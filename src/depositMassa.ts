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

const TOKEN_CONTRACT_ADDRESS =
  'AS12jyar7DLYxX9fsr1WsTkhMcZEvLSmHFQ1ucqWv2M1wqh7yv7zB';
const BRIDGE_CONTRACT_ADDRESS =
  'AS1e4vvqMy4RvdSF7xgwMhcu2QhtEfBa8L8QtJSL39AHgGwcCtQn';

const PRIVATE_KEY = process.env.WALLET_SECRET_KEY;

if (!PRIVATE_KEY) {
  throw new Error('Missing WALLET_SECRET_KEY in .env file');
}

(async () => {
  try {
    const account: IAccount = await WalletClient.getAccountFromSecretKey(
      PRIVATE_KEY,
    );

    const client: Client = await ClientFactory.createDefaultClient(
      DefaultProviderUrls.BUILDNET,
      true,
      account,
    );

    let approveTx = await client.smartContracts().callSmartContract({
      maxGas: MAX_GAS_CALL,
      targetAddress: TOKEN_CONTRACT_ADDRESS,
      functionName: 'approve',
      parameter: new Args()
        .addString(BRIDGE_CONTRACT_ADDRESS)
        .addU64(1000000000n)
        .serialize(),
      fee: 0n,
    });

    console.log(approveTx);

    let depositTX = await client.smartContracts().callSmartContract({
      maxGas: MAX_GAS_CALL,
      targetAddress: BRIDGE_CONTRACT_ADDRESS,
      functionName: 'depositMassa',
      parameter: new Args().addU64(1000000000n).serialize(),
      fee: 0n,
    });

    console.log(depositTX);
  } catch (err) {
    console.log(err);
  }
  process.exit(0); // terminate the process after deployment(s)
})();
