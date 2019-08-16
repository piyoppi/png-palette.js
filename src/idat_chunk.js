import CrcCalculator from './crc_calculator';
import Adler32 from './adler32';
import PngBytes from './../src/png_bytes';

export default class IdatChunk {
  constructor(data, option = {}) {
    this.data = data;

    this.fdict = option.fdict || 0;
    this.flevel = option.flevel || 2;
    this.slideWindowMode = option.slideWindowMode || 7;     // 2 ^ (slideWindowMode + 8) = actualSlideWindowSize
  }

  _chunkType() {
    return [0x49, 0x44, 0x41, 0x54];
  }

  *_chunkLength(dataLength) {
    yield* [dataLength >>> 24, dataLength >>> 16, dataLength >>> 8, dataLength].map( val => val & 0x000000FF);
  }

  _cmf() {
    return [this.slideWindowMode << 4 | 0x08];
  }

  _flg() {
    const cmf = this._cmf();
    const fval = this.flevel << 6 | this.fdict << 5;
    const fcheck = 31 - (((cmf * 256) + fval) % 31);
    return [fval | fcheck];
  }

  get slideWindowSize() {
    return Math.pow(this.slideWindowMode + 8, 2);
  }

  get rawDataLength() {
    const cycle = Math.ceil(this.data.length / 32768);
    return Math.ceil((cycle * (32 + 3) + this.data.length * 8 + 32) / 8);
  }

  _raw() {
    const cycle = Math.ceil(this.data.length / 32768);
    const byteLen = this.rawDataLength;
    const bytes = new PngBytes(byteLen);
    let writeBitCount = 0;
    let dataCursor = 0;

    for( let i=0; i<cycle; i++ ) {
      let bfinal = (cycle-1) === i;
      bytes.writeNonBoundary(bfinal, 1); 
      bytes.writeNonBoundary(0x00, 2); 

      const dataLength = Math.min(this.data.length, 32768);
      bytes.writeNonBoundary(dataLength, 16);
      bytes.writeNonBoundary(~dataLength + 1, 16);

      for( let n=0; n<this.data.length; n++ ) {
        bytes.writeNonBoundary(this.data[dataCursor++], 8); 
      }
    }

    bytes.writeNonBoundary(Adler32.calc(this.data), 32);
    return bytes;
  }

  write(bytes) {
    const dataLength = this.rawDataLength
    const chunkData = this._chunkType().concat(Array.from(this._raw()));
    bytes.write(this._chunkLength(this.rawDataLength));
    bytes.write(chunkData[Symbol.iterator]());
    bytes.write(this._crc(chunkData));
  }

  *_crc(data) {
    const crc = CrcCalculator.calc(data);
    yield* [crc >>> 24, crc >>> 16, crc >>> 8, crc].map( val => val & 0x000000FF);
  }
}
