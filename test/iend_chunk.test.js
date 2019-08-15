import IendChunk from './../src/iend_chunk';
import PngBytes from './../src/png_bytes';

describe('write', () => {
  test('return byte array', () => {
    const chunk = new IendChunk();
    const data = new PngBytes(12);
    chunk.write(data);

    expect(data.bytes.toString()).toEqual([
      0x00, 0x00, 0x00, 0x00,
      0x49, 0x45, 0x4E, 0x44,
      0xAE, 0x42, 0x60, 0x82
    ].toString());
  });
});
