import CrcCalculator from './crc_calculator';

export default class TrnsChunk {
  constructor(palette) {
    this.palette = palette;
  }

  get length() {
    return 12 + this.palette.length;
  }

  _crc() {
    const crc = CrcCalculator.calc(this._chunkDataArray());
    return [crc >>> 24, crc >>> 16, crc >>> 8, crc].map( val => val & 0x000000FF);
  }

  _chunkLength() {
    const length = this.palette.length;
    return [length >>> 24, length >>> 16, length >>> 8, length].map( val => val & 0x000000FF);
  }

  _chunkType() {
    return [0x74, 0x52, 0x4E, 0x53];
  }

  _alphaPalette() {
    return this.palette.map( color => color.a );
  }

  _chunkDataArray() {
    return this._chunkType()
      .concat(this._alphaPalette())
  }

  write(bytes) {
    bytes.write(this._chunkLength());
    bytes.write(this._chunkDataArray());
    bytes.write(this._crc());
  }
}
