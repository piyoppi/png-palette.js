import IdhrChunk, { ColorType } from './../src/idhr_chunk'
import PngBytes from './../src/png_bytes';

describe('_imageWidth', () => {
  test('return byte array', () => {
    const chunk = new IdhrChunk(128, 128, 8, ColorType.palette + ColorType.color);
    const arr = chunk._imageWidth();
    expect(arr[0]).toEqual(0x00);
    expect(arr[1]).toEqual(0x00);
    expect(arr[2]).toEqual(0x00);
    expect(arr[3]).toEqual(0x80);
  });
});

describe('_imageHeight', () => {
  test('return byte array', () => {
    const chunk = new IdhrChunk(128, 128, 8, ColorType.palette + ColorType.color);
    const arr = chunk._imageHeight();
    expect(arr[0]).toEqual(0x00);
    expect(arr[1]).toEqual(0x00);
    expect(arr[2]).toEqual(0x00);
    expect(arr[3]).toEqual(0x80);
  });
});

describe('_chunkDataArray', () => {
  const chunk = new IdhrChunk(1, 1, 8, ColorType.palette + ColorType.color);
  test('return byte array', () => {
    const arr = chunk._chunkDataArray();
    // chunk type === IDHR
    expect(arr[0]).toEqual(0x49);
    expect(arr[1]).toEqual(0x48);
    expect(arr[2]).toEqual(0x44);
    expect(arr[3]).toEqual(0x52);
    // Width
    expect(arr[4]).toEqual(0x00);
    expect(arr[5]).toEqual(0x00);
    expect(arr[6]).toEqual(0x00);
    expect(arr[7]).toEqual(0x01);
    // Height
    expect(arr[8]).toEqual(0x00);
    expect(arr[9]).toEqual(0x00);
    expect(arr[10]).toEqual(0x00);
    expect(arr[11]).toEqual(0x01);
    // Depth
    expect(arr[12]).toEqual(0x08);
    // Color
    expect(arr[13]).toEqual(0x03);
    // Compress
    expect(arr[14]).toEqual(0x00);
    // Filter
    expect(arr[15]).toEqual(0x00);
    // Interlace
    expect(arr[16]).toEqual(0x00);
  });
});

describe('write', () => {
  test('return byte array', () => {
    const chunk = new IdhrChunk(1, 1, 8, ColorType.palette + ColorType.color);
    const data = new PngBytes(25);
    chunk.write(data);
    expect(data.bytes.toString()).toEqual([
      0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01,
      0x00, 0x00, 0x00, 0x01,
      0x08,
      0x03,
      0x00,
      0x00,
      0x00,
      0x28, 0xCB, 0x34, 0xBB
    ].toString());
  });
});
