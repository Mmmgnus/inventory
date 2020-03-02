export default class Container {
  constructor ({ x, y, columns, rows }) {
    this.x = x;
    this.y = y;
    this.rows = rows;
    this.columns = columns;
    this.slots = [];
  }

  getSlotIndex(item) {
    return this.slots.findIndex((slot) => {
      return slot.id === item.id
    })
  }

  getItemPosition (item) {
    let temp;

    this.slots.forEach((slot) => {
      if (slot.item === item) {
        temp = slot.size
      }
    })

    return temp;
  }

  getItems () {
    return this.slots.map((slot) => slot.item);
  }

  contains (item) {
    return this.slots.some((slot) => slot.item === item);
  }

  slotVector ({x, y}) {
    const xSize = 64;
    const ySize = 64;
    const slotVector = {
      x: [itemVector.x, (xSize === 1) ? itemVector.x : itemVector.x + xSize - 1],
      y: [itemVector.y, (ySize === 1) ? itemVector.y : itemVector.y + ySize - 1],
    }

    console.log('slotVector:', slotVector.x, slotVector.y)
  }

  /**
   * 
   * @param {*} params
   * @param {Item} params.item The item we want to add to the container.
   * @param {x, y} params.size  
   */
  addItem ({ item, position }) {
    const xSize = item.slotSizeX;
    const ySize = item.slotSizeY;
    const slotPosition = {x: position.x - 1, y: position.y - 1};
    const slotVector = {
      x: [slotPosition.x, (xSize === 1) ? slotPosition.x  : xSize - 1],
      y: [slotPosition.y, (ySize === 1) ? slotPosition.y : ySize - 1],
    }

    item.x = this.x + (slotVector.x[0] * 64);
    item.y = this.y + (slotVector.y[0] * 64);
    item.width = item.slotSizeX * 64;
    item.height = item.slotSizeY * 64;

    const slot = {
      size: {
        x: [slotPosition.x, slotVector.x[1]],
        y: [slotPosition.y, slotVector.x[1]]
      },
      item: item
    }

    this.slots.push(slot);
  }

  moveContainer ({x, y}) {
    this.x = x;
    this.y = y;

    this.updateItems();
  }

  updateItems() {
    this.slots.forEach((slot) => {
      const { size, item } = slot;
      console.log('slotsize', size);
      item.x = this.x + (size.x[0] * 64);
      item.y = this.y + (size.y[0] * 64);
    });
  }

  add(item, slotPosition) {
    const xSize = item.width / 64;
    const ySize = item.height / 64;
    const slotVector = {
      x: [slotPosition.x, (xSize === 1) ? slotPosition.x : xSize - 1],
      y: [slotPosition.y, (ySize === 1) ? slotPosition.y : ySize - 1],
    }

    // Update item position.
    item.x = this.x + (slotVector.x[0] * 64)
    item.y = this.y + (slotVector.y[0] * 64)

    if (this.contains(item)) {
      this.slots.forEach((slot) => {
        if (slot.item.id === item.id) {
          slot.size = slotVector;
        }
      })
    }
    else {
      this.slots.push({
        size: slotVector,
        item: item
      })
    }
  }

  remove (item) {    
    this.slots = this.slots.filter((slot) => slot.item.id !== item.id)
  }

  itemFitInContainer(itemVector, item) {
    const xSize = item.width / 64;
    const ySize = item.height / 64;
    const slotVector = {
      x: [itemVector.x, (xSize === 1) ? itemVector.x : itemVector.x + xSize - 1],
      y: [itemVector.y, (ySize === 1) ? itemVector.y : itemVector.y + ySize - 1],
    }

    let isFitting = true;
    this.slots.forEach((slot) => {
      if (
        slotVector.x[0] === -1 ||
        slotVector.y[0] === -1 ||
        slotVector.x[1] === -1 ||
        slotVector.y[1] === -1 ||
        // Start at the same position.
        slot.size.x[0] === slotVector.x[0] && slot.size.y[0] === slotVector.y[0] ||
        // End at the same position
        slot.size.x[1] === slotVector.x[1] && slot.size.y[1] === slotVector.y[1] ||
        // Ends outside of the container
        slotVector.x[1] > this.columns - 1 ||
        slotVector.y[1] > this.rows - 1
      ) {
        isFitting = false;
      }
    })

    return isFitting;
  }

  render (render) {
    const ctx = render.ctx;
    const { x, y, columns, rows} = this;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#444';
    ctx.rect(
      x - 2,
      y - 2,
      64 * columns + 4,
      64 * rows + 4
    )
    ctx.stroke();

    this.renderGrid(render)
    this.renderItems(render)
  }

  renderItems (render) {
    const items = this.slots.map((slot) => slot.item);

    render.drawEntities(items);
  }

  renderGrid(render) {
    const ctx = render.ctx;
    const { rows, columns } = this;

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#444';


    for (var r = 1; r < rows; r++) {
      const x = this.x;
      const y = this.y + (r * 64);

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (columns * 64), y);
      ctx.stroke();
    }

    for (var c = 1; c < columns; c++) {
      const x = this.x + ((c - 0) * 64)
      const y = this.y;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + (rows * 64));
      ctx.stroke();
    }
  }
}