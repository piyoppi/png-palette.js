import PngBytes from './png_bytes';
import IdhrChunk, {ColorType} from './idhr_chunk';
import PlteChunk from './plte_chunk';
import TrnsChunk from './trns_chunk';
import IdatChunk, {DeflateDataType} from './idat_chunk';
import IendChunk from './iend_chunk';
import Png from './png'

export default class PngConv {
  constructor(img) {
    this.img = img || null;
    this.png = null;
  }

  _getPixelData() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = this.img.width;
    canvas.height = this.img.height;
    ctx.drawImage(this.img, 0, 0);

    return ctx.getImageData( 0, 0, this.img.width, this.img.height ).data;
  }

  _prepare() {
    const data = this._getPixelData();
    this.png = new Png(data, this.img.width, this.img.height);
  }

  convert() {
    if( !this.png ) this._prepare();

    this.png.convertToPaletteMode();
  }

  _pngSignature() {
    return [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
  }

  fileData() {
    const idhrChunk = new IdhrChunk(this.png.width, this.png.height, 8, ColorType.palette | ColorType.color);
    const plteChunk = new PlteChunk(this.png.palette);
    const trnsChunk = new TrnsChunk(this.png.palette);
    const idatChunk = new IdatChunk(this.png.rawData, {dataMode: DeflateDataType.raw});
    const iendChunk = new IendChunk();

    const byteLength = 8 + idhrChunk.length + plteChunk.length + trnsChunk.length + idatChunk.length + iendChunk.length;
    const bytes = new PngBytes(byteLength);

    bytes.write(this._pngSignature());
    idhrChunk.write(bytes);
    plteChunk.write(bytes);
    trnsChunk.write(bytes);
    idatChunk.write(bytes);
    iendChunk.write(bytes);

    return bytes;
  }

  toBlob() {
    const bytes = this.fileData();
    return new Blob([bytes.buffer], {type: 'image/png'});
  }
}
//window.PngConv = PngConv;
