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

    expect(chunk._getLengthCode(3)).toEqual({value: chunk._getFixedHuffmanCode(257).value, extraCode: 0, bitlen: 7, extraCodeBitLen: 0});
    expect(chunk._getLengthCode(4)).toEqual({value: chunk._getFixedHuffmanCode(258).value, extraCode: 0, bitlen: 7, extraCodeBitLen: 0});
    expect(chunk._getLengthCode(10)).toEqual({value: chunk._getFixedHuffmanCode(264).value, extraCode: 0, bitlen: 7, extraCodeBitLen: 0});
    expect(chunk._getLengthCode(11)).toEqual({value: chunk._getFixedHuffmanCode(265).value, extraCode: 0x00, bitlen: 7, extraCodeBitLen: 1});
    expect(chunk._getLengthCode(12)).toEqual({value: chunk._getFixedHuffmanCode(265).value, extraCode: 0x01, bitlen: 7, extraCodeBitLen: 1});
    expect(chunk._getLengthCode(13)).toEqual({value: chunk._getFixedHuffmanCode(266).value, extraCode: 0x00, bitlen: 7, extraCodeBitLen: 1});
    expect(chunk._getLengthCode(14)).toEqual({value: chunk._getFixedHuffmanCode(266).value, extraCode: 0x01, bitlen: 7, extraCodeBitLen: 1});
    expect(chunk._getLengthCode(15)).toEqual({value: chunk._getFixedHuffmanCode(267).value, extraCode: 0x00, bitlen: 7, extraCodeBitLen: 1});
    expect(chunk._getLengthCode(16)).toEqual({value: chunk._getFixedHuffmanCode(267).value, extraCode: 0x01, bitlen: 7, extraCodeBitLen: 1});
    expect(chunk._getLengthCode(17)).toEqual({value: chunk._getFixedHuffmanCode(268).value, extraCode: 0x00, bitlen: 7, extraCodeBitLen: 1});
    expect(chunk._getLengthCode(18)).toEqual({value: chunk._getFixedHuffmanCode(268).value, extraCode: 0x01, bitlen: 7, extraCodeBitLen: 1});
    expect(chunk._getLengthCode(19)).toEqual({value: chunk._getFixedHuffmanCode(269).value, extraCode: 0x00, bitlen: 7, extraCodeBitLen: 2});
    expect(chunk._getLengthCode(20)).toEqual({value: chunk._getFixedHuffmanCode(269).value, extraCode: 0x01, bitlen: 7, extraCodeBitLen: 2});
    expect(chunk._getLengthCode(21)).toEqual({value: chunk._getFixedHuffmanCode(269).value, extraCode: 0x02, bitlen: 7, extraCodeBitLen: 2});
    expect(chunk._getLengthCode(22)).toEqual({value: chunk._getFixedHuffmanCode(269).value, extraCode: 0x03, bitlen: 7, extraCodeBitLen: 2});
    expect(chunk._getLengthCode(23)).toEqual({value: chunk._getFixedHuffmanCode(270).value, extraCode: 0x00, bitlen: 7, extraCodeBitLen: 2});
    expect(chunk._getLengthCode(24)).toEqual({value: chunk._getFixedHuffmanCode(270).value, extraCode: 0x01, bitlen: 7, extraCodeBitLen: 2});
    expect(chunk._getLengthCode(25)).toEqual({value: chunk._getFixedHuffmanCode(270).value, extraCode: 0x02, bitlen: 7, extraCodeBitLen: 2});
    expect(chunk._getLengthCode(26)).toEqual({value: chunk._getFixedHuffmanCode(270).value, extraCode: 0x03, bitlen: 7, extraCodeBitLen: 2});
    expect(chunk._getLengthCode(27)).toEqual({value: chunk._getFixedHuffmanCode(271).value, extraCode: 0x00, bitlen: 7, extraCodeBitLen: 2});
    expect(chunk._getLengthCode(28)).toEqual({value: chunk._getFixedHuffmanCode(271).value, extraCode: 0x01, bitlen: 7, extraCodeBitLen: 2});
    expect(chunk._getLengthCode(29)).toEqual({value: chunk._getFixedHuffmanCode(271).value, extraCode: 0x02, bitlen: 7, extraCodeBitLen: 2});
    expect(chunk._getLengthCode(30)).toEqual({value: chunk._getFixedHuffmanCode(271).value, extraCode: 0x03, bitlen: 7, extraCodeBitLen: 2});
    expect(chunk._getLengthCode(31)).toEqual({value: chunk._getFixedHuffmanCode(272).value, extraCode: 0x00, bitlen: 7, extraCodeBitLen: 2});
    expect(chunk._getLengthCode(68)).toEqual({value: chunk._getFixedHuffmanCode(277).value, extraCode: 0x01, bitlen: 7, extraCodeBitLen: 4});
  });
});

describe('_getDistanceCode', () => {
  test('return a distance code', () => {
    const chunk = new IdatChunk([]);
    expect(chunk._getDistanceCode(1)).toEqual({value: 0x00, extraCode: 0, bitlen: 5, extraCodeBitLen: 0});
    expect(chunk._getDistanceCode(2)).toEqual({value: 0x01, extraCode: 0, bitlen: 5, extraCodeBitLen: 0});
    expect(chunk._getDistanceCode(3)).toEqual({value: 0x02, extraCode: 0, bitlen: 5, extraCodeBitLen: 0});
    expect(chunk._getDistanceCode(4)).toEqual({value: 0x03, extraCode: 0, bitlen: 5, extraCodeBitLen: 0});
    expect(chunk._getDistanceCode(5)).toEqual({value: 0x04, extraCode: 0x00, bitlen: 5, extraCodeBitLen: 1});
    expect(chunk._getDistanceCode(6)).toEqual({value: 0x04, extraCode: 0x01, bitlen: 5, extraCodeBitLen: 1});
    expect(chunk._getDistanceCode(7)).toEqual({value: 0x05, extraCode: 0x00, bitlen: 5, extraCodeBitLen: 1});
    expect(chunk._getDistanceCode(8)).toEqual({value: 0x05, extraCode: 0x01, bitlen: 5, extraCodeBitLen: 1});
    expect(chunk._getDistanceCode(9)).toEqual({value: 0x06, extraCode: 0x00, bitlen: 5, extraCodeBitLen: 2});
    expect(chunk._getDistanceCode(10)).toEqual({value: 0x06, extraCode: 0x01, bitlen: 5, extraCodeBitLen: 2});
    expect(chunk._getDistanceCode(11)).toEqual({value: 0x06, extraCode: 0x02, bitlen: 5, extraCodeBitLen: 2});
    expect(chunk._getDistanceCode(12)).toEqual({value: 0x06, extraCode: 0x03, bitlen: 5, extraCodeBitLen: 2});
    expect(chunk._getDistanceCode(13)).toEqual({value: 0x07, extraCode: 0x00, bitlen: 5, extraCodeBitLen: 2});
    expect(chunk._getDistanceCode(14)).toEqual({value: 0x07, extraCode: 0x01, bitlen: 5, extraCodeBitLen: 2});
    expect(chunk._getDistanceCode(15)).toEqual({value: 0x07, extraCode: 0x02, bitlen: 5, extraCodeBitLen: 2});
    expect(chunk._getDistanceCode(16)).toEqual({value: 0x07, extraCode: 0x03, bitlen: 5, extraCodeBitLen: 2});
    expect(chunk._getDistanceCode(17)).toEqual({value: 0x08, extraCode: 0x00, bitlen: 5, extraCodeBitLen: 3});
    expect(chunk._getDistanceCode(18)).toEqual({value: 0x08, extraCode: 0x01, bitlen: 5, extraCodeBitLen: 3});
    expect(chunk._getDistanceCode(19)).toEqual({value: 0x08, extraCode: 0x02, bitlen: 5, extraCodeBitLen: 3});
    expect(chunk._getDistanceCode(20)).toEqual({value: 0x08, extraCode: 0x03, bitlen: 5, extraCodeBitLen: 3});
    expect(chunk._getDistanceCode(31)).toEqual({value: 0x09, extraCode: 0x06, bitlen: 5, extraCodeBitLen: 3});
    expect(chunk._getDistanceCode(82)).toEqual({value: 0x0c, extraCode: 0x11, bitlen: 5, extraCodeBitLen: 5});
  });
});

describe('_inWindowData', () => {
  test('return bytes in the window', () => {
    const chunk = new IdatChunk([
      0xAA, 0x00, 0xFF, 0x00, 0xF0, 0x0F, 0x00, 0xFF, 0x00, 0xB0, 0xB0, 0x0F,
      0xF0, 0x0F, 0x00, 0xFF, 0x04
    ]);
    
    expect(chunk._inWindowData(4)).toEqual([0xAA, 0x00, 0xFF, 0x00]);
  })
});

