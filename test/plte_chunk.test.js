import PlteChunk from './../src/plte_chunk';
import PngBytes from './../src/png_bytes';

describe('_palette', () => {
  test('return byte array', () => {
    const chunk = new PlteChunk([
      {r: 0,   g: 0,   b: 0},
      {r: 255, g: 0,   b: 0},
      {r: 0,   g: 255, b: 0},
      {r: 0,   g: 0,   b: 255}
    ]);

    expect(chunk._palette()).toEqual([
      0x00, 0x00, 0x00, 
      0xFF, 0x00, 0x00, 
      0x00, 0xFF, 0x00, 
      0x00, 0x00, 0xFF 
    ]);
  });
})

describe('write', () => {
  test('return byte array', () => {
    const chunk = new PlteChunk([
      {r: 0,   g: 0,   b: 0},
      {r: 255, g: 0,   b: 0},
      {r: 0,   g: 255, b: 0},
      {r: 0,   g: 0,   b: 255}
    ]);
    const data = new PngBytes(24);
    chunk.write(data);

    expect(data.bytes.toString()).toEqual([
      0x00, 0x00, 0x00, 0x0C,
      0x50, 0x4C, 0x54, 0x45,
      0x00, 0x00, 0x00,
      0xFF, 0x00, 0x00, 
      0x00, 0xFF, 0x00, 
      0x00, 0x00, 0xFF,
      0x9B, 0xC0, 0x13, 0xDC
    ].toString());
  });
});

describe('length', () => {
  test('return chunk length', () => {
    const chunk = new PlteChunk([
      {r: 0,   g: 0,   b: 0},
      {r: 255, g: 0,   b: 0},
      {r: 0,   g: 255, b: 0},
      {r: 0,   g: 0,   b: 255}
    ]);
    const data = new PngBytes(24);

    expect(chunk.length).toEqual(24);
  })
});
