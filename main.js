import Item from './Item.js';
import Container from './Container.js';
import Render from './Render.js';
import AssetsLoader from './assetsLoader.js';

const debugInfo = {
  items: [],
}

function createItem (itemProps) {
  const item = new Item(itemProps);
  debugInfo.items.push(item);

  return item;
}

const assetsLoader = new AssetsLoader();
const render = new Render({
  id: 'canvas',
  assetsLoader: assetsLoader
});

var myAudio = document.createElement('audio');
myAudio.src = './sounds/item-pickup.webm';

let draggedItem;
let draggedItemStartVector;
let draggedItemContainer;

let containers = [];

assetsLoader.load([
  { id: 1, src: './images/1.webp', width: 64, height: 64 },
  { id: 2, src: './images/2.webp', width: 128, height: 64 },
  { id: 3, src: './images/3.webp', width: 128, height: 128 },
  { id: 4, src: './images/4.webp', width: 384, height: 128 },
  { id: 5, src: './images/5.webp', width: 128, height: 192 },
  { id: 6, src: './images/6.webp', width: 256, height: 320 },
  { id: 7, src: './images/7.webp', width: 256, height: 256 },
  { id: 8, src: './images/8.webp', width: 256, height: 320 },
  { id: 9, src: './images/9.webp', width: 64, height: 64 },
  { id: 10, src: './images/10.webp', width: 256, height: 128 },
]).then(() => {
  console.info('[Assets loaded]');
  requestAnimationFrame(tick);
});

const stash = new Container({ x: 64, y: 300, columns: 10, rows: 13 });
stash.addItem({
  position: { x: 1, y: 1 },
  item: createItem({
    itemId: 3,
    slotSizeX: 2, 
    slotSizeY: 2
  })
});

stash.addItem({
  position: { x: 1, y: 3 },
  item: createItem({
    itemId: 5,
    slotSizeX: 2,
    slotSizeY: 3
  })
})

stash.addItem({
  position: { x: 1, y: 6 },
  item: createItem({
    itemId: 4,
    slotSizeX: 6,
    slotSizeY: 2
  })
})

stash.addItem({
  position: { x: 3, y: 1 },
  item: createItem({
    itemId: 6,
    slotSizeX: 4,
    slotSizeY: 5
  })
})

stash.addItem({
  position: { x: 7, y: 1 },
  item: createItem({
    itemId: 8,
    slotSizeX: 4,
    slotSizeY: 5
  })
})

stash.addItem({
  position: { x: 7, y: 6 },
  item: createItem({
    itemId: 7,
    slotSizeX: 4,
    slotSizeY: 4
  })
})

stash.addItem({
  position: { x: 1, y: 8 },
  item: createItem({
    itemId: 10,
    slotSizeX: 4,
    slotSizeY: 2
  })
})

const smallContainer = new Container({ x: 256, y: 64, columns: 1, rows: 2})
smallContainer.addItem({
  position: { x: 1, y: 1 },
  item: createItem({
    itemId: 1,
    slotSizeX: 1,
    slotSizeY: 1,
  })
});

smallContainer.addItem({
  position: { x: 1, y: 2 },
  item: createItem({
    itemId: 1,
    slotSizeX: 1,
    slotSizeY: 1,
  })
})

const mediumContainer = new Container({ x: 64, y: 64, columns: 2, rows: 2 })
mediumContainer.addItem({
  position: { x: 1, y: 2 },
  item: createItem({
    itemId: 1,
    slotSizeX: 1,
    slotSizeY: 1,
  })
});

mediumContainer.addItem({
  position: { x: 1, y: 1 },
  item: createItem({
    itemId: 2,
    slotSizeX: 2,
    slotSizeY: 1,
  })
});

// mediumContainer.addItem({
//   position: { x: 2, y: 2 },
//   item: createItem({
//     itemId: 9,
//     slotSizeX: 1,
//     slotSizeY: 1,
//   })
// });

containers.push(stash);
containers.push(smallContainer);
containers.push(mediumContainer);

canvas.addEventListener('mousedown', clickHandler);

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

function clickHandler (event) {
  const target = event.target;
  const rect = target.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  const itemResult = getItemByPosition(mouseX, mouseY)

  if (itemResult) {
    let item = itemResult.item;
    console.info(` Item [${item.id}:${item.itemId}] is clicked.`);
    item.dragged = true;
    draggedItem = item;
    draggedItemStartVector = {
      x: item.x,
      y: item.y
    }

    draggedItemContainer = itemResult.container;

    canvas.addEventListener('mousemove', moveHandler);
    canvas.addEventListener('mouseup', releaseHandler);
  }
}

function getMousePosition (event) {
  const target = event.target;
  const rect = target.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  return { x: mouseX, y: mouseY }
}

function moveHandler (event) {
  const item = draggedItem;
  const mouse = getMousePosition(event);
  const offset = {
    x: item.width / 2,
    y: item.height / 2
  }
  item.x = mouse.x - offset.x;
  item.y = mouse.y - offset.y;

  const container = getContainerAtVector({x: mouse.x, y: mouse.y});

  if (container) {
    const mouseXOff = event.clientX - container.x;
    const mouseYOff = event.clientY - container.y;
    const slotPositionVector = {
      x: Math.floor(mouseXOff / 64) - 1,
      y: Math.floor(mouseYOff / 64) - 1 
    }

    container.highlightSlots(item)

    // console.log('Slot:', slotPositionVector);
    // console.log('Mouse:', mouse.x, mouse.y)
  }
  else {
    containers.forEach((container) => container.highlightSlots())
  }
}

function getContainerAtVector(vector) {
  const {x, y} = vector;
  return containers.filter((container) => {
    return (x > container.x && x < (container.x + (container.columns * 64)) && y > container.y && y < (container.y + (container.rows * 64)))
  })[0] || undefined;
}

function releaseHandler (event) {
  const target = event.target;
  const rect = target.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  
  const targetContainer = getContainerAtVector({x: mouseX, y: mouseY})
  
  if (targetContainer) {
    targetContainer.highlightSlots();
    const mouseXOff = event.clientX - targetContainer.x;
    const mouseYOff = event.clientY - targetContainer.y;

    const slotPositionVector = {
      x: Math.floor(mouseXOff / 64),
      y: Math.floor(mouseYOff / 64)
    }
    
    const itemXoff = draggedItem.x - targetContainer.x;
    const itemYoff = draggedItem.y - targetContainer.y;
    
    
    const slotPosition = 
    {
      x: Math.floor(itemXoff / 64),
      y: Math.floor((itemYoff) / 64),
    }
    
    // const temp = targetContainer.getItemBySlot(slotPosition, draggedItem);
    const vector = slotPosition;

    if (targetContainer.itemFitInContainer(vector, draggedItem)) {
      if(!targetContainer.contains(draggedItem)) {
        draggedItemContainer.remove(draggedItem)
      }

      targetContainer.add(draggedItem, vector);
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
  draggedItemContainer = undefined;
  draggedItemStartVector = undefined;

  canvas.removeEventListener('mousemove', moveHandler);
  canvas.removeEventListener('mouseup', releaseHandler);
  // myAudio.pause();
  myAudio.currentTime = 0,
  myAudio.play(0);

  console.table(debugInfo.items);
}

function renderContainers (containers) {
  containers.forEach((container) => {
    container.render(render);
  })
}

function tick () {
  render.clear()
  renderContainers(containers)
  if(draggedItem) { render.drawEntities([draggedItem]); }

  requestAnimationFrame(tick)
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
  setTimeout(() => context.close(), 100);
}