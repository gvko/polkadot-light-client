import { Injectable, Logger } from '@nestjs/common';
import { config } from '../common/config';
import { Contract, providers, Wallet } from 'ethers';
import tokenAbi from '../contract-abi/Token';
import stakingAbi from '../contract-abi/Stakearna';
import { TransactionResponse } from '@ethersproject/providers'

@Injectable()
export class Web3ProviderService {
  private readonly logger: Logger;
  private readonly provider;
  private readonly wallet: Wallet;
  private readonly tokenContract: Contract;
  private readonly stakingContract: Contract;

  constructor() {
    this.logger = new Logger(Web3ProviderService.name);
    this.provider = new providers.AlchemyProvider('goerli', config().ethNode.apiKey);
    this.wallet = new Wallet(config().ethNode.walletPrivKey, this.provider);
    this.tokenContract = new Contract(config().contract.tokenContract, tokenAbi.abi, this.wallet);
    this.stakingContract = new Contract(config().contract.stakingContract, stakingAbi.abi, this.wallet);
  }

  private async approveAllowance(address: string, amount: number) {
    this.logger.log(`Approve allowance of ${amount} for ${address}`);
    const gasPrice = await this.provider.getGasPrice();
    const gasEstimate = await this.tokenContract.estimateGas.approve(address, amount);

    try {
      const tx: TransactionResponse = await this.tokenContract.functions.approve(address, amount, {
        gasPrice,
        gasLimit: gasEstimate.toNumber() * 3
      });
      await tx.wait(1);
      this.logger.log(`Tx hash: ${tx.hash}`);
    } catch (err) {
      this.logger.error('Could not approve allowance', err);
      throw err;
    }
  }

  async stake(address: string, amount: number) {
    await this.approveAllowance(address, amount);

    this.logger.log(`Stake amount of ${amount} for ${address}`);
    const gasPrice = await this.provider.getGasPrice();
    const gasEstimate = await this.stakingContract.estimateGas.stakeToken(amount);

    try {
      const tx: TransactionResponse = await this.stakingContract.functions.stakeToken(amount, {
        gasPrice,
        gasLimit: gasEstimate.toNumber() * 3
      });
      await tx.wait(1);
      this.logger.log(`Tx hash: ${tx.hash}`);
    } catch (err) {
      this.logger.error('Could not stake', err);
      throw err;
    }
  }

  async claim() {
    const gasPrice = await this.provider.getGasPrice();
    const gasEstimate = await this.stakingContract.estimateGas.claimReward();

    try {
      const tx: TransactionResponse = await this.stakingContract.functions.claimReward({
        gasPrice,
        gasLimit: gasEstimate.toNumber() * 3
      });
      await tx.wait(1);
      this.logger.log(`Tx hash: ${tx.hash}`);
    } catch (err) {
      this.logger.error('Could not claim', err);
      throw err;
    }
  }
}
