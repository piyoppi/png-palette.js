import CrcCalculator from './crc_calculator';

export const ColorType = {
  palette: 1,
  color: 2,
  alpha: 4
}

export default class IdhrChunk {
  constructor(width, height, depth, colorType) {
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.colorType = colorType;
  }

  get length() {
    return 25;
  }

  _imageWidth() {
    return [this.width >>> 24, this.width >>> 16, this.width >>> 8, this.width].map( val => val & 0x000000FF);
  }

  _imageHeight() {
    return [this.height >>> 24, this.height >>> 16, this.height >>> 8, this.height].map( val => val & 0x000000FF);
  }

  *_crc() {
    const crc = CrcCalculator.calc(this._chunkDataArray());
    yield* [crc >>> 24, crc >>> 16, crc >>> 8, crc].map( val => val & 0x000000FF);
  }

  *_chunkLength() {
    yield* [0x00, 0x00, 0x00, 0x0D];
  }

  _chunkType() {
    return [0x49, 0x48, 0x44, 0x52];
  }

  _depth() {
    return [this.depth];
  }

  _colorType() {
    return [this.colorType];
  }

  _compressMethod() {
    return [0x00];
  }

  _filterMethod() {
    return [0x00];
  }

  _interlace() {
    return [0x00];
  }

  _chunkDataArray() {
    return this._chunkType()
      .concat(this._imageWidth())
      .concat(this._imageHeight())
      .concat(this._depth())
      .concat(this._colorType())
      .concat(this._compressMethod())
      .concat(this._filterMethod())
      .concat(this._interlace())
  }

  *_chunkData() {
    yield* this._chunkDataArray();
  }

  write(bytes) {
    bytes.write(this._chunkLength());
    bytes.write(this._chunkData());
    bytes.write(this._crc());
  }
}
