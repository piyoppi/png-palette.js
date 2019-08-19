import CrcCalculator from './crc_calculator';
import Adler32 from './adler32';
import PngBytes from './png_bytes';

export const DeflateDataType = {
  raw: 0,
  fixedDict: 1
}

export default class IdatChunk {
  constructor(data, option = {}) {
    this.data = data;

    this.fdict = option.fdict || 0;
    this.flevel = option.flevel || 2;
    this.slideWindowMode = option.slideWindowMode || 7;     // 2 ^ (slideWindowMode + 8) = actualSlideWindowSize
    this.dataMode = DeflateDataType.raw;
  }

  get length() {
    switch( this.dataMode ) {
      case DeflateDataType.raw:
        return 12 + 2 + this.rawDataLength;
    }
  }

  _chunkType() {
    return [0x49, 0x44, 0x41, 0x54];
  }

  _chunkLength(dataLength) {
    return [dataLength >>> 24, dataLength >>> 16, dataLength >>> 8, dataLength].map( val => val & 0x000000FF);
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
    return cycle * 3 + 2 + this.data.length + 4
  }

  _raw() {
    const cycle = Math.ceil(this.data.length / 32768);
    const byteLen = this.rawDataLength;
    const bytes = new PngBytes(byteLen);
    let writeBitCount = 0;
    let dataCursor = 0;

    for( let i=0; i<cycle; i++ ) {
      const bfinal = (cycle-1) === i ? 1 : 0;
      const dataLength = Math.min(this.data.length, 32768);
      const dataLengthComplement = (~dataLength) & 0xFFFF;
      bytes.write([0x00 | bfinal]);
      bytes.write([dataLength, dataLength >>> 8].map( val => val & 0xFF ));
      bytes.write([dataLengthComplement, dataLengthComplement >>> 8].map( val => val & 0xFF ));

      for( let n=0; n<this.data.length; n++ ) {
        bytes.write([this.data[dataCursor++]]);
      }
    }

    bytes.write(this._adler32());
    return bytes;
  }

  write(bytes) {
    const dataLength = this.rawDataLength
    const chunkData = this._cmf()
      .concat(this._flg())
      .concat(Array.from(this._raw().bytes));
    const chunkContent = this._chunkType().concat(chunkData);

    bytes.write(this._chunkLength(chunkData.length));
    bytes.write(chunkContent);
    bytes.write(this._crc(chunkContent));
  }

  _adler32() {
    const adler32 = Adler32.calc(this.data);
    return [adler32 >>> 24, adler32 >>> 16, adler32 >>> 8, adler32].map( val => val & 0x000000FF);
  }

  _crc(data) {
    const crc = CrcCalculator.calc(data);
    return [crc >>> 24, crc >>> 16, crc >>> 8, crc].map( val => val & 0x000000FF);
  }
}
