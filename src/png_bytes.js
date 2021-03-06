export default class PngBytes {
  constructor(length) {
    this.buffer = new ArrayBuffer(length);
    this.bytes = new Uint8Array(this.buffer);
    this.cursor = 0;
    this.offset = 0;
  }

  write(arr, len = arr.length) {
    if( this.offset > 0 ) {
      this.offset = 0;
      this.cursor++;
    }

    for(let i=0; i<len; i++) {
      this.bytes[this.cursor++] = arr[i];
    }
  }

  static reverse(wordData, bitLen) {
    let v = wordData;
    v = ((v >> 1) & 0x5555) | ((v & 0x5555) << 1);
    v = ((v >> 2) & 0x3333) | ((v & 0x3333) << 2);
    v = ((v >> 4) & 0x0F0F) | ((v & 0x0F0F) << 4);
    v = (v >> 8) | (v << 8);

    return (v & 0xFFFF) >>> (16 - bitLen);
  }

  writeNonBoundary(data, bitlen, isLsb = false) {
    const cycle = Math.ceil((bitlen + this.offset) / 8);
    const bitLengthInlastByte = (this.offset + bitlen) % 8;

    let offset = this.offset;
    let buf = data & Math.pow(2, bitlen) - 1;
    let currentBitlen = bitlen;

    for(let i=0; i<cycle; i++) {
      let putValue;
      const removedBitlen = 8 - offset;

      if( isLsb ) {
        putValue = (buf & (Math.pow(2, 8 - offset) - 1)) << offset;
        buf >>>= removedBitlen;
      } else {
        putValue = buf >>> Math.max(currentBitlen - (8 - offset), 0);
        buf &= Math.pow(2, currentBitlen + 1) - 1;
      }

      if (i === cycle-1 && bitLengthInlastByte > 0 && !isLsb) {
        putValue = putValue << (8 - bitLengthInlastByte);
      }

      this.bytes[this.cursor++] |= putValue;

      currentBitlen -= removedBitlen;

      offset = 0;
    }

    this.offset = bitLengthInlastByte;
    if( this.offset > 0 ) this.cursor--;
  }
}
