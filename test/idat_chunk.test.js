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
      0x01,
      0x04, 0x00,
      0xFB, 0xFF,
      0xFF, 0x00, 0xF0, 0x0F,
      0x05, 0xEF, 0x01, 0xFF,
    ].toString());
  });
});

describe('_findInWindow', () => {
  test('return a found element when the data has a part of the given values', () => {
    const chunk = new IdatChunk([0x00, 0xFF, 0x00, 0xF0, 0x0F, 0x00, 0xB0, 0x00, 0xF0, 0xF0, 0x0F]);
    expect(chunk._findInWindow([0x00, 0xF0, 0xB0], 6)).toEqual({
      cursor: 2,
      length: 2
    });
  });
});

describe('_getFixedHuffmanCode', () => {
  test('return a huffman code when given a value', () => {
    const chunk = new IdatChunk([]);

    expect(chunk._getFixedHuffmanCode(0)).toEqual({value: 0b00110000, bitlen: 8});
    expect(chunk._getFixedHuffmanCode(143)).toEqual({value: 0b10111111, bitlen: 8});
    expect(chunk._getFixedHuffmanCode(144)).toEqual({value: 0b110010000, bitlen: 9});
    expect(chunk._getFixedHuffmanCode(255)).toEqual({value: 0b111111111, bitlen: 9});
    expect(chunk._getFixedHuffmanCode(256)).toEqual({value: 0b0000000, bitlen: 7});
    expect(chunk._getFixedHuffmanCode(279)).toEqual({value: 0b0010111, bitlen: 7});
    expect(chunk._getFixedHuffmanCode(280)).toEqual({value: 0b11000000, bitlen: 8});
    expect(chunk._getFixedHuffmanCode(287)).toEqual({value: 0b11000111, bitlen: 8});
  });
});

describe('compress', () => {
  test('return a compressed data', () => {
    const chunk = new IdatChunk([
      0xAA, 0x00, 0xFF, 0x00, 0xF0, 0x0F, 0x00, 0xFF, 0x00, 0xB0, 0xB0, 0x0F,
      0xF0, 0x0F, 0x00, 0xFF, 0x04
    ]);
    const expectedBytes = new PngBytes(19);

    expectedBytes.writeNonBoundary(0b110, 3);
    expectedBytes.writeNonBoundary(chunk._getFixedHuffmanCode(0xAA).value, chunk._getFixedHuffmanCode(0xAA).bitlen);
    expectedBytes.writeNonBoundary(chunk._getFixedHuffmanCode(0x00).value, chunk._getFixedHuffmanCode(0x00).bitlen);
    expectedBytes.writeNonBoundary(chunk._getFixedHuffmanCode(0xFF).value, chunk._getFixedHuffmanCode(0xFF).bitlen);
    expectedBytes.writeNonBoundary(chunk._getFixedHuffmanCode(0x00).value, chunk._getFixedHuffmanCode(0x00).bitlen);
    expectedBytes.writeNonBoundary(chunk._getFixedHuffmanCode(0xF0).value, chunk._getFixedHuffmanCode(0xF0).bitlen);
    expectedBytes.writeNonBoundary(chunk._getFixedHuffmanCode(0x0F).value, chunk._getFixedHuffmanCode(0x0F).bitlen);
    expectedBytes.writeNonBoundary(chunk._getLengthCode(3).value, chunk._getLengthCode(3).bitlen);
    expectedBytes.writeNonBoundary(chunk._getDistanceCode(5).value, chunk._getDistanceCode(5).bitlen);
    expectedBytes.writeNonBoundary(chunk._getFixedHuffmanCode(0xB0).value, chunk._getFixedHuffmanCode(0xB0).bitlen);
    expectedBytes.writeNonBoundary(chunk._getFixedHuffmanCode(0xB0).value, chunk._getFixedHuffmanCode(0xB0).bitlen);
    expectedBytes.writeNonBoundary(chunk._getFixedHuffmanCode(0x0F).value, chunk._getFixedHuffmanCode(0x0F).bitlen);
    expectedBytes.writeNonBoundary(chunk._getLengthCode(4).value, chunk._getLengthCode(4).bitlen);
    expectedBytes.writeNonBoundary(chunk._getDistanceCode(8).value, chunk._getDistanceCode(8).bitlen);
    expectedBytes.writeNonBoundary(chunk._getFixedHuffmanCode(0x04).value, chunk._getFixedHuffmanCode(0x04).bitlen);

    expectedBytes.write(chunk._adler32());

    expect(chunk.compress().bytes.toString()).toEqual(expectedBytes.bytes.toString());
  });
});

describe('write', () => {
  test('return byte array', () => {
    const chunk = new IdatChunk([0xFF, 0x00, 0xF0, 0x0F]);
    const data = new PngBytes(chunk.length);
    chunk.write(data);

    expect(data.bytes.toString()).toEqual([
      0x00, 0x00, 0x00, 0x0F,
      0x49, 0x44, 0x41, 0x54,
      0x78, 0x9C,
      0x01,
      0x04, 0x00,
      0xFB, 0xFF,
      0xFF, 0x00, 0xF0, 0x0F,
      0x05, 0xEF, 0x01, 0xFF,
      0x57, 0x8C, 0xC9, 0xB2,
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
