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

  reverse(start = 0, end = this.bytes.length) {
    for( let i=start; i<end; i++ ) {
      let v = this.bytes[i];
      v = ((v >> 1) & 0x55) | ((v & 0x55) << 1);
      v = ((v >> 2) & 0x33) | ((v & 0x33) << 2);
      v = (v >> 4) | (v << 4);
      this.bytes[i] = v;
    }
  }

  writeNonBoundary(data, bitlen) {
    const cycle = Math.ceil((bitlen + this.offset) / 8);
    const bitLengthInlastByte = (this.offset + bitlen) % 8;

    let offset = this.offset;
    let buf = data & Math.pow(2, bitlen) - 1;
    let currentBitlen = bitlen;

    for(let i=0; i<cycle; i++) {
      let putValue = buf >>> Math.max(currentBitlen - (8 - offset), 0);
      if( i === cycle-1 && bitLengthInlastByte > 0) {
        putValue = putValue << (8 - bitLengthInlastByte);
      }

      this.bytes[this.cursor++] |= putValue;

      const removedBitlen = 8 - offset;
      currentBitlen -= removedBitlen;
      buf &= Math.pow(2, currentBitlen + 1) - 1;

      offset = 0;
    }

    this.offset = bitLengthInlastByte;
    if( this.offset > 0 ) this.cursor--;
  }
}
