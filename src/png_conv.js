import PngBytes from './png_bytes';
import IdhrChunk, {ColorType} from './idhr_chunk';
import PlteChunk from './plte_chunk';

export default class PngConv {
  constructor(img) {
    this.img = img;
    this.extractedColors = [];
  }

  extractColors() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = this.img.width;
    canvas.height = this.img.height;
    ctx.drawImage(this.img, 0, 0);

    const pixels = ctx.getImageData( 0, 0, this.img.width, this.img.height ).data;

    let colorList = {};

    for( let y = 0; y < canvas.height; y++ ) {
      for( let x = 0; x < canvas.width; x++ ) {
        var idx = ((y * canvas.width) + x) * 4;
        var key = `${pixels[idx]},${pixels[idx+1]},${pixels[idx+2]}`;
        if( !(key in colorList) ){
          colorList[key] = { r: pixels[idx], g: pixels[idx+1], b: pixels[idx+2] };
        }
      }
    }
    this.extractedColors = Object.entries(colorList).map( entry => entry[1] );

    return this.extractedColors;
  }

  _calcBufferSize() {
    return this.img.width * this.img.height;
  }

  *_pngSignature() {
    yield* [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
  }

  convert() {
    this.extractColors();

    const bytes = new PngBytes(this._calcBufferSize());

    bytes.write(this._pngSignature());

    const idhrChunk = new IdhrChunk(this.img.width, this.img.height, 8, ColorType.palette | ColorType.color);
    const plteChunk = new PlteChunk(this.extractedColors);
    idhrChunk.write(bytes);
    plteChunk.write(bytes);

    const blob = new Blob([bytes.buffer], {type: 'image/png'});
  }
}
