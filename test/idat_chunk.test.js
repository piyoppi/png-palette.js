import IdatChunk from './../src/idat_chunk';
import PngBytes from './../src/png_bytes';

describe('_cmf', () => {
  test('return byte array', () => {
    const chunk = new IdatChunk(1, 1, 8, 3, []);
    expect(chunk._cmf()).toEqual([0x78]);
  });
});

describe('_flg', () => {
  test('return byte array', () => {
    const chunk = new IdatChunk(1, 1, 8, 3, []);
    expect(chunk._flg()).toEqual([0x9C]);
  });
});
