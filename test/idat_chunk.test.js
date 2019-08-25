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

describe('_getLengthCode', () => {
  test('return a length code', () => {
    const chunk = new IdatChunk([]);

    expect(chunk._getLengthCode(3)).toEqual({value: chunk._getFixedHuffmanCode(257).value, bitlen: 7});
    expect(chunk._getLengthCode(4)).toEqual({value: chunk._getFixedHuffmanCode(258).value, bitlen: 7});
    expect(chunk._getLengthCode(10)).toEqual({value: chunk._getFixedHuffmanCode(264).value, bitlen: 7});
    expect(chunk._getLengthCode(11)).toEqual({value: chunk._getFixedHuffmanCode(265).value << 1 | 0x00, bitlen: 8});
    expect(chunk._getLengthCode(12)).toEqual({value: chunk._getFixedHuffmanCode(265).value << 1 | 0x01, bitlen: 8});
    expect(chunk._getLengthCode(13)).toEqual({value: chunk._getFixedHuffmanCode(266).value << 1 | 0x00, bitlen: 8});
    expect(chunk._getLengthCode(14)).toEqual({value: chunk._getFixedHuffmanCode(266).value << 1 | 0x01, bitlen: 8});
    expect(chunk._getLengthCode(15)).toEqual({value: chunk._getFixedHuffmanCode(267).value << 1 | 0x00, bitlen: 8});
    expect(chunk._getLengthCode(16)).toEqual({value: chunk._getFixedHuffmanCode(267).value << 1 | 0x01, bitlen: 8});
    expect(chunk._getLengthCode(17)).toEqual({value: chunk._getFixedHuffmanCode(268).value << 1 | 0x00, bitlen: 8});
    expect(chunk._getLengthCode(18)).toEqual({value: chunk._getFixedHuffmanCode(268).value << 1 | 0x01, bitlen: 8});
    expect(chunk._getLengthCode(19)).toEqual({value: chunk._getFixedHuffmanCode(269).value << 2 | 0x00, bitlen: 9});
    expect(chunk._getLengthCode(20)).toEqual({value: chunk._getFixedHuffmanCode(269).value << 2 | 0x01, bitlen: 9});
    expect(chunk._getLengthCode(21)).toEqual({value: chunk._getFixedHuffmanCode(269).value << 2 | 0x02, bitlen: 9});
    expect(chunk._getLengthCode(22)).toEqual({value: chunk._getFixedHuffmanCode(269).value << 2 | 0x03, bitlen: 9});
    expect(chunk._getLengthCode(23)).toEqual({value: chunk._getFixedHuffmanCode(270).value << 2 | 0x00, bitlen: 9});
    expect(chunk._getLengthCode(24)).toEqual({value: chunk._getFixedHuffmanCode(270).value << 2 | 0x01, bitlen: 9});
    expect(chunk._getLengthCode(25)).toEqual({value: chunk._getFixedHuffmanCode(270).value << 2 | 0x02, bitlen: 9});
    expect(chunk._getLengthCode(26)).toEqual({value: chunk._getFixedHuffmanCode(270).value << 2 | 0x03, bitlen: 9});
    expect(chunk._getLengthCode(27)).toEqual({value: chunk._getFixedHuffmanCode(271).value << 2 | 0x00, bitlen: 9});
    expect(chunk._getLengthCode(28)).toEqual({value: chunk._getFixedHuffmanCode(271).value << 2 | 0x01, bitlen: 9});
    expect(chunk._getLengthCode(29)).toEqual({value: chunk._getFixedHuffmanCode(271).value << 2 | 0x02, bitlen: 9});
    expect(chunk._getLengthCode(30)).toEqual({value: chunk._getFixedHuffmanCode(271).value << 2 | 0x03, bitlen: 9});
  });
});

