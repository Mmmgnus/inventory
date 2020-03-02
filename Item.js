import Entity from "./Entity.js";
import Render from './Render.js';

function generateID() {
  return (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
}

export default class Item extends Entity {
  constructor ({ itemId, x, y, width, height, color }) {
    super({ x, y, width, height});
    this.itemId = itemId;
    this.id = generateID();
    this.color = color;
    this.dragged = false;
  }

  render (ctx, assetsLoader) {
    if (!ctx) {
      throw new Error('Missing Canvas context');
    }

    const { x, y, color, width, height, dragged } = this;
    const sprite = assetsLoader.getSprite(this.itemId);

    if (!sprite) {
      throw Error('Missing assets for itemId:', this.itemId);
    }

    ctx.beginPath();
    ctx.fillStyle = '#202020';
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.rect(x, y, width, height);
    ctx.fill()
    sprite.render(ctx, x, y);
    ctx.stroke();

    if (dragged) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#888';
      ctx.stroke();
    }
  }
}