import Sprite from "./Sprite.js";

export default class AssetsLoader {
  constructor () {
    this.assets = [];
    this.loadingAssets = [];
  }

  getSprite (id) {
    return this.assets.filter((sprite) => {
      return sprite.id === id
    })[0] || undefined;
  }

  load (assets) {
    assets.forEach((asset) => {
      const { id, src, width, height } = asset;
      const sprite = new Sprite({ id, src, width, height })
      this.loadingAssets.push(sprite.load());
      console.log('unloaded', this.loadingAssets)
    })

    return Promise.all(this.loadingAssets).then((...sprites) => {
      console.log('Loaded sprites:', sprites[0]);
      this.assets = this.assets.concat(sprites[0]);
    })
  }
}