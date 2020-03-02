import Item from './Item.js';
import Container from './Container.js';
import Render from './Render.js';
import AssetsLoader from './assetsLoader.js';

const assetsLoader = new AssetsLoader();
const render = new Render({
  id: 'canvas',
  assetsLoader: assetsLoader
});


let draggedItem;
let draggedItemStartVector;
let draggedItemContainer;

let containers = [];

assetsLoader.load([
  { id: 1, src: './images/1.png', width: 64, height: 64 },
  { id: 2, src: './images/2.png', width: 128, height: 64 },
  { id: 3, src: './images/3.png', width: 128, height: 128 },
  { id: 4, src: './images/4.png', width: 384, height: 128 },
  { id: 5, src: './images/5.png', width: 128, height: 192 },
  { id: 6, src: './images/6.png', width: 256, height: 320 },
]).then(() => {
  console.info('[Assets loaded]');
  requestAnimationFrame(tick);
});

containers.push(new Container({
  x: 64,
  y: 300,
  columns: 7,
  rows: 7,
  slots: [
    {
      size: {
        x: [0, 1],
        y: [0, 1]
      },
      item: new Item({
        itemId: 3,
        x: 64,
        y: 300,
        width: 64 * 2,
        height: 64 * 2,
      }),
    },
    {
      size: {
        x: [0, 2],
        y: [2, 4]
      },
      item: new Item({
        itemId: 5,
        x: 64,
        y: 300 + (64 * 2),
        width: 64 * 2,
        height: 64 * 3,
      }),
    },
    {
      size: {
        x: [0, 5],
        y: [5, 1]
      },
      item: new Item({
        itemId: 4,
        x: 64 + (64 * 0),
        y: 300 + (64 * 5),
        width: 384,
        height: 128,
      }),
    },
    {
      size: {
        x: [2, 6],
        y: [0, 4]
      },
      item: new Item({
        itemId: 6,
        x: 64 + (64 * 2),
        y: 300 + (64 * 0),
        width: 256,
        height: 320,
      }),
    }
  ]
}))

containers.push(new Container({
  x: 600,
  y: 512,
  columns: 1,
  rows: 2,
  slots: [
    {
      size: {
        x: [0, 0],
        y: [0, 0]
      },
      item: new Item({
        itemId: 1,
        x: 600,
        y: 512,
        width: 64,
        height: 64,
      })
    },
    {
      size: {
        x: [1, 1],
        y: [1, 1]
      },
      item: new Item({
        itemId: 1,
        x: 600,
        y: 576,
        width: 64,
        height: 64
      })
    }
  ]
}))

containers.push(new Container ({
  x: 64,
  y: 64,
  columns: 2,
  rows: 2,
  slots: [
    {
      size: {
        x: [0, 1],
        y: [0, 0]
      },
      item: new Item({
        itemId: 2,
        x: 64,
        y: 64,
        width: 128,
        height: 64,
      }),
    },
    {
      size: {
        x: [0, 0],
        y: [1, 1]
      },
      item: new Item({
        itemId: 1,
        x: 64,
        y: 128,
        width: 64,
        height: 64,
      })
    }
  ]
}));

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
    console.info(` Item [${item.id}] is clicked.`);
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

    console.log('Slot:', slotPositionVector);
    console.log('Mouse:', mouse.x, mouse.y)
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
    
    const vector = (slotPosition.x !== -1 && slotPosition.y !== -1) ? slotPosition : slotPositionVector;

    if (targetContainer.itemFitInContainer(vector, draggedItem)) {
      if(!targetContainer.contains(draggedItem)) {
        draggedItemContainer.remove(draggedItem)
      }

      targetContainer.add(draggedItem, vector, draggedItemContainer);
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
  beep()
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