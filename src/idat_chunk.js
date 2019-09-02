import CrcCalculator from './crc_calculator';
import Adler32 from './adler32';
import PngBytes from './png_bytes';
import Deflate from './deflate';

export const DeflateDataType = {
  raw: 0,
  fixedHuffman: 1
}

export default class IdatChunk {
  constructor(data, option = {}) {
    this.data = data;

    this.fdict = option.fdict || 0;
    this.flevel = option.flevel || 2;
    this.slideWindowMode = option.slideWindowMode || 7;     // 2 ^ (slideWindowMode + 8) = actualSlideWindowSize
    this.dataMode = option.dataMode || DeflateDataType.raw;

    this._calculatedCompressedValue = null;

    if( this.data && (this.data.length > 0) && this.dataMode === DeflateDataType.fixedHuffman ) {
      this.compress();
    }
  }

  get length() {
    switch( this.dataMode ) {
      case DeflateDataType.raw:
        return 12 + 2 + this.rawDataLength;
      case DeflateDataType.fixedHuffman:
        return 12 + 2 + this._calculatedCompressedValue.bytes.length;
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
    return Math.pow(2, this.slideWindowMode + 8);
  }

  get rawDataLength() {
    const cycle = Math.ceil(this.data.length / 32768);
    return cycle * 3 + 2 + this.data.length + 4
  }

  _raw() {
    const cycle = Math.ceil(this.data.length / 32768);
    const bytes = new PngBytes(this.rawDataLength);
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

  compress() {
    const deflate = new Deflate(this.data, this.slideWindowSize);
    const compressedData = deflate.compress(4);
    compressedData.write(this._adler32());
    this._calculatedCompressedValue = compressedData;

    return compressedData;
  }

  write(bytes) {
    let chunkData = this._cmf().concat(this._flg());

    switch(this.dataMode) {
      case DeflateDataType.raw:
        chunkData = chunkData.concat(Array.from(this._raw().bytes));
        break;
      case DeflateDataType.fixedHuffman:
        chunkData = chunkData.concat(Array.from(this._calculatedCompressedValue.bytes));
        break;
    }

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
