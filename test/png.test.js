import Png from './../src/png';

const pixels = [
  0x00, 0xF0, 0x00, 0xFF,
  0xFF, 0x00, 0x00, 0xFF,
  0x00, 0xFF, 0x00, 0xFF,
  0x00, 0x00, 0xFF, 0xFF,
  0xFF, 0x00, 0x00, 0xFF,
  0x00, 0xFF, 0x00, 0xFF,
  0x00, 0x00, 0xFF, 0xFF,
  0x00, 0xF0, 0x00, 0xFF,
  0x00, 0x00, 0x00, 0xFF,
];

describe('_extractColors', () => {
  test('extracted colors in the given data', () => {
    const png = new Png(pixels, 3, 3);
    const extractedColors = png._extractColors();
    expect(extractedColors.length).toEqual(5);
    expect(extractedColors).toContainEqual({r: 0x00, g: 0x00, b: 0x00});
    expect(extractedColors).toContainEqual({r: 0xFF, g: 0x00, b: 0x00});
    expect(extractedColors).toContainEqual({r: 0x00, g: 0xFF, b: 0x00});
    expect(extractedColors).toContainEqual({r: 0x00, g: 0x00, b: 0xFF});
    expect(extractedColors).toContainEqual({r: 0x00, g: 0xF0, b: 0x00});
  });
});

describe('convertToPaletteMode', () => {
  let png;

  beforeEach(() => {
    png = new Png(pixels, 3, 3);
    png.convertToPaletteMode();
  });

  test('converted to png data', () => {
    expect(png.rawData).toEqual([
      0x00, 0x00, 0x01, 0x02,
      0x00, 0x03, 0x01, 0x02,
      0x00, 0x03, 0x00, 0x04
    ]);
  });

  test('palette mode is true', () => {
    expect(png.isPaletteMode).toEqual(true);
  });
});
