import { Args, stringToBytes, u64ToBytes } from '@massalabs/as-types';
import { Context, resetStorage, setDeployContext } from '@massalabs/massa-as-sdk';
import { constructor, getFeesInDollar, _getHash } from '../contracts/main';

describe('Group test', () => {
  test('Testing event', () => {
    expect(_getHash(Context.timestamp(), 1, 'AS1e4vvqMy4RvdSF7xgwMhcu2QhtEfBa8L8QtJSL39AHgGwcCtQn')).toBe('');
  });
});
