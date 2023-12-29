// The entry file of your WebAssembly module.
import {
  Context,
  Storage,
  Coins,
  Address,
  sha256,
} from '@massalabs/massa-as-sdk';
import {
  Args,
  stringToBytes,
  u64ToBytes,
  u32ToBytes,
  bytesToU64,
} from '@massalabs/as-types';
import { IERC20, Transfer } from './interfaces';

export const TOKEN_KEY = 'TOKEN_KEY';
export const OWNER_KEY = 'OWNER_KEY';
export const PROGRAM_KEY = 'PROGRAM_KEY';
export const CHAIN_KEY = 'CHAIN_KEY';

export const FEES_IN_DOLLAR_KEY = stringToBytes('FEES_IN_DOLLAR_KEY');
export const FEES_IN_CDT_PERCENTAGE_KEY = stringToBytes(
  'FEES_IN_CDT_PERCENTAGE_KEY',
);
export const MINIMUM_TRANSFER_QUANTITY_KEY = stringToBytes(
  'MINIMUM_TRANSFER_QUANTITY_KEY',
);

export const BRIDGE_FEES_IN_CDT_KEY = stringToBytes('BRIDGE_FEES_IN_CDT_KEY');
export const LOCK_ASK_DURATION_KEY = stringToBytes('LOCK_ASK_DURATION_KEY');
export const UNLOCK_ASK_DURATION_KEY = stringToBytes('UNLOCK_ASK_DURATION_KEY');
export const UNLOCK_ASK_TIME_KEY = stringToBytes('UNLOCK_ASK_TIME_KEY');

export const BLOCKS_LENGTH_KEY = stringToBytes('BLOCKS_LENGTH_KEY');
export const TRANSFERS_INDEXES_KEY = 'TRANSFERS_INDEXES_KEY_';
export const TRANSFERS_KEY = 'TRANSFERS_KEY_';
export const TRANSFERS_HASHS_KEY = 'TRANSFERS_HASHS_KEY_';
export const TRANSFER_INDEX_KEY = stringToBytes('TRANSFER_INDEX_KEY');

export const DEX_IN_KEY = 'DEX_IN_KEY';
export const DEX_OUT_KEY = 'DEX_OUT_KEY';
export const DEX_POOL_KEY = 'DEX_POOL_KEY';

export const PAUSED_KEY = 'PAUSED_KEY';

export function constructor(binaryArgs: StaticArray<u8>): void {
  assert(Context.isDeployingContract());

  const args = new Args(binaryArgs);
  const bridgeChain = args
    .nextString()
    .expect('bridgeChain argument is missing or invalid');
  const token = args.nextString().expect('tokenArgument is missing or invalid');
  const feesInDollar = args
    .nextU64()
    .expect('feesInDollar argument is missing or invalid');
  const feesInCDTPercentage = args
    .nextU64()
    .expect('feesInCDTPercentage argument is missing or invalid');
  const dexIn = args
    .nextString()
    .expect('dexIn argument is missing or invalid');
  const dexOut = args
    .nextString()
    .expect('dexOut argument is missing or invalid');
  const dexPool = args
    .nextString()
    .expect('dexPool argument is missing or invalid');
  const minimumTransferQuantity = 1_000_000_000;
  const lockAskDuration = 2 * 86400;
  const unlockAskDuration = 15 * 86400;

  Storage.set(CHAIN_KEY, bridgeChain);
  Storage.set(TOKEN_KEY, token);
  Storage.set(OWNER_KEY, Context.caller().toString());
  Storage.set(PROGRAM_KEY, Context.caller().toString());
  Storage.set(FEES_IN_DOLLAR_KEY, u64ToBytes(feesInDollar));
  Storage.set(FEES_IN_CDT_PERCENTAGE_KEY, u64ToBytes(feesInCDTPercentage));
  Storage.set(DEX_IN_KEY, dexIn);
  Storage.set(DEX_OUT_KEY, dexOut);
  Storage.set(dexPool, dexPool);
  Storage.set(
    MINIMUM_TRANSFER_QUANTITY_KEY,
    u64ToBytes(minimumTransferQuantity),
  );
  Storage.set(LOCK_ASK_DURATION_KEY, u64ToBytes(lockAskDuration));
  Storage.set(UNLOCK_ASK_DURATION_KEY, u64ToBytes(unlockAskDuration));
  Storage.set(TRANSFER_INDEX_KEY, u64ToBytes(0));

  Storage.set(PAUSED_KEY, 'false');
}

