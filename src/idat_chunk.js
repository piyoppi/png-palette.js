import CrcCalculator from './crc_calculator';
import Adler32 from './adler32';

export default class IdatChunk {
  constructor(width, height, depth, colorType, palette, data, option = {}) {
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.colorType = colorType;
    this.palette = palette;
    this.data = data;

    this.fdict = option.fdict || 0;
    this.flevel = option.flevel || 2;
    this.slideWindowMode = option.slideWindowMode || 7;     // 2 ^ (slideWindowMode + 8) = actualSlideWindowSize
  }

  _chunkType() {
    return [0x49, 0x44, 0x41, 0x54];
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

  writeRaw(bytes) {
    const cycle = Math.ceil(this.data.length / 32768);
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
  }

  *_crc() {
    const crc = CrcCalculator.calc(this._chunkDataArray());
    yield* [crc >>> 24, crc >>> 16, crc >>> 8, crc].map( val => val & 0x000000FF);
  }

  *_adler32() {
    const adler32 = Adler32.calc(this.data);
    yield* [adler32 >>> 24, adler32 >>> 16, adler32 >>> 8, adler32].map( val => val & 0x000000FF);
  }
}
