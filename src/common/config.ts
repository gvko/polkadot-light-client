// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import { get } from 'env-var';

export const config = () => ({
  node: {
    apiUrl: get('NODE_API_URL').required().asString(),
  },
  headerBatchSize: get('HEADER_BATCH_SIZE').required().asInt(),
});

export type ConfigShape = ReturnType<typeof config>;