describe('_getDistanceCode', () => {
  test('return a distance code', () => {
    const chunk = new IdatChunk([]);
    expect(chunk._getDistanceCode(1)).toEqual({value: 0x00, bitlen: 5});
    expect(chunk._getDistanceCode(2)).toEqual({value: 0x01, bitlen: 5});
    expect(chunk._getDistanceCode(3)).toEqual({value: 0x02, bitlen: 5});
    expect(chunk._getDistanceCode(4)).toEqual({value: 0x03, bitlen: 5});
    expect(chunk._getDistanceCode(5)).toEqual({value: 0x04 << 1 | 0x00, bitlen: 6});
    expect(chunk._getDistanceCode(6)).toEqual({value: 0x04 << 1 | 0x01, bitlen: 6});
    expect(chunk._getDistanceCode(7)).toEqual({value: 0x05 << 1 | 0x00, bitlen: 6});
    expect(chunk._getDistanceCode(8)).toEqual({value: 0x05 << 1 | 0x01, bitlen: 6});
    expect(chunk._getDistanceCode(9)).toEqual({value: 0x06 << 2 | 0x00, bitlen: 7});
    expect(chunk._getDistanceCode(10)).toEqual({value: 0x06 << 2 | 0x01, bitlen: 7});
    expect(chunk._getDistanceCode(11)).toEqual({value: 0x06 << 2 | 0x02, bitlen: 7});
    expect(chunk._getDistanceCode(12)).toEqual({value: 0x06 << 2 | 0x03, bitlen: 7});
    expect(chunk._getDistanceCode(13)).toEqual({value: 0x07 << 2 | 0x00, bitlen: 7});
    expect(chunk._getDistanceCode(14)).toEqual({value: 0x07 << 2 | 0x01, bitlen: 7});
    expect(chunk._getDistanceCode(15)).toEqual({value: 0x07 << 2 | 0x02, bitlen: 7});
    expect(chunk._getDistanceCode(16)).toEqual({value: 0x07 << 2 | 0x03, bitlen: 7});
    expect(chunk._getDistanceCode(17)).toEqual({value: 0x08 << 3 | 0x00, bitlen: 8});
    expect(chunk._getDistanceCode(18)).toEqual({value: 0x08 << 3 | 0x01, bitlen: 8});
    expect(chunk._getDistanceCode(19)).toEqual({value: 0x08 << 3 | 0x02, bitlen: 8});
    expect(chunk._getDistanceCode(20)).toEqual({value: 0x08 << 3 | 0x03, bitlen: 8});
  });
});

describe('compress', () => {
  test('return a compressed data', () => {
    const chunk = new IdatChunk([
      0xAA, 0x00, 0xFF, 0x00, 0xF0, 0x0F, 0x00, 0xFF, 0x00, 0xB0, 0xB0, 0x0F,
      0xF0, 0x0F, 0x00, 0xFF, 0x04
    ]);
    const expectedBytes = new PngBytes(20);

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
    expectedBytes.writeNonBoundary(0x00, 7);
    expectedBytes.reverse();
    expectedBytes.write(chunk._adler32());

    expect(chunk.compress().bytes.toString()).toEqual(expectedBytes.bytes.toString());
  });

  test('return a compressed data (2x3 png pattern)', () => {
    const chunk = new IdatChunk([
      0x00, 0x00, 0x01,
      0x00, 0x01, 0x01,
      0x00, 0x01, 0x01
    ]);
    const expectedBytes = new PngBytes(13);

    expectedBytes.writeNonBoundary(0b110, 3);
    expectedBytes.writeNonBoundary(chunk._getFixedHuffmanCode(0x00).value, chunk._getFixedHuffmanCode(0x00).bitlen);
    expectedBytes.writeNonBoundary(chunk._getFixedHuffmanCode(0x00).value, chunk._getFixedHuffmanCode(0x00).bitlen);
    expectedBytes.writeNonBoundary(chunk._getFixedHuffmanCode(0x01).value, chunk._getFixedHuffmanCode(0x01).bitlen);
    expectedBytes.writeNonBoundary(chunk._getFixedHuffmanCode(0x00).value, chunk._getFixedHuffmanCode(0x00).bitlen);
    expectedBytes.writeNonBoundary(chunk._getFixedHuffmanCode(0x01).value, chunk._getFixedHuffmanCode(0x01).bitlen);
    expectedBytes.writeNonBoundary(chunk._getLengthCode(3).value, chunk._getLengthCode(3).bitlen);
    expectedBytes.writeNonBoundary(chunk._getDistanceCode(3).value, chunk._getDistanceCode(3).bitlen);
    expectedBytes.writeNonBoundary(chunk._getFixedHuffmanCode(0x01).value, chunk._getFixedHuffmanCode(0x01).bitlen);
    expectedBytes.writeNonBoundary(0x00, 7);
    expectedBytes.reverse();
    expectedBytes.write(chunk._adler32());

    expect(chunk.compress().bytes.toString()).toEqual(expectedBytes.bytes.toString());
  });

  test('return a compressed data (zero pattern)', () => {
    const chunk = new IdatChunk([
      0x00, 0x00
    ]);
    const expectedBytes = new PngBytes(8);

    expectedBytes.writeNonBoundary(0b110, 3);
    expectedBytes.writeNonBoundary(chunk._getFixedHuffmanCode(0x00).value, chunk._getFixedHuffmanCode(0x00).bitlen);
    expectedBytes.writeNonBoundary(chunk._getFixedHuffmanCode(0x00).value, chunk._getFixedHuffmanCode(0x00).bitlen);
    expectedBytes.writeNonBoundary(0x00, 7);
    expectedBytes.reverse();
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
