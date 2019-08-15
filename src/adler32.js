const BASE = 65521

export default class Adler32 {
  static update(adler, data) {
    let s1 = adler & 0xffff;
    let s2 = (adler >> 16) & 0xffff;

    for (let n = 0; n < data.length; n++) {
      s1 = (s1 + data[n]) % BASE;
      s2 = (s2 + s1)     % BASE;
    }
    return (s2 << 16) + s1;
  }

  static calc(data) {
    return Adler32.update(1, data);
  }
}
