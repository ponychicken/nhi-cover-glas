(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

require("whatwg-fetch");

var _libGetData = require("./lib/getData");

var redirectParent = _libGetData.redirectParent;
var getTitleData = _libGetData.getTitleData;

require("points");

var PointerProxy = _interopRequire(require("./lib/PointerProxy"));

var svgwidth = 1120;
var svgheight = 758;
var loupeZoom = 1.5;
var loupe, loupeContent, image1, image2, image3;
var hasChanged = true;

function loadSVG() {
  fetch("./assets/source.svg").then(function (response) {
    return response.text();
  }).then(function (text) {
    var frag = document.createElement("div");
    frag.innerHTML = text;
    document.body.appendChild(frag);
    setup(frag);
  });
}

function mapRange(from, to, s) {
  return to[0] + (s - from[0]) * (to[1] - to[0]) / (from[1] - from[0]);
}

function moveImages(x, y) {
  moveMaskContent(image1, mapRange([0, 1120], [79, -310], x), mapRange([0, 758], [170, -320], y));
  moveMaskContent(image2, mapRange([0, 758], [204, 489], y), mapRange([0, 1120], [42, 495], x));
  moveMaskContent(image3, mapRange([0, 758], [290, 0], y), mapRange([0, 1120], [220, -100], x));

  moveLoupe(x, y);
}

function updateLoupeAttribute() {
  var _loupe$point = loupe.point;
  var x = _loupe$point.x;
  var y = _loupe$point.y;

  loupe.setAttribute("transform", "translate(" + x + ", " + y + ")");

  var contentX = x / (loupeZoom * -2);
  var contentY = y / (loupeZoom * -2);

  loupeContent.setAttribute("transform", "scale(1.5) translate(" + contentX + ", " + contentY + ")");
}

function updateAttribute(element) {
  element.setAttribute("transform", "translate(" + element.point.x + ", " + element.point.y + ")");
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

  var distance = Math.sqrt(Math.pow(xOld - x, 2) + Math.pow(yOld - y, 2));

  var duration = distance / 50 * 1400 / window.innerWidth;
  var intervalFrequency = 5;
  var lastTime = duration * 1000;
  var steps = ~ ~(lastTime / intervalFrequency);
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
  var svg = container.querySelector("svg");
  var images = svg.querySelectorAll(".cropped");
  console.log(images.length);

  image1 = images[1];
  image2 = images[2];
  image3 = images[0];
  loupe = svg.querySelector("#circle-loupe");
  loupeContent = svg.querySelector("#loupe-visible use");

  image1.point = { x: 0, y: 0 };
  image2.point = { x: 0, y: 0 };
  image3.point = { x: 0, y: 0 };
  loupe.point = { x: 0, y: 0 };

  var offset = [0, 0];
  var first = true;
  loupe.style.display = "none";

  svg.addEventListener("pointermove", function (e) {
    if (first) {
      loupe.style.display = "";
      first = false;
    }
    var point = getRelativePoint(e, svg);

    moveImages(point.x, point.y);

    hasChanged = true;
  });

  moveImages(0, 0);
  draw();

  if (true || "ontouchstart" in window) {
    loupe.style.display = "";
    randomMove(400, 300);
  }

  getTitleData(function (msg) {
    // Add link to body to have the parent redirect to the magazine URL
    if (msg.isHomepage) {
      document.body.addEventListener("click", function () {
        redirectParent(msg.domain_path);
      });
      document.body.style.cursor = "pointer";
    }
  });
}

loadSVG();

},{"./lib/PointerProxy":6,"./lib/getData":7,"points":3,"whatwg-fetch":4}],2:[function(require,module,exports){
/*!
 * EventEmitter2
 * https://github.com/hij1nx/EventEmitter2
 *
 * Copyright (c) 2013 hij1nx
 * Licensed under the MIT license.
 */
;!function(undefined) {

  var isArray = Array.isArray ? Array.isArray : function _isArray(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
  };
  var defaultMaxListeners = 10;

  function init() {
    this._events = {};
    if (this._conf) {
      configure.call(this, this._conf);
    }
  }

  function configure(conf) {
    if (conf) {

      this._conf = conf;

      conf.delimiter && (this.delimiter = conf.delimiter);
      conf.maxListeners && (this._events.maxListeners = conf.maxListeners);
      conf.wildcard && (this.wildcard = conf.wildcard);
      conf.newListener && (this.newListener = conf.newListener);

      if (this.wildcard) {
        this.listenerTree = {};
      }
    }
  }

  function EventEmitter(conf) {
    this._events = {};
    this.newListener = false;
    configure.call(this, conf);
  }

  //
  // Attention, function return type now is array, always !
  // It has zero elements if no any matches found and one or more
  // elements (leafs) if there are matches
  //
  function searchListenerTree(handlers, type, tree, i) {
    if (!tree) {
      return [];
    }
    var listeners=[], leaf, len, branch, xTree, xxTree, isolatedBranch, endReached,
        typeLength = type.length, currentType = type[i], nextType = type[i+1];
    if (i === typeLength && tree._listeners) {
      //
      // If at the end of the event(s) list and the tree has listeners
      // invoke those listeners.
      //
      if (typeof tree._listeners === 'function') {
        handlers && handlers.push(tree._listeners);
        return [tree];
      } else {
        for (leaf = 0, len = tree._listeners.length; leaf < len; leaf++) {
          handlers && handlers.push(tree._listeners[leaf]);
        }
        return [tree];
      }
    }

    if ((currentType === '*' || currentType === '**') || tree[currentType]) {
      //
      // If the event emitted is '*' at this part
      // or there is a concrete match at this patch
      //
      if (currentType === '*') {
        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+1));
          }
        }
        return listeners;
      } else if(currentType === '**') {
        endReached = (i+1 === typeLength || (i+2 === typeLength && nextType === '*'));
        if(endReached && tree._listeners) {
          // The next element has a _listeners, add it to the handlers.
          listeners = listeners.concat(searchListenerTree(handlers, type, tree, typeLength));
        }

        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            if(branch === '*' || branch === '**') {
              if(tree[branch]._listeners && !endReached) {
                listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], typeLength));
              }
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            } else if(branch === nextType) {
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+2));
            } else {
              // No match on this one, shift into the tree but not in the type array.
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            }
          }
        }
        return listeners;
      }

      listeners = listeners.concat(searchListenerTree(handlers, type, tree[currentType], i+1));
    }

    xTree = tree['*'];
    if (xTree) {
      //
      // If the listener tree will allow any match for this part,
      // then recursively explore all branches of the tree
      //
      searchListenerTree(handlers, type, xTree, i+1);
    }

    xxTree = tree['**'];
    if(xxTree) {
      if(i < typeLength) {
        if(xxTree._listeners) {
          // If we have a listener on a '**', it will catch all, so add its handler.
          searchListenerTree(handlers, type, xxTree, typeLength);
        }

        // Build arrays of matching next branches and others.
        for(branch in xxTree) {
          if(branch !== '_listeners' && xxTree.hasOwnProperty(branch)) {
            if(branch === nextType) {
              // We know the next element will match, so jump twice.
              searchListenerTree(handlers, type, xxTree[branch], i+2);
            } else if(branch === currentType) {
              // Current node matches, move into the tree.
              searchListenerTree(handlers, type, xxTree[branch], i+1);
            } else {
              isolatedBranch = {};
              isolatedBranch[branch] = xxTree[branch];
              searchListenerTree(handlers, type, { '**': isolatedBranch }, i+1);
            }
          }
        }
      } else if(xxTree._listeners) {
        // We have reached the end and still on a '**'
        searchListenerTree(handlers, type, xxTree, typeLength);
      } else if(xxTree['*'] && xxTree['*']._listeners) {
        searchListenerTree(handlers, type, xxTree['*'], typeLength);
      }
    }

    return listeners;
  }

  function growListenerTree(type, listener) {

    type = typeof type === 'string' ? type.split(this.delimiter) : type.slice();

    //
    // Looks for two consecutive '**', if so, don't add the event at all.
    //
    for(var i = 0, len = type.length; i+1 < len; i++) {
      if(type[i] === '**' && type[i+1] === '**') {
        return;
      }
    }

    var tree = this.listenerTree;
    var name = type.shift();

    while (name) {

      if (!tree[name]) {
        tree[name] = {};
      }

      tree = tree[name];

      if (type.length === 0) {

        if (!tree._listeners) {
          tree._listeners = listener;
        }
        else if(typeof tree._listeners === 'function') {
          tree._listeners = [tree._listeners, listener];
        }
        else if (isArray(tree._listeners)) {

          tree._listeners.push(listener);

          if (!tree._listeners.warned) {

            var m = defaultMaxListeners;

            if (typeof this._events.maxListeners !== 'undefined') {
              m = this._events.maxListeners;
            }

            if (m > 0 && tree._listeners.length > m) {

              tree._listeners.warned = true;
              console.error('(node) warning: possible EventEmitter memory ' +
                            'leak detected. %d listeners added. ' +
                            'Use emitter.setMaxListeners() to increase limit.',
                            tree._listeners.length);
              console.trace();
            }
          }
        }
        return true;
      }
      name = type.shift();
    }
    return true;
  }

  // By default EventEmitters will print a warning if more than
  // 10 listeners are added to it. This is a useful default which
  // helps finding memory leaks.
  //
  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.

  EventEmitter.prototype.delimiter = '.';

  EventEmitter.prototype.setMaxListeners = function(n) {
    this._events || init.call(this);
    this._events.maxListeners = n;
    if (!this._conf) this._conf = {};
    this._conf.maxListeners = n;
  };

  EventEmitter.prototype.event = '';

  EventEmitter.prototype.once = function(event, fn) {
    this.many(event, 1, fn);
    return this;
  };

  EventEmitter.prototype.many = function(event, ttl, fn) {
    var self = this;

    if (typeof fn !== 'function') {
      throw new Error('many only accepts instances of Function');
    }

    function listener() {
      if (--ttl === 0) {
        self.off(event, listener);
      }
      fn.apply(this, arguments);
    }

    listener._origin = fn;

    this.on(event, listener);

    return self;
  };

  EventEmitter.prototype.emit = function() {

    this._events || init.call(this);

    var type = arguments[0];

    if (type === 'newListener' && !this.newListener) {
      if (!this._events.newListener) { return false; }
    }

    // Loop through the *_all* functions and invoke them.
    if (this._all) {
      var l = arguments.length;
      var args = new Array(l - 1);
      for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
      for (i = 0, l = this._all.length; i < l; i++) {
        this.event = type;
        this._all[i].apply(this, args);
      }
    }

    // If there is no 'error' event listener then throw.
    if (type === 'error') {

      if (!this._all &&
        !this._events.error &&
        !(this.wildcard && this.listenerTree.error)) {

        if (arguments[1] instanceof Error) {
          throw arguments[1]; // Unhandled 'error' event
        } else {
          throw new Error("Uncaught, unspecified 'error' event.");
        }
        return false;
      }
    }

    var handler;

    if(this.wildcard) {
      handler = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
    }
    else {
      handler = this._events[type];
    }

    if (typeof handler === 'function') {
      this.event = type;
      if (arguments.length === 1) {
        handler.call(this);
      }
      else if (arguments.length > 1)
        switch (arguments.length) {
          case 2:
            handler.call(this, arguments[1]);
            break;
          case 3:
            handler.call(this, arguments[1], arguments[2]);
            break;
          // slower
          default:
            var l = arguments.length;
            var args = new Array(l - 1);
            for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
            handler.apply(this, args);
        }
      return true;
    }
    else if (handler) {
      var l = arguments.length;
      var args = new Array(l - 1);
      for (var i = 1; i < l; i++) args[i - 1] = arguments[i];

      var listeners = handler.slice();
      for (var i = 0, l = listeners.length; i < l; i++) {
        this.event = type;
        listeners[i].apply(this, args);
      }
      return (listeners.length > 0) || !!this._all;
    }
    else {
      return !!this._all;
    }

  };

  EventEmitter.prototype.on = function(type, listener) {

    if (typeof type === 'function') {
      this.onAny(type);
      return this;
    }

    if (typeof listener !== 'function') {
      throw new Error('on only accepts instances of Function');
    }
    this._events || init.call(this);

    // To avoid recursion in the case that type == "newListeners"! Before
    // adding it to the listeners, first emit "newListeners".
    this.emit('newListener', type, listener);

    if(this.wildcard) {
      growListenerTree.call(this, type, listener);
      return this;
    }

    if (!this._events[type]) {
      // Optimize the case of one listener. Don't need the extra array object.
      this._events[type] = listener;
    }
    else if(typeof this._events[type] === 'function') {
      // Adding the second element, need to change to array.
      this._events[type] = [this._events[type], listener];
    }
    else if (isArray(this._events[type])) {
      // If we've already got an array, just append.
      this._events[type].push(listener);

      // Check for listener leak
      if (!this._events[type].warned) {

        var m = defaultMaxListeners;

        if (typeof this._events.maxListeners !== 'undefined') {
          m = this._events.maxListeners;
        }

        if (m > 0 && this._events[type].length > m) {

          this._events[type].warned = true;
          console.error('(node) warning: possible EventEmitter memory ' +
                        'leak detected. %d listeners added. ' +
                        'Use emitter.setMaxListeners() to increase limit.',
                        this._events[type].length);
          console.trace();
        }
      }
    }
    return this;
  };

  EventEmitter.prototype.onAny = function(fn) {

    if (typeof fn !== 'function') {
      throw new Error('onAny only accepts instances of Function');
    }

    if(!this._all) {
      this._all = [];
    }

    // Add the function to the event listener collection.
    this._all.push(fn);
    return this;
  };

  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  EventEmitter.prototype.off = function(type, listener) {
    if (typeof listener !== 'function') {
      throw new Error('removeListener only takes instances of Function');
    }

    var handlers,leafs=[];

    if(this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
    }
    else {
      // does not use listeners(), so no side effect of creating _events[type]
      if (!this._events[type]) return this;
      handlers = this._events[type];
      leafs.push({_listeners:handlers});
    }

    for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
      var leaf = leafs[iLeaf];
      handlers = leaf._listeners;
      if (isArray(handlers)) {

        var position = -1;

        for (var i = 0, length = handlers.length; i < length; i++) {
          if (handlers[i] === listener ||
            (handlers[i].listener && handlers[i].listener === listener) ||
            (handlers[i]._origin && handlers[i]._origin === listener)) {
            position = i;
            break;
          }
        }

        if (position < 0) {
          continue;
        }

        if(this.wildcard) {
          leaf._listeners.splice(position, 1);
        }
        else {
          this._events[type].splice(position, 1);
        }

        if (handlers.length === 0) {
          if(this.wildcard) {
            delete leaf._listeners;
          }
          else {
            delete this._events[type];
          }
        }
        return this;
      }
      else if (handlers === listener ||
        (handlers.listener && handlers.listener === listener) ||
        (handlers._origin && handlers._origin === listener)) {
        if(this.wildcard) {
          delete leaf._listeners;
        }
        else {
          delete this._events[type];
        }
      }
    }

    return this;
  };

  EventEmitter.prototype.offAny = function(fn) {
    var i = 0, l = 0, fns;
    if (fn && this._all && this._all.length > 0) {
      fns = this._all;
      for(i = 0, l = fns.length; i < l; i++) {
        if(fn === fns[i]) {
          fns.splice(i, 1);
          return this;
        }
      }
    } else {
      this._all = [];
    }
    return this;
  };

  EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

  EventEmitter.prototype.removeAllListeners = function(type) {
    if (arguments.length === 0) {
      !this._events || init.call(this);
      return this;
    }

    if(this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      var leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);

      for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
        var leaf = leafs[iLeaf];
        leaf._listeners = null;
      }
    }
    else {
      if (!this._events[type]) return this;
      this._events[type] = null;
    }
    return this;
  };

  EventEmitter.prototype.listeners = function(type) {
    if(this.wildcard) {
      var handlers = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handlers, ns, this.listenerTree, 0);
      return handlers;
    }

    this._events || init.call(this);

    if (!this._events[type]) this._events[type] = [];
    if (!isArray(this._events[type])) {
      this._events[type] = [this._events[type]];
    }
    return this._events[type];
  };

  EventEmitter.prototype.listenersAny = function() {

    if(this._all) {
      return this._all;
    }
    else {
      return [];
    }

  };

  if (typeof define === 'function' && define.amd) {
     // AMD. Register as an anonymous module.
    define(function() {
      return EventEmitter;
    });
  } else if (typeof exports === 'object') {
    // CommonJS
    exports.EventEmitter2 = EventEmitter;
  }
  else {
    // Browser global.
    window.EventEmitter2 = EventEmitter;
  }
}();

},{}],3:[function(require,module,exports){
/* Points - v0.1.1 - 2013-07-11
 * Another Pointer Events polyfill

 * http://rich-harris.github.io/Points
 * Copyright (c) 2013 Rich Harris; Released under the MIT License */



(function () {

	'use strict';

	var activePointers,
		numActivePointers,
		recentTouchStarts,
		mouseDefaults,
		mouseEvents,
		i,
		setUpMouseEvent,
		createUIEvent,
		createEvent,
		createMouseProxyEvent,
		mouseEventIsSimulated,
		createTouchProxyEvent,
		buttonsMap,
		pointerEventProperties;


	// Pointer events supported? Great, nothing to do, let's go home
	if ( window.onpointerdown !== undefined ) {
		return;
	}

	pointerEventProperties = 'screenX screenY clientX clientY ctrlKey shiftKey altKey metaKey relatedTarget detail button buttons pointerId pointerType width height pressure tiltX tiltY isPrimary'.split( ' ' );

	// Can we create events using the MouseEvent constructor? If so, gravy
	try {
		i = new UIEvent( 'test' );

		createUIEvent = function ( type, bubbles ) {
			return new UIEvent( type, { view: window, bubbles: bubbles });
		};

	// otherwise we need to do things oldschool
	} catch ( err ) {
		if ( document.createEvent ) {
			createUIEvent = function ( type, bubbles ) {
				var pointerEvent = document.createEvent( 'UIEvents' );
				pointerEvent.initUIEvent( type, bubbles, true, window );

				return pointerEvent;
			};
		}
	}

	if ( !createUIEvent ) {
		throw new Error( 'Cannot create events. You may be using an unsupported browser.' );
	}

	createEvent = function ( type, originalEvent, params, noBubble ) {
		var pointerEvent, i;

		pointerEvent = createUIEvent( type, !noBubble );

		i = pointerEventProperties.length;
		while ( i-- ) {
			Object.defineProperty( pointerEvent, pointerEventProperties[i], {
				value: params[ pointerEventProperties[i] ],
				writable: false
			});
		}

		Object.defineProperty( pointerEvent, 'originalEvent', {
			value: originalEvent,
			writable: false
		});

		Object.defineProperty( pointerEvent, 'preventDefault', {
			value: preventDefault,
			writable: false
		});

		return pointerEvent;
	};


	// add pointerEnabled property to navigator
	navigator.pointerEnabled = true;


	// If we're in IE10, these events are already supported, except prefixed
	if ( window.onmspointerdown !== undefined ) {
		[ 'MSPointerDown', 'MSPointerUp', 'MSPointerCancel', 'MSPointerMove', 'MSPointerOver', 'MSPointerOut' ].forEach( function ( prefixed ) {
			var unprefixed;

			unprefixed = prefixed.toLowerCase().substring( 2 );

			// pointerenter and pointerleave are special cases
			if ( unprefixed === 'pointerover' || unprefixed === 'pointerout' ) {
				window.addEventListener( prefixed, function ( originalEvent ) {
					var unprefixedEvent = createEvent( unprefixed, originalEvent, originalEvent, false );
					originalEvent.target.dispatchEvent( unprefixedEvent );

					if ( !originalEvent.target.contains( originalEvent.relatedTarget ) ) {
						unprefixedEvent = createEvent( ( unprefixed === 'pointerover' ? 'pointerenter' : 'pointerleave' ), originalEvent, originalEvent, true );
						originalEvent.target.dispatchEvent( unprefixedEvent );
					}
				}, true );
			}

			else {
				window.addEventListener( prefixed, function ( originalEvent ) {
					var unprefixedEvent = createEvent( unprefixed, originalEvent, originalEvent, false );
					originalEvent.target.dispatchEvent( unprefixedEvent );
				}, true );
			}
		});

		navigator.maxTouchPoints = navigator.msMaxTouchPoints;

		// Nothing more to do.
		return;
	}


	// https://dvcs.w3.org/hg/pointerevents/raw-file/tip/pointerEvents.html#dfn-chorded-buttons
	buttonsMap = {
		0: 1,
		1: 4,
		2: 2
	};

	createMouseProxyEvent = function ( type, originalEvent, noBubble ) {
		var button, buttons, pressure, params, mouseEventParams, pointerEventParams;

		// normalise button and buttons
		if ( originalEvent.buttons !== undefined ) {
			buttons = originalEvent.buttons;
			button = !originalEvent.buttons ? -1 : originalEvent.button;
		}

		else {
			if ( event.button === 0 && event.which === 0 ) {
				button = -1;
				buttons = 0;
			} else {
				button = originalEvent.button;
				buttons = buttonsMap[ button ];
			}
		}

		// Pressure is 0.5 for buttons down, 0 for no buttons down (unless pressure is
		// reported, obvs)
		pressure = originalEvent.pressure || originalEvent.mozPressure || ( buttons ? 0.5 : 0 );


		// This is the quickest way to copy event parameters. You can't enumerate
		// over event properties in Firefox (possibly elsewhere), so a traditional
		// extend function won't work
		params = {
			screenX:       originalEvent.screenX,
			screenY:       originalEvent.screenY,
			clientX:       originalEvent.clientX,
			clientY:       originalEvent.clientY,
			ctrlKey:       originalEvent.ctrlKey,
			shiftKey:      originalEvent.shiftKey,
			altKey:        originalEvent.altKey,
			metaKey:       originalEvent.metaKey,
			relatedTarget: originalEvent.relatedTarget,
			detail:        originalEvent.detail,
			button:        button,
			buttons:       buttons,

			pointerId:     1,
			pointerType:   'mouse',
			width:         0,
			height:        0,
			pressure:      pressure,
			tiltX:         0,
			tiltY:         0,
			isPrimary:     true,

			preventDefault: preventDefault
		};

		return createEvent( type, originalEvent, params, noBubble );
	};

	// Some mouse events are real, others are simulated based on touch events.
	// We only want the real ones, or we'll end up firing our load at
	// inappropriate moments.
	//
	// Surprisingly, the coordinates of the mouse event won't exactly correspond
	// with the touchstart that originated them, so we need to be a bit fuzzy.
	if ( window.ontouchstart !== undefined ) {
		mouseEventIsSimulated = function ( event ) {
			var i = recentTouchStarts.length, threshold = 10, touch;
			while ( i-- ) {
				touch = recentTouchStarts[i];
				if ( Math.abs( event.clientX - touch.clientX ) < threshold && Math.abs( event.clientY - touch.clientY ) < threshold ) {
					return true;
				}
			}
		};
	} else {
		mouseEventIsSimulated = function () {
			return false;
		};
	}



	setUpMouseEvent = function ( type ) {
		if ( type === 'over' || type === 'out' ) {
			window.addEventListener( 'mouse' + type, function ( originalEvent ) {
				var pointerEvent;

				if ( mouseEventIsSimulated( originalEvent ) ) {
					return;
				}

				pointerEvent = createMouseProxyEvent( 'pointer' + type, originalEvent );
				originalEvent.target.dispatchEvent( pointerEvent );

				if ( !originalEvent.target.contains( originalEvent.relatedTarget ) ) {
					pointerEvent = createMouseProxyEvent( ( type === 'over' ? 'pointerenter' : 'pointerleave' ), originalEvent, true );
					originalEvent.target.dispatchEvent( pointerEvent );
				}
			});
		}

		else {
			window.addEventListener( 'mouse' + type, function ( originalEvent ) {
				var pointerEvent;

				if ( mouseEventIsSimulated( originalEvent ) ) {
					return;
				}

				pointerEvent = createMouseProxyEvent( 'pointer' + type, originalEvent );
				originalEvent.target.dispatchEvent( pointerEvent );
			});
		}
	};

	[ 'down', 'up', 'over', 'out', 'move' ].forEach( function ( eventType ) {
		setUpMouseEvent( eventType );
	});





	// Touch events:
	if ( window.ontouchstart !== undefined ) {
		// Set up a registry of current touches
		activePointers = {};
		numActivePointers = 0;

		// Maintain a list of recent touchstarts, so we can eliminate simulate
		// mouse events later
		recentTouchStarts = [];

		createTouchProxyEvent = function ( type, originalEvent, touch, noBubble, relatedTarget ) {
			var params;

			params = {
				screenX:       originalEvent.screenX,
				screenY:       originalEvent.screenY,
				clientX:       touch.clientX,
				clientY:       touch.clientY,
				ctrlKey:       originalEvent.ctrlKey,
				shiftKey:      originalEvent.shiftKey,
				altKey:        originalEvent.altKey,
				metaKey:       originalEvent.metaKey,
				relatedTarget: relatedTarget || originalEvent.relatedTarget, // TODO is this right? also: mouseenter/leave?
				detail:        originalEvent.detail,
				button:        0,
				buttons:       1,

				pointerId:     touch.identifier + 2, // ensure no collisions between touch and mouse pointer IDs
				pointerType:   'touch',
				width:         20, // roughly how fat people's fingers are
				height:        20,
				pressure:      0.5,
				tiltX:         0,
				tiltY:         0,
				isPrimary:     activePointers[ touch.identifier ].isPrimary,

				preventDefault: preventDefault
			};

			return createEvent( type, originalEvent, params, noBubble );
		};

		// touchstart
		window.addEventListener( 'touchstart', function ( event ) {
			var touches, processTouch;

			touches = event.changedTouches;

			processTouch = function ( touch ) {
				var pointerdownEvent, pointeroverEvent, pointerenterEvent, pointer;

				pointer = {
					target: touch.target,
					isPrimary: numActivePointers ? false : true
				};

				activePointers[ touch.identifier ] = pointer;
				numActivePointers += 1;

				pointerdownEvent = createTouchProxyEvent( 'pointerdown', event, touch );
				pointeroverEvent = createTouchProxyEvent( 'pointerover', event, touch );
				pointerenterEvent = createTouchProxyEvent( 'pointerenter', event, touch, true );

				touch.target.dispatchEvent( pointeroverEvent );
				touch.target.dispatchEvent( pointerenterEvent );
				touch.target.dispatchEvent( pointerdownEvent );

				// we need to keep track of recent touchstart events, so we can test
				// whether later mouse events are simulated
				recentTouchStarts.push( touch );
				setTimeout( function () {
					var index = recentTouchStarts.indexOf( touch );
					if ( index !== -1 ) {
						recentTouchStarts.splice( index, 1 );
					}
				}, 1500 );
			};

			for ( i=0; i<touches.length; i+=1 ) {
				processTouch( touches[i] );
			}
		});

		// touchmove
		window.addEventListener( 'touchmove', function ( event ) {
			var touches, processTouch;

			touches = event.changedTouches;

			processTouch = function ( touch ) {
				var pointermoveEvent, pointeroverEvent, pointeroutEvent, pointerenterEvent, pointerleaveEvent, pointer, previousTarget, actualTarget;

				pointer = activePointers[ touch.identifier ];
				actualTarget = document.elementFromPoint( touch.clientX, touch.clientY );

				if ( pointer.target === actualTarget ) {
					// just fire a touchmove event
					pointermoveEvent = createTouchProxyEvent( 'pointermove', event, touch );
					actualTarget.dispatchEvent( pointermoveEvent );
					return;
				}


				// target has changed - we need to fire a pointerout (and possibly pointerleave)
				// event on the previous target, and a pointerover (and possibly pointerenter)
				// event on the current target. Then we fire the pointermove event on the current
				// target

				previousTarget = pointer.target;
				pointer.target = actualTarget;

				// pointerleave
				if ( !previousTarget.contains( actualTarget ) ) {
					// new target is not a child of previous target, so fire pointerleave on previous
					pointerleaveEvent = createTouchProxyEvent( 'pointerleave', event, touch, true, actualTarget );
					previousTarget.dispatchEvent( pointerleaveEvent );
				}

				// pointerout
				pointeroutEvent = createTouchProxyEvent( 'pointerout', event, touch, false );
				previousTarget.dispatchEvent( pointeroutEvent );

				// pointermove
				pointermoveEvent = createTouchProxyEvent( 'pointermove', event, touch, false );
				actualTarget.dispatchEvent( pointermoveEvent );

				// pointerover
				pointeroverEvent = createTouchProxyEvent( 'pointerover', event, touch, false );
				actualTarget.dispatchEvent( pointeroverEvent );

				// pointerenter
				if ( !actualTarget.contains( previousTarget ) ) {
					// previous target is not a child of current target, so fire pointerenter on current
					pointerenterEvent = createTouchProxyEvent( 'pointerenter', event, touch, true, previousTarget );
					actualTarget.dispatchEvent( pointerenterEvent );
				}
			};

			for ( i=0; i<touches.length; i+=1 ) {
				processTouch( touches[i] );
			}
		});

		// touchend
		window.addEventListener( 'touchend', function ( event ) {
			var touches, processTouch;

			touches = event.changedTouches;

			processTouch = function ( touch ) {
				var pointerupEvent, pointeroutEvent, pointerleaveEvent, previousTarget, actualTarget;

				actualTarget = document.elementFromPoint( touch.clientX, touch.clientY );

				pointerupEvent = createTouchProxyEvent( 'pointerup', event, touch, false );
				pointeroutEvent = createTouchProxyEvent( 'pointerout', event, touch, false );
				pointerleaveEvent = createTouchProxyEvent( 'pointerleave', event, touch, true );

				delete activePointers[ touch.identifier ];
				numActivePointers -= 1;

				actualTarget.dispatchEvent( pointerupEvent );
				actualTarget.dispatchEvent( pointeroutEvent );
				actualTarget.dispatchEvent( pointerleaveEvent );
			};

			for ( i=0; i<touches.length; i+=1 ) {
				processTouch( touches[i] );
			}
		});

		// touchcancel
		window.addEventListener( 'touchcancel', function ( event ) {
			var touches, processTouch;

			touches = event.changedTouches;

			processTouch = function ( touch ) {
				var pointercancelEvent, pointeroutEvent, pointerleaveEvent;

				pointercancelEvent = createTouchProxyEvent( 'pointercancel', event, touch );
				pointeroutEvent = createTouchProxyEvent( 'pointerout', event, touch );
				pointerleaveEvent = createTouchProxyEvent( 'pointerleave', event, touch );

				touch.target.dispatchEvent( pointercancelEvent );
				touch.target.dispatchEvent( pointeroutEvent );
				touch.target.dispatchEvent( pointerleaveEvent );

				delete activePointers[ touch.identifier ];
				numActivePointers -= 1;
			};

			for ( i=0; i<touches.length; i+=1 ) {
				processTouch( touches[i] );
			}
		});
	}


	// Single preventDefault function - no point recreating it over and over
	function preventDefault () {
		this.originalEvent.preventDefault();
	}

	// TODO stopPropagation?

}());
},{}],4:[function(require,module,exports){
(function() {
  'use strict';

  if (self.fetch) {
    return
  }

  function Headers(headers) {
    this.map = {}

    var self = this
    if (headers instanceof Headers) {
      headers.forEach(function(name, values) {
        values.forEach(function(value) {
          self.append(name, value)
        })
      })

    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        self.append(name, headers[name])
      })
    }
  }

  Headers.prototype.append = function(name, value) {
    name = name.toLowerCase()
    var list = this.map[name]
    if (!list) {
      list = []
      this.map[name] = list
    }
    list.push(value)
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[name.toLowerCase()]
  }

  Headers.prototype.get = function(name) {
    var values = this.map[name.toLowerCase()]
    return values ? values[0] : null
  }

  Headers.prototype.getAll = function(name) {
    return this.map[name.toLowerCase()] || []
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(name.toLowerCase())
  }

  Headers.prototype.set = function(name, value) {
    this.map[name.toLowerCase()] = [value]
  }

  // Instead of iterable for now.
  Headers.prototype.forEach = function(callback) {
    var self = this
    Object.getOwnPropertyNames(this.map).forEach(function(name) {
      callback(name, self.map[name])
    })
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    reader.readAsArrayBuffer(blob)
    return fileReaderReady(reader)
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    reader.readAsText(blob)
    return fileReaderReady(reader)
  }

  var support = {
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob();
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self
  }

  function Body() {
    this.bodyUsed = false

    if (support.blob) {
      this._initBody = function(body) {
        this._bodyInit = body
        if (typeof body === 'string') {
          this._bodyText = body
        } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
          this._bodyBlob = body
        } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
          this._bodyFormData = body
        } else if (!body) {
          this._bodyText = ''
        } else {
          throw new Error('unsupported BodyInit type')
        }
      }

      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        return this.blob().then(readBlobAsArrayBuffer)
      }

      this.text = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as text')
        } else {
          return Promise.resolve(this._bodyText)
        }
      }
    } else {
      this._initBody = function(body) {
        this._bodyInit = body
        if (typeof body === 'string') {
          this._bodyText = body
        } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
          this._bodyFormData = body
        } else if (!body) {
          this._bodyText = ''
        } else {
          throw new Error('unsupported BodyInit type')
        }
      }

      this.text = function() {
        var rejected = consumed(this)
        return rejected ? rejected : Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(url, options) {
    options = options || {}
    this.url = url

    this.credentials = options.credentials || 'omit'
    this.headers = new Headers(options.headers)
    this.method = normalizeMethod(options.method || 'GET')
    this.mode = options.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && options.body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(options.body)
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function headers(xhr) {
    var head = new Headers()
    var pairs = xhr.getAllResponseHeaders().trim().split('\n')
    pairs.forEach(function(header) {
      var split = header.trim().split(':')
      var key = split.shift().trim()
      var value = split.join(':').trim()
      head.append(key, value)
    })
    return head
  }

  Request.prototype.fetch = function() {
    var self = this

    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest()
      if (self.credentials === 'cors') {
        xhr.withCredentials = true;
      }

      function responseURL() {
        if ('responseURL' in xhr) {
          return xhr.responseURL
        }

        // Avoid security warnings on getResponseHeader when not allowed by CORS
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
          return xhr.getResponseHeader('X-Request-URL')
        }

        return;
      }

      xhr.onload = function() {
        var status = (xhr.status === 1223) ? 204 : xhr.status
        if (status < 100 || status > 599) {
          reject(new TypeError('Network request failed'))
          return
        }
        var options = {
          status: status,
          statusText: xhr.statusText,
          headers: headers(xhr),
          url: responseURL()
        }
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(self.method, self.url, true)
      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      self.headers.forEach(function(name, values) {
        values.forEach(function(value) {
          xhr.setRequestHeader(name, value)
        })
      })

      xhr.send(typeof self._bodyInit === 'undefined' ? null : self._bodyInit)
    })
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this._initBody(bodyInit)
    this.type = 'default'
    this.url = null
    this.status = options.status
    this.statusText = options.statusText
    this.headers = options.headers
    this.url = options.url || ''
  }

  Body.call(Response.prototype)

  self.Headers = Headers;
  self.Request = Request;
  self.Response = Response;

  self.fetch = function (url, options) {
    return new Request(url, options).fetch()
  }
  self.fetch.polyfill = true
})();

},{}],5:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var PointerEvent = (function () {
  function PointerEvent(event, element) {
    _classCallCheck(this, PointerEvent);

    this.element = element;
    this.originalEvent = event;
  }

  _createClass(PointerEvent, {
    point: {
      get: function () {
        // TODO: do we need to recalculate this each time, or can we optimize by checking using
        // scroll events?
        var bounds = this.element.getBoundingClientRect(),
            point = this.pagePoint;
        point.x -= bounds.left;
        point.y -= bounds.top;
        return point;
      }
    },
    pagePoint: {
      get: function () {
        return {
          x: this.originalEvent.clientX,
          y: this.originalEvent.clientY
        };
      }
    },
    time: {
      get: function () {
        return new Date(this.originalEvent.timeStamp);
      }
    },
    type: {
      get: function () {
        return this.originalEvent.type;
      }
    }
  });

  return PointerEvent;
})();

