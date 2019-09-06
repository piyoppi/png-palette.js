export default class Png {
  constructor(pixels, width, height, palette) {
    this.pixels = pixels;
    this.rawData = [];
    this.palette = palette || [];
    this.isPaletteMode = !!palette;
    this.width = width;
    this.height = height;
  }

  _extractColors() {
    let colorList = {};
    const pixels = this.pixels;

    for( let y = 0; y < this.height; y++ ) {
      for( let x = 0; x < this.width; x++ ) {
        const idx = ((y * this.width) + x) * 4;
        const key = `${pixels[idx]},${pixels[idx+1]},${pixels[idx+2]},${pixels[idx+3]}`;
        if( !(key in colorList) ){
          colorList[key] = { r: pixels[idx], g: pixels[idx+1], b: pixels[idx+2], a: pixels[idx+3] };
        }
      }
    }

    return Object.entries(colorList).map( entry => entry[1] );
  }

  convertToPaletteMode() {
    const palette = this._extractColors();
    const pixels = this.pixels;
    let convertedData = [];

    for( let y = 0; y < this.height; y++ ) {
      convertedData.push(0x00);
      for( let x = 0; x < this.width; x++ ) {
        const idx = ((y * this.width) + x) * 4;
        convertedData.push(
          palette.findIndex( color =>
            color.r === pixels[idx] &&
            color.g === pixels[idx+1] &&
            color.b === pixels[idx+2]
          )
        );
      }
    }

    this.palette = palette;
    this.rawData = convertedData;

    this.isPaletteMode = true;
  }
}