function _onlyOwner(): void {
  assert(
    Context.caller().toString() == Storage.get(OWNER_KEY),
    'Only the owner can do this action',
  );
}

function _onlyProgramOrOwner(): void {
  assert(
    Context.caller().toString() == Storage.get(OWNER_KEY) ||
      Context.caller().toString() == Storage.get(PROGRAM_KEY),
    'Only program or Owner',
  );
}

function _actived(): void {
  assert(Storage.get(PAUSED_KEY) == 'false', 'Bridge actually paused');
}

export function setFeesInDollar(_args: StaticArray<u8>): void {
  _onlyOwner();
  const args = new Args(_args);

  const feesInDollar = args
    .nextU64()
    .expect('feesInDollar argument is missing or invalid');

  Storage.set(FEES_IN_DOLLAR_KEY, u64ToBytes(feesInDollar));
}

export function setFeesInCDTPercentage(_args: StaticArray<u8>): void {
  _onlyOwner();
  const args = new Args(_args);

  const feesInCDTPercentage = args
    .nextU64()
    .expect('feesInCDTPercentage argument is missing or invalid');

  Storage.set(FEES_IN_CDT_PERCENTAGE_KEY, u64ToBytes(feesInCDTPercentage));
}

export function askWithdraw(_: StaticArray<u8>): void {
  _onlyOwner();
  Storage.set(UNLOCK_ASK_TIME_KEY, u64ToBytes(Context.timestamp()));
}

export function setDex(_args: StaticArray<u8>): void {
  _onlyOwner();

  const args = new Args(_args);

  const dexIn = args
    .nextString()
    .expect('dexIn argument is missing or invalid');
  const dexOut = args
    .nextString()
    .expect('dexOut argument is missing or invalid');
  const dexPool = args
    .nextString()
    .expect('dexPool argument is missing or invalid');

  Storage.set(DEX_IN_KEY, dexIn);
  Storage.set(DEX_OUT_KEY, dexOut);
  Storage.set(DEX_POOL_KEY, dexPool);
}

export function updateTransferCost(_args: StaticArray<u8>): void {
  _onlyOwner();

  const args = new Args(_args);

  const feesInDollar = args
    .nextU64()
    .expect('feesInDollar argument is missing or invalid');

  Storage.set(FEES_IN_DOLLAR_KEY, u64ToBytes(feesInDollar));
}

export function setPaused(_args: StaticArray<u8>): void {
  _onlyOwner();

  const args = new Args(_args);

  const paused = args
    .nextBool()
    .expect('paused argument is missing or invalid');

  Storage.set(PAUSED_KEY, paused ? 'true' : 'false');
}

export function setMinimumTransferQuantity(_args: StaticArray<u8>): void {
  _onlyOwner();

  const args = new Args(_args);

  const minimumTransferQuantity = args
    .nextU64()
    .expect('minimumTransferQuantity argument is missing or invalid');

  Storage.set(
    MINIMUM_TRANSFER_QUANTITY_KEY,
    u64ToBytes(minimumTransferQuantity),
  );
}

export function changeOwner(_args: StaticArray<u8>): void {
  _onlyOwner();

  const args = new Args(_args);

  const owner = args
    .nextString()
    .expect('owner argument is missing or invalid');

  Storage.set(OWNER_KEY, owner);
}

