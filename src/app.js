import 'whatwg-fetch';
//import getTitleData from './lib/getData';
import 'points';
import PointerProxy from './lib/PointerProxy';

const svgwidth = 1120;
const svgheight = 758;
const loupeZoom = 1.5;
var loupe, loupeContent, image1, image2, image3;
var hasChanged = true;


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

function moveImages(x, y) {
  moveMaskContent(image1, mapRange([0, 1120], [79, -310], x), mapRange([0, 758], [170, -320], y));
  moveMaskContent(image2, mapRange([0, 758], [108, 489], y), mapRange([0, 1120], [-100, 490], x));
  moveMaskContent(image3, mapRange([0, 758], [ 290, 0], y), mapRange([0, 1120], [220, -100], x));
  
  moveLoupe(x, y);
}

function updateLoupeAttribute() {
  var {x, y} = loupe.point;
  
  loupe.setAttribute('transform', `translate(${x}, ${y})`);

  var contentX = x / (loupeZoom * -2);
  var contentY = y / (loupeZoom * -2);
  
  loupeContent.setAttribute('transform', `scale(1.5) translate(${contentX}, ${contentY})`);
}

function updateAttribute(element) {
  element.setAttribute('transform', `translate(${element.point.x}, ${element.point.y})`);
}

function updateAttributes() {
  updateAttribute(image1);
  updateAttribute(image2);
  updateAttribute(image3);
  updateLoupeAttribute();
}

function moveMaskContent(element, x, y, dir) {
  var point = element.point;
  point.x = x;
  point.y = y;
}

function moveLoupe(x, y) {
  loupe.point.x = x;
  loupe.point.y = y;
}

function draw() {
  if (hasChanged) {
    updateLoupeAttribute();
    updateAttributes();
    
    hasChanged = false;  
  }
  requestAnimationFrame(draw);
  
}

function randomMove(xOld, yOld) {
  var x = Math.random() * 1120;
  var y = Math.random() * 760;
  
  var duration = 2 + Math.random() * 4;
  var intervalFrequency = 5;
  var lastTime = duration * 1000;
  var steps = ~~(lastTime / intervalFrequency);
  var step = 0;
  // Call it a lot, since this doesn't actually do anything heavy
  var interval = setInterval(function () {

    
    var xNow = xOld + (x - xOld) / steps * step;
    var yNow = yOld + (y - yOld) / steps * step;
    
    if (step > steps) {
      clearInterval(interval);
      randomMove(xNow, yNow);
      return;
    }
    
    moveImages(xNow, yNow);
    hasChanged = true;
    step++;
  }, intervalFrequency);
}

function getRelativePoint(event, element) {
  var bounds = element.getBoundingClientRect();
  var x = event.clientX - bounds.left;
  var y = event.clientY - bounds.top;
  var svgScale = Math.max(svgwidth / window.innerWidth, svgheight / window.innerHeight);
  
  x *= svgScale;
  y *= svgScale;
  return {
    x: x,
    y: y
  };
}

function setup(container) {
  var svg = container.querySelector('svg');
  var images = svg.querySelectorAll('.cropped');
  console.log(images.length);

  image1 = images[1];
  image2 = images[2];
  image3 = images[0];
  loupe = svg.querySelector('#circle-loupe');
  loupeContent = svg.querySelector('#loupe-visible use');

  image1.point = {x: 0, y: 0};
  image2.point = {x: 0, y: 0};
  image3.point = {x: 0, y: 0};
  loupe.point = {x: 0, y: 0};


  var offset = [0, 0];
  var first = true;
  loupe.style.display = 'none';
  
  container.addEventListener('pointermove', function (e) {
    if (first) {
      loupe.style.display = '';
      first = false;
    }
    var point = getRelativePoint(e, svg);

    moveImages(point.x, point.y);
    
    hasChanged = true;

  })


  moveImages(0, 0);
  draw();
  
  if ('ontouchstart' in window) {
    loupe.style.display = '';
    randomMove(400, 300);
  }

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
