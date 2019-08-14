import CrcCalculator from './../src/crc_calculator'

describe('calc', () => {
  test('return byte array', () => {
    const result = CrcCalculator.calc([
      0x49,
      0x48,
      0x44,
      0x52,
      0x00,
      0x00,
      0x00,
      0x01,
      0x00,
      0x00,
      0x00,
      0x01,
      0x08,
      0x03,
      0x00,
      0x00,
      0x00
    ]);

    expect(result).toEqual(0x28CB34BB);
  });
});
