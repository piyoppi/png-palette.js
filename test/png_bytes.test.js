import PngBytes from './../src/png_bytes';

describe('writeNonBoundary', () => {
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
    const data = new PngBytes(3);
    data.writeNonBoundary(0b001, 3);
    data.writeNonBoundary(0b01001010010111, 14);

    expect(data.bytes.toString()).toEqual([0b00101001, 0b01001011, 0b10000000].toString());
  });
});