export function changeProgram(_args: StaticArray<u8>): void {
  _onlyOwner();

  const args = new Args(_args);

  const program = args
    .nextString()
    .expect('program argument is missing or invalid');

  Storage.set(PROGRAM_KEY, program);
}

export function depositMassa(_args: StaticArray<u8>): void {
  _onlyOwner();

  const args = new Args(_args);

  const quantity = args
    .nextU64()
    .expect('quantity parameter is missing or invalid');

  assert(Context.transferredCoins() >= quantity, 'PAYMENT_ABORT');
}

export function withdrawMassa(_args: StaticArray<u8>): void {
  _onlyOwner();

  const args = new Args(_args);

  const quantity = args
    .nextU64()
    .expect('quantity parameter is missing or invalid');

  assert(Coins.balance() >= quantity, 'Insufficient balance');

  Coins.transferCoins(new Address(Storage.get(OWNER_KEY)), quantity);
}

export function collectCDTFees(_: StaticArray<u8>): void {
  _onlyOwner();

  const callee = Context.callee();
  const caller = Context.caller();
  const token = new IERC20(new Address(Storage.get(TOKEN_KEY)));

  const bridgeFeesInCDT = bytesToU64(Storage.get(BRIDGE_FEES_IN_CDT_KEY));

  assert(token.balanceOf(callee) >= bridgeFeesInCDT, 'INSUFFICIENT_BALANCE');

  token.transfer(caller, bridgeFeesInCDT);

  Storage.set(BRIDGE_FEES_IN_CDT_KEY, u64ToBytes(0));
}

export function deposit(_args: StaticArray<u8>): void {
  _onlyOwner();

  const args = new Args(_args);

  const coin = args.nextString().expect('coin argument is missing or invalid');
  const quantity = args
    .nextU64()
    .expect('quantity parameter is missing or invalid');

  const token = new IERC20(new Address(coin));
  const caller = Context.caller();
  const callee = Context.callee();

  assert(token.balanceOf(caller) >= quantity, 'INSUFFICIENT_BALANCE');
  assert(token.allowance(caller, callee) >= quantity, 'INSUFFICIENT_ALLOWANCE');

  token.transferFrom(caller, callee, quantity);
}

export function withdraw(_args: StaticArray<u8>): void {
  _onlyOwner();

  const unlockAskTime = bytesToU64(Storage.get(UNLOCK_ASK_TIME_KEY));
  const lockAskDuration = bytesToU64(Storage.get(LOCK_ASK_DURATION_KEY));
  const unlockAskDuration = bytesToU64(Storage.get(UNLOCK_ASK_DURATION_KEY));
  const timestamp = Context.timestamp();

  assert(
    unlockAskTime < timestamp - lockAskDuration,
    '2_DAYS_MINIMUM_LOCKED_PERIOD',
  );
  assert(
    unlockAskTime > timestamp - unlockAskDuration,
    '15_DAYS_MAXIMUM_UNLOCKED_PERIOD',
  );

  const args = new Args(_args);

  const coin = args.nextString().expect('coin argument is missing or invalid');
  const quantity = args
    .nextU64()
    .expect('quantity parameter is missing or invalid');

  const token = new IERC20(new Address(coin));
  assert(token.balanceOf(Context.callee()) >= quantity, 'INSUFFICIENT_BALANCE');
  token.transfer(Context.caller(), quantity);
}

