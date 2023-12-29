import { Serializable, Args, Result } from '@massalabs/as-types';

export class Transfer implements Serializable {
  constructor(
    public _hash: string = '',
    public _from: string = '',
    public _coin: string = '',
    public _quantity: u64 = 0,
    public _fromChain: string = '',
    public _toChain: string = '',
    public _feesInCDT: u64 = 0,
    public _feesInMassa: u64 = 0,
    public _blockTimestamp: u64 = 0,
    public _blockNumber: u64 = 0,
    public _data: string = '',
  ) {}

  serialize(): StaticArray<u8> {
    return new Args()
      .add(this._hash)
      .add(this._from)
      .add(this._coin)
      .add(this._quantity)
      .add(this._fromChain)
      .add(this._toChain)
      .add(this._feesInCDT)
      .add(this._feesInMassa)
      .add(this._blockTimestamp)
      .add(this._blockNumber)
      .add(this._data)
      .serialize();
  }

  deserialize(data: StaticArray<u8>, offset: i32 = 0): Result<i32> {
    const args = new Args(data, offset);
    this._hash = args.nextString().expect("Can't deserialize transfer");
    this._from = args.nextString().expect("Can't deserialize transfer");
    this._coin = args.nextString().expect("Can't deserialize transfer");
    this._quantity = args.nextU64().expect("Can't deserialize transfer");
    this._fromChain = args.nextString().expect("Can't deserialize transfer");
    this._toChain = args.nextString().expect("Can't deserialize transfer");
    this._feesInCDT = args.nextU64().expect("Can't deserialize transfer");
    this._feesInMassa = args.nextU64().expect("Can't deserialize transfer");
    this._blockTimestamp = args.nextU64().expect("Can't deserialize transfer");
    this._blockNumber = args.nextU64().expect("Can't deserialize transfer");
    this._data = args.nextString().expect("Can't deserialize transfer");
    return new Result(args.offset);
  }
}
