import CrcCalculator from './crc_calculator';

export default class PlteChunk {
  constructor(palette) {
    this.palette = palette;
  }

  get length() {
    return 12 + 3 * this.palette.length;
  }

  _chunkLength() {
    const length = this.palette.length * 3;
    return [length >>> 24, length >>> 16, length >>> 8, length].map( val => val & 0x000000FF);
  }

  _chunkType() {
    return [0x50, 0x4C, 0x54, 0x45];
  }

  _palette() {
    let palette = [];
    this.palette.forEach( color => {
      palette.push(color.r);
      palette.push(color.g);
      palette.push(color.b);
    });

    return palette;
  }

  _chunkDataArray() {
    return this._chunkType()
      .concat(this._palette());
  }

  _chunkData() {
    return this._chunkDataArray();
  }

  _crc() {
    const crc = CrcCalculator.calc(this._chunkDataArray());
    return [crc >>> 24, crc >>> 16, crc >>> 8, crc].map( val => val & 0x000000FF);
  }

  write(bytes) {
    bytes.write(this._chunkLength());
    bytes.write(this._chunkData());
    bytes.write(this._crc());
  }
}