export function initTransfer(_args: StaticArray<u8>): void {
  _actived();
  const args = new Args(_args);
  const quantity = args
    .nextU64()
    .expect('quantity parameter is missing or invalid');
  const toChain = args
    .nextString()
    .expect('toChain parameter is missing or invalid');
  const data = args.nextString().expect('data parameter is missing or invalid');
  const tokenAddress = Storage.get(TOKEN_KEY);
  const chain = Storage.get(CHAIN_KEY);
  const token = new IERC20(new Address(tokenAddress));
  const minimumTransferQuantity = bytesToU64(
    Storage.get(MINIMUM_TRANSFER_QUANTITY_KEY),
  );
  const caller = Context.caller();
  const callee = Context.caller();

  assert(Context.transferredCoins() >= _getFeesInMassa(), 'PAYMENT_ABORT');
  assert(quantity >= minimumTransferQuantity, 'INSUFFICIENT_QUANTITY');
  assert(token.balanceOf(caller) >= quantity, 'INSUFFICIENT_BALANCE');
  assert(token.allowance(caller, callee) >= quantity, 'INSUFFICIENT_ALLOWANCE');

  token.transferFrom(caller, callee, quantity);

  const transferFeesInCDT = _getFeesInCDTByQuantity(
    new Args().add(quantity).serialize(),
  );
  const transferQuantity = quantity - transferFeesInCDT;
  const transferMassaFees = Context.transferredCoins();
  const bridgeFeesInCDT = bytesToU64(Storage.get(BRIDGE_FEES_IN_CDT_KEY));

  Storage.set(
    BRIDGE_FEES_IN_CDT_KEY,
    u64ToBytes(bridgeFeesInCDT + transferFeesInCDT),
  );
  const index = bytesToU64(Storage.get(TRANSFER_INDEX_KEY));
  const transferHash = _getHash(Context.timestamp(), 0, caller.toString());
  const transferKey = stringToBytes(TRANSFERS_KEY + index.toString());

  const transfer = new Transfer(
    transferHash,
    caller.toString(),
    tokenAddress,
    transferQuantity,
    chain,
    toChain,
    transferFeesInCDT,
    transferMassaFees,
    Context.timestamp(),
    0,
    data,
  );

  Storage.set(transferKey, transfer.serialize());

  Storage.set(TRANSFER_INDEX_KEY, u64ToBytes(index + 1));
  const transfersIndexesKey = stringToBytes(
    TRANSFERS_INDEXES_KEY + transferHash,
  );
  Storage.set(transfersIndexesKey, u64ToBytes(index));
  const transfersHashsKey = stringToBytes(TRANSFERS_HASHS_KEY + transferHash);
  Storage.set(transfersHashsKey, stringToBytes(transferHash));
}

export function addTransfersFrom(_args: StaticArray<u8>): void {
  _onlyProgramOrOwner();

  const args = new Args(_args);
  const fromChains = args
    .nextStringArray()
    .expect('fromChains argument is missing or invalid');
  const transfersAddresses = args
    .nextStringArray()
    .expect('transfersAddresses is missing or invalid');
  const amounts = args
    .nextFixedSizeArray<u64>()
    .expect('amounts argument is missing or invalid');
  const transfersHashs = args
    .nextStringArray()
    .expect('transfersHashs argument is missing or invalid');

  for (let i = 0; i < transfersAddresses.length; i++) {
    const transferAddress = transfersAddresses[i];
    const amount = amounts[i];
    const transferHash = transfersHashs[i];

    const transfersHashsKey = stringToBytes(TRANSFERS_HASHS_KEY + transferHash);

    assert(!Storage.has(transfersHashsKey), 'Already transferred');

    const token = new IERC20(new Address(Storage.get(TOKEN_KEY)));
    token.transfer(new Address(transferAddress), amount);
    Storage.set(transfersHashsKey, stringToBytes(transferHash));
  }
}

export function getFeesInDollar(_: StaticArray<u8>): StaticArray<u8> {
  return Storage.get(FEES_IN_DOLLAR_KEY);
}

export function getFeesInMassa(_: StaticArray<u8>): StaticArray<u8> {
  return u64ToBytes(_getFeesInMassa());
}

export function getTokenPriceOutFromPoolBalance(
  _args: StaticArray<u8>,
): StaticArray<u8> {
  const args = new Args(_args);

  const dexIn = args.nextString().expect('in parameter is missing or invalid');
  const dexOut = args
    .nextString()
    .expect('out parameter is missing or invalid');
  const dexPool = args
    .nextString()
    .expect('pool parameter is missing or invalid');

  return u64ToBytes(_getTokenPriceOutFromPoolBalance(dexIn, dexOut, dexPool));
}

