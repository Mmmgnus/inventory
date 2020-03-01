const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

let draggedItem;
let draggedItemStartVector;
let draggedItemContainer;

let containers = [
  {
    x: 64,
    y: 300,
    width: 7,
    height: 7,
    slots: [
      {
        size: {
          x: [0, 1],
          y: [0, 1]
        },
        item: {
          id: generateID(),
          color: 'pink',
          x: 64,
          y: 300,
          width: 128,
          height: 128,
          dragged: false
        }
      }
    ]
  },
  {
    x: 600,
    y: 512,
    width: 1,
    height: 2,
    slots: [
      {
        size: {
          x: [0, 0],
          y: [0, 0]
        },
        item: {
          id: generateID(),
          color: 'blue',
          x: 600,
          y: 512,
          width: 64,
          height: 64,
          dragged: false
        }
      },
      {
        size: {
          x: [1, 1],
          y: [1, 1]
        },
        item: {
          id: generateID(),
          color: 'red',
          x: 600,
          y: 576,
          width: 64,
          height: 64,
          dragged: false
        }
      }
    ]
  },
  {
    x: 64,
    y: 64,
    width: 2,
    height: 2,
    slots: [
      {
        size: {
          x: [0, 1],
          y: [0, 0]
        },
        item: {
          id: generateID(),
          color: 'green',
          x: 64,
          y: 64,
          width: 128,
          height: 64,
          dragged: false
        },
      },
      {
        size: {
          x: [0, 0],
          y: [1, 1]
        },
        item: {
          id: generateID(),
          color: 'yellow',
          x: 64,
          y: 128,
          width: 64,
          height: 64,
          dragged: false
        }
      }
    ]
  }
]

canvas.addEventListener('mousedown', clickHandler);

function generateID () {
  return (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
}

function getItemByPosition (x, y) {
  const container = getContainerAtVector({x, y})
  let items = [];
  containers.forEach((container) => {
    container.slots.forEach((slot) => {
      items.push({
        item: slot.item,
        container: container
      });
    });
  });

  return items.filter((itemObj) => {
    const item = itemObj.item;
    return (x > item.x && x < (item.x + item.width) && y > item.y && y < (item.y + item.height))
  })[0];
}

function getItemPosition (item, container) {
  let temp;

  container.slots.forEach((slot) => {
    if (slot.item === item) {
      temp = slot.size
    }
  })

  return temp;
}

function clickHandler (event) {
  const target = event.target;
  const rect = target.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  const itemResult = getItemByPosition(mouseX, mouseY)
  console.log(itemResult)
  if (itemResult) {
    let item = itemResult.item;
    console.log('item clicked:', item)
    item.dragged = true;
    draggedItem = item;
    draggedItemStartVector = {
      x: item.x,
      y: item.y
    }

    draggedItemContainer = itemResult.container;

    canvas.addEventListener('mousemove', moveHandler);
    canvas.addEventListener('mouseup', releaseHandler);

    beep('sawtooth');
  }
}

function getMousePosition (event) {
  const target = event.target;
  const rect = target.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  return { x: mouseX, y: mouseY }
}

function getDraggedItemIndex () {
  return items.findIndex((item) => {
    return item.dragged
  })
}

function moveHandler (event) {
  // const item = items[getDraggedItemIndex()]
  const item = draggedItem;
  const mouse = getMousePosition(event);
  const offset = {
    x: item.width / 2,
    y: item.height / 2
  }
  item.x = mouse.x - offset.x;
  item.y = mouse.y - offset.y;
}

function getContainerAtVector(vector) {
  const {x, y} = vector;
  return containers.filter((container) => {
    return (x > container.x && x < (container.x + (container.width * 64)) && y > container.y && y < (container.y + (container.height * 64)))
  })
}

function releaseHandler (event) {
  const target = event.target;
  const rect = target.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  
  const targetContainer = getContainerAtVector({x: mouseX, y: mouseY})
  
  if (targetContainer.length) {
    const mouseXOff = event.clientX - targetContainer[0].x;
    const mouseYOff = event.clientY - targetContainer[0].y;
    const slotPositionVector = {
      x: Math.floor(mouseXOff / 64),
      y: Math.floor(mouseYOff / 64)
    }

    itemXoff = draggedItem.x -  targetContainer[0].x;
    itemYoff = draggedItem.y - targetContainer[0].y;

    
    const slotPosition = 
    {
      x: Math.floor(itemXoff / 64),
      y: Math.floor((itemYoff) / 64),
    }
    
    const vector = (slotPosition.x !== -1 && slotPosition.y !== -1) ? slotPosition : slotPositionVector;

    console.log(vector)

    console.log('Container:', targetContainer[0], 'position:', vector, 'does it fit?', itemFitInContainer(targetContainer[0], vector, draggedItem))

    if (itemFitInContainer(targetContainer[0], vector, draggedItem)) {
      addToContainer(targetContainer[0], draggedItem, vector);
    }
    else {
      draggedItem.x = draggedItemStartVector.x
      draggedItem.y = draggedItemStartVector.y
    }
  }
  else {
    draggedItem.x = draggedItemStartVector.x
    draggedItem.y = draggedItemStartVector.y
  }

  draggedItem.dragged = false;
  draggedItem = undefined;
  canvas.removeEventListener('mousemove', moveHandler);
  canvas.removeEventListener('mouseup', releaseHandler);
  beep()
}

function addToContainer (container, item, slotPosition) {
  const xSize = item.width / 64;
  const ySize = item.height / 64;
  const slotVector = {
    x: [slotPosition.x, (xSize === 1) ? slotPosition.x : xSize - 1],
    y: [slotPosition.y, (ySize === 1) ? slotPosition.y : ySize - 1],
  }

  item.x = container.x + (slotVector.x[0] * 64)
  item.y = container.y + (slotVector.y[0] * 64)

  if (container === draggedItemContainer) {
    container.slots.forEach((slot) => {
      if (slot.item.id === item.id) {
        slot.size = slotVector;
      }
    })
  }
  else {
    container.slots.push({
      size: slotVector,
      item: item
    })

    draggedItemContainer.slots = draggedItemContainer.slots.filter((slot) => slot.item.id !== item.id)
  }
}

function itemFitInContainer (container, itemVector, item) {
  // Is there already something in that slot?
  const xSize = item.width / 64;
  const ySize = item.height / 64;
  const slotVector = {
    x: [itemVector.x, (xSize === 1) ? itemVector.x :  itemVector.x + xSize - 1],
    y: [itemVector.y, (ySize === 1) ? itemVector.y :  itemVector.y + ySize - 1],
  }

  console.log('item size', slotVector.x, slotVector.y)


  // Wich slots do we want to add item to
  let isFitting = true;
  container.slots.forEach((slot) => {
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
      slotVector.x[1] > container.width - 1 ||
      slotVector.y[1] > container.height - 1
    ) {
      isFitting = false;
    }
  })

  return isFitting;
}

function renderDraggedItem () {
  // rendering the item that is dragged.
}

function renderItems (items) {
  if (!items) {
    return;
  }

  items.forEach((item) => {
    ctx.beginPath();
    ctx.fillStyle = item.color;
    ctx.rect(item.x, item.y, item.width, item.height);
    ctx.fill()
    if (item.dragged) {
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#fff';
      ctx.stroke();
    }
  })
}

function renderContainers (containers) {
  containers.forEach((container) => {
    ctx.beginPath();
    ctx.moveTo(container.x, container.y);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000';
    ctx.rect(container.x, container.y, 64 * container.width + 4, 64 * container.height + 4)
    ctx.stroke();
    renderContainerItems(container)
  })
}

function renderContainerItems (container) {
  const items = container.slots.map((slot) => slot.item)
  renderItems(items)
}

function render () {
  clearCanvas()
  renderContainers(containers)
  if(draggedItem) { renderItems([draggedItem]); }

  requestAnimationFrame(render)
}

function clearCanvas () {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

function beep (type) {
  var frequency = 226.6
  
  var context = new AudioContext()
  var o = context.createOscillator()
  var g = context.createGain()
  o.connect(g)
  g.connect(context.destination)
  o.start(0)
  g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.1)
  o.frequency.value = frequency
  o.type = type || 'sine';
}

// stop sound:
// g.gain.exponentialRampToValueAtTime(
//   0.00001, context.currentTime + 0.04
// )

requestAnimationFrame(render)


// containers[0].items.set({x:0, y:0}, items[0])
// containers[0].items.set({x:0, y:1}, items[1])