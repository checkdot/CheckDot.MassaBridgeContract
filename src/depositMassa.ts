import {
  Args,
  Client,
  ClientFactory,
  DefaultProviderUrls,
  IAccount,
  MAX_GAS_CALL,
  WalletClient,
} from '@massalabs/massa-web3';
import dotenv from 'dotenv';

dotenv.config();

const CONTRACT_ADDRESS = 'AS1e4vvqMy4RvdSF7xgwMhcu2QhtEfBa8L8QtJSL39AHgGwcCtQn';

const PRIVATE_KEY = process.env.WALLET_SECRET_KEY;

if (!PRIVATE_KEY) {
  throw new Error('Missing WALLET_SECRET_KEY in .env file');
}

(async () => {
  const account: IAccount = await WalletClient.getAccountFromSecretKey(
    PRIVATE_KEY,
  );

  const client: Client = await ClientFactory.createDefaultClient(
    DefaultProviderUrls.BUILDNET,
    true,
    account,
  );

  let res = await client.smartContracts().callSmartContract({
    maxGas: BigInt(1000000),
    targetAddress: CONTRACT_ADDRESS,
    functionName: 'depositMassa',
    parameter: new Args().addU64(1000000000n).serialize(),
    fee: MAX_GAS_CALL,
  });

  console.log(res);
  process.exit(0); // terminate the process after deployment(s)
})();