export function getFeesInCDTByQuantity(
  _args: StaticArray<u8>,
): StaticArray<u8> {
  return u64ToBytes(_getFeesInCDTByQuantity(_args));
}

export function transferExists(_args: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(_args);
  const transferHash = args
    .nextBytes()
    .expect('transferHash argument is missing or invalid');
  const transfersHashsKey = stringToBytes(
    TRANSFERS_HASHS_KEY + transferHash.toString(),
  );
  if (!Storage.has(transfersHashsKey)) {
    return u32ToBytes(0);
  }
  const transfersHashs = Storage.get(transfersHashsKey);
  return transferHash.toString() == transfersHashs.toString()
    ? u32ToBytes(1)
    : u32ToBytes(0);
}

export function getTransfer(_args: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(_args);
  const transferHash = args
    .nextBytes()
    .expect('transferHash argument is missing or invalid');

  const transfersIndexesKey = stringToBytes(
    TRANSFERS_INDEXES_KEY + transferHash.toString(),
  );

  if (!Storage.has(transfersIndexesKey)) {
    return [];
  }
  const transferIndex = bytesToU64(Storage.get(transfersIndexesKey));
  const transfersKey = stringToBytes(TRANSFERS_KEY + transferIndex.toString());

  if (!Storage.has(transfersKey)) {
    return [];
  }
  return Storage.get(transfersKey);
}

export function getTransferLength(_: StaticArray<u8>): StaticArray<u8> {
  return Storage.get(TRANSFER_INDEX_KEY);
}

export function getTransfers(_args: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(_args);
  const page = args.nextI64().expect('page argument is missing or invalid');
  const pageSize = args
    .nextI64()
    .expect('pageSize argument is missing or invalid');
  const poolLength: i64 = bytesToU64(Storage.get(TRANSFER_INDEX_KEY));
  const queryStartPoolIndex = poolLength - pageSize * (page + 1) + pageSize;
  assert(queryStartPoolIndex >= 0, 'Out of bounds');
  let queryEndPoolIndex = queryStartPoolIndex - pageSize;
  if (queryEndPoolIndex < 0) queryEndPoolIndex = 0;
  let currentPoolIndex = queryStartPoolIndex;
  assert(currentPoolIndex <= poolLength, 'Out of bounds');

  let transfers: Transfer[] = [];

  for (; currentPoolIndex > queryEndPoolIndex; currentPoolIndex--) {
    const transfersKey = stringToBytes(
      TRANSFERS_KEY + (currentPoolIndex - 1).toString(),
    );
    if (Storage.has(transfersKey)) {
      const transfer = new Transfer();
      transfer.deserialize(Storage.get(transfersKey));
      transfers.push(transfer);
    }
  }
  return new Args().addSerializableObjectArray(transfers).serialize();
}

export function getLastsTransfers(_args: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(_args);
  const size = args.nextU64().expect('size argument is missing or invalid');

  const poolLength = bytesToU64(Storage.get(TRANSFER_INDEX_KEY));
  let start: u64 = 0;
  let memorySize = size;
  if (poolLength > size) {
    start = poolLength - size;
  } else {
    memorySize = poolLength;
  }
  let currentIndex: u64 = start;

  let transfers: Transfer[] = [];

  for (; currentIndex < poolLength; currentIndex++) {
    const transfersKey = stringToBytes(TRANSFERS_KEY + currentIndex.toString());
    if (Storage.has(transfersKey)) {
      const transfer = new Transfer();
      transfer.deserialize(Storage.get(transfersKey));
      transfers.push(transfer);
    }
  }

  return new Args().addSerializableObjectArray(transfers).serialize();
}

export function balance(_: StaticArray<u8>): StaticArray<u8> {
  return u64ToBytes(Coins.balance());
}