module.exports = PointerEvent;

},{}],6:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var eventemitter2 = _interopRequire(require("eventemitter2"));

var PointerEvent = _interopRequire(require("./PointerEvent"));

var PointerProxy = (function (_eventemitter2$EventEmitter2) {
  function PointerProxy(element, filter) {
    var _this = this;

    _classCallCheck(this, PointerProxy);

    this.element = element;
    this.filter = filter;

    var relayEvent = function (originalEvent) {
      if (_this.filter && _this.filter(originalEvent) === false) return;

      _this.emit(event.type, new PointerEvent(event, _this.element));
    };

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = PointerProxy.eventTypes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var eventName = _step.value;

        element.addEventListener(eventName, relayEvent);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"]) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  _inherits(PointerProxy, _eventemitter2$EventEmitter2);

  _createClass(PointerProxy, {
    forwardEvents: {
      value: function forwardEvents(emitter) {
        this.onAny(function forward(event) {
          emitter.emit(event.type, event);
        });
      }
    }
  });

  return PointerProxy;
})(eventemitter2.EventEmitter2);

module.exports = PointerProxy;

PointerProxy.eventTypes = ["pointerover", "pointerenter", "pointerdown", "pointerup", "pointermove", "pointercancel", "pointerout", "pointerleave"];

},{"./PointerEvent":5,"eventemitter2":2}],7:[function(require,module,exports){
"use strict";

exports.redirectParent = redirectParent;
exports.getTitleData = getTitleData;
Object.defineProperty(exports, "__esModule", {
  value: true
});

function redirectParent(url) {
  parent.postMessage("{\"status\": \"redirect\", \"domain_path\": \"" + url + "\"}", "*");
}

function getTitleData(callback) {

  // Somehow determines if we're on the homepage. no idea what they came up here...
  function isHomepage() {
    var match = RegExp("[?&]homepage=([^&]*)").exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
  }

  // Receive data having title and subtitle and put in on the page
  window.addEventListener("message", function (e) {
    var msg = JSON.parse(e.data);
    if (msg.domain_path !== undefined) {
      msg.isHomepage = isHomepage();
      callback(msg);
    }
  });

  // Create unique cover id
  var coverId = window.location.pathname.split("/")[4];

  // Send information to parent saying that loading of the iframe is ready
  parent.postMessage("{\"status\": \"ready\", \"coverId\": \"" + coverId + "\"}", "*");
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGVvL25oaS1jb3Zlci1nbGFzL3NyYy9hcHAuanMiLCIuLi9ub2RlX21vZHVsZXMvZXZlbnRlbWl0dGVyMi9saWIvZXZlbnRlbWl0dGVyMi5qcyIsIi4uL25vZGVfbW9kdWxlcy9wb2ludHMvUG9pbnRzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3doYXR3Zy1mZXRjaC9mZXRjaC5qcyIsIi9Vc2Vycy9sZW8vbmhpLWNvdmVyLWdsYXMvc3JjL2xpYi9Qb2ludGVyRXZlbnQuanMiLCIvVXNlcnMvbGVvL25oaS1jb3Zlci1nbGFzL3NyYy9saWIvUG9pbnRlclByb3h5LmpzIiwiL1VzZXJzL2xlby9uaGktY292ZXItZ2xhcy9zcmMvbGliL2dldERhdGEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O1FDQU8sY0FBYzs7MEJBQ3NCLGVBQWU7O0lBQWxELGNBQWMsZUFBZCxjQUFjO0lBQUUsWUFBWSxlQUFaLFlBQVk7O1FBQzdCLFFBQVE7O0lBQ1IsWUFBWSwyQkFBTSxvQkFBb0I7O0FBRTdDLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQztBQUN0QixJQUFNLFNBQVMsR0FBRyxHQUFHLENBQUM7QUFDdEIsSUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDO0FBQ3RCLElBQUksS0FBSyxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQztBQUNoRCxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUM7O0FBR3RCLFNBQVMsT0FBTyxHQUFHO0FBQ2pCLE9BQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUN6QixJQUFJLENBQUMsVUFBVSxRQUFRLEVBQUU7QUFDeEIsV0FBTyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7R0FDeEIsQ0FBQyxDQUNELElBQUksQ0FBQyxVQUFVLElBQUksRUFBRTtBQUNwQixRQUFJLElB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM2NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUFJLE9BQU8sR0FBRyxBQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O0FBR3ZELFFBQU0sQ0FBQyxXQUFXLENBQUMseUNBQWtDLEdBQUcsT0FBTyxHQUFHLEtBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztDQUM5RSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgJ3doYXR3Zy1mZXRjaCc7XG5pbXBvcnQge3JlZGlyZWN0UGFyZW50LCBnZXRUaXRsZURhdGF9IGZyb20gJy4vbGliL2dldERhdGEnO1xuaW1wb3J0ICdwb2ludHMnO1xuaW1wb3J0IFBvaW50ZXJQcm94eSBmcm9tICcuL2xpYi9Qb2ludGVyUHJveHknO1xuXG5jb25zdCBzdmd3aWR0aCA9IDExMjA7XG5jb25zdCBzdmdoZWlnaHQgPSA3NTg7XG5jb25zdCBsb3VwZVpvb20gPSAxLjU7XG52YXIgbG91cGUsIGxvdXBlQ29udGVudCwgaW1hZ2UxLCBpbWFnZTIsIGltYWdlMztcbnZhciBoYXNDaGFuZ2VkID0gdHJ1ZTtcblxuXG5mdW5jdGlvbiBsb2FkU1ZHKCkge1xuICBmZXRjaCgnLi9hc3NldHMvc291cmNlLnN2ZycpXG4gICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xuICAgIH0pXG4gICAgLnRoZW4oZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgIHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBmcmFnLmlubmVySFRNTCA9IHRleHQ7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGZyYWcpO1xuICAgICAgc2V0dXAoZnJhZyk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIG1hcFJhbmdlKGZyb20sIHRvLCBzKSB7XG4gIHJldHVybiB0b1swXSArIChzIC0gZnJvbVswXSkgKiAodG9bMV0gLSB0b1swXSkgLyAoZnJvbVsxXSAtIGZyb21bMF0pO1xufVxuXG5mdW5jdGlvbiBtb3ZlSW1hZ2VzKHgsIHkpIHtcbiAgbW92ZU1hc2tDb250ZW50KGltYWdlMSwgbWFwUmFuZ2UoWzAsIDExMjBdLCBbNzksIC0zMTBdLCB4KSwgbWFwUmFuZ2UoWzAsIDc1OF0sIFsxNzAsIC0zMjBdLCB5KSk7XG4gIG1vdmVNYXNrQ29udGVudChpbWFnZTIsIG1hcFJhbmdlKFswLCA3NThdLCBbMjA0LCA0ODldLCB5KSwgbWFwUmFuZ2UoWzAsIDExMjBdLCBbNDIsIDQ5NV0sIHgpKTtcbiAgbW92ZU1hc2tDb250ZW50KGltYWdlMywgbWFwUmFuZ2UoWzAsIDc1OF0sIFsgMjkwLCAwXSwgeSksIG1hcFJhbmdlKFswLCAxMTIwXSwgWzIyMCwgLTEwMF0sIHgpKTtcbiAgXG4gIG1vdmVMb3VwZSh4LCB5KTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlTG91cGVBdHRyaWJ1dGUoKSB7XG4gIHZhciB7eCwgeX0gPSBsb3VwZS5wb2ludDtcbiAgXG4gIGxvdXBlLnNldEF0dHJpYnV0ZSgndHJhbnNmb3JtJywgYHRyYW5zbGF0ZSgke3h9LCAke3l9KWApO1xuXG4gIHZhciBjb250ZW50WCA9IHggLyAobG91cGVab29tICogLTIpO1xuICB2YXIgY29udGVudFkgPSB5IC8gKGxvdXBlWm9vbSAqIC0yKTtcbiAgXG4gIGxvdXBlQ29udGVudC5zZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybScsIGBzY2FsZSgxLjUpIHRyYW5zbGF0ZSgke2NvbnRlbnRYfSwgJHtjb250ZW50WX0pYCk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUF0dHJpYnV0ZShlbGVtZW50KSB7XG4gIGVsZW1lbnQuc2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKCR7ZWxlbWVudC5wb2ludC54fSwgJHtlbGVtZW50LnBvaW50Lnl9KWApO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVBdHRyaWJ1dGVzKCkge1xuICB1cGRhdGVBdHRyaWJ1dGUoaW1hZ2UxKTtcbiAgdXBkYXRlQXR0cmlidXRlKGltYWdlMik7XG4gIHVwZGF0ZUF0dHJpYnV0ZShpbWFnZTMpO1xuICB1cGRhdGVMb3VwZUF0dHJpYnV0ZSgpO1xufVxuXG5mdW5jdGlvbiBtb3ZlTWFza0NvbnRlbnQoZWxlbWVudCwgeCwgeSwgZGlyKSB7XG4gIHZhciBwb2ludCA9IGVsZW1lbnQucG9pbnQ7XG4gIHBvaW50LnggPSB4O1xuICBwb2ludC55ID0geTtcbn1cblxuZnVuY3Rpb24gbW92ZUxvdXBlKHgsIHkpIHtcbiAgbG91cGUucG9pbnQueCA9IHg7XG4gIGxvdXBlLnBvaW50LnkgPSB5O1xufVxuXG5mdW5jdGlvbiBkcmF3KCkge1xuICBpZiAoaGFzQ2hhbmdlZCkge1xuICAgIHVwZGF0ZUxvdXBlQXR0cmlidXRlKCk7XG4gICAgdXBkYXRlQXR0cmlidXRlcygpO1xuICAgIFxuICAgIGhhc0NoYW5nZWQgPSBmYWxzZTsgIFxuICB9XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShkcmF3KTtcbiAgXG59XG5cbmZ1bmN0aW9uIHJhbmRvbU1vdmUoeE9sZCwgeU9sZCkge1xuICB2YXIgeCA9IE1hdGgucmFuZG9tKCkgKiAxMTIwO1xuICB2YXIgeSA9IE1hdGgucmFuZG9tKCkgKiA3NjA7XG4gIFxuICB2YXIgZGlzdGFuY2UgPSBNYXRoLnNxcnQoTWF0aC5wb3coeE9sZCAtIHgsIDIpICsgTWF0aC5wb3coeU9sZCAtIHksIDIpKVxuICBcbiAgdmFyIGR1cmF0aW9uID0gZGlzdGFuY2UgLyA1MCAqIDE0MDAgLyB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgdmFyIGludGVydmFsRnJlcXVlbmN5ID0gNTtcbiAgdmFyIGxhc3RUaW1lID0gZHVyYXRpb24gKiAxMDAwO1xuICB2YXIgc3RlcHMgPSB+fihsYXN0VGltZSAvIGludGVydmFsRnJlcXVlbmN5KTtcbiAgdmFyIHN0ZXAgPSAwO1xuICAvLyBDYWxsIGl0IGEgbG90LCBzaW5jZSB0aGlzIGRvZXNuJ3QgYWN0dWFsbHkgZG8gYW55dGhpbmcgaGVhdnlcbiAgdmFyIGludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgIHZhciB4Tm93ID0geE9sZCArICh4IC0geE9sZCkgLyBzdGVwcyAqIHN0ZXA7XG4gICAgdmFyIHlOb3cgPSB5T2xkICsgKHkgLSB5T2xkKSAvIHN0ZXBzICogc3RlcDtcbiAgICBcbiAgICBpZiAoc3RlcCA+IHN0ZXBzKSB7XG4gICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgIHJhbmRvbU1vdmUoeE5vdywgeU5vdyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIFxuICAgIG1vdmVJbWFnZXMoeE5vdywgeU5vdyk7XG4gICAgaGFzQ2hhbmdlZCA9IHRydWU7XG4gICAgc3RlcCsrO1xuICB9LCBpbnRlcnZhbEZyZXF1ZW5jeSk7XG59XG5cbmZ1bmN0aW9uIGdldFJlbGF0aXZlUG9pbnQoZXZlbnQsIGVsZW1lbnQpIHtcbiAgdmFyIGJvdW5kcyA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHZhciB4ID0gZXZlbnQuY2xpZW50WCAtIGJvdW5kcy5sZWZ0O1xuICB2YXIgeSA9IGV2ZW50LmNsaWVudFkgLSBib3VuZHMudG9wO1xuICB2YXIgc3ZnU2NhbGUgPSBNYXRoLm1heChzdmd3aWR0aCAvIHdpbmRvdy5pbm5lcldpZHRoLCBzdmdoZWlnaHQgLyB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICBcbiAgeCAqPSBzdmdTY2FsZTtcbiAgeSAqPSBzdmdTY2FsZTtcbiAgcmV0dXJuIHtcbiAgICB4OiB4LFxuICAgIHk6IHlcbiAgfTtcbn1cblxuZnVuY3Rpb24gc2V0dXAoY29udGFpbmVyKSB7XG4gIHZhciBzdmcgPSBjb250YWluZXIucXVlcnlTZWxlY3Rvcignc3ZnJyk7XG4gIHZhciBpbWFnZXMgPSBzdmcucXVlcnlTZWxlY3RvckFsbCgnLmNyb3BwZWQnKTtcbiAgY29uc29sZS5sb2coaW1hZ2VzLmxlbmd0aCk7XG5cbiAgaW1hZ2UxID0gaW1hZ2VzWzFdO1xuICBpbWFnZTIgPSBpbWFnZXNbMl07XG4gIGltYWdlMyA9IGltYWdlc1swXTtcbiAgbG91cGUgPSBzdmcucXVlcnlTZWxlY3RvcignI2NpcmNsZS1sb3VwZScpO1xuICBsb3VwZUNvbnRlbnQgPSBzdmcucXVlcnlTZWxlY3RvcignI2xvdXBlLXZpc2libGUgdXNlJyk7XG5cbiAgaW1hZ2UxLnBvaW50ID0ge3g6IDAsIHk6IDB9O1xuICBpbWFnZTIucG9pbnQgPSB7eDogMCwgeTogMH07XG4gIGltYWdlMy5wb2ludCA9IHt4OiAwLCB5OiAwfTtcbiAgbG91cGUucG9pbnQgPSB7eDogMCwgeTogMH07XG5cblxuICB2YXIgb2Zmc2V0ID0gWzAsIDBdO1xuICB2YXIgZmlyc3QgPSB0cnVlO1xuICBsb3VwZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICBcbiAgc3ZnLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJtb3ZlJywgZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoZmlyc3QpIHtcbiAgICAgIGxvdXBlLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgIGZpcnN0ID0gZmFsc2U7XG4gICAgfVxuICAgIHZhciBwb2ludCA9IGdldFJlbGF0aXZlUG9pbnQoZSwgc3ZnKTtcblxuICAgIG1vdmVJbWFnZXMocG9pbnQueCwgcG9pbnQueSk7XG4gICAgXG4gICAgaGFzQ2hhbmdlZCA9IHRydWU7XG5cbiAgfSlcblxuXG4gIG1vdmVJbWFnZXMoMCwgMCk7XG4gIGRyYXcoKTtcbiAgXG4gIGlmICh0cnVlIHx8ICdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdykge1xuICAgIGxvdXBlLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICByYW5kb21Nb3ZlKDQwMCwgMzAwKTtcbiAgfVxuICBcbiAgZ2V0VGl0bGVEYXRhKGZ1bmN0aW9uIChtc2cpIHsgICAgXG4gICAgLy8gQWRkIGxpbmsgdG8gYm9keSB0byBoYXZlIHRoZSBwYXJlbnQgcmVkaXJlY3QgdG8gdGhlIG1hZ2F6aW5lIFVSTFxuICAgIGlmIChtc2cuaXNIb21lcGFnZSkge1xuICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICByZWRpcmVjdFBhcmVudChtc2cuZG9tYWluX3BhdGgpO1xuICAgICAgfSk7XG4gICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICB9XG4gIH0pO1xuXG59XG5cblxuXG5cbmxvYWRTVkcoKTtcbiIsIi8qIVxuICogRXZlbnRFbWl0dGVyMlxuICogaHR0cHM6Ly9naXRodWIuY29tL2hpajFueC9FdmVudEVtaXR0ZXIyXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDEzIGhpajFueFxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICovXG47IWZ1bmN0aW9uKHVuZGVmaW5lZCkge1xuXG4gIHZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSA/IEFycmF5LmlzQXJyYXkgOiBmdW5jdGlvbiBfaXNBcnJheShvYmopIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09IFwiW29iamVjdCBBcnJheV1cIjtcbiAgfTtcbiAgdmFyIGRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuICBmdW5jdGlvbiBpbml0KCkge1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGlmICh0aGlzLl9jb25mKSB7XG4gICAgICBjb25maWd1cmUuY2FsbCh0aGlzLCB0aGlzLl9jb25mKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjb25maWd1cmUoY29uZikge1xuICAgIGlmIChjb25mKSB7XG5cbiAgICAgIHRoaXMuX2NvbmYgPSBjb25mO1xuXG4gICAgICBjb25mLmRlbGltaXRlciAmJiAodGhpcy5kZWxpbWl0ZXIgPSBjb25mLmRlbGltaXRlcik7XG4gICAgICBjb25mLm1heExpc3RlbmVycyAmJiAodGhpcy5fZXZlbnRzLm1heExpc3RlbmVycyA9IGNvbmYubWF4TGlzdGVuZXJzKTtcbiAgICAgIGNvbmYud2lsZGNhcmQgJiYgKHRoaXMud2lsZGNhcmQgPSBjb25mLndpbGRjYXJkKTtcbiAgICAgIGNvbmYubmV3TGlzdGVuZXIgJiYgKHRoaXMubmV3TGlzdGVuZXIgPSBjb25mLm5ld0xpc3RlbmVyKTtcblxuICAgICAgaWYgKHRoaXMud2lsZGNhcmQpIHtcbiAgICAgICAgdGhpcy5saXN0ZW5lclRyZWUgPSB7fTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBFdmVudEVtaXR0ZXIoY29uZikge1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHRoaXMubmV3TGlzdGVuZXIgPSBmYWxzZTtcbiAgICBjb25maWd1cmUuY2FsbCh0aGlzLCBjb25mKTtcbiAgfVxuXG4gIC8vXG4gIC8vIEF0dGVudGlvbiwgZnVuY3Rpb24gcmV0dXJuIHR5cGUgbm93IGlzIGFycmF5LCBhbHdheXMgIVxuICAvLyBJdCBoYXMgemVybyBlbGVtZW50cyBpZiBubyBhbnkgbWF0Y2hlcyBmb3VuZCBhbmQgb25lIG9yIG1vcmVcbiAgLy8gZWxlbWVudHMgKGxlYWZzKSBpZiB0aGVyZSBhcmUgbWF0Y2hlc1xuICAvL1xuICBmdW5jdGlvbiBzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHRyZWUsIGkpIHtcbiAgICBpZiAoIXRyZWUpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgdmFyIGxpc3RlbmVycz1bXSwgbGVhZiwgbGVuLCBicmFuY2gsIHhUcmVlLCB4eFRyZWUsIGlzb2xhdGVkQnJhbmNoLCBlbmRSZWFjaGVkLFxuICAgICAgICB0eXBlTGVuZ3RoID0gdHlwZS5sZW5ndGgsIGN1cnJlbnRUeXBlID0gdHlwZVtpXSwgbmV4dFR5cGUgPSB0eXBlW2krMV07XG4gICAgaWYgKGkgPT09IHR5cGVMZW5ndGggJiYgdHJlZS5fbGlzdGVuZXJzKSB7XG4gICAgICAvL1xuICAgICAgLy8gSWYgYXQgdGhlIGVuZCBvZiB0aGUgZXZlbnQocykgbGlzdCBhbmQgdGhlIHRyZWUgaGFzIGxpc3RlbmVyc1xuICAgICAgLy8gaW52b2tlIHRob3NlIGxpc3RlbmVycy5cbiAgICAgIC8vXG4gICAgICBpZiAodHlwZW9mIHRyZWUuX2xpc3RlbmVycyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBoYW5kbGVycyAmJiBoYW5kbGVycy5wdXNoKHRyZWUuX2xpc3RlbmVycyk7XG4gICAgICAgIHJldHVybiBbdHJlZV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKGxlYWYgPSAwLCBsZW4gPSB0cmVlLl9saXN0ZW5lcnMubGVuZ3RoOyBsZWFmIDwgbGVuOyBsZWFmKyspIHtcbiAgICAgICAgICBoYW5kbGVycyAmJiBoYW5kbGVycy5wdXNoKHRyZWUuX2xpc3RlbmVyc1tsZWFmXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFt0cmVlXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoKGN1cnJlbnRUeXBlID09PSAnKicgfHwgY3VycmVudFR5cGUgPT09ICcqKicpIHx8IHRyZWVbY3VycmVudFR5cGVdKSB7XG4gICAgICAvL1xuICAgICAgLy8gSWYgdGhlIGV2ZW50IGVtaXR0ZWQgaXMgJyonIGF0IHRoaXMgcGFydFxuICAgICAgLy8gb3IgdGhlcmUgaXMgYSBjb25jcmV0ZSBtYXRjaCBhdCB0aGlzIHBhdGNoXG4gICAgICAvL1xuICAgICAgaWYgKGN1cnJlbnRUeXBlID09PSAnKicpIHtcbiAgICAgICAgZm9yIChicmFuY2ggaW4gdHJlZSkge1xuICAgICAgICAgIGlmIChicmFuY2ggIT09ICdfbGlzdGVuZXJzJyAmJiB0cmVlLmhhc093blByb3BlcnR5KGJyYW5jaCkpIHtcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5jb25jYXQoc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB0cmVlW2JyYW5jaF0sIGkrMSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGlzdGVuZXJzO1xuICAgICAgfSBlbHNlIGlmKGN1cnJlbnRUeXBlID09PSAnKionKSB7XG4gICAgICAgIGVuZFJlYWNoZWQgPSAoaSsxID09PSB0eXBlTGVuZ3RoIHx8IChpKzIgPT09IHR5cGVMZW5ndGggJiYgbmV4dFR5cGUgPT09ICcqJykpO1xuICAgICAgICBpZihlbmRSZWFjaGVkICYmIHRyZWUuX2xpc3RlbmVycykge1xuICAgICAgICAgIC8vIFRoZSBuZXh0IGVsZW1lbnQgaGFzIGEgX2xpc3RlbmVycywgYWRkIGl0IHRvIHRoZSBoYW5kbGVycy5cbiAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuY29uY2F0KHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgdHJlZSwgdHlwZUxlbmd0aCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChicmFuY2ggaW4gdHJlZSkge1xuICAgICAgICAgIGlmIChicmFuY2ggIT09ICdfbGlzdGVuZXJzJyAmJiB0cmVlLmhhc093blByb3BlcnR5KGJyYW5jaCkpIHtcbiAgICAgICAgICAgIGlmKGJyYW5jaCA9PT0gJyonIHx8IGJyYW5jaCA9PT0gJyoqJykge1xuICAgICAgICAgICAgICBpZih0cmVlW2JyYW5jaF0uX2xpc3RlbmVycyAmJiAhZW5kUmVhY2hlZCkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5jb25jYXQoc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB0cmVlW2JyYW5jaF0sIHR5cGVMZW5ndGgpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuY29uY2F0KHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgdHJlZVticmFuY2hdLCBpKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYoYnJhbmNoID09PSBuZXh0VHlwZSkge1xuICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuY29uY2F0KHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgdHJlZVticmFuY2hdLCBpKzIpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIE5vIG1hdGNoIG9uIHRoaXMgb25lLCBzaGlmdCBpbnRvIHRoZSB0cmVlIGJ1dCBub3QgaW4gdGhlIHR5cGUgYXJyYXkuXG4gICAgICAgICAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5jb25jYXQoc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB0cmVlW2JyYW5jaF0sIGkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxpc3RlbmVycztcbiAgICAgIH1cblxuICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHRyZWVbY3VycmVudFR5cGVdLCBpKzEpKTtcbiAgICB9XG5cbiAgICB4VHJlZSA9IHRyZWVbJyonXTtcbiAgICBpZiAoeFRyZWUpIHtcbiAgICAgIC8vXG4gICAgICAvLyBJZiB0aGUgbGlzdGVuZXIgdHJlZSB3aWxsIGFsbG93IGFueSBtYXRjaCBmb3IgdGhpcyBwYXJ0LFxuICAgICAgLy8gdGhlbiByZWN1cnNpdmVseSBleHBsb3JlIGFsbCBicmFuY2hlcyBvZiB0aGUgdHJlZVxuICAgICAgLy9cbiAgICAgIHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgeFRyZWUsIGkrMSk7XG4gICAgfVxuXG4gICAgeHhUcmVlID0gdHJlZVsnKionXTtcbiAgICBpZih4eFRyZWUpIHtcbiAgICAgIGlmKGkgPCB0eXBlTGVuZ3RoKSB7XG4gICAgICAgIGlmKHh4VHJlZS5fbGlzdGVuZXJzKSB7XG4gICAgICAgICAgLy8gSWYgd2UgaGF2ZSBhIGxpc3RlbmVyIG9uIGEgJyoqJywgaXQgd2lsbCBjYXRjaCBhbGwsIHNvIGFkZCBpdHMgaGFuZGxlci5cbiAgICAgICAgICBzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHh4VHJlZSwgdHlwZUxlbmd0aCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBCdWlsZCBhcnJheXMgb2YgbWF0Y2hpbmcgbmV4dCBicmFuY2hlcyBhbmQgb3RoZXJzLlxuICAgICAgICBmb3IoYnJhbmNoIGluIHh4VHJlZSkge1xuICAgICAgICAgIGlmKGJyYW5jaCAhPT0gJ19saXN0ZW5lcnMnICYmIHh4VHJlZS5oYXNPd25Qcm9wZXJ0eShicmFuY2gpKSB7XG4gICAgICAgICAgICBpZihicmFuY2ggPT09IG5leHRUeXBlKSB7XG4gICAgICAgICAgICAgIC8vIFdlIGtub3cgdGhlIG5leHQgZWxlbWVudCB3aWxsIG1hdGNoLCBzbyBqdW1wIHR3aWNlLlxuICAgICAgICAgICAgICBzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHh4VHJlZVticmFuY2hdLCBpKzIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmKGJyYW5jaCA9PT0gY3VycmVudFR5cGUpIHtcbiAgICAgICAgICAgICAgLy8gQ3VycmVudCBub2RlIG1hdGNoZXMsIG1vdmUgaW50byB0aGUgdHJlZS5cbiAgICAgICAgICAgICAgc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB4eFRyZWVbYnJhbmNoXSwgaSsxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlzb2xhdGVkQnJhbmNoID0ge307XG4gICAgICAgICAgICAgIGlzb2xhdGVkQnJhbmNoW2JyYW5jaF0gPSB4eFRyZWVbYnJhbmNoXTtcbiAgICAgICAgICAgICAgc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB7ICcqKic6IGlzb2xhdGVkQnJhbmNoIH0sIGkrMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYoeHhUcmVlLl9saXN0ZW5lcnMpIHtcbiAgICAgICAgLy8gV2UgaGF2ZSByZWFjaGVkIHRoZSBlbmQgYW5kIHN0aWxsIG9uIGEgJyoqJ1xuICAgICAgICBzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHh4VHJlZSwgdHlwZUxlbmd0aCk7XG4gICAgICB9IGVsc2UgaWYoeHhUcmVlWycqJ10gJiYgeHhUcmVlWycqJ10uX2xpc3RlbmVycykge1xuICAgICAgICBzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHh4VHJlZVsnKiddLCB0eXBlTGVuZ3RoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbGlzdGVuZXJzO1xuICB9XG5cbiAgZnVuY3Rpb24gZ3Jvd0xpc3RlbmVyVHJlZSh0eXBlLCBsaXN0ZW5lcikge1xuXG4gICAgdHlwZSA9IHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyA/IHR5cGUuc3BsaXQodGhpcy5kZWxpbWl0ZXIpIDogdHlwZS5zbGljZSgpO1xuXG4gICAgLy9cbiAgICAvLyBMb29rcyBmb3IgdHdvIGNvbnNlY3V0aXZlICcqKicsIGlmIHNvLCBkb24ndCBhZGQgdGhlIGV2ZW50IGF0IGFsbC5cbiAgICAvL1xuICAgIGZvcih2YXIgaSA9IDAsIGxlbiA9IHR5cGUubGVuZ3RoOyBpKzEgPCBsZW47IGkrKykge1xuICAgICAgaWYodHlwZVtpXSA9PT0gJyoqJyAmJiB0eXBlW2krMV0gPT09ICcqKicpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciB0cmVlID0gdGhpcy5saXN0ZW5lclRyZWU7XG4gICAgdmFyIG5hbWUgPSB0eXBlLnNoaWZ0KCk7XG5cbiAgICB3aGlsZSAobmFtZSkge1xuXG4gICAgICBpZiAoIXRyZWVbbmFtZV0pIHtcbiAgICAgICAgdHJlZVtuYW1lXSA9IHt9O1xuICAgICAgfVxuXG4gICAgICB0cmVlID0gdHJlZVtuYW1lXTtcblxuICAgICAgaWYgKHR5cGUubGVuZ3RoID09PSAwKSB7XG5cbiAgICAgICAgaWYgKCF0cmVlLl9saXN0ZW5lcnMpIHtcbiAgICAgICAgICB0cmVlLl9saXN0ZW5lcnMgPSBsaXN0ZW5lcjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKHR5cGVvZiB0cmVlLl9saXN0ZW5lcnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICB0cmVlLl9saXN0ZW5lcnMgPSBbdHJlZS5fbGlzdGVuZXJzLCBsaXN0ZW5lcl07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNBcnJheSh0cmVlLl9saXN0ZW5lcnMpKSB7XG5cbiAgICAgICAgICB0cmVlLl9saXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG5cbiAgICAgICAgICBpZiAoIXRyZWUuX2xpc3RlbmVycy53YXJuZWQpIHtcblxuICAgICAgICAgICAgdmFyIG0gPSBkZWZhdWx0TWF4TGlzdGVuZXJzO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuX2V2ZW50cy5tYXhMaXN0ZW5lcnMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgIG0gPSB0aGlzLl9ldmVudHMubWF4TGlzdGVuZXJzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobSA+IDAgJiYgdHJlZS5fbGlzdGVuZXJzLmxlbmd0aCA+IG0pIHtcblxuICAgICAgICAgICAgICB0cmVlLl9saXN0ZW5lcnMud2FybmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJlZS5fbGlzdGVuZXJzLmxlbmd0aCk7XG4gICAgICAgICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBuYW1lID0gdHlwZS5zaGlmdCgpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW5cbiAgLy8gMTAgbGlzdGVuZXJzIGFyZSBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoXG4gIC8vIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuICAvL1xuICAvLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3NcbiAgLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5cbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5kZWxpbWl0ZXIgPSAnLic7XG5cbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gICAgdGhpcy5fZXZlbnRzIHx8IGluaXQuY2FsbCh0aGlzKTtcbiAgICB0aGlzLl9ldmVudHMubWF4TGlzdGVuZXJzID0gbjtcbiAgICBpZiAoIXRoaXMuX2NvbmYpIHRoaXMuX2NvbmYgPSB7fTtcbiAgICB0aGlzLl9jb25mLm1heExpc3RlbmVycyA9IG47XG4gIH07XG5cbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5ldmVudCA9ICcnO1xuXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKGV2ZW50LCBmbikge1xuICAgIHRoaXMubWFueShldmVudCwgMSwgZm4pO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUubWFueSA9IGZ1bmN0aW9uKGV2ZW50LCB0dGwsIGZuKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdtYW55IG9ubHkgYWNjZXB0cyBpbnN0YW5jZXMgb2YgRnVuY3Rpb24nKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaXN0ZW5lcigpIHtcbiAgICAgIGlmICgtLXR0bCA9PT0gMCkge1xuICAgICAgICBzZWxmLm9mZihldmVudCwgbGlzdGVuZXIpO1xuICAgICAgfVxuICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBsaXN0ZW5lci5fb3JpZ2luID0gZm47XG5cbiAgICB0aGlzLm9uKGV2ZW50LCBsaXN0ZW5lcik7XG5cbiAgICByZXR1cm4gc2VsZjtcbiAgfTtcblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbigpIHtcblxuICAgIHRoaXMuX2V2ZW50cyB8fCBpbml0LmNhbGwodGhpcyk7XG5cbiAgICB2YXIgdHlwZSA9IGFyZ3VtZW50c1swXTtcblxuICAgIGlmICh0eXBlID09PSAnbmV3TGlzdGVuZXInICYmICF0aGlzLm5ld0xpc3RlbmVyKSB7XG4gICAgICBpZiAoIXRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcikgeyByZXR1cm4gZmFsc2U7IH1cbiAgICB9XG5cbiAgICAvLyBMb29wIHRocm91Z2ggdGhlICpfYWxsKiBmdW5jdGlvbnMgYW5kIGludm9rZSB0aGVtLlxuICAgIGlmICh0aGlzLl9hbGwpIHtcbiAgICAgIHZhciBsID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGwgLSAxKTtcbiAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgbDsgaSsrKSBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgIGZvciAoaSA9IDAsIGwgPSB0aGlzLl9hbGwubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHRoaXMuZXZlbnQgPSB0eXBlO1xuICAgICAgICB0aGlzLl9hbGxbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICAgIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG5cbiAgICAgIGlmICghdGhpcy5fYWxsICYmXG4gICAgICAgICF0aGlzLl9ldmVudHMuZXJyb3IgJiZcbiAgICAgICAgISh0aGlzLndpbGRjYXJkICYmIHRoaXMubGlzdGVuZXJUcmVlLmVycm9yKSkge1xuXG4gICAgICAgIGlmIChhcmd1bWVudHNbMV0gaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgIHRocm93IGFyZ3VtZW50c1sxXTsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmNhdWdodCwgdW5zcGVjaWZpZWQgJ2Vycm9yJyBldmVudC5cIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBoYW5kbGVyO1xuXG4gICAgaWYodGhpcy53aWxkY2FyZCkge1xuICAgICAgaGFuZGxlciA9IFtdO1xuICAgICAgdmFyIG5zID0gdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnID8gdHlwZS5zcGxpdCh0aGlzLmRlbGltaXRlcikgOiB0eXBlLnNsaWNlKCk7XG4gICAgICBzZWFyY2hMaXN0ZW5lclRyZWUuY2FsbCh0aGlzLCBoYW5kbGVyLCBucywgdGhpcy5saXN0ZW5lclRyZWUsIDApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLmV2ZW50ID0gdHlwZTtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKVxuICAgICAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAvLyBzbG93ZXJcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdmFyIGwgPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkobCAtIDEpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBsOyBpKyspIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGVsc2UgaWYgKGhhbmRsZXIpIHtcbiAgICAgIHZhciBsID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGwgLSAxKTtcbiAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgbDsgaSsrKSBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuICAgICAgdmFyIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB0aGlzLmV2ZW50ID0gdHlwZTtcbiAgICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIChsaXN0ZW5lcnMubGVuZ3RoID4gMCkgfHwgISF0aGlzLl9hbGw7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuICEhdGhpcy5fYWxsO1xuICAgIH1cblxuICB9O1xuXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuXG4gICAgaWYgKHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLm9uQW55KHR5cGUpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdvbiBvbmx5IGFjY2VwdHMgaW5zdGFuY2VzIG9mIEZ1bmN0aW9uJyk7XG4gICAgfVxuICAgIHRoaXMuX2V2ZW50cyB8fCBpbml0LmNhbGwodGhpcyk7XG5cbiAgICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09IFwibmV3TGlzdGVuZXJzXCIhIEJlZm9yZVxuICAgIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJzXCIuXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICAgIGlmKHRoaXMud2lsZGNhcmQpIHtcbiAgICAgIGdyb3dMaXN0ZW5lclRyZWUuY2FsbCh0aGlzLCB0eXBlLCBsaXN0ZW5lcik7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSkge1xuICAgICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgICB9XG4gICAgZWxzZSBpZih0eXBlb2YgdGhpcy5fZXZlbnRzW3R5cGVdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXNBcnJheSh0aGlzLl9ldmVudHNbdHlwZV0pKSB7XG4gICAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG5cbiAgICAgIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gICAgICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcblxuICAgICAgICB2YXIgbSA9IGRlZmF1bHRNYXhMaXN0ZW5lcnM7XG5cbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLl9ldmVudHMubWF4TGlzdGVuZXJzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIG0gPSB0aGlzLl9ldmVudHMubWF4TGlzdGVuZXJzO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG5cbiAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbkFueSA9IGZ1bmN0aW9uKGZuKSB7XG5cbiAgICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ29uQW55IG9ubHkgYWNjZXB0cyBpbnN0YW5jZXMgb2YgRnVuY3Rpb24nKTtcbiAgICB9XG5cbiAgICBpZighdGhpcy5fYWxsKSB7XG4gICAgICB0aGlzLl9hbGwgPSBbXTtcbiAgICB9XG5cbiAgICAvLyBBZGQgdGhlIGZ1bmN0aW9uIHRvIHRoZSBldmVudCBsaXN0ZW5lciBjb2xsZWN0aW9uLlxuICAgIHRoaXMuX2FsbC5wdXNoKGZuKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbjtcblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdyZW1vdmVMaXN0ZW5lciBvbmx5IHRha2VzIGluc3RhbmNlcyBvZiBGdW5jdGlvbicpO1xuICAgIH1cblxuICAgIHZhciBoYW5kbGVycyxsZWFmcz1bXTtcblxuICAgIGlmKHRoaXMud2lsZGNhcmQpIHtcbiAgICAgIHZhciBucyA9IHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyA/IHR5cGUuc3BsaXQodGhpcy5kZWxpbWl0ZXIpIDogdHlwZS5zbGljZSgpO1xuICAgICAgbGVhZnMgPSBzZWFyY2hMaXN0ZW5lclRyZWUuY2FsbCh0aGlzLCBudWxsLCBucywgdGhpcy5saXN0ZW5lclRyZWUsIDApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIGRvZXMgbm90IHVzZSBsaXN0ZW5lcnMoKSwgc28gbm8gc2lkZSBlZmZlY3Qgb2YgY3JlYXRpbmcgX2V2ZW50c1t0eXBlXVxuICAgICAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pIHJldHVybiB0aGlzO1xuICAgICAgaGFuZGxlcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgICBsZWFmcy5wdXNoKHtfbGlzdGVuZXJzOmhhbmRsZXJzfSk7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaUxlYWY9MDsgaUxlYWY8bGVhZnMubGVuZ3RoOyBpTGVhZisrKSB7XG4gICAgICB2YXIgbGVhZiA9IGxlYWZzW2lMZWFmXTtcbiAgICAgIGhhbmRsZXJzID0gbGVhZi5fbGlzdGVuZXJzO1xuICAgICAgaWYgKGlzQXJyYXkoaGFuZGxlcnMpKSB7XG5cbiAgICAgICAgdmFyIHBvc2l0aW9uID0gLTE7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGhhbmRsZXJzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKGhhbmRsZXJzW2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgICAgKGhhbmRsZXJzW2ldLmxpc3RlbmVyICYmIGhhbmRsZXJzW2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikgfHxcbiAgICAgICAgICAgIChoYW5kbGVyc1tpXS5fb3JpZ2luICYmIGhhbmRsZXJzW2ldLl9vcmlnaW4gPT09IGxpc3RlbmVyKSkge1xuICAgICAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uIDwgMCkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcy53aWxkY2FyZCkge1xuICAgICAgICAgIGxlYWYuX2xpc3RlbmVycy5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGhhbmRsZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIGlmKHRoaXMud2lsZGNhcmQpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBsZWFmLl9saXN0ZW5lcnM7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChoYW5kbGVycyA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgKGhhbmRsZXJzLmxpc3RlbmVyICYmIGhhbmRsZXJzLmxpc3RlbmVyID09PSBsaXN0ZW5lcikgfHxcbiAgICAgICAgKGhhbmRsZXJzLl9vcmlnaW4gJiYgaGFuZGxlcnMuX29yaWdpbiA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIGlmKHRoaXMud2lsZGNhcmQpIHtcbiAgICAgICAgICBkZWxldGUgbGVhZi5fbGlzdGVuZXJzO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZkFueSA9IGZ1bmN0aW9uKGZuKSB7XG4gICAgdmFyIGkgPSAwLCBsID0gMCwgZm5zO1xuICAgIGlmIChmbiAmJiB0aGlzLl9hbGwgJiYgdGhpcy5fYWxsLmxlbmd0aCA+IDApIHtcbiAgICAgIGZucyA9IHRoaXMuX2FsbDtcbiAgICAgIGZvcihpID0gMCwgbCA9IGZucy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYoZm4gPT09IGZuc1tpXSkge1xuICAgICAgICAgIGZucy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fYWxsID0gW107XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZjtcblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgIXRoaXMuX2V2ZW50cyB8fCBpbml0LmNhbGwodGhpcyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpZih0aGlzLndpbGRjYXJkKSB7XG4gICAgICB2YXIgbnMgPSB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgPyB0eXBlLnNwbGl0KHRoaXMuZGVsaW1pdGVyKSA6IHR5cGUuc2xpY2UoKTtcbiAgICAgIHZhciBsZWFmcyA9IHNlYXJjaExpc3RlbmVyVHJlZS5jYWxsKHRoaXMsIG51bGwsIG5zLCB0aGlzLmxpc3RlbmVyVHJlZSwgMCk7XG5cbiAgICAgIGZvciAodmFyIGlMZWFmPTA7IGlMZWFmPGxlYWZzLmxlbmd0aDsgaUxlYWYrKykge1xuICAgICAgICB2YXIgbGVhZiA9IGxlYWZzW2lMZWFmXTtcbiAgICAgICAgbGVhZi5fbGlzdGVuZXJzID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSkgcmV0dXJuIHRoaXM7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICBpZih0aGlzLndpbGRjYXJkKSB7XG4gICAgICB2YXIgaGFuZGxlcnMgPSBbXTtcbiAgICAgIHZhciBucyA9IHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyA/IHR5cGUuc3BsaXQodGhpcy5kZWxpbWl0ZXIpIDogdHlwZS5zbGljZSgpO1xuICAgICAgc2VhcmNoTGlzdGVuZXJUcmVlLmNhbGwodGhpcywgaGFuZGxlcnMsIG5zLCB0aGlzLmxpc3RlbmVyVHJlZSwgMCk7XG4gICAgICByZXR1cm4gaGFuZGxlcnM7XG4gICAgfVxuXG4gICAgdGhpcy5fZXZlbnRzIHx8IGluaXQuY2FsbCh0aGlzKTtcblxuICAgIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKSB0aGlzLl9ldmVudHNbdHlwZV0gPSBbXTtcbiAgICBpZiAoIWlzQXJyYXkodGhpcy5fZXZlbnRzW3R5cGVdKSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9ldmVudHNbdHlwZV07XG4gIH07XG5cbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnNBbnkgPSBmdW5jdGlvbigpIHtcblxuICAgIGlmKHRoaXMuX2FsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2FsbDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gIH07XG5cbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIEV2ZW50RW1pdHRlcjtcbiAgICB9KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAvLyBDb21tb25KU1xuICAgIGV4cG9ydHMuRXZlbnRFbWl0dGVyMiA9IEV2ZW50RW1pdHRlcjtcbiAgfVxuICBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbC5cbiAgICB3aW5kb3cuRXZlbnRFbWl0dGVyMiA9IEV2ZW50RW1pdHRlcjtcbiAgfVxufSgpO1xuIiwiLyogUG9pbnRzIC0gdjAuMS4xIC0gMjAxMy0wNy0xMVxuICogQW5vdGhlciBQb2ludGVyIEV2ZW50cyBwb2x5ZmlsbFxuXG4gKiBodHRwOi8vcmljaC1oYXJyaXMuZ2l0aHViLmlvL1BvaW50c1xuICogQ29weXJpZ2h0IChjKSAyMDEzIFJpY2ggSGFycmlzOyBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UgKi9cblxuXG5cbihmdW5jdGlvbiAoKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciBhY3RpdmVQb2ludGVycyxcblx0XHRudW1BY3RpdmVQb2ludGVycyxcblx0XHRyZWNlbnRUb3VjaFN0YXJ0cyxcblx0XHRtb3VzZURlZmF1bHRzLFxuXHRcdG1vdXNlRXZlbnRzLFxuXHRcdGksXG5cdFx0c2V0VXBNb3VzZUV2ZW50LFxuXHRcdGNyZWF0ZVVJRXZlbnQsXG5cdFx0Y3JlYXRlRXZlbnQsXG5cdFx0Y3JlYXRlTW91c2VQcm94eUV2ZW50LFxuXHRcdG1vdXNlRXZlbnRJc1NpbXVsYXRlZCxcblx0XHRjcmVhdGVUb3VjaFByb3h5RXZlbnQsXG5cdFx0YnV0dG9uc01hcCxcblx0XHRwb2ludGVyRXZlbnRQcm9wZXJ0aWVzO1xuXG5cblx0Ly8gUG9pbnRlciBldmVudHMgc3VwcG9ydGVkPyBHcmVhdCwgbm90aGluZyB0byBkbywgbGV0J3MgZ28gaG9tZVxuXHRpZiAoIHdpbmRvdy5vbnBvaW50ZXJkb3duICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0cG9pbnRlckV2ZW50UHJvcGVydGllcyA9ICdzY3JlZW5YIHNjcmVlblkgY2xpZW50WCBjbGllbnRZIGN0cmxLZXkgc2hpZnRLZXkgYWx0S2V5IG1ldGFLZXkgcmVsYXRlZFRhcmdldCBkZXRhaWwgYnV0dG9uIGJ1dHRvbnMgcG9pbnRlcklkIHBvaW50ZXJUeXBlIHdpZHRoIGhlaWdodCBwcmVzc3VyZSB0aWx0WCB0aWx0WSBpc1ByaW1hcnknLnNwbGl0KCAnICcgKTtcblxuXHQvLyBDYW4gd2UgY3JlYXRlIGV2ZW50cyB1c2luZyB0aGUgTW91c2VFdmVudCBjb25zdHJ1Y3Rvcj8gSWYgc28sIGdyYXZ5XG5cdHRyeSB7XG5cdFx0aSA9IG5ldyBVSUV2ZW50KCAndGVzdCcgKTtcblxuXHRcdGNyZWF0ZVVJRXZlbnQgPSBmdW5jdGlvbiAoIHR5cGUsIGJ1YmJsZXMgKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFVJRXZlbnQoIHR5cGUsIHsgdmlldzogd2luZG93LCBidWJibGVzOiBidWJibGVzIH0pO1xuXHRcdH07XG5cblx0Ly8gb3RoZXJ3aXNlIHdlIG5lZWQgdG8gZG8gdGhpbmdzIG9sZHNjaG9vbFxuXHR9IGNhdGNoICggZXJyICkge1xuXHRcdGlmICggZG9jdW1lbnQuY3JlYXRlRXZlbnQgKSB7XG5cdFx0XHRjcmVhdGVVSUV2ZW50ID0gZnVuY3Rpb24gKCB0eXBlLCBidWJibGVzICkge1xuXHRcdFx0XHR2YXIgcG9pbnRlckV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoICdVSUV2ZW50cycgKTtcblx0XHRcdFx0cG9pbnRlckV2ZW50LmluaXRVSUV2ZW50KCB0eXBlLCBidWJibGVzLCB0cnVlLCB3aW5kb3cgKTtcblxuXHRcdFx0XHRyZXR1cm4gcG9pbnRlckV2ZW50O1xuXHRcdFx0fTtcblx0XHR9XG5cdH1cblxuXHRpZiAoICFjcmVhdGVVSUV2ZW50ICkge1xuXHRcdHRocm93IG5ldyBFcnJvciggJ0Nhbm5vdCBjcmVhdGUgZXZlbnRzLiBZb3UgbWF5IGJlIHVzaW5nIGFuIHVuc3VwcG9ydGVkIGJyb3dzZXIuJyApO1xuXHR9XG5cblx0Y3JlYXRlRXZlbnQgPSBmdW5jdGlvbiAoIHR5cGUsIG9yaWdpbmFsRXZlbnQsIHBhcmFtcywgbm9CdWJibGUgKSB7XG5cdFx0dmFyIHBvaW50ZXJFdmVudCwgaTtcblxuXHRcdHBvaW50ZXJFdmVudCA9IGNyZWF0ZVVJRXZlbnQoIHR5cGUsICFub0J1YmJsZSApO1xuXG5cdFx0aSA9IHBvaW50ZXJFdmVudFByb3BlcnRpZXMubGVuZ3RoO1xuXHRcdHdoaWxlICggaS0tICkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KCBwb2ludGVyRXZlbnQsIHBvaW50ZXJFdmVudFByb3BlcnRpZXNbaV0sIHtcblx0XHRcdFx0dmFsdWU6IHBhcmFtc1sgcG9pbnRlckV2ZW50UHJvcGVydGllc1tpXSBdLFxuXHRcdFx0XHR3cml0YWJsZTogZmFsc2Vcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggcG9pbnRlckV2ZW50LCAnb3JpZ2luYWxFdmVudCcsIHtcblx0XHRcdHZhbHVlOiBvcmlnaW5hbEV2ZW50LFxuXHRcdFx0d3JpdGFibGU6IGZhbHNlXG5cdFx0fSk7XG5cblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoIHBvaW50ZXJFdmVudCwgJ3ByZXZlbnREZWZhdWx0Jywge1xuXHRcdFx0dmFsdWU6IHByZXZlbnREZWZhdWx0LFxuXHRcdFx0d3JpdGFibGU6IGZhbHNlXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gcG9pbnRlckV2ZW50O1xuXHR9O1xuXG5cblx0Ly8gYWRkIHBvaW50ZXJFbmFibGVkIHByb3BlcnR5IHRvIG5hdmlnYXRvclxuXHRuYXZpZ2F0b3IucG9pbnRlckVuYWJsZWQgPSB0cnVlO1xuXG5cblx0Ly8gSWYgd2UncmUgaW4gSUUxMCwgdGhlc2UgZXZlbnRzIGFyZSBhbHJlYWR5IHN1cHBvcnRlZCwgZXhjZXB0IHByZWZpeGVkXG5cdGlmICggd2luZG93Lm9ubXNwb2ludGVyZG93biAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFsgJ01TUG9pbnRlckRvd24nLCAnTVNQb2ludGVyVXAnLCAnTVNQb2ludGVyQ2FuY2VsJywgJ01TUG9pbnRlck1vdmUnLCAnTVNQb2ludGVyT3ZlcicsICdNU1BvaW50ZXJPdXQnIF0uZm9yRWFjaCggZnVuY3Rpb24gKCBwcmVmaXhlZCApIHtcblx0XHRcdHZhciB1bnByZWZpeGVkO1xuXG5cdFx0XHR1bnByZWZpeGVkID0gcHJlZml4ZWQudG9Mb3dlckNhc2UoKS5zdWJzdHJpbmcoIDIgKTtcblxuXHRcdFx0Ly8gcG9pbnRlcmVudGVyIGFuZCBwb2ludGVybGVhdmUgYXJlIHNwZWNpYWwgY2FzZXNcblx0XHRcdGlmICggdW5wcmVmaXhlZCA9PT0gJ3BvaW50ZXJvdmVyJyB8fCB1bnByZWZpeGVkID09PSAncG9pbnRlcm91dCcgKSB7XG5cdFx0XHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCBwcmVmaXhlZCwgZnVuY3Rpb24gKCBvcmlnaW5hbEV2ZW50ICkge1xuXHRcdFx0XHRcdHZhciB1bnByZWZpeGVkRXZlbnQgPSBjcmVhdGVFdmVudCggdW5wcmVmaXhlZCwgb3JpZ2luYWxFdmVudCwgb3JpZ2luYWxFdmVudCwgZmFsc2UgKTtcblx0XHRcdFx0XHRvcmlnaW5hbEV2ZW50LnRhcmdldC5kaXNwYXRjaEV2ZW50KCB1bnByZWZpeGVkRXZlbnQgKTtcblxuXHRcdFx0XHRcdGlmICggIW9yaWdpbmFsRXZlbnQudGFyZ2V0LmNvbnRhaW5zKCBvcmlnaW5hbEV2ZW50LnJlbGF0ZWRUYXJnZXQgKSApIHtcblx0XHRcdFx0XHRcdHVucHJlZml4ZWRFdmVudCA9IGNyZWF0ZUV2ZW50KCAoIHVucHJlZml4ZWQgPT09ICdwb2ludGVyb3ZlcicgPyAncG9pbnRlcmVudGVyJyA6ICdwb2ludGVybGVhdmUnICksIG9yaWdpbmFsRXZlbnQsIG9yaWdpbmFsRXZlbnQsIHRydWUgKTtcblx0XHRcdFx0XHRcdG9yaWdpbmFsRXZlbnQudGFyZ2V0LmRpc3BhdGNoRXZlbnQoIHVucHJlZml4ZWRFdmVudCApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSwgdHJ1ZSApO1xuXHRcdFx0fVxuXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoIHByZWZpeGVkLCBmdW5jdGlvbiAoIG9yaWdpbmFsRXZlbnQgKSB7XG5cdFx0XHRcdFx0dmFyIHVucHJlZml4ZWRFdmVudCA9IGNyZWF0ZUV2ZW50KCB1bnByZWZpeGVkLCBvcmlnaW5hbEV2ZW50LCBvcmlnaW5hbEV2ZW50LCBmYWxzZSApO1xuXHRcdFx0XHRcdG9yaWdpbmFsRXZlbnQudGFyZ2V0LmRpc3BhdGNoRXZlbnQoIHVucHJlZml4ZWRFdmVudCApO1xuXHRcdFx0XHR9LCB0cnVlICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRuYXZpZ2F0b3IubWF4VG91Y2hQb2ludHMgPSBuYXZpZ2F0b3IubXNNYXhUb3VjaFBvaW50cztcblxuXHRcdC8vIE5vdGhpbmcgbW9yZSB0byBkby5cblx0XHRyZXR1cm47XG5cdH1cblxuXG5cdC8vIGh0dHBzOi8vZHZjcy53My5vcmcvaGcvcG9pbnRlcmV2ZW50cy9yYXctZmlsZS90aXAvcG9pbnRlckV2ZW50cy5odG1sI2Rmbi1jaG9yZGVkLWJ1dHRvbnNcblx0YnV0dG9uc01hcCA9IHtcblx0XHQwOiAxLFxuXHRcdDE6IDQsXG5cdFx0MjogMlxuXHR9O1xuXG5cdGNyZWF0ZU1vdXNlUHJveHlFdmVudCA9IGZ1bmN0aW9uICggdHlwZSwgb3JpZ2luYWxFdmVudCwgbm9CdWJibGUgKSB7XG5cdFx0dmFyIGJ1dHRvbiwgYnV0dG9ucywgcHJlc3N1cmUsIHBhcmFtcywgbW91c2VFdmVudFBhcmFtcywgcG9pbnRlckV2ZW50UGFyYW1zO1xuXG5cdFx0Ly8gbm9ybWFsaXNlIGJ1dHRvbiBhbmQgYnV0dG9uc1xuXHRcdGlmICggb3JpZ2luYWxFdmVudC5idXR0b25zICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRidXR0b25zID0gb3JpZ2luYWxFdmVudC5idXR0b25zO1xuXHRcdFx0YnV0dG9uID0gIW9yaWdpbmFsRXZlbnQuYnV0dG9ucyA/IC0xIDogb3JpZ2luYWxFdmVudC5idXR0b247XG5cdFx0fVxuXG5cdFx0ZWxzZSB7XG5cdFx0XHRpZiAoIGV2ZW50LmJ1dHRvbiA9PT0gMCAmJiBldmVudC53aGljaCA9PT0gMCApIHtcblx0XHRcdFx0YnV0dG9uID0gLTE7XG5cdFx0XHRcdGJ1dHRvbnMgPSAwO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YnV0dG9uID0gb3JpZ2luYWxFdmVudC5idXR0b247XG5cdFx0XHRcdGJ1dHRvbnMgPSBidXR0b25zTWFwWyBidXR0b24gXTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBQcmVzc3VyZSBpcyAwLjUgZm9yIGJ1dHRvbnMgZG93biwgMCBmb3Igbm8gYnV0dG9ucyBkb3duICh1bmxlc3MgcHJlc3N1cmUgaXNcblx0XHQvLyByZXBvcnRlZCwgb2J2cylcblx0XHRwcmVzc3VyZSA9IG9yaWdpbmFsRXZlbnQucHJlc3N1cmUgfHwgb3JpZ2luYWxFdmVudC5tb3pQcmVzc3VyZSB8fCAoIGJ1dHRvbnMgPyAwLjUgOiAwICk7XG5cblxuXHRcdC8vIFRoaXMgaXMgdGhlIHF1aWNrZXN0IHdheSB0byBjb3B5IGV2ZW50IHBhcmFtZXRlcnMuIFlvdSBjYW4ndCBlbnVtZXJhdGVcblx0XHQvLyBvdmVyIGV2ZW50IHByb3BlcnRpZXMgaW4gRmlyZWZveCAocG9zc2libHkgZWxzZXdoZXJlKSwgc28gYSB0cmFkaXRpb25hbFxuXHRcdC8vIGV4dGVuZCBmdW5jdGlvbiB3b24ndCB3b3JrXG5cdFx0cGFyYW1zID0ge1xuXHRcdFx0c2NyZWVuWDogICAgICAgb3JpZ2luYWxFdmVudC5zY3JlZW5YLFxuXHRcdFx0c2NyZWVuWTogICAgICAgb3JpZ2luYWxFdmVudC5zY3JlZW5ZLFxuXHRcdFx0Y2xpZW50WDogICAgICAgb3JpZ2luYWxFdmVudC5jbGllbnRYLFxuXHRcdFx0Y2xpZW50WTogICAgICAgb3JpZ2luYWxFdmVudC5jbGllbnRZLFxuXHRcdFx0Y3RybEtleTogICAgICAgb3JpZ2luYWxFdmVudC5jdHJsS2V5LFxuXHRcdFx0c2hpZnRLZXk6ICAgICAgb3JpZ2luYWxFdmVudC5zaGlmdEtleSxcblx0XHRcdGFsdEtleTogICAgICAgIG9yaWdpbmFsRXZlbnQuYWx0S2V5LFxuXHRcdFx0bWV0YUtleTogICAgICAgb3JpZ2luYWxFdmVudC5tZXRhS2V5LFxuXHRcdFx0cmVsYXRlZFRhcmdldDogb3JpZ2luYWxFdmVudC5yZWxhdGVkVGFyZ2V0LFxuXHRcdFx0ZGV0YWlsOiAgICAgICAgb3JpZ2luYWxFdmVudC5kZXRhaWwsXG5cdFx0XHRidXR0b246ICAgICAgICBidXR0b24sXG5cdFx0XHRidXR0b25zOiAgICAgICBidXR0b25zLFxuXG5cdFx0XHRwb2ludGVySWQ6ICAgICAxLFxuXHRcdFx0cG9pbnRlclR5cGU6ICAgJ21vdXNlJyxcblx0XHRcdHdpZHRoOiAgICAgICAgIDAsXG5cdFx0XHRoZWlnaHQ6ICAgICAgICAwLFxuXHRcdFx0cHJlc3N1cmU6ICAgICAgcHJlc3N1cmUsXG5cdFx0XHR0aWx0WDogICAgICAgICAwLFxuXHRcdFx0dGlsdFk6ICAgICAgICAgMCxcblx0XHRcdGlzUHJpbWFyeTogICAgIHRydWUsXG5cblx0XHRcdHByZXZlbnREZWZhdWx0OiBwcmV2ZW50RGVmYXVsdFxuXHRcdH07XG5cblx0XHRyZXR1cm4gY3JlYXRlRXZlbnQoIHR5cGUsIG9yaWdpbmFsRXZlbnQsIHBhcmFtcywgbm9CdWJibGUgKTtcblx0fTtcblxuXHQvLyBTb21lIG1vdXNlIGV2ZW50cyBhcmUgcmVhbCwgb3RoZXJzIGFyZSBzaW11bGF0ZWQgYmFzZWQgb24gdG91Y2ggZXZlbnRzLlxuXHQvLyBXZSBvbmx5IHdhbnQgdGhlIHJlYWwgb25lcywgb3Igd2UnbGwgZW5kIHVwIGZpcmluZyBvdXIgbG9hZCBhdFxuXHQvLyBpbmFwcHJvcHJpYXRlIG1vbWVudHMuXG5cdC8vXG5cdC8vIFN1cnByaXNpbmdseSwgdGhlIGNvb3JkaW5hdGVzIG9mIHRoZSBtb3VzZSBldmVudCB3b24ndCBleGFjdGx5IGNvcnJlc3BvbmRcblx0Ly8gd2l0aCB0aGUgdG91Y2hzdGFydCB0aGF0IG9yaWdpbmF0ZWQgdGhlbSwgc28gd2UgbmVlZCB0byBiZSBhIGJpdCBmdXp6eS5cblx0aWYgKCB3aW5kb3cub250b3VjaHN0YXJ0ICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0bW91c2VFdmVudElzU2ltdWxhdGVkID0gZnVuY3Rpb24gKCBldmVudCApIHtcblx0XHRcdHZhciBpID0gcmVjZW50VG91Y2hTdGFydHMubGVuZ3RoLCB0aHJlc2hvbGQgPSAxMCwgdG91Y2g7XG5cdFx0XHR3aGlsZSAoIGktLSApIHtcblx0XHRcdFx0dG91Y2ggPSByZWNlbnRUb3VjaFN0YXJ0c1tpXTtcblx0XHRcdFx0aWYgKCBNYXRoLmFicyggZXZlbnQuY2xpZW50WCAtIHRvdWNoLmNsaWVudFggKSA8IHRocmVzaG9sZCAmJiBNYXRoLmFicyggZXZlbnQuY2xpZW50WSAtIHRvdWNoLmNsaWVudFkgKSA8IHRocmVzaG9sZCApIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdH0gZWxzZSB7XG5cdFx0bW91c2VFdmVudElzU2ltdWxhdGVkID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH07XG5cdH1cblxuXG5cblx0c2V0VXBNb3VzZUV2ZW50ID0gZnVuY3Rpb24gKCB0eXBlICkge1xuXHRcdGlmICggdHlwZSA9PT0gJ292ZXInIHx8IHR5cGUgPT09ICdvdXQnICkge1xuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZScgKyB0eXBlLCBmdW5jdGlvbiAoIG9yaWdpbmFsRXZlbnQgKSB7XG5cdFx0XHRcdHZhciBwb2ludGVyRXZlbnQ7XG5cblx0XHRcdFx0aWYgKCBtb3VzZUV2ZW50SXNTaW11bGF0ZWQoIG9yaWdpbmFsRXZlbnQgKSApIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRwb2ludGVyRXZlbnQgPSBjcmVhdGVNb3VzZVByb3h5RXZlbnQoICdwb2ludGVyJyArIHR5cGUsIG9yaWdpbmFsRXZlbnQgKTtcblx0XHRcdFx0b3JpZ2luYWxFdmVudC50YXJnZXQuZGlzcGF0Y2hFdmVudCggcG9pbnRlckV2ZW50ICk7XG5cblx0XHRcdFx0aWYgKCAhb3JpZ2luYWxFdmVudC50YXJnZXQuY29udGFpbnMoIG9yaWdpbmFsRXZlbnQucmVsYXRlZFRhcmdldCApICkge1xuXHRcdFx0XHRcdHBvaW50ZXJFdmVudCA9IGNyZWF0ZU1vdXNlUHJveHlFdmVudCggKCB0eXBlID09PSAnb3ZlcicgPyAncG9pbnRlcmVudGVyJyA6ICdwb2ludGVybGVhdmUnICksIG9yaWdpbmFsRXZlbnQsIHRydWUgKTtcblx0XHRcdFx0XHRvcmlnaW5hbEV2ZW50LnRhcmdldC5kaXNwYXRjaEV2ZW50KCBwb2ludGVyRXZlbnQgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0ZWxzZSB7XG5cdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlJyArIHR5cGUsIGZ1bmN0aW9uICggb3JpZ2luYWxFdmVudCApIHtcblx0XHRcdFx0dmFyIHBvaW50ZXJFdmVudDtcblxuXHRcdFx0XHRpZiAoIG1vdXNlRXZlbnRJc1NpbXVsYXRlZCggb3JpZ2luYWxFdmVudCApICkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHBvaW50ZXJFdmVudCA9IGNyZWF0ZU1vdXNlUHJveHlFdmVudCggJ3BvaW50ZXInICsgdHlwZSwgb3JpZ2luYWxFdmVudCApO1xuXHRcdFx0XHRvcmlnaW5hbEV2ZW50LnRhcmdldC5kaXNwYXRjaEV2ZW50KCBwb2ludGVyRXZlbnQgKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcblxuXHRbICdkb3duJywgJ3VwJywgJ292ZXInLCAnb3V0JywgJ21vdmUnIF0uZm9yRWFjaCggZnVuY3Rpb24gKCBldmVudFR5cGUgKSB7XG5cdFx0c2V0VXBNb3VzZUV2ZW50KCBldmVudFR5cGUgKTtcblx0fSk7XG5cblxuXG5cblxuXHQvLyBUb3VjaCBldmVudHM6XG5cdGlmICggd2luZG93Lm9udG91Y2hzdGFydCAhPT0gdW5kZWZpbmVkICkge1xuXHRcdC8vIFNldCB1cCBhIHJlZ2lzdHJ5IG9mIGN1cnJlbnQgdG91Y2hlc1xuXHRcdGFjdGl2ZVBvaW50ZXJzID0ge307XG5cdFx0bnVtQWN0aXZlUG9pbnRlcnMgPSAwO1xuXG5cdFx0Ly8gTWFpbnRhaW4gYSBsaXN0IG9mIHJlY2VudCB0b3VjaHN0YXJ0cywgc28gd2UgY2FuIGVsaW1pbmF0ZSBzaW11bGF0ZVxuXHRcdC8vIG1vdXNlIGV2ZW50cyBsYXRlclxuXHRcdHJlY2VudFRvdWNoU3RhcnRzID0gW107XG5cblx0XHRjcmVhdGVUb3VjaFByb3h5RXZlbnQgPSBmdW5jdGlvbiAoIHR5cGUsIG9yaWdpbmFsRXZlbnQsIHRvdWNoLCBub0J1YmJsZSwgcmVsYXRlZFRhcmdldCApIHtcblx0XHRcdHZhciBwYXJhbXM7XG5cblx0XHRcdHBhcmFtcyA9IHtcblx0XHRcdFx0c2NyZWVuWDogICAgICAgb3JpZ2luYWxFdmVudC5zY3JlZW5YLFxuXHRcdFx0XHRzY3JlZW5ZOiAgICAgICBvcmlnaW5hbEV2ZW50LnNjcmVlblksXG5cdFx0XHRcdGNsaWVudFg6ICAgICAgIHRvdWNoLmNsaWVudFgsXG5cdFx0XHRcdGNsaWVudFk6ICAgICAgIHRvdWNoLmNsaWVudFksXG5cdFx0XHRcdGN0cmxLZXk6ICAgICAgIG9yaWdpbmFsRXZlbnQuY3RybEtleSxcblx0XHRcdFx0c2hpZnRLZXk6ICAgICAgb3JpZ2luYWxFdmVudC5zaGlmdEtleSxcblx0XHRcdFx0YWx0S2V5OiAgICAgICAgb3JpZ2luYWxFdmVudC5hbHRLZXksXG5cdFx0XHRcdG1ldGFLZXk6ICAgICAgIG9yaWdpbmFsRXZlbnQubWV0YUtleSxcblx0XHRcdFx0cmVsYXRlZFRhcmdldDogcmVsYXRlZFRhcmdldCB8fCBvcmlnaW5hbEV2ZW50LnJlbGF0ZWRUYXJnZXQsIC8vIFRPRE8gaXMgdGhpcyByaWdodD8gYWxzbzogbW91c2VlbnRlci9sZWF2ZT9cblx0XHRcdFx0ZGV0YWlsOiAgICAgICAgb3JpZ2luYWxFdmVudC5kZXRhaWwsXG5cdFx0XHRcdGJ1dHRvbjogICAgICAgIDAsXG5cdFx0XHRcdGJ1dHRvbnM6ICAgICAgIDEsXG5cblx0XHRcdFx0cG9pbnRlcklkOiAgICAgdG91Y2guaWRlbnRpZmllciArIDIsIC8vIGVuc3VyZSBubyBjb2xsaXNpb25zIGJldHdlZW4gdG91Y2ggYW5kIG1vdXNlIHBvaW50ZXIgSURzXG5cdFx0XHRcdHBvaW50ZXJUeXBlOiAgICd0b3VjaCcsXG5cdFx0XHRcdHdpZHRoOiAgICAgICAgIDIwLCAvLyByb3VnaGx5IGhvdyBmYXQgcGVvcGxlJ3MgZmluZ2VycyBhcmVcblx0XHRcdFx0aGVpZ2h0OiAgICAgICAgMjAsXG5cdFx0XHRcdHByZXNzdXJlOiAgICAgIDAuNSxcblx0XHRcdFx0dGlsdFg6ICAgICAgICAgMCxcblx0XHRcdFx0dGlsdFk6ICAgICAgICAgMCxcblx0XHRcdFx0aXNQcmltYXJ5OiAgICAgYWN0aXZlUG9pbnRlcnNbIHRvdWNoLmlkZW50aWZpZXIgXS5pc1ByaW1hcnksXG5cblx0XHRcdFx0cHJldmVudERlZmF1bHQ6IHByZXZlbnREZWZhdWx0XG5cdFx0XHR9O1xuXG5cdFx0XHRyZXR1cm4gY3JlYXRlRXZlbnQoIHR5cGUsIG9yaWdpbmFsRXZlbnQsIHBhcmFtcywgbm9CdWJibGUgKTtcblx0XHR9O1xuXG5cdFx0Ly8gdG91Y2hzdGFydFxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIGZ1bmN0aW9uICggZXZlbnQgKSB7XG5cdFx0XHR2YXIgdG91Y2hlcywgcHJvY2Vzc1RvdWNoO1xuXG5cdFx0XHR0b3VjaGVzID0gZXZlbnQuY2hhbmdlZFRvdWNoZXM7XG5cblx0XHRcdHByb2Nlc3NUb3VjaCA9IGZ1bmN0aW9uICggdG91Y2ggKSB7XG5cdFx0XHRcdHZhciBwb2ludGVyZG93bkV2ZW50LCBwb2ludGVyb3ZlckV2ZW50LCBwb2ludGVyZW50ZXJFdmVudCwgcG9pbnRlcjtcblxuXHRcdFx0XHRwb2ludGVyID0ge1xuXHRcdFx0XHRcdHRhcmdldDogdG91Y2gudGFyZ2V0LFxuXHRcdFx0XHRcdGlzUHJpbWFyeTogbnVtQWN0aXZlUG9pbnRlcnMgPyBmYWxzZSA6IHRydWVcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRhY3RpdmVQb2ludGVyc1sgdG91Y2guaWRlbnRpZmllciBdID0gcG9pbnRlcjtcblx0XHRcdFx0bnVtQWN0aXZlUG9pbnRlcnMgKz0gMTtcblxuXHRcdFx0XHRwb2ludGVyZG93bkV2ZW50ID0gY3JlYXRlVG91Y2hQcm94eUV2ZW50KCAncG9pbnRlcmRvd24nLCBldmVudCwgdG91Y2ggKTtcblx0XHRcdFx0cG9pbnRlcm92ZXJFdmVudCA9IGNyZWF0ZVRvdWNoUHJveHlFdmVudCggJ3BvaW50ZXJvdmVyJywgZXZlbnQsIHRvdWNoICk7XG5cdFx0XHRcdHBvaW50ZXJlbnRlckV2ZW50ID0gY3JlYXRlVG91Y2hQcm94eUV2ZW50KCAncG9pbnRlcmVudGVyJywgZXZlbnQsIHRvdWNoLCB0cnVlICk7XG5cblx0XHRcdFx0dG91Y2gudGFyZ2V0LmRpc3BhdGNoRXZlbnQoIHBvaW50ZXJvdmVyRXZlbnQgKTtcblx0XHRcdFx0dG91Y2gudGFyZ2V0LmRpc3BhdGNoRXZlbnQoIHBvaW50ZXJlbnRlckV2ZW50ICk7XG5cdFx0XHRcdHRvdWNoLnRhcmdldC5kaXNwYXRjaEV2ZW50KCBwb2ludGVyZG93bkV2ZW50ICk7XG5cblx0XHRcdFx0Ly8gd2UgbmVlZCB0byBrZWVwIHRyYWNrIG9mIHJlY2VudCB0b3VjaHN0YXJ0IGV2ZW50cywgc28gd2UgY2FuIHRlc3Rcblx0XHRcdFx0Ly8gd2hldGhlciBsYXRlciBtb3VzZSBldmVudHMgYXJlIHNpbXVsYXRlZFxuXHRcdFx0XHRyZWNlbnRUb3VjaFN0YXJ0cy5wdXNoKCB0b3VjaCApO1xuXHRcdFx0XHRzZXRUaW1lb3V0KCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0dmFyIGluZGV4ID0gcmVjZW50VG91Y2hTdGFydHMuaW5kZXhPZiggdG91Y2ggKTtcblx0XHRcdFx0XHRpZiAoIGluZGV4ICE9PSAtMSApIHtcblx0XHRcdFx0XHRcdHJlY2VudFRvdWNoU3RhcnRzLnNwbGljZSggaW5kZXgsIDEgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sIDE1MDAgKTtcblx0XHRcdH07XG5cblx0XHRcdGZvciAoIGk9MDsgaTx0b3VjaGVzLmxlbmd0aDsgaSs9MSApIHtcblx0XHRcdFx0cHJvY2Vzc1RvdWNoKCB0b3VjaGVzW2ldICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQvLyB0b3VjaG1vdmVcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNobW92ZScsIGZ1bmN0aW9uICggZXZlbnQgKSB7XG5cdFx0XHR2YXIgdG91Y2hlcywgcHJvY2Vzc1RvdWNoO1xuXG5cdFx0XHR0b3VjaGVzID0gZXZlbnQuY2hhbmdlZFRvdWNoZXM7XG5cblx0XHRcdHByb2Nlc3NUb3VjaCA9IGZ1bmN0aW9uICggdG91Y2ggKSB7XG5cdFx0XHRcdHZhciBwb2ludGVybW92ZUV2ZW50LCBwb2ludGVyb3ZlckV2ZW50LCBwb2ludGVyb3V0RXZlbnQsIHBvaW50ZXJlbnRlckV2ZW50LCBwb2ludGVybGVhdmVFdmVudCwgcG9pbnRlciwgcHJldmlvdXNUYXJnZXQsIGFjdHVhbFRhcmdldDtcblxuXHRcdFx0XHRwb2ludGVyID0gYWN0aXZlUG9pbnRlcnNbIHRvdWNoLmlkZW50aWZpZXIgXTtcblx0XHRcdFx0YWN0dWFsVGFyZ2V0ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCggdG91Y2guY2xpZW50WCwgdG91Y2guY2xpZW50WSApO1xuXG5cdFx0XHRcdGlmICggcG9pbnRlci50YXJnZXQgPT09IGFjdHVhbFRhcmdldCApIHtcblx0XHRcdFx0XHQvLyBqdXN0IGZpcmUgYSB0b3VjaG1vdmUgZXZlbnRcblx0XHRcdFx0XHRwb2ludGVybW92ZUV2ZW50ID0gY3JlYXRlVG91Y2hQcm94eUV2ZW50KCAncG9pbnRlcm1vdmUnLCBldmVudCwgdG91Y2ggKTtcblx0XHRcdFx0XHRhY3R1YWxUYXJnZXQuZGlzcGF0Y2hFdmVudCggcG9pbnRlcm1vdmVFdmVudCApO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cblx0XHRcdFx0Ly8gdGFyZ2V0IGhhcyBjaGFuZ2VkIC0gd2UgbmVlZCB0byBmaXJlIGEgcG9pbnRlcm91dCAoYW5kIHBvc3NpYmx5IHBvaW50ZXJsZWF2ZSlcblx0XHRcdFx0Ly8gZXZlbnQgb24gdGhlIHByZXZpb3VzIHRhcmdldCwgYW5kIGEgcG9pbnRlcm92ZXIgKGFuZCBwb3NzaWJseSBwb2ludGVyZW50ZXIpXG5cdFx0XHRcdC8vIGV2ZW50IG9uIHRoZSBjdXJyZW50IHRhcmdldC4gVGhlbiB3ZSBmaXJlIHRoZSBwb2ludGVybW92ZSBldmVudCBvbiB0aGUgY3VycmVudFxuXHRcdFx0XHQvLyB0YXJnZXRcblxuXHRcdFx0XHRwcmV2aW91c1RhcmdldCA9IHBvaW50ZXIudGFyZ2V0O1xuXHRcdFx0XHRwb2ludGVyLnRhcmdldCA9IGFjdHVhbFRhcmdldDtcblxuXHRcdFx0XHQvLyBwb2ludGVybGVhdmVcblx0XHRcdFx0aWYgKCAhcHJldmlvdXNUYXJnZXQuY29udGFpbnMoIGFjdHVhbFRhcmdldCApICkge1xuXHRcdFx0XHRcdC8vIG5ldyB0YXJnZXQgaXMgbm90IGEgY2hpbGQgb2YgcHJldmlvdXMgdGFyZ2V0LCBzbyBmaXJlIHBvaW50ZXJsZWF2ZSBvbiBwcmV2aW91c1xuXHRcdFx0XHRcdHBvaW50ZXJsZWF2ZUV2ZW50ID0gY3JlYXRlVG91Y2hQcm94eUV2ZW50KCAncG9pbnRlcmxlYXZlJywgZXZlbnQsIHRvdWNoLCB0cnVlLCBhY3R1YWxUYXJnZXQgKTtcblx0XHRcdFx0XHRwcmV2aW91c1RhcmdldC5kaXNwYXRjaEV2ZW50KCBwb2ludGVybGVhdmVFdmVudCApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gcG9pbnRlcm91dFxuXHRcdFx0XHRwb2ludGVyb3V0RXZlbnQgPSBjcmVhdGVUb3VjaFByb3h5RXZlbnQoICdwb2ludGVyb3V0JywgZXZlbnQsIHRvdWNoLCBmYWxzZSApO1xuXHRcdFx0XHRwcmV2aW91c1RhcmdldC5kaXNwYXRjaEV2ZW50KCBwb2ludGVyb3V0RXZlbnQgKTtcblxuXHRcdFx0XHQvLyBwb2ludGVybW92ZVxuXHRcdFx0XHRwb2ludGVybW92ZUV2ZW50ID0gY3JlYXRlVG91Y2hQcm94eUV2ZW50KCAncG9pbnRlcm1vdmUnLCBldmVudCwgdG91Y2gsIGZhbHNlICk7XG5cdFx0XHRcdGFjdHVhbFRhcmdldC5kaXNwYXRjaEV2ZW50KCBwb2ludGVybW92ZUV2ZW50ICk7XG5cblx0XHRcdFx0Ly8gcG9pbnRlcm92ZXJcblx0XHRcdFx0cG9pbnRlcm92ZXJFdmVudCA9IGNyZWF0ZVRvdWNoUHJveHlFdmVudCggJ3BvaW50ZXJvdmVyJywgZXZlbnQsIHRvdWNoLCBmYWxzZSApO1xuXHRcdFx0XHRhY3R1YWxUYXJnZXQuZGlzcGF0Y2hFdmVudCggcG9pbnRlcm92ZXJFdmVudCApO1xuXG5cdFx0XHRcdC8vIHBvaW50ZXJlbnRlclxuXHRcdFx0XHRpZiAoICFhY3R1YWxUYXJnZXQuY29udGFpbnMoIHByZXZpb3VzVGFyZ2V0ICkgKSB7XG5cdFx0XHRcdFx0Ly8gcHJldmlvdXMgdGFyZ2V0IGlzIG5vdCBhIGNoaWxkIG9mIGN1cnJlbnQgdGFyZ2V0LCBzbyBmaXJlIHBvaW50ZXJlbnRlciBvbiBjdXJyZW50XG5cdFx0XHRcdFx0cG9pbnRlcmVudGVyRXZlbnQgPSBjcmVhdGVUb3VjaFByb3h5RXZlbnQoICdwb2ludGVyZW50ZXInLCBldmVudCwgdG91Y2gsIHRydWUsIHByZXZpb3VzVGFyZ2V0ICk7XG5cdFx0XHRcdFx0YWN0dWFsVGFyZ2V0LmRpc3BhdGNoRXZlbnQoIHBvaW50ZXJlbnRlckV2ZW50ICk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHRcdGZvciAoIGk9MDsgaTx0b3VjaGVzLmxlbmd0aDsgaSs9MSApIHtcblx0XHRcdFx0cHJvY2Vzc1RvdWNoKCB0b3VjaGVzW2ldICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQvLyB0b3VjaGVuZFxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hlbmQnLCBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXHRcdFx0dmFyIHRvdWNoZXMsIHByb2Nlc3NUb3VjaDtcblxuXHRcdFx0dG91Y2hlcyA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzO1xuXG5cdFx0XHRwcm9jZXNzVG91Y2ggPSBmdW5jdGlvbiAoIHRvdWNoICkge1xuXHRcdFx0XHR2YXIgcG9pbnRlcnVwRXZlbnQsIHBvaW50ZXJvdXRFdmVudCwgcG9pbnRlcmxlYXZlRXZlbnQsIHByZXZpb3VzVGFyZ2V0LCBhY3R1YWxUYXJnZXQ7XG5cblx0XHRcdFx0YWN0dWFsVGFyZ2V0ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCggdG91Y2guY2xpZW50WCwgdG91Y2guY2xpZW50WSApO1xuXG5cdFx0XHRcdHBvaW50ZXJ1cEV2ZW50ID0gY3JlYXRlVG91Y2hQcm94eUV2ZW50KCAncG9pbnRlcnVwJywgZXZlbnQsIHRvdWNoLCBmYWxzZSApO1xuXHRcdFx0XHRwb2ludGVyb3V0RXZlbnQgPSBjcmVhdGVUb3VjaFByb3h5RXZlbnQoICdwb2ludGVyb3V0JywgZXZlbnQsIHRvdWNoLCBmYWxzZSApO1xuXHRcdFx0XHRwb2ludGVybGVhdmVFdmVudCA9IGNyZWF0ZVRvdWNoUHJveHlFdmVudCggJ3BvaW50ZXJsZWF2ZScsIGV2ZW50LCB0b3VjaCwgdHJ1ZSApO1xuXG5cdFx0XHRcdGRlbGV0ZSBhY3RpdmVQb2ludGVyc1sgdG91Y2guaWRlbnRpZmllciBdO1xuXHRcdFx0XHRudW1BY3RpdmVQb2ludGVycyAtPSAxO1xuXG5cdFx0XHRcdGFjdHVhbFRhcmdldC5kaXNwYXRjaEV2ZW50KCBwb2ludGVydXBFdmVudCApO1xuXHRcdFx0XHRhY3R1YWxUYXJnZXQuZGlzcGF0Y2hFdmVudCggcG9pbnRlcm91dEV2ZW50ICk7XG5cdFx0XHRcdGFjdHVhbFRhcmdldC5kaXNwYXRjaEV2ZW50KCBwb2ludGVybGVhdmVFdmVudCApO1xuXHRcdFx0fTtcblxuXHRcdFx0Zm9yICggaT0wOyBpPHRvdWNoZXMubGVuZ3RoOyBpKz0xICkge1xuXHRcdFx0XHRwcm9jZXNzVG91Y2goIHRvdWNoZXNbaV0gKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdC8vIHRvdWNoY2FuY2VsXG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaGNhbmNlbCcsIGZ1bmN0aW9uICggZXZlbnQgKSB7XG5cdFx0XHR2YXIgdG91Y2hlcywgcHJvY2Vzc1RvdWNoO1xuXG5cdFx0XHR0b3VjaGVzID0gZXZlbnQuY2hhbmdlZFRvdWNoZXM7XG5cblx0XHRcdHByb2Nlc3NUb3VjaCA9IGZ1bmN0aW9uICggdG91Y2ggKSB7XG5cdFx0XHRcdHZhciBwb2ludGVyY2FuY2VsRXZlbnQsIHBvaW50ZXJvdXRFdmVudCwgcG9pbnRlcmxlYXZlRXZlbnQ7XG5cblx0XHRcdFx0cG9pbnRlcmNhbmNlbEV2ZW50ID0gY3JlYXRlVG91Y2hQcm94eUV2ZW50KCAncG9pbnRlcmNhbmNlbCcsIGV2ZW50LCB0b3VjaCApO1xuXHRcdFx0XHRwb2ludGVyb3V0RXZlbnQgPSBjcmVhdGVUb3VjaFByb3h5RXZlbnQoICdwb2ludGVyb3V0JywgZXZlbnQsIHRvdWNoICk7XG5cdFx0XHRcdHBvaW50ZXJsZWF2ZUV2ZW50ID0gY3JlYXRlVG91Y2hQcm94eUV2ZW50KCAncG9pbnRlcmxlYXZlJywgZXZlbnQsIHRvdWNoICk7XG5cblx0XHRcdFx0dG91Y2gudGFyZ2V0LmRpc3BhdGNoRXZlbnQoIHBvaW50ZXJjYW5jZWxFdmVudCApO1xuXHRcdFx0XHR0b3VjaC50YXJnZXQuZGlzcGF0Y2hFdmVudCggcG9pbnRlcm91dEV2ZW50ICk7XG5cdFx0XHRcdHRvdWNoLnRhcmdldC5kaXNwYXRjaEV2ZW50KCBwb2ludGVybGVhdmVFdmVudCApO1xuXG5cdFx0XHRcdGRlbGV0ZSBhY3RpdmVQb2ludGVyc1sgdG91Y2guaWRlbnRpZmllciBdO1xuXHRcdFx0XHRudW1BY3RpdmVQb2ludGVycyAtPSAxO1xuXHRcdFx0fTtcblxuXHRcdFx0Zm9yICggaT0wOyBpPHRvdWNoZXMubGVuZ3RoOyBpKz0xICkge1xuXHRcdFx0XHRwcm9jZXNzVG91Y2goIHRvdWNoZXNbaV0gKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cblx0Ly8gU2luZ2xlIHByZXZlbnREZWZhdWx0IGZ1bmN0aW9uIC0gbm8gcG9pbnQgcmVjcmVhdGluZyBpdCBvdmVyIGFuZCBvdmVyXG5cdGZ1bmN0aW9uIHByZXZlbnREZWZhdWx0ICgpIHtcblx0XHR0aGlzLm9yaWdpbmFsRXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0fVxuXG5cdC8vIFRPRE8gc3RvcFByb3BhZ2F0aW9uP1xuXG59KCkpOyIsIihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGlmIChzZWxmLmZldGNoKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICBmdW5jdGlvbiBIZWFkZXJzKGhlYWRlcnMpIHtcbiAgICB0aGlzLm1hcCA9IHt9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICBpZiAoaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMpIHtcbiAgICAgIGhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbihuYW1lLCB2YWx1ZXMpIHtcbiAgICAgICAgdmFsdWVzLmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICBzZWxmLmFwcGVuZChuYW1lLCB2YWx1ZSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICB9IGVsc2UgaWYgKGhlYWRlcnMpIHtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGhlYWRlcnMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgICBzZWxmLmFwcGVuZChuYW1lLCBoZWFkZXJzW25hbWVdKVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5hcHBlbmQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIG5hbWUgPSBuYW1lLnRvTG93ZXJDYXNlKClcbiAgICB2YXIgbGlzdCA9IHRoaXMubWFwW25hbWVdXG4gICAgaWYgKCFsaXN0KSB7XG4gICAgICBsaXN0ID0gW11cbiAgICAgIHRoaXMubWFwW25hbWVdID0gbGlzdFxuICAgIH1cbiAgICBsaXN0LnB1c2godmFsdWUpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMubWFwW25hbWUudG9Mb3dlckNhc2UoKV1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgdmFsdWVzID0gdGhpcy5tYXBbbmFtZS50b0xvd2VyQ2FzZSgpXVxuICAgIHJldHVybiB2YWx1ZXMgPyB2YWx1ZXNbMF0gOiBudWxsXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5nZXRBbGwgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwW25hbWUudG9Mb3dlckNhc2UoKV0gfHwgW11cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAuaGFzT3duUHJvcGVydHkobmFtZS50b0xvd2VyQ2FzZSgpKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICB0aGlzLm1hcFtuYW1lLnRvTG93ZXJDYXNlKCldID0gW3ZhbHVlXVxuICB9XG5cbiAgLy8gSW5zdGVhZCBvZiBpdGVyYWJsZSBmb3Igbm93LlxuICBIZWFkZXJzLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0aGlzLm1hcCkuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICBjYWxsYmFjayhuYW1lLCBzZWxmLm1hcFtuYW1lXSlcbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gY29uc3VtZWQoYm9keSkge1xuICAgIGlmIChib2R5LmJvZHlVc2VkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJykpXG4gICAgfVxuICAgIGJvZHkuYm9keVVzZWQgPSB0cnVlXG4gIH1cblxuICBmdW5jdGlvbiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXNvbHZlKHJlYWRlci5yZXN1bHQpXG4gICAgICB9XG4gICAgICByZWFkZXIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QocmVhZGVyLmVycm9yKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzQXJyYXlCdWZmZXIoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGJsb2IpXG4gICAgcmV0dXJuIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzVGV4dChibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICByZWFkZXIucmVhZEFzVGV4dChibG9iKVxuICAgIHJldHVybiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICB9XG5cbiAgdmFyIHN1cHBvcnQgPSB7XG4gICAgYmxvYjogJ0ZpbGVSZWFkZXInIGluIHNlbGYgJiYgJ0Jsb2InIGluIHNlbGYgJiYgKGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbmV3IEJsb2IoKTtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9KSgpLFxuICAgIGZvcm1EYXRhOiAnRm9ybURhdGEnIGluIHNlbGZcbiAgfVxuXG4gIGZ1bmN0aW9uIEJvZHkoKSB7XG4gICAgdGhpcy5ib2R5VXNlZCA9IGZhbHNlXG5cbiAgICBpZiAoc3VwcG9ydC5ibG9iKSB7XG4gICAgICB0aGlzLl9pbml0Qm9keSA9IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICAgICAgdGhpcy5fYm9keUluaXQgPSBib2R5XG4gICAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHlcbiAgICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmJsb2IgJiYgQmxvYi5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICAgIHRoaXMuX2JvZHlCbG9iID0gYm9keVxuICAgICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuZm9ybURhdGEgJiYgRm9ybURhdGEucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgICB0aGlzLl9ib2R5Rm9ybURhdGEgPSBib2R5XG4gICAgICAgIH0gZWxzZSBpZiAoIWJvZHkpIHtcbiAgICAgICAgICB0aGlzLl9ib2R5VGV4dCA9ICcnXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bnN1cHBvcnRlZCBCb2R5SW5pdCB0eXBlJylcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmJsb2IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlCbG9iKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyBibG9iJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBCbG9iKFt0aGlzLl9ib2R5VGV4dF0pKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYXJyYXlCdWZmZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvYigpLnRoZW4ocmVhZEJsb2JBc0FycmF5QnVmZmVyKVxuICAgICAgfVxuXG4gICAgICB0aGlzLnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgICByZXR1cm4gcmVhZEJsb2JBc1RleHQodGhpcy5fYm9keUJsb2IpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIHRleHQnKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keVRleHQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5faW5pdEJvZHkgPSBmdW5jdGlvbihib2R5KSB7XG4gICAgICAgIHRoaXMuX2JvZHlJbml0ID0gYm9keVxuICAgICAgICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5XG4gICAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5mb3JtRGF0YSAmJiBGb3JtRGF0YS5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICAgIHRoaXMuX2JvZHlGb3JtRGF0YSA9IGJvZHlcbiAgICAgICAgfSBlbHNlIGlmICghYm9keSkge1xuICAgICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gJydcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vuc3VwcG9ydGVkIEJvZHlJbml0IHR5cGUnKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMudGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICByZXR1cm4gcmVqZWN0ZWQgPyByZWplY3RlZCA6IFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5VGV4dClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5mb3JtRGF0YSkge1xuICAgICAgdGhpcy5mb3JtRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihkZWNvZGUpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5qc29uID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihKU09OLnBhcnNlKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvLyBIVFRQIG1ldGhvZHMgd2hvc2UgY2FwaXRhbGl6YXRpb24gc2hvdWxkIGJlIG5vcm1hbGl6ZWRcbiAgdmFyIG1ldGhvZHMgPSBbJ0RFTEVURScsICdHRVQnLCAnSEVBRCcsICdPUFRJT05TJywgJ1BPU1QnLCAnUFVUJ11cblxuICBmdW5jdGlvbiBub3JtYWxpemVNZXRob2QobWV0aG9kKSB7XG4gICAgdmFyIHVwY2FzZWQgPSBtZXRob2QudG9VcHBlckNhc2UoKVxuICAgIHJldHVybiAobWV0aG9kcy5pbmRleE9mKHVwY2FzZWQpID4gLTEpID8gdXBjYXNlZCA6IG1ldGhvZFxuICB9XG5cbiAgZnVuY3Rpb24gUmVxdWVzdCh1cmwsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICAgIHRoaXMudXJsID0gdXJsXG5cbiAgICB0aGlzLmNyZWRlbnRpYWxzID0gb3B0aW9ucy5jcmVkZW50aWFscyB8fCAnb21pdCdcbiAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgdGhpcy5tZXRob2QgPSBub3JtYWxpemVNZXRob2Qob3B0aW9ucy5tZXRob2QgfHwgJ0dFVCcpXG4gICAgdGhpcy5tb2RlID0gb3B0aW9ucy5tb2RlIHx8IG51bGxcbiAgICB0aGlzLnJlZmVycmVyID0gbnVsbFxuXG4gICAgaWYgKCh0aGlzLm1ldGhvZCA9PT0gJ0dFVCcgfHwgdGhpcy5tZXRob2QgPT09ICdIRUFEJykgJiYgb3B0aW9ucy5ib2R5KSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdCb2R5IG5vdCBhbGxvd2VkIGZvciBHRVQgb3IgSEVBRCByZXF1ZXN0cycpXG4gICAgfVxuICAgIHRoaXMuX2luaXRCb2R5KG9wdGlvbnMuYm9keSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlY29kZShib2R5KSB7XG4gICAgdmFyIGZvcm0gPSBuZXcgRm9ybURhdGEoKVxuICAgIGJvZHkudHJpbSgpLnNwbGl0KCcmJykuZm9yRWFjaChmdW5jdGlvbihieXRlcykge1xuICAgICAgaWYgKGJ5dGVzKSB7XG4gICAgICAgIHZhciBzcGxpdCA9IGJ5dGVzLnNwbGl0KCc9JylcbiAgICAgICAgdmFyIG5hbWUgPSBzcGxpdC5zaGlmdCgpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIHZhciB2YWx1ZSA9IHNwbGl0LmpvaW4oJz0nKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICBmb3JtLmFwcGVuZChkZWNvZGVVUklDb21wb25lbnQobmFtZSksIGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gZm9ybVxuICB9XG5cbiAgZnVuY3Rpb24gaGVhZGVycyh4aHIpIHtcbiAgICB2YXIgaGVhZCA9IG5ldyBIZWFkZXJzKClcbiAgICB2YXIgcGFpcnMgPSB4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkudHJpbSgpLnNwbGl0KCdcXG4nKVxuICAgIHBhaXJzLmZvckVhY2goZnVuY3Rpb24oaGVhZGVyKSB7XG4gICAgICB2YXIgc3BsaXQgPSBoZWFkZXIudHJpbSgpLnNwbGl0KCc6JylcbiAgICAgIHZhciBrZXkgPSBzcGxpdC5zaGlmdCgpLnRyaW0oKVxuICAgICAgdmFyIHZhbHVlID0gc3BsaXQuam9pbignOicpLnRyaW0oKVxuICAgICAgaGVhZC5hcHBlbmQoa2V5LCB2YWx1ZSlcbiAgICB9KVxuICAgIHJldHVybiBoZWFkXG4gIH1cblxuICBSZXF1ZXN0LnByb3RvdHlwZS5mZXRjaCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpc1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gICAgICBpZiAoc2VsZi5jcmVkZW50aWFscyA9PT0gJ2NvcnMnKSB7XG4gICAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiByZXNwb25zZVVSTCgpIHtcbiAgICAgICAgaWYgKCdyZXNwb25zZVVSTCcgaW4geGhyKSB7XG4gICAgICAgICAgcmV0dXJuIHhoci5yZXNwb25zZVVSTFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXZvaWQgc2VjdXJpdHkgd2FybmluZ3Mgb24gZ2V0UmVzcG9uc2VIZWFkZXIgd2hlbiBub3QgYWxsb3dlZCBieSBDT1JTXG4gICAgICAgIGlmICgvXlgtUmVxdWVzdC1VUkw6L20udGVzdCh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHhoci5nZXRSZXNwb25zZUhlYWRlcignWC1SZXF1ZXN0LVVSTCcpXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHN0YXR1cyA9ICh4aHIuc3RhdHVzID09PSAxMjIzKSA/IDIwNCA6IHhoci5zdGF0dXNcbiAgICAgICAgaWYgKHN0YXR1cyA8IDEwMCB8fCBzdGF0dXMgPiA1OTkpIHtcbiAgICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICAgIHN0YXR1czogc3RhdHVzLFxuICAgICAgICAgIHN0YXR1c1RleHQ6IHhoci5zdGF0dXNUZXh0LFxuICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnMoeGhyKSxcbiAgICAgICAgICB1cmw6IHJlc3BvbnNlVVJMKClcbiAgICAgICAgfVxuICAgICAgICB2YXIgYm9keSA9ICdyZXNwb25zZScgaW4geGhyID8geGhyLnJlc3BvbnNlIDogeGhyLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgcmVzb2x2ZShuZXcgUmVzcG9uc2UoYm9keSwgb3B0aW9ucykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vcGVuKHNlbGYubWV0aG9kLCBzZWxmLnVybCwgdHJ1ZSlcbiAgICAgIGlmICgncmVzcG9uc2VUeXBlJyBpbiB4aHIgJiYgc3VwcG9ydC5ibG9iKSB7XG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnYmxvYidcbiAgICAgIH1cblxuICAgICAgc2VsZi5oZWFkZXJzLmZvckVhY2goZnVuY3Rpb24obmFtZSwgdmFsdWVzKSB7XG4gICAgICAgIHZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIobmFtZSwgdmFsdWUpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICB4aHIuc2VuZCh0eXBlb2Ygc2VsZi5fYm9keUluaXQgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IHNlbGYuX2JvZHlJbml0KVxuICAgIH0pXG4gIH1cblxuICBCb2R5LmNhbGwoUmVxdWVzdC5wcm90b3R5cGUpXG5cbiAgZnVuY3Rpb24gUmVzcG9uc2UoYm9keUluaXQsIG9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSB7fVxuICAgIH1cblxuICAgIHRoaXMuX2luaXRCb2R5KGJvZHlJbml0KVxuICAgIHRoaXMudHlwZSA9ICdkZWZhdWx0J1xuICAgIHRoaXMudXJsID0gbnVsbFxuICAgIHRoaXMuc3RhdHVzID0gb3B0aW9ucy5zdGF0dXNcbiAgICB0aGlzLnN0YXR1c1RleHQgPSBvcHRpb25zLnN0YXR1c1RleHRcbiAgICB0aGlzLmhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnNcbiAgICB0aGlzLnVybCA9IG9wdGlvbnMudXJsIHx8ICcnXG4gIH1cblxuICBCb2R5LmNhbGwoUmVzcG9uc2UucHJvdG90eXBlKVxuXG4gIHNlbGYuSGVhZGVycyA9IEhlYWRlcnM7XG4gIHNlbGYuUmVxdWVzdCA9IFJlcXVlc3Q7XG4gIHNlbGYuUmVzcG9uc2UgPSBSZXNwb25zZTtcblxuICBzZWxmLmZldGNoID0gZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCh1cmwsIG9wdGlvbnMpLmZldGNoKClcbiAgfVxuICBzZWxmLmZldGNoLnBvbHlmaWxsID0gdHJ1ZVxufSkoKTtcbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIFBvaW50ZXJFdmVudCB7XG4gIGNvbnN0cnVjdG9yKGV2ZW50LCBlbGVtZW50KSB7XG4gICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgdGhpcy5vcmlnaW5hbEV2ZW50ID0gZXZlbnQ7XG4gIH1cblxuICBnZXQgcG9pbnQoKSB7XG4gICAgLy8gVE9ETzogZG8gd2UgbmVlZCB0byByZWNhbGN1bGF0ZSB0aGlzIGVhY2ggdGltZSwgb3IgY2FuIHdlIG9wdGltaXplIGJ5IGNoZWNraW5nIHVzaW5nXG4gICAgLy8gc2Nyb2xsIGV2ZW50cz9cbiAgICB2YXIgYm91bmRzID0gdGhpcy5lbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgICBwb2ludCA9IHRoaXMucGFnZVBvaW50O1xuICAgIHBvaW50LnggLT0gYm91bmRzLmxlZnQ7XG4gICAgcG9pbnQueSAtPSBib3VuZHMudG9wO1xuICAgIHJldHVybiBwb2ludDtcbiAgfVxuXG4gIGdldCBwYWdlUG9pbnQoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgeDogdGhpcy5vcmlnaW5hbEV2ZW50LmNsaWVudFgsXG4gICAgICAgIHk6IHRoaXMub3JpZ2luYWxFdmVudC5jbGllbnRZXG4gICAgfTtcbiAgfVxuXG4gIGdldCB0aW1lKCkge1xuICAgIHJldHVybiBuZXcgRGF0ZSh0aGlzLm9yaWdpbmFsRXZlbnQudGltZVN0YW1wKTtcbiAgfVxuXG4gIGdldCB0eXBlKCkge1xuICAgIHJldHVybiB0aGlzLm9yaWdpbmFsRXZlbnQudHlwZTtcbiAgfVxufVxuIiwiaW1wb3J0IGV2ZW50ZW1pdHRlcjIgZnJvbSAnZXZlbnRlbWl0dGVyMic7XG5pbXBvcnQgUG9pbnRlckV2ZW50IGZyb20gJy4vUG9pbnRlckV2ZW50JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUG9pbnRlclByb3h5IGV4dGVuZHMgZXZlbnRlbWl0dGVyMi5FdmVudEVtaXR0ZXIyIHtcbiAgY29uc3RydWN0b3IoZWxlbWVudCwgZmlsdGVyKSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLmZpbHRlciA9IGZpbHRlcjtcblxuICAgIGxldCByZWxheUV2ZW50ID0gKG9yaWdpbmFsRXZlbnQpID0+IHtcbiAgICAgIGlmICh0aGlzLmZpbHRlciAmJiB0aGlzLmZpbHRlcihvcmlnaW5hbEV2ZW50KSA9PT0gZmFsc2UpXG4gICAgICAgIHJldHVybjtcblxuICAgICAgdGhpcy5lbWl0KGV2ZW50LnR5cGUsIG5ldyBQb2ludGVyRXZlbnQoZXZlbnQsIHRoaXMuZWxlbWVudCkpO1xuICAgIH07XG5cbiAgICBmb3IgKGxldCBldmVudE5hbWUgb2YgUG9pbnRlclByb3h5LmV2ZW50VHlwZXMpIHtcbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHJlbGF5RXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIGZvcndhcmRFdmVudHMoZW1pdHRlcikge1xuICAgIHRoaXMub25BbnkoZnVuY3Rpb24gZm9yd2FyZChldmVudCkge1xuICAgICAgZW1pdHRlci5lbWl0KGV2ZW50LnR5cGUsIGV2ZW50KTtcbiAgICB9KTtcbiAgfVxufVxuXG5Qb2ludGVyUHJveHkuZXZlbnRUeXBlcyA9IFtcbiAgJ3BvaW50ZXJvdmVyJyxcbiAgJ3BvaW50ZXJlbnRlcicsXG4gICdwb2ludGVyZG93bicsXG4gICdwb2ludGVydXAnLFxuICAncG9pbnRlcm1vdmUnLFxuICAncG9pbnRlcmNhbmNlbCcsXG4gICdwb2ludGVyb3V0JyxcbiAgJ3BvaW50ZXJsZWF2ZScsXG5dO1xuIiwiZXhwb3J0IGZ1bmN0aW9uIHJlZGlyZWN0UGFyZW50KHVybCkge1xuICBwYXJlbnQucG9zdE1lc3NhZ2UoJ3tcInN0YXR1c1wiOiBcInJlZGlyZWN0XCIsIFwiZG9tYWluX3BhdGhcIjogXCInICsgdXJsICsgJ1wifScsICcqJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUaXRsZURhdGEoY2FsbGJhY2spIHtcblxuICAvLyBTb21laG93IGRldGVybWluZXMgaWYgd2UncmUgb24gdGhlIGhvbWVwYWdlLiBubyBpZGVhIHdoYXQgdGhleSBjYW1lIHVwIGhlcmUuLi5cbiAgZnVuY3Rpb24gaXNIb21lcGFnZSgpIHtcbiAgICB2YXIgbWF0Y2ggPSBSZWdFeHAoJ1s/Jl1ob21lcGFnZT0oW14mXSopJykuZXhlYyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbiAgICByZXR1cm4gbWF0Y2ggJiYgZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzFdLnJlcGxhY2UoL1xcKy9nLCAnICcpKTtcbiAgfVxuXG4gIC8vIFJlY2VpdmUgZGF0YSBoYXZpbmcgdGl0bGUgYW5kIHN1YnRpdGxlIGFuZCBwdXQgaW4gb24gdGhlIHBhZ2VcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZSkge1xuICAgIHZhciBtc2cgPSBKU09OLnBhcnNlKGUuZGF0YSk7XG4gICAgaWYgKG1zZy5kb21haW5fcGF0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBtc2cuaXNIb21lcGFnZSA9IGlzSG9tZXBhZ2UoKTtcbiAgICAgIGNhbGxiYWNrKG1zZyk7XG4gICAgfVxuICB9KTtcblxuICAvLyBDcmVhdGUgdW5pcXVlIGNvdmVyIGlkXG4gIHZhciBjb3ZlcklkID0gKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSkuc3BsaXQoJy8nKVs0XTtcblxuICAvLyBTZW5kIGluZm9ybWF0aW9uIHRvIHBhcmVudCBzYXlpbmcgdGhhdCBsb2FkaW5nIG9mIHRoZSBpZnJhbWUgaXMgcmVhZHlcbiAgcGFyZW50LnBvc3RNZXNzYWdlKCd7XCJzdGF0dXNcIjogXCJyZWFkeVwiLCBcImNvdmVySWRcIjogXCInICsgY292ZXJJZCArICdcIn0nLCAnKicpO1xufVxuIl19
