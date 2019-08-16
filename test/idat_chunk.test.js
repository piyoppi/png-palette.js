import IdatChunk from './../src/idat_chunk';

describe('_cmf', () => {
  test('return byte array', () => {
    const chunk = new IdatChunk([]);
    expect(chunk._cmf()).toEqual([0x78]);
  });
});

describe('_flg', () => {
  test('return byte array', () => {
    const chunk = new IdatChunk([]);
    expect(chunk._flg()).toEqual([0x9C]);
  });
});

describe('_raw', () => {
  test('return byte array', () => {
    const chunk = new IdatChunk([
      0xFF,
      0x00,
      0xF0,
      0x0F
    ]);
    expect(chunk._raw().bytes.toString()).toEqual([
      0b10000000,
      0b00000000,
      0b10011111,
      0b11111111,
      0b10011111,
      0b11100000,
      0b00011110,
      0b00000001,
      0b11100000,
      0b10111101,
      0b11100000,
      0b00111111,
      0b11100000,
    ].toString());
  });
});