export function getDex(_: StaticArray<u8>): StaticArray<u8> {
  return new Args()
    .add(Storage.get(DEX_IN_KEY))
    .add(Storage.get(DEX_OUT_KEY))
    .add(Storage.get(DEX_POOL_KEY))
    .serialize();
}

export function isPaused(): StaticArray<u8> {
  return Storage.get(PAUSED_KEY) == 'true' ? u32ToBytes(1) : u32ToBytes(0);
}

export function token(_: StaticArray<u8>): StaticArray<u8> {
  return stringToBytes(Storage.get(TOKEN_KEY));
}

export function owner(_: StaticArray<u8>): StaticArray<u8> {
  return stringToBytes(Storage.get(OWNER_KEY));
}

export function program(_: StaticArray<u8>): StaticArray<u8> {
  return stringToBytes(Storage.get(PROGRAM_KEY));
}

export function chain(_: StaticArray<u8>): StaticArray<u8> {
  return stringToBytes(Storage.get(CHAIN_KEY));
}

export function feesInDollar(_: StaticArray<u8>): StaticArray<u8> {
  return Storage.get(FEES_IN_DOLLAR_KEY);
}

export function feesInCDTPercentage(_: StaticArray<u8>): StaticArray<u8> {
  return Storage.get(FEES_IN_CDT_PERCENTAGE_KEY);
}

export function minimumTransferQuantity(_: StaticArray<u8>): StaticArray<u8> {
  return Storage.get(MINIMUM_TRANSFER_QUANTITY_KEY);
}

export function bridgeFeesInCDT(_: StaticArray<u8>): StaticArray<u8> {
  return Storage.get(BRIDGE_FEES_IN_CDT_KEY);
}

export function lockAskDuration(_: StaticArray<u8>): StaticArray<u8> {
  return Storage.get(LOCK_ASK_DURATION_KEY);
}

export function unlockAskDuration(_: StaticArray<u8>): StaticArray<u8> {
  return Storage.get(UNLOCK_ASK_DURATION_KEY);
}

export function unlockAskTime(_: StaticArray<u8>): StaticArray<u8> {
  return Storage.get(UNLOCK_ASK_TIME_KEY);
}

function _getFeesInCDTByQuantity(_args: StaticArray<u8>): u64 {
  const feesInCDTPercentage = bytesToU64(
    Storage.get(FEES_IN_CDT_PERCENTAGE_KEY),
  );
  if (feesInCDTPercentage == 0) {
    return 0;
  }
  const args = new Args(_args);

  const quantity = args
    .nextU64()
    .expect('quantity paramter is missing or invalid');

  const transferFees = (quantity / 100) * feesInCDTPercentage;
  return transferFees;
}

function _getFeesInMassa(): u64 {
  const dexIn = Storage.get(DEX_IN_KEY);
  const dexOut = Storage.get(DEX_OUT_KEY);
  const dexPool = Storage.get(DEX_POOL_KEY);
  const oneDollar = _getTokenPriceOutFromPoolBalance(dexIn, dexOut, dexPool);
  const feesInDollar = bytesToU64(Storage.get(FEES_IN_DOLLAR_KEY));
  return ((oneDollar * 1_000_000_000) / feesInDollar) * 100;
}

function _getTokenPriceOutFromPoolBalance(
  dexIn: string,
  dexOut: string,
  dexPool: string,
): u64 {
  const tokenIn = new IERC20(new Address(dexIn));
  const tokenOut = new IERC20(new Address(dexOut));
  const pool = new Address(dexPool);

  const balanceIn = tokenIn.balanceOf(pool);
  const balanceOut = tokenOut.balanceOf(pool);

  assert(balanceOut > 0);

  return (balanceIn * 1_000_000_000) / balanceOut;
}

function _getHash(timestamp: u64, nonce: u64, addr: string): string {
  const hash = sha256(
    new Args().add(timestamp).add(addr).add(nonce).serialize(),
  );
  return hash.reduce((prev, cur) => prev + String.fromCharCode(cur), '');
}
