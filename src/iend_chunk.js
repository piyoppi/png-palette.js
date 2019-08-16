import CrcCalculator from './crc_calculator';

export default class IendChunk {
  constructor(palette) {
    this.palette = palette;
  }

  get length() {
    return 12;
  }

  *_chunkLength() {
    yield* [0x00, 0x00, 0x00, 0x00]
  }

  _chunkType() {
    return [0x49, 0x45, 0x4E, 0x44];
  }

  _chunkDataArray() {
    return this._chunkType();
  }

  *_chunkData() {
    yield* this._chunkDataArray();
  }

  *_crc() {
    const crc = CrcCalculator.calc(this._chunkDataArray());
    yield* [crc >>> 24, crc >>> 16, crc >>> 8, crc].map( val => val & 0x000000FF);
  }

  write(bytes) {
    bytes.write(this._chunkLength());
    bytes.write(this._chunkData());
    bytes.write(this._crc());
  }
}
