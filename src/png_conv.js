import PngBytes from './png_bytes';
import IdhrChunk, {ColorType} from './idhr_chunk';
import PlteChunk from './plte_chunk';
import IdatChunk from './idat_chunk';
import IendChunk from './iend_chunk';
import Png from './png'

export default class PngConv {
  constructor(img) {
    this.img = img;
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
    this.png.convertToPaletteMode(extractedColors);
  }

  _calcBufferSize() {
    return this.img.width * this.img.height;
  }

  *_pngSignature() {
    yield* [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
  }

  convert() {
    this._prepare();

    const bytes = new PngBytes(this._calcBufferSize());

    const idhrChunk = new IdhrChunk(this.png.width, this.png.height, 8, ColorType.palette | ColorType.color);
    const plteChunk = new PlteChunk(this.png.palette);
    const IdatChunk = new IdatChunk(this.png.rawData);
    const IendChunk = new IendChunk();

    bytes.write(this._pngSignature());
    idhrChunk.write(bytes);
    plteChunk.write(bytes);
    idatChunk.write(bytes);
    iendChunk.write(bytes);

    const blob = new Blob([bytes.buffer], {type: 'image/png'});
  }
}
