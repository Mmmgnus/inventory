export default class Sprite {
  constructor ({ id, src, width, height }) {
    this.id = id;
    this.src = src;
    this.width = width;
    this.height = height;
    this.image;
  }

  load () {
    const { image, width, height } = this;
    const promise = new Promise((resolve, reject) => {
      const img = new Image(width, height);
      img.onload = (event) => {
        this.image = img;
        this.loaded = true;
        resolve(this);
      };
      img.src = this.src;
    });

    return promise;
  }

  render (ctx, x, y) {
    const { image, width, height } = this;
    ctx.drawImage(this.image, x, y, this.width, this.height);
  }


}