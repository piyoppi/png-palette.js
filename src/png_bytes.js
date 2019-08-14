export default class PngBytes {
  constructor(length) {
    this.buffer = new ArrayBuffer(length);
    this.bytes = new Uint8Array(this.buffer);
    this.cursor = 0;
  }

  write(itr) {
    for(let val of itr) {
      this.bytes[this.cursor++] = val;
    }
  }
}
