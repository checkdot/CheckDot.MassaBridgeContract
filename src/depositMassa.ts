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

const BRIDGE_CONTRACT_ADDRESS =
  'AS1HbUnCRbCRgtJKLWFf8e5qri2r6exdgzfcJGRDCsQu7VRAbhFx';

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

    let depositTX = await client.smartContracts().callSmartContract({
      maxGas: MAX_GAS_CALL,
      targetAddress: BRIDGE_CONTRACT_ADDRESS,
      functionName: 'depositMassa',
      parameter: new Args().addU64(1000n).serialize(),
      fee: 0n,
      coins: 1000n,
    });

    console.log(depositTX);
  } catch (err) {
    console.log(err);
  }
  process.exit(0); // terminate the process after deployment(s)
})();
