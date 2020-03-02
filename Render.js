export default class Render {
  constructor({ id, assetsLoader }) {
    this.canvas = document.getElementById(id);
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.assetsLoader = assetsLoader;
    this.ctx.imageSmoothingEnabled = false;       /* standard */
    this.ctx.mozImageSmoothingEnabled = false;    /* Firefox */
    this.ctx.oImageSmoothingEnabled = false;      /* Opera */
    this.ctx.webkitImageSmoothingEnabled = false; /* Safari */
    this.ctx.msImageSmoothingEnabled = false;     /* IE */
  }

  clear () {
    const { ctx, width, height } = this;
    ctx.clearRect(0, 0, width, height);
  }

  drawEntities (entities) {
    if (!entities) {
      return;
    }

    entities.forEach((entity) => entity.render(this.ctx, this.assetsLoader));
  }
}