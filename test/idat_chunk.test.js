import IdatChunk from './../src/idat_chunk';
import PngBytes from './../src/png_bytes';

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
    const chunk = new IdatChunk([0xFF, 0x00, 0xF0, 0x0F]);

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

describe('write', () => {
  test('return byte array', () => {
    const chunk = new IdatChunk([0xFF, 0x00, 0xF0, 0x0F]);
    const data = new PngBytes(chunk.length);
    chunk.write(data);

    expect(data.bytes.toString()).toEqual([
      0x00, 0x00, 0x00, 0x0D,
      0x49, 0x44, 0x41, 0x54,
      0x78, 0x9C,
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
      0xCF, 0x76, 0x43, 0x75,
    ].toString());
  });
});

describe('length', () => {
  test('return chunk length', () => {
    const chunk = new IdatChunk([0xFF, 0x00, 0xF0, 0x0F]);

    expect(chunk.length).toEqual(27);
  });
});

describe('rawDataLength', () => {
  test('return raw data length', () => {
    const chunk = new IdatChunk([0xFF, 0x00, 0xF0, 0x0F]);
    expect(chunk.rawDataLength).toEqual(13);
  });
});
