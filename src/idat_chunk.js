import CrcCalculator from './crc_calculator';
import Adler32 from './adler32';
import PngBytes from './png_bytes';

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

  _getFixedHuffmanCode(val) {
    if( val <= 143 ) {
      return {value: val + 48, bitlen: 8};
    } else if( val <= 255 ) {
      return {value: val + 256, bitlen: 9};
    } else if( val <= 279 ) {
      return {value: val - 256, bitlen: 7};
    } else if( val <= 287 ) {
      return {value: val - 88, bitlen: 8};
    }
  }

  _getLengthCode(val) {
    if( val <= 10 ) {
      const fixedHuffmanCode = this._getFixedHuffmanCode(val + 254);
      return {...fixedHuffmanCode, extraCode: 0, extraCodeBitLen: 0};
    } else if( val <= 18 ) {
      const fixedHuffmanCode = this._getFixedHuffmanCode(val + 254 - (val - 11 - Math.floor((val - 11) / 2)));
      return {value: fixedHuffmanCode.value, extraCode: (val - 11) % 2, bitlen: fixedHuffmanCode.bitlen, extraCodeBitLen: 1};
    } else if( val <= 34 ) {
      const fixedHuffmanCode = this._getFixedHuffmanCode(val + 250 - (val - 19 - Math.floor((val - 19) / 4)));
      return {value: fixedHuffmanCode.value, extraCode: (val - 19) % 4, bitlen: fixedHuffmanCode.bitlen, extraCodeBitLen: 2};
    } else if( val <= 66 ) {
      const fixedHuffmanCode = this._getFixedHuffmanCode(val + 238 - (val - 35 - Math.floor((val - 35) / 8)));
      return {value: fixedHuffmanCode.value, extraCode: (val - 35) % 8, bitlen: fixedHuffmanCode.bitlen, extraCodeBitLen: 3};
    } else if( val <= 130 ) {
      const fixedHuffmanCode = this._getFixedHuffmanCode(val + 210 - (val - 67 - Math.floor((val - 67) / 16)));
      return {value: fixedHuffmanCode.value, extraCode: (val - 67) % 16, bitlen: fixedHuffmanCode.bitlen, extraCodeBitLen: 4};
    } else if( val <= 257 ) {
      const fixedHuffmanCode = this._getFixedHuffmanCode(val + 150 - (val - 131 - Math.floor((val - 131) / 32)));
      return {value: fixedHuffmanCode.value, extraCode: (val - 131) % 32, bitlen: fixedHuffmanCode.bitlen, extraCodeBitLen: 5};
    } else if( val === 258 ) {
      const fixedHuffmanCode = this._getFixedHuffmanCode(285);
      return {...fixedHuffmanCode, extraCode: 0, extraCodeBitLen: 0};
    }
  }

  _getDistanceCode(val) {
    if( val <= 4 ) {
      return {value: val - 1, extraCode: 0, bitlen: 5, extraCodeBitLen: 0};
    } else if( val <= 8 ) {
      return {value: (val - 1 - (val - 5 - Math.floor((val - 5) / 2))), extraCode: (val - 5) % 2, bitlen: 5, extraCodeBitLen: 1};
    } else if( val <= 16 ) {
      return {value: (val - 3 - (val - 9 - Math.floor((val - 9) / 4))), extraCode: (val - 9) % 4, bitlen: 5, extraCodeBitLen: 2};
    } else if( val <= 32 ) {
      return {value: (val - 9 - (val - 17 - Math.floor((val - 17) / 8))), extraCode: (val - 17) % 8, bitlen: 5, extraCodeBitLen: 3};
    } else if( val <= 64 ) {
      return {value: (val - 23 - (val - 33 - Math.floor((val - 33) / 16))), extraCode: (val - 33) % 16, bitlen: 5, extraCodeBitLen: 4};
    } else if( val <= 128 ) {
      return {value: (val - 53 - (val - 65 - Math.floor((val - 65) / 32))), extraCode: (val - 65) % 32, bitlen: 5, extraCodeBitLen: 5};
    } else if( val <= 256 ) {
      return {value: (val - 115 - (val - 129 - Math.floor((val - 129) / 64))), extraCode: (val - 129) % 64, bitlen: 5, extraCodeBitLen: 6};
    } else if( val <= 512 ) {
      return {value: (val - 241 - (val - 257 - Math.floor((val - 257) / 128))), extraCode: (val - 257) % 128, bitlen: 5, extraCodeBitLen: 7};
    } else if( val <= 1024 ) {
      return {value: (val - 495 - (val - 513 - Math.floor((val - 513) / 256))), extraCode: (val - 513) % 256, bitlen: 5, extraCodeBitLen: 8};
    } else if( val <= 2048 ) {
      return {value: (val - 1005 - (val - 1025 - Math.floor((val - 1025) / 512))), extraCode: (val - 1025) % 512, bitlen: 5, extraCodeBitLen: 9};
    } else if( val <= 4096 ) {
      return {value: (val - 2027 - (val - 2049 - Math.floor((val - 2049) / 1024))), extraCode: (val - 2049) % 1024, bitlen: 5, extraCodeBitLen: 10};
    } else if( val <= 8192 ) {
      return {value: (val - 4073 - (val - 4097 - Math.floor((val - 4097) / 2048))), extraCode: (val - 4097) % 2048, bitlen: 5, extraCodeBitLen: 11};
    } else if( val <= 16384 ) {
      return {value: (val - 8167 - (val - 8193 - Math.floor((val - 8193) / 4096))), extraCode: (val - 8193) % 4096, bitlen: 5, extraCodeBitLen: 12};
    } else if( val <= 32768 ) {
      return {value: (val - 16357 - (val - 16385 - Math.floor((val - 16385) / 8192))), extraCode: (val - 16385) % 8192, bitlen: 5, extraCodeBitLen: 13};
    }
  }

  _getStartWindowCursor(cursor) {
    return Math.max(0, cursor - this.slideWindowSize);
  }

  _inWindowData(cursor) {
    const windowSize = Math.min(this.slideWindowSize, cursor - this._getStartWindowCursor(cursor));
    return this.data.slice(this._getStartWindowCursor(cursor), windowSize);
  }

  _findInWindow(buffer, cursor) {
    const inWindowData = this._inWindowData(cursor);

    let findOffset = inWindowData.length - 1;
    let foundCursor = -1;
    let maxFoundCount = -1;

    while(findOffset >= 1) {
      let foundCount = 0;
      const firstCursor = inWindowData.lastIndexOf(buffer[0], findOffset);
      if( firstCursor < 0 ) break;

      for(let i=1; i<buffer.length; i++) {
        if( inWindowData[firstCursor + i] === buffer[i] ) {
          foundCount++;
        } else {
          break;
        }
      }

      if( foundCount > maxFoundCount ) {
        foundCursor = firstCursor;
        maxFoundCount = foundCount;
      }

      if( foundCount === buffer.length - 1 ) {
        break;
      }

      findOffset = firstCursor - 1;
    }

     return {
       cursor: foundCursor,
       length: maxFoundCount + 1
     };
  }

  compress() {
    const bytes = new PngBytes(6 + this.data.length);
    let bitCounter = 0;

    const write = (code) => {
      bytes.writeNonBoundary(PngBytes.reverse(code.value, code.bitlen), code.bitlen, true);
      bitCounter += code.bitlen;
      if( typeof code.extraCode !== 'undefined' ) {
        bytes.writeNonBoundary(code.extraCode, code.extraCodeBitLen, true);
        bitCounter += code.extraCodeBitLen;
      }
    };

    const bfinal = 1;
    write({value: bfinal, bitlen: 1});
    write({value: 0x02, bitlen: 2});

    write(this._getFixedHuffmanCode(this.data[0]));

    let buffer = [];
    for( let n=1; n<this.data.length; n++ ) {
      const foundBytePosition = this._inWindowData(n).indexOf(this.data[n]);
      const startCursor = n - buffer.length;

      buffer.push(this.data[n]);

      if( foundBytePosition < 0 || (n === this.data.length - 1) ) {
        if( buffer.length <= 3 ) {
          for( let i=0; i<buffer.length; i++ ) {
            write(this._getFixedHuffmanCode(buffer[i]));
          }
        } else {
          const lastByte = buffer.splice(buffer.length - 1, 1)[0];
          let currentWord = buffer;
          let offsetStartCursor = 0;

          while(currentWord.length > 0) {
            const foundResult = this._findInWindow(currentWord, startCursor + offsetStartCursor);
            if( foundResult.cursor >= 0 && foundResult.length >= 3 ) {
              const dist = startCursor + offsetStartCursor - foundResult.cursor;
              write(this._getLengthCode(foundResult.length));
              write(this._getDistanceCode(dist))
              currentWord.splice(0, foundResult.length);
              offsetStartCursor += foundResult.length;
            } else {
              write(this._getFixedHuffmanCode(currentWord[0]));
              currentWord.splice(0, 1);
              offsetStartCursor++;
            }
          }

          n--;
        }

        buffer = [];
      }
    }
    
    write({value: 0x00, bitlen: 7})
    bytes.write(this._adler32());

    const byteLength = Math.ceil(bitCounter / 8) + 4;
    const resultBytes = new PngBytes(byteLength);
    resultBytes.write(bytes.bytes, byteLength);
    this._calculatedCompressedValue = resultBytes;

    return resultBytes;
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
