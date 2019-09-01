import PngBytes from './../src/png_bytes';

describe('reverse', () => {
  test('converted to lsb', () => {
    expect(PngBytes.reverse(0b10101010, 8)).toEqual(0b01010101);
    expect(PngBytes.reverse(0b1100, 4)).toEqual(0b0011);
    expect(PngBytes.reverse(0b0000000010010011, 16)).toEqual(0b1100100100000000);
    expect(PngBytes.reverse(0b0000000000111100, 16)).toEqual(0b0011110000000000);
    expect(PngBytes.reverse(1, 1)).toEqual(1);
    expect(PngBytes.reverse(1, 2)).toEqual(0b10);
  });
});

describe('writeNonBoundary', () => {
  describe('padding from lsb', () => {
    test('written bytes when bitlen is 1/2 bytes', () => {
      const data = new PngBytes(1);
      data.writeNonBoundary(0b1100, 8, true);

      expect(data.bytes.toString()).toEqual([0b00001100].toString());
    });

    test('written bytes when bitlen is 1 bytes', () => {
      const data = new PngBytes(1);
      data.writeNonBoundary(0b11000, 5, true);
      data.writeNonBoundary(0b110, 3, true);

      expect(data.bytes.toString()).toEqual([0b11011000].toString());
    });

    test('written bytes when bitlen is 3 bits', () => {
      const data = new PngBytes(1);
      data.writeNonBoundary(1, 1, true);
      data.writeNonBoundary(0b10, 2, true);

      expect(data.bytes.toString()).toEqual([0b00000101].toString());
    });

    test('written bytes when bitlen is 11 bits', () => {
      const data = new PngBytes(2);
      data.writeNonBoundary(1, 1, true);
      data.writeNonBoundary(0b10, 2, true);
      data.writeNonBoundary(0b00110000, 8, true);

      expect(data.bytes.toString()).toEqual([0b10000101, 0b00000001].toString());
    });

    test('written bytes when bitlen is 3/2 bytes', () => {
      const data = new PngBytes(2);
      data.writeNonBoundary(0x123, 12, true);

      expect(data.bytes.toString()).toEqual([0x23, 0x01].toString());
    });
  });

  describe('padding from msb', () => {
    test('written bytes when bitlen is 3 bits', () => {
      const data = new PngBytes(1);
      data.writeNonBoundary(1, 1);
      data.writeNonBoundary(0b10, 2);
      data.writeNonBoundary(0b111, 3);

      expect(data.bytes.toString()).toEqual([0b11011100].toString());
    });

    test('written bytes when offset is zero', () => {
      const data = new PngBytes(1);
      data.writeNonBoundary(0x12, 8);

      expect(data.bytes.toString()).toEqual([0x12].toString());
    });

    test('written bytes when bitlen is 1 bit', () => {
      const data = new PngBytes(1);
      data.writeNonBoundary(1, 1);

      expect(data.bytes.toString()).toEqual([0x80].toString());
    });

    test('written bytes when bitlen is 1/2 bytes', () => {
      const data = new PngBytes(1);
      data.writeNonBoundary(0b0010, 4);

      expect(data.bytes.toString()).toEqual([0b00100000].toString());
    });

    test('written bytes when bitlen is 3/2 bytes', () => {
      const data = new PngBytes(2);
      data.writeNonBoundary(0x123, 12);

      expect(data.bytes.toString()).toEqual([0x12, 0x30].toString());
    });

    test('written bytes when bitlen is 5/4 bytes', () => {
      const data = new PngBytes(3);
      data.writeNonBoundary(0x1234A, 20);

      expect(data.bytes.toString()).toEqual([0x12, 0x34, 0xA0].toString());
    });

    test('written bytes when bitlen is 3 bytes', () => {
      const data = new PngBytes(3);
      data.writeNonBoundary(0x1234A9, 24);

      expect(data.bytes.toString()).toEqual([0x12, 0x34, 0xA9].toString());
    });

    test('written bytes when has offset', () => {
      const data = new PngBytes(3);
      data.writeNonBoundary(0b001, 3);
      data.writeNonBoundary(0b0100101, 7);

      expect(data.bytes.toString()).toEqual([0b00101001, 0b01000000, 0].toString());
    });

    test('written bytes when has offset', () => {
      const data = new PngBytes(5);
      data.writeNonBoundary(1, 1);
      data.writeNonBoundary(0, 2);
      data.writeNonBoundary(0x04, 16);
      data.writeNonBoundary(~0x04 + 1, 16);

      expect(data.bytes.toString()).toEqual([
        0b10000000,
        0b00000000,
        0b10011111,
        0b11111111,
        0b10000000
      ].toString());
    });
  });
});
