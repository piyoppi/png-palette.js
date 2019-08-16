import Adler32 from './../src/adler32';

describe('calc', () => {
  test('return adler32 value', () => {
    expect(Adler32.calc([0x61, 0x62, 0x63])).toEqual(0x024d0127);
  });
});
