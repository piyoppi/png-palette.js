let crcTable = null;

export default class CrcCalculator {
  static _makeCrcTable() {
    crcTable = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        if (c & 1)
          c = 0xEDB88320 ^ (c >>> 1);
        else
          c = c >>> 1;
      }
      crcTable.push(c);
    }
  }

  static _updateCrc(crc, arr) {
    let c = crc;

    if (!crcTable) CrcCalculator._makeCrcTable();
      
    for (let n = 0; n < arr.length; n++) {
      c = crcTable[(c ^ arr[n]) & 0xff] ^ (c >>> 8);
    }

    return c;
  }
  
  static calc(data){
    return CrcCalculator._updateCrc(0xFFFFFFFF, data) ^ 0xFFFFFFFF;
  }
}