describe('compress', () => {
  test('return a compressed data (17 bytes)', () => {
    const rawData = [
      0xAA, 0x00, 0xFF, 0x00,
      0xF0, 0x0F, 0x00, 0xFF,
      0x00, 0xB0, 0xB0, 0x0F,
      0xF0, 0x0F, 0x00, 0xFF,
      0x04
    ];
    const chunk = new IdatChunk(rawData);
    const codes = rawData.map( val => chunk._getFixedHuffmanCode(val) );
    const expectedBytes = new PngBytes(20);

    expectedBytes.writeNonBoundary(0b011, 3, true);
    expectedBytes.writeNonBoundary(PngBytes.reverse(codes[0].value, codes[0].bitlen), codes[0].bitlen, true);
    expectedBytes.writeNonBoundary(PngBytes.reverse(codes[1].value, codes[1].bitlen), codes[1].bitlen, true);
    expectedBytes.writeNonBoundary(PngBytes.reverse(codes[2].value, codes[2].bitlen), codes[2].bitlen, true);
    expectedBytes.writeNonBoundary(PngBytes.reverse(codes[3].value, codes[3].bitlen), codes[3].bitlen, true);
    expectedBytes.writeNonBoundary(PngBytes.reverse(codes[4].value, codes[4].bitlen), codes[4].bitlen, true);
    expectedBytes.writeNonBoundary(PngBytes.reverse(codes[5].value, codes[5].bitlen), codes[5].bitlen, true);

    const lengthCode1 = chunk._getLengthCode(3);
    expectedBytes.writeNonBoundary(PngBytes.reverse(lengthCode1.value, lengthCode1.bitlen), lengthCode1.bitlen, true);
    expectedBytes.writeNonBoundary(lengthCode1.extraCode, lengthCode1.extraCodeBitLen, true);

    const distCode1 = chunk._getDistanceCode(5);
    expectedBytes.writeNonBoundary(PngBytes.reverse(distCode1.value, distCode1.bitlen), distCode1.bitlen, true);
    expectedBytes.writeNonBoundary(distCode1.extraCode, distCode1.extraCodeBitLen, true);

    expectedBytes.writeNonBoundary(PngBytes.reverse(codes[9].value, codes[9].bitlen), codes[9].bitlen, true);
    expectedBytes.writeNonBoundary(PngBytes.reverse(codes[10].value, codes[10].bitlen), codes[10].bitlen, true);
    expectedBytes.writeNonBoundary(PngBytes.reverse(codes[11].value, codes[11].bitlen), codes[11].bitlen, true);

    const lengthCode2 = chunk._getLengthCode(4);
    expectedBytes.writeNonBoundary(PngBytes.reverse(lengthCode2.value, lengthCode2.bitlen), lengthCode2.bitlen, true);
    expectedBytes.writeNonBoundary(lengthCode2.extraCode, lengthCode2.extraCodeBitLen, true);

    const distCode2 = chunk._getDistanceCode(8);
    expectedBytes.writeNonBoundary(PngBytes.reverse(distCode2.value, distCode2.bitlen), distCode2.bitlen, true);
    expectedBytes.writeNonBoundary(distCode2.extraCode, distCode2.extraCodeBitLen, true);

    expectedBytes.writeNonBoundary(PngBytes.reverse(codes[16].value, codes[16].bitlen), codes[16].bitlen, true);
    expectedBytes.writeNonBoundary(0x00, 7, true);
    expectedBytes.write(chunk._adler32(), 4, true);

    expect(chunk.compress().bytes.toString()).toEqual(expectedBytes.bytes.toString());
  });

  test('return a compressed data (2x3 png pattern)', () => {
    const rawData = [
      0x00, 0x00, 0x01,
      0x00, 0x01, 0x01,
      0x00, 0x01, 0x01
    ];
    const expectedBytes = new PngBytes(13);
    const chunk = new IdatChunk(rawData);
    const codes = rawData.map( val => chunk._getFixedHuffmanCode(val) );

    expectedBytes.writeNonBoundary(0b011, 3, true);
    expectedBytes.writeNonBoundary(PngBytes.reverse(codes[0].value, codes[0].bitlen), codes[0].bitlen, true);
    expectedBytes.writeNonBoundary(PngBytes.reverse(codes[1].value, codes[1].bitlen), codes[1].bitlen, true);
    expectedBytes.writeNonBoundary(PngBytes.reverse(codes[2].value, codes[2].bitlen), codes[2].bitlen, true);
    expectedBytes.writeNonBoundary(PngBytes.reverse(codes[3].value, codes[3].bitlen), codes[3].bitlen, true);
    expectedBytes.writeNonBoundary(PngBytes.reverse(codes[4].value, codes[4].bitlen), codes[4].bitlen, true);

    const lengthCode = chunk._getLengthCode(3);
    expectedBytes.writeNonBoundary(PngBytes.reverse(lengthCode.value, lengthCode.bitlen), lengthCode.bitlen, true);
    expectedBytes.writeNonBoundary(lengthCode.extraCode, lengthCode.extraCodeBitLen, true);

    const distCode = chunk._getDistanceCode(3);
    expectedBytes.writeNonBoundary(PngBytes.reverse(distCode.value, distCode.bitlen), distCode.bitlen, true);
    expectedBytes.writeNonBoundary(distCode.extraCode, distCode.extraCodeBitLen, true);

    expectedBytes.writeNonBoundary(PngBytes.reverse(codes[8].value, codes[8].bitlen), codes[8].bitlen, true);
    expectedBytes.writeNonBoundary(0x00, 7);
    expectedBytes.write(chunk._adler32());

    expect(chunk.compress().bytes.toString()).toEqual(expectedBytes.bytes.toString());
  });

  test('return a compressed data (zero pattern)', () => {
    const chunk = new IdatChunk([
      0x00, 0x00
    ]);
    const expectedBytes = new PngBytes(8);
    const code = chunk._getFixedHuffmanCode(0x00);

    expectedBytes.writeNonBoundary(0b011, 3, true);
    expectedBytes.writeNonBoundary(PngBytes.reverse(code.value, code.bitlen), code.bitlen, true);
    expectedBytes.writeNonBoundary(PngBytes.reverse(code.value, code.bitlen), code.bitlen, true);
    expectedBytes.writeNonBoundary(0x00, 7);
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
