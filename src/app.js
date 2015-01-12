import 'whatwg-fetch';
//import getTitleData from './lib/getData';
import 'points';
import PointerProxy from './lib/PointerProxy';

const svgwidth = 1120;

function loadSVG() {
  fetch('./assets/source.svg')
    .then(function (response) {
      return response.text();
    })
    .then(function (text) {
      var frag = document.createElement('div');
      frag.innerHTML = text;
      document.body.appendChild(frag);
      setup(frag);
    });
}

var mapRange = function (from, to, s) {
  return to[0] + (s - from[0]) * (to[1] - to[0]) / (from[1] - from[0]);
};

function getPredominantDirection(array) {
  var x = Math.abs(array[0].x - array[array.length - 1].x);
  var y = Math.abs(array[0].y - array[array.length - 1].y);

  return (x > y) ? 'x' : 'y';
}

function invertDir(dir) {
  if (dir == 'x') return 'y';
  if (dir == 'y') return 'x';
}

function moveImages(x, y, dir) {
  moveMaskContent(image1, mapRange([0, 1120], [79, -310], x), mapRange([0, 758], [170, -320], y), dir);
  moveMaskContent(image2, mapRange([0, 758], [108, 489], y), mapRange([0, 1120], [-100, 490], x), invertDir(dir));
  moveMaskContent(image3, mapRange([0, 758], [ 290, 0], y), mapRange([0, 1120], [220, -100], x), invertDir(dir));
}

function moveMaskContent(element, x, y, dir) {
  var point = element.point;
  
  if (dir != 'y') {
    point.x = x;
  }

  if (dir != 'x') {
    point.y = y;
  }
  
  element.setAttribute('transform', `translate(${point.x}, ${point.y})`)
}


function getRelativePoint(event, element) {
  var bounds = element.getBoundingClientRect();
  var x = event.clientX - bounds.left;
  var y = event.clientY - bounds.top;
  x *= svgwidth / window.innerWidth;
  y *= svgwidth / window.innerWidth;
  return {
    x: x,
    y: y
  };
}

function setup(container) {
  var svg = container.querySelector('svg');
  var images = svg.querySelectorAll('.cropped');
  console.log(images.length);

  var image1 = images[1];
  var image2 = images[2];
  var image3 = images[0];

  image1.point = {x: 0, y: 0};
  image2.point = {x: 0, y: 0};
  image3.point = {x: 0, y: 0};

  image1.dragSpeed = 0.7;
  image2.dragSpeed = 0.4;
  image3.dragSpeed = 1;

  var last = [];
  for (var i = 0; i < 3; i++) {
    last.push({
      x: 0,
      y: 0
    });
  }

  var dragging = false;
  var offset = [0, 0];

  function setActiveDrag(e) {
    dragging = this;
    var lastPos = {
      x: dragging.point.x,
      y: dragging.point.y
    }
    dragging.lastPoint = lastPos;
    offset = last[0];
  }

  image1.addEventListener('pointerdown', setActiveDrag);
  image2.addEventListener('pointerdown', setActiveDrag);
  image3.addEventListener('pointerdown', setActiveDrag);

  container.addEventListener('pointermove', function (e) {
    last.pop();
    var point = getRelativePoint(e, container);

    last.unshift(point);
    var dir = getPredominantDirection(last);

    if (dragging) {
      let x = (point.x - offset.x) * dragging.dragSpeed + dragging.lastPoint.x;
      let y = (point.y - offset.y) * dragging.dragSpeed + dragging.lastPoint.y;
      dragging.setAttribute('transform', `translate(${x}, ${y})`);
    } else {
      moveImages(point.x, point.y, dir);
    }
  })

  container.addEventListener('pointerup', function (e) {
    dragging = false;
  })

  moveImages(0, 0);
}

// getTitleData(function (msg) {
//   document.querySelector('h1').innerHTML = msg.title;
//   document.querySelector('h2').innerHTML = msg.subtitle;
//   
//   // Add link to body to have the parent redirect to the magazine URL
//   if (msg.isHomepage) {
//     document.body.addEventListener('click', function() {
//       redirectParent(msg.domain_path);
//     });
//     document.body.style.cursor = 'pointer';
//   }
// });

loadSVG();
