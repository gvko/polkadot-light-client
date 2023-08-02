import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { config } from '../common/config';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Header } from '@polkadot/types/interfaces';
import { BaseTrie as Tree } from 'merkle-patricia-tree';
import { Proof } from 'merkle-patricia-tree/dist.browser/baseTrie';

export interface PolkadotHeader {
  number: number;
  hash: string;
  // other header fields?
}

interface InclusionProofs {
  [key: string]: Proof;
}

@Injectable()
export class ClientService {
  private readonly logger: Logger;
  private readonly headerBatchSize: number;
  private headers: PolkadotHeader[];
  private merkleRoots: Buffer[];
  private readonly proofs: InclusionProofs;
  private readonly tree: Tree;
  private readonly provider: WsProvider;

  constructor() {
    this.logger = new Logger(ClientService.name);
    this.headerBatchSize = config().headerBatchSize;
    this.headers = [];
    this.merkleRoots = [];
    this.proofs = {};
    this.tree = new Tree();
    this.provider = new WsProvider(config().node.apiUrl);

    this.connect();
  }

  async connect(): Promise<void> {
    const api = await ApiPromise.create({provider: this.provider});
    this.logger.log('Subscribe to incoming headers...');

    api.rpc.chain.subscribeNewHeads(async (header: Header) => {
      // this.logger.log('Incoming header', header);

      const newHeader: PolkadotHeader = {
        number: header.number.toNumber(),
        hash: header.hash.toString(),
      };
      this.logger.log(`New header`, newHeader);

      this.addHeader(newHeader);

      if (this.headers.length === this.headerBatchSize) {
        await this.writeToMerkleTree();
      }
    });
  }

  private addHeader(header: PolkadotHeader) {
    this.headers.push(header);
  }

  private async writeToMerkleTree() {
    this.logger.log('Write headers to merkle tree');

    for (const header of this.headers) {
      const keyHash = Buffer.from(header.hash);
      const keyNumber = Buffer.from(header.number.toString());
      const value = Buffer.from(JSON.stringify(header));

      await this.tree.put(keyHash, value);
      await this.tree.put(keyNumber, value);
      this.proofs[header.hash] = await this.generateMerkleProof(header.hash);
      // const verifiedProof = await this.verifyMerkleProof(header.hash);
      // this.logger.log(`Verified proof for hash ${header.hash}: `, verifiedProof);
    }

    const merkleRoot = this.tree.root;
    this.merkleRoots.push(merkleRoot);

    // Clear the headers array for the next batch
    this.headers = [];
  }

  async getHeaderByNumber(number: number): Promise<PolkadotHeader> {
    const header = await this.tree.get(Buffer.from(number.toString()));
    if (!header) {
      throw new InternalServerErrorException(`No header stored with given number: ${number}`);
    }

    return JSON.parse(header.toString());
  }

  async getHeaderByHash(hash: string): Promise<PolkadotHeader> {
    const header = await this.tree.get(Buffer.from(hash));
    if (!header) {
      throw new InternalServerErrorException(`No header stored with given hash: ${hash}`);
    }

    return JSON.parse(header.toString());
  }

  async generateMerkleProof(hash: string): Promise<Proof> {
    return await Tree.createProof(this.tree, Buffer.from(hash));
  }

  async verifyMerkleProof(hash: string): Promise<PolkadotHeader> {
    const proof = await Tree.verifyProof(this.tree.root, Buffer.from(hash), this.proofs[hash]);
    return JSON.parse(proof.toString());
  }
}
