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

  var duration = distance / 100;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGVvL25oaS1jb3Zlci1nbGFzL3NyYy9hcHAuanMiLCIuLi9ub2RlX21vZHVsZXMvZXZlbnRlbWl0dGVyMi9saWIvZXZlbnRlbWl0dGVyMi5qcyIsIi4uL25vZGVfbW9kdWxlcy9wb2ludHMvUG9pbnRzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3doYXR3Zy1mZXRjaC9mZXRjaC5qcyIsIi9Vc2Vycy9sZW8vbmhpLWNvdmVyLWdsYXMvc3JjL2xpYi9Qb2ludGVyRXZlbnQuanMiLCIvVXNlcnMvbGVvL25oaS1jb3Zlci1nbGFzL3NyYy9saWIvUG9pbnRlclByb3h5LmpzIiwiL1VzZXJzL2xlby9uaGktY292ZXItZ2xhcy9zcmMvbGliL2dldERhdGEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O1FDQU8sY0FBYzs7MEJBQ3NCLGVBQWU7O0lBQWxELGNBQWMsZUFBZCxjQUFjO0lBQUUsWUFBWSxlQUFaLFlBQVk7O1FBQzdCLFFBQVE7O0lBQ1IsWUFBWSwyQkFBTSxvQkFBb0I7O0FBRTdDLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQztBQUN0QixJQUFNLFNBQVMsR0FBRyxHQUFHLENBQUM7QUFDdEIsSUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDO0FBQ3RCLElBQUksS0FBSyxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQztBQUNoRCxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUM7O0FBR3RCLFNBQVMsT0FBTyxHQUFHO0FBQ2pCLE9BQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUN6QixJQUFJLENBQUMsVUFBVSxRQUFRLEVBQUU7QUFDeEIsV0FBTyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7R0FDeEIsQ0FBQyxDQUNELElBQUksQ0FBQyxVQUFVLElBQUksRUFBRTtBQUNwQixRQUFJLElB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM2NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUFRLENBQUMsUUFBUSxDQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O0FBR3ZELFFBQU0sQ0FBQyxXQUFXLENBQUMseUNBQWtDLEdBQUcsT0FBTyxHQUFHLEtBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztDQUM5RSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgJ3doYXR3Zy1mZXRjaCc7XG5pbXBvcnQge3JlZGlyZWN0UGFyZW50LCBnZXRUaXRsZURhdGF9IGZyb20gJy4vbGliL2dldERhdGEnO1xuaW1wb3J0ICdwb2ludHMnO1xuaW1wb3J0IFBvaW50ZXJQcm94eSBmcm9tICcuL2xpYi9Qb2ludGVyUHJveHknO1xuXG5jb25zdCBzdmd3aWR0aCA9IDExMjA7XG5jb25zdCBzdmdoZWlnaHQgPSA3NTg7XG5jb25zdCBsb3VwZVpvb20gPSAxLjU7XG52YXIgbG91cGUsIGxvdXBlQ29udGVudCwgaW1hZ2UxLCBpbWFnZTIsIGltYWdlMztcbnZhciBoYXNDaGFuZ2VkID0gdHJ1ZTtcblxuXG5mdW5jdGlvbiBsb2FkU1ZHKCkge1xuICBmZXRjaCgnLi9hc3NldHMvc291cmNlLnN2ZycpXG4gICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xuICAgIH0pXG4gICAgLnRoZW4oZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgIHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBmcmFnLmlubmVySFRNTCA9IHRleHQ7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGZyYWcpO1xuICAgICAgc2V0dXAoZnJhZyk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIG1hcFJhbmdlKGZyb20sIHRvLCBzKSB7XG4gIHJldHVybiB0b1swXSArIChzIC0gZnJvbVswXSkgKiAodG9bMV0gLSB0b1swXSkgLyAoZnJvbVsxXSAtIGZyb21bMF0pO1xufVxuXG5mdW5jdGlvbiBtb3ZlSW1hZ2VzKHgsIHkpIHtcbiAgbW92ZU1hc2tDb250ZW50KGltYWdlMSwgbWFwUmFuZ2UoWzAsIDExMjBdLCBbNzksIC0zMTBdLCB4KSwgbWFwUmFuZ2UoWzAsIDc1OF0sIFsxNzAsIC0zMjBdLCB5KSk7XG4gIG1vdmVNYXNrQ29udGVudChpbWFnZTIsIG1hcFJhbmdlKFswLCA3NThdLCBbMjA0LCA0ODldLCB5KSwgbWFwUmFuZ2UoWzAsIDExMjBdLCBbNDIsIDQ5NV0sIHgpKTtcbiAgbW92ZU1hc2tDb250ZW50KGltYWdlMywgbWFwUmFuZ2UoWzAsIDc1OF0sIFsgMjkwLCAwXSwgeSksIG1hcFJhbmdlKFswLCAxMTIwXSwgWzIyMCwgLTEwMF0sIHgpKTtcbiAgXG4gIG1vdmVMb3VwZSh4LCB5KTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlTG91cGVBdHRyaWJ1dGUoKSB7XG4gIHZhciB7eCwgeX0gPSBsb3VwZS5wb2ludDtcbiAgXG4gIGxvdXBlLnNldEF0dHJpYnV0ZSgndHJhbnNmb3JtJywgYHRyYW5zbGF0ZSgke3h9LCAke3l9KWApO1xuXG4gIHZhciBjb250ZW50WCA9IHggLyAobG91cGVab29tICogLTIpO1xuICB2YXIgY29udGVudFkgPSB5IC8gKGxvdXBlWm9vbSAqIC0yKTtcbiAgXG4gIGxvdXBlQ29udGVudC5zZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybScsIGBzY2FsZSgxLjUpIHRyYW5zbGF0ZSgke2NvbnRlbnRYfSwgJHtjb250ZW50WX0pYCk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUF0dHJpYnV0ZShlbGVtZW50KSB7XG4gIGVsZW1lbnQuc2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKCR7ZWxlbWVudC5wb2ludC54fSwgJHtlbGVtZW50LnBvaW50Lnl9KWApO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVBdHRyaWJ1dGVzKCkge1xuICB1cGRhdGVBdHRyaWJ1dGUoaW1hZ2UxKTtcbiAgdXBkYXRlQXR0cmlidXRlKGltYWdlMik7XG4gIHVwZGF0ZUF0dHJpYnV0ZShpbWFnZTMpO1xuICB1cGRhdGVMb3VwZUF0dHJpYnV0ZSgpO1xufVxuXG5mdW5jdGlvbiBtb3ZlTWFza0NvbnRlbnQoZWxlbWVudCwgeCwgeSwgZGlyKSB7XG4gIHZhciBwb2ludCA9IGVsZW1lbnQucG9pbnQ7XG4gIHBvaW50LnggPSB4O1xuICBwb2ludC55ID0geTtcbn1cblxuZnVuY3Rpb24gbW92ZUxvdXBlKHgsIHkpIHtcbiAgbG91cGUucG9pbnQueCA9IHg7XG4gIGxvdXBlLnBvaW50LnkgPSB5O1xufVxuXG5mdW5jdGlvbiBkcmF3KCkge1xuICBpZiAoaGFzQ2hhbmdlZCkge1xuICAgIHVwZGF0ZUxvdXBlQXR0cmlidXRlKCk7XG4gICAgdXBkYXRlQXR0cmlidXRlcygpO1xuICAgIFxuICAgIGhhc0NoYW5nZWQgPSBmYWxzZTsgIFxuICB9XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShkcmF3KTtcbiAgXG59XG5cbmZ1bmN0aW9uIHJhbmRvbU1vdmUoeE9sZCwgeU9sZCkge1xuICB2YXIgeCA9IE1hdGgucmFuZG9tKCkgKiAxMTIwO1xuICB2YXIgeSA9IE1hdGgucmFuZG9tKCkgKiA3NjA7XG4gIFxuICB2YXIgZGlzdGFuY2UgPSBNYXRoLnNxcnQoTWF0aC5wb3coeE9sZCAtIHgsIDIpICsgTWF0aC5wb3coeU9sZCAtIHksIDIpKVxuICBcbiAgdmFyIGR1cmF0aW9uID0gZGlzdGFuY2UgLyAxMDA7XG4gIHZhciBpbnRlcnZhbEZyZXF1ZW5jeSA9IDU7XG4gIHZhciBsYXN0VGltZSA9IGR1cmF0aW9uICogMTAwMDtcbiAgdmFyIHN0ZXBzID0gfn4obGFzdFRpbWUgLyBpbnRlcnZhbEZyZXF1ZW5jeSk7XG4gIHZhciBzdGVwID0gMDtcbiAgLy8gQ2FsbCBpdCBhIGxvdCwgc2luY2UgdGhpcyBkb2Vzbid0IGFjdHVhbGx5IGRvIGFueXRoaW5nIGhlYXZ5XG4gIHZhciBpbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgeE5vdyA9IHhPbGQgKyAoeCAtIHhPbGQpIC8gc3RlcHMgKiBzdGVwO1xuICAgIHZhciB5Tm93ID0geU9sZCArICh5IC0geU9sZCkgLyBzdGVwcyAqIHN0ZXA7XG4gICAgXG4gICAgaWYgKHN0ZXAgPiBzdGVwcykge1xuICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICByYW5kb21Nb3ZlKHhOb3csIHlOb3cpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBcbiAgICBtb3ZlSW1hZ2VzKHhOb3csIHlOb3cpO1xuICAgIGhhc0NoYW5nZWQgPSB0cnVlO1xuICAgIHN0ZXArKztcbiAgfSwgaW50ZXJ2YWxGcmVxdWVuY3kpO1xufVxuXG5mdW5jdGlvbiBnZXRSZWxhdGl2ZVBvaW50KGV2ZW50LCBlbGVtZW50KSB7XG4gIHZhciBib3VuZHMgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB2YXIgeCA9IGV2ZW50LmNsaWVudFggLSBib3VuZHMubGVmdDtcbiAgdmFyIHkgPSBldmVudC5jbGllbnRZIC0gYm91bmRzLnRvcDtcbiAgdmFyIHN2Z1NjYWxlID0gTWF0aC5tYXgoc3Znd2lkdGggLyB3aW5kb3cuaW5uZXJXaWR0aCwgc3ZnaGVpZ2h0IC8gd2luZG93LmlubmVySGVpZ2h0KTtcbiAgXG4gIHggKj0gc3ZnU2NhbGU7XG4gIHkgKj0gc3ZnU2NhbGU7XG4gIHJldHVybiB7XG4gICAgeDogeCxcbiAgICB5OiB5XG4gIH07XG59XG5cbmZ1bmN0aW9uIHNldHVwKGNvbnRhaW5lcikge1xuICB2YXIgc3ZnID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ3N2ZycpO1xuICB2YXIgaW1hZ2VzID0gc3ZnLnF1ZXJ5U2VsZWN0b3JBbGwoJy5jcm9wcGVkJyk7XG4gIGNvbnNvbGUubG9nKGltYWdlcy5sZW5ndGgpO1xuXG4gIGltYWdlMSA9IGltYWdlc1sxXTtcbiAgaW1hZ2UyID0gaW1hZ2VzWzJdO1xuICBpbWFnZTMgPSBpbWFnZXNbMF07XG4gIGxvdXBlID0gc3ZnLnF1ZXJ5U2VsZWN0b3IoJyNjaXJjbGUtbG91cGUnKTtcbiAgbG91cGVDb250ZW50ID0gc3ZnLnF1ZXJ5U2VsZWN0b3IoJyNsb3VwZS12aXNpYmxlIHVzZScpO1xuXG4gIGltYWdlMS5wb2ludCA9IHt4OiAwLCB5OiAwfTtcbiAgaW1hZ2UyLnBvaW50ID0ge3g6IDAsIHk6IDB9O1xuICBpbWFnZTMucG9pbnQgPSB7eDogMCwgeTogMH07XG4gIGxvdXBlLnBvaW50ID0ge3g6IDAsIHk6IDB9O1xuXG5cbiAgdmFyIG9mZnNldCA9IFswLCAwXTtcbiAgdmFyIGZpcnN0ID0gdHJ1ZTtcbiAgbG91cGUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgXG4gIHN2Zy5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVybW92ZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKGZpcnN0KSB7XG4gICAgICBsb3VwZS5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgICBmaXJzdCA9IGZhbHNlO1xuICAgIH1cbiAgICB2YXIgcG9pbnQgPSBnZXRSZWxhdGl2ZVBvaW50KGUsIHN2Zyk7XG5cbiAgICBtb3ZlSW1hZ2VzKHBvaW50LngsIHBvaW50LnkpO1xuICAgIFxuICAgIGhhc0NoYW5nZWQgPSB0cnVlO1xuXG4gIH0pXG5cblxuICBtb3ZlSW1hZ2VzKDAsIDApO1xuICBkcmF3KCk7XG4gIFxuICBpZiAodHJ1ZSB8fCAnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpIHtcbiAgICBsb3VwZS5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgcmFuZG9tTW92ZSg0MDAsIDMwMCk7XG4gIH1cbiAgXG4gIGdldFRpdGxlRGF0YShmdW5jdGlvbiAobXNnKSB7ICAgIFxuICAgIC8vIEFkZCBsaW5rIHRvIGJvZHkgdG8gaGF2ZSB0aGUgcGFyZW50IHJlZGlyZWN0IHRvIHRoZSBtYWdhemluZSBVUkxcbiAgICBpZiAobXNnLmlzSG9tZXBhZ2UpIHtcbiAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVkaXJlY3RQYXJlbnQobXNnLmRvbWFpbl9wYXRoKTtcbiAgICAgIH0pO1xuICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG4gICAgfVxuICB9KTtcblxufVxuXG5cblxuXG5sb2FkU1ZHKCk7XG4iLCIvKiFcbiAqIEV2ZW50RW1pdHRlcjJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9oaWoxbngvRXZlbnRFbWl0dGVyMlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMyBoaWoxbnhcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqL1xuOyFmdW5jdGlvbih1bmRlZmluZWQpIHtcblxuICB2YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgPyBBcnJheS5pc0FycmF5IDogZnVuY3Rpb24gX2lzQXJyYXkob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSBcIltvYmplY3QgQXJyYXldXCI7XG4gIH07XG4gIHZhciBkZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbiAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBpZiAodGhpcy5fY29uZikge1xuICAgICAgY29uZmlndXJlLmNhbGwodGhpcywgdGhpcy5fY29uZik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY29uZmlndXJlKGNvbmYpIHtcbiAgICBpZiAoY29uZikge1xuXG4gICAgICB0aGlzLl9jb25mID0gY29uZjtcblxuICAgICAgY29uZi5kZWxpbWl0ZXIgJiYgKHRoaXMuZGVsaW1pdGVyID0gY29uZi5kZWxpbWl0ZXIpO1xuICAgICAgY29uZi5tYXhMaXN0ZW5lcnMgJiYgKHRoaXMuX2V2ZW50cy5tYXhMaXN0ZW5lcnMgPSBjb25mLm1heExpc3RlbmVycyk7XG4gICAgICBjb25mLndpbGRjYXJkICYmICh0aGlzLndpbGRjYXJkID0gY29uZi53aWxkY2FyZCk7XG4gICAgICBjb25mLm5ld0xpc3RlbmVyICYmICh0aGlzLm5ld0xpc3RlbmVyID0gY29uZi5uZXdMaXN0ZW5lcik7XG5cbiAgICAgIGlmICh0aGlzLndpbGRjYXJkKSB7XG4gICAgICAgIHRoaXMubGlzdGVuZXJUcmVlID0ge307XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gRXZlbnRFbWl0dGVyKGNvbmYpIHtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICB0aGlzLm5ld0xpc3RlbmVyID0gZmFsc2U7XG4gICAgY29uZmlndXJlLmNhbGwodGhpcywgY29uZik7XG4gIH1cblxuICAvL1xuICAvLyBBdHRlbnRpb24sIGZ1bmN0aW9uIHJldHVybiB0eXBlIG5vdyBpcyBhcnJheSwgYWx3YXlzICFcbiAgLy8gSXQgaGFzIHplcm8gZWxlbWVudHMgaWYgbm8gYW55IG1hdGNoZXMgZm91bmQgYW5kIG9uZSBvciBtb3JlXG4gIC8vIGVsZW1lbnRzIChsZWFmcykgaWYgdGhlcmUgYXJlIG1hdGNoZXNcbiAgLy9cbiAgZnVuY3Rpb24gc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB0cmVlLCBpKSB7XG4gICAgaWYgKCF0cmVlKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHZhciBsaXN0ZW5lcnM9W10sIGxlYWYsIGxlbiwgYnJhbmNoLCB4VHJlZSwgeHhUcmVlLCBpc29sYXRlZEJyYW5jaCwgZW5kUmVhY2hlZCxcbiAgICAgICAgdHlwZUxlbmd0aCA9IHR5cGUubGVuZ3RoLCBjdXJyZW50VHlwZSA9IHR5cGVbaV0sIG5leHRUeXBlID0gdHlwZVtpKzFdO1xuICAgIGlmIChpID09PSB0eXBlTGVuZ3RoICYmIHRyZWUuX2xpc3RlbmVycykge1xuICAgICAgLy9cbiAgICAgIC8vIElmIGF0IHRoZSBlbmQgb2YgdGhlIGV2ZW50KHMpIGxpc3QgYW5kIHRoZSB0cmVlIGhhcyBsaXN0ZW5lcnNcbiAgICAgIC8vIGludm9rZSB0aG9zZSBsaXN0ZW5lcnMuXG4gICAgICAvL1xuICAgICAgaWYgKHR5cGVvZiB0cmVlLl9saXN0ZW5lcnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgaGFuZGxlcnMgJiYgaGFuZGxlcnMucHVzaCh0cmVlLl9saXN0ZW5lcnMpO1xuICAgICAgICByZXR1cm4gW3RyZWVdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChsZWFmID0gMCwgbGVuID0gdHJlZS5fbGlzdGVuZXJzLmxlbmd0aDsgbGVhZiA8IGxlbjsgbGVhZisrKSB7XG4gICAgICAgICAgaGFuZGxlcnMgJiYgaGFuZGxlcnMucHVzaCh0cmVlLl9saXN0ZW5lcnNbbGVhZl0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbdHJlZV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKChjdXJyZW50VHlwZSA9PT0gJyonIHx8IGN1cnJlbnRUeXBlID09PSAnKionKSB8fCB0cmVlW2N1cnJlbnRUeXBlXSkge1xuICAgICAgLy9cbiAgICAgIC8vIElmIHRoZSBldmVudCBlbWl0dGVkIGlzICcqJyBhdCB0aGlzIHBhcnRcbiAgICAgIC8vIG9yIHRoZXJlIGlzIGEgY29uY3JldGUgbWF0Y2ggYXQgdGhpcyBwYXRjaFxuICAgICAgLy9cbiAgICAgIGlmIChjdXJyZW50VHlwZSA9PT0gJyonKSB7XG4gICAgICAgIGZvciAoYnJhbmNoIGluIHRyZWUpIHtcbiAgICAgICAgICBpZiAoYnJhbmNoICE9PSAnX2xpc3RlbmVycycgJiYgdHJlZS5oYXNPd25Qcm9wZXJ0eShicmFuY2gpKSB7XG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuY29uY2F0KHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgdHJlZVticmFuY2hdLCBpKzEpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxpc3RlbmVycztcbiAgICAgIH0gZWxzZSBpZihjdXJyZW50VHlwZSA9PT0gJyoqJykge1xuICAgICAgICBlbmRSZWFjaGVkID0gKGkrMSA9PT0gdHlwZUxlbmd0aCB8fCAoaSsyID09PSB0eXBlTGVuZ3RoICYmIG5leHRUeXBlID09PSAnKicpKTtcbiAgICAgICAgaWYoZW5kUmVhY2hlZCAmJiB0cmVlLl9saXN0ZW5lcnMpIHtcbiAgICAgICAgICAvLyBUaGUgbmV4dCBlbGVtZW50IGhhcyBhIF9saXN0ZW5lcnMsIGFkZCBpdCB0byB0aGUgaGFuZGxlcnMuXG4gICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHRyZWUsIHR5cGVMZW5ndGgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoYnJhbmNoIGluIHRyZWUpIHtcbiAgICAgICAgICBpZiAoYnJhbmNoICE9PSAnX2xpc3RlbmVycycgJiYgdHJlZS5oYXNPd25Qcm9wZXJ0eShicmFuY2gpKSB7XG4gICAgICAgICAgICBpZihicmFuY2ggPT09ICcqJyB8fCBicmFuY2ggPT09ICcqKicpIHtcbiAgICAgICAgICAgICAgaWYodHJlZVticmFuY2hdLl9saXN0ZW5lcnMgJiYgIWVuZFJlYWNoZWQpIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuY29uY2F0KHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgdHJlZVticmFuY2hdLCB0eXBlTGVuZ3RoKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHRyZWVbYnJhbmNoXSwgaSkpO1xuICAgICAgICAgICAgfSBlbHNlIGlmKGJyYW5jaCA9PT0gbmV4dFR5cGUpIHtcbiAgICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHRyZWVbYnJhbmNoXSwgaSsyKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBObyBtYXRjaCBvbiB0aGlzIG9uZSwgc2hpZnQgaW50byB0aGUgdHJlZSBidXQgbm90IGluIHRoZSB0eXBlIGFycmF5LlxuICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuY29uY2F0KHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgdHJlZVticmFuY2hdLCBpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsaXN0ZW5lcnM7XG4gICAgICB9XG5cbiAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5jb25jYXQoc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB0cmVlW2N1cnJlbnRUeXBlXSwgaSsxKSk7XG4gICAgfVxuXG4gICAgeFRyZWUgPSB0cmVlWycqJ107XG4gICAgaWYgKHhUcmVlKSB7XG4gICAgICAvL1xuICAgICAgLy8gSWYgdGhlIGxpc3RlbmVyIHRyZWUgd2lsbCBhbGxvdyBhbnkgbWF0Y2ggZm9yIHRoaXMgcGFydCxcbiAgICAgIC8vIHRoZW4gcmVjdXJzaXZlbHkgZXhwbG9yZSBhbGwgYnJhbmNoZXMgb2YgdGhlIHRyZWVcbiAgICAgIC8vXG4gICAgICBzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHhUcmVlLCBpKzEpO1xuICAgIH1cblxuICAgIHh4VHJlZSA9IHRyZWVbJyoqJ107XG4gICAgaWYoeHhUcmVlKSB7XG4gICAgICBpZihpIDwgdHlwZUxlbmd0aCkge1xuICAgICAgICBpZih4eFRyZWUuX2xpc3RlbmVycykge1xuICAgICAgICAgIC8vIElmIHdlIGhhdmUgYSBsaXN0ZW5lciBvbiBhICcqKicsIGl0IHdpbGwgY2F0Y2ggYWxsLCBzbyBhZGQgaXRzIGhhbmRsZXIuXG4gICAgICAgICAgc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB4eFRyZWUsIHR5cGVMZW5ndGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQnVpbGQgYXJyYXlzIG9mIG1hdGNoaW5nIG5leHQgYnJhbmNoZXMgYW5kIG90aGVycy5cbiAgICAgICAgZm9yKGJyYW5jaCBpbiB4eFRyZWUpIHtcbiAgICAgICAgICBpZihicmFuY2ggIT09ICdfbGlzdGVuZXJzJyAmJiB4eFRyZWUuaGFzT3duUHJvcGVydHkoYnJhbmNoKSkge1xuICAgICAgICAgICAgaWYoYnJhbmNoID09PSBuZXh0VHlwZSkge1xuICAgICAgICAgICAgICAvLyBXZSBrbm93IHRoZSBuZXh0IGVsZW1lbnQgd2lsbCBtYXRjaCwgc28ganVtcCB0d2ljZS5cbiAgICAgICAgICAgICAgc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB4eFRyZWVbYnJhbmNoXSwgaSsyKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZihicmFuY2ggPT09IGN1cnJlbnRUeXBlKSB7XG4gICAgICAgICAgICAgIC8vIEN1cnJlbnQgbm9kZSBtYXRjaGVzLCBtb3ZlIGludG8gdGhlIHRyZWUuXG4gICAgICAgICAgICAgIHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgeHhUcmVlW2JyYW5jaF0sIGkrMSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpc29sYXRlZEJyYW5jaCA9IHt9O1xuICAgICAgICAgICAgICBpc29sYXRlZEJyYW5jaFticmFuY2hdID0geHhUcmVlW2JyYW5jaF07XG4gICAgICAgICAgICAgIHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgeyAnKionOiBpc29sYXRlZEJyYW5jaCB9LCBpKzEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmKHh4VHJlZS5fbGlzdGVuZXJzKSB7XG4gICAgICAgIC8vIFdlIGhhdmUgcmVhY2hlZCB0aGUgZW5kIGFuZCBzdGlsbCBvbiBhICcqKidcbiAgICAgICAgc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB4eFRyZWUsIHR5cGVMZW5ndGgpO1xuICAgICAgfSBlbHNlIGlmKHh4VHJlZVsnKiddICYmIHh4VHJlZVsnKiddLl9saXN0ZW5lcnMpIHtcbiAgICAgICAgc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB4eFRyZWVbJyonXSwgdHlwZUxlbmd0aCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpc3RlbmVycztcbiAgfVxuXG4gIGZ1bmN0aW9uIGdyb3dMaXN0ZW5lclRyZWUodHlwZSwgbGlzdGVuZXIpIHtcblxuICAgIHR5cGUgPSB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgPyB0eXBlLnNwbGl0KHRoaXMuZGVsaW1pdGVyKSA6IHR5cGUuc2xpY2UoKTtcblxuICAgIC8vXG4gICAgLy8gTG9va3MgZm9yIHR3byBjb25zZWN1dGl2ZSAnKionLCBpZiBzbywgZG9uJ3QgYWRkIHRoZSBldmVudCBhdCBhbGwuXG4gICAgLy9cbiAgICBmb3IodmFyIGkgPSAwLCBsZW4gPSB0eXBlLmxlbmd0aDsgaSsxIDwgbGVuOyBpKyspIHtcbiAgICAgIGlmKHR5cGVbaV0gPT09ICcqKicgJiYgdHlwZVtpKzFdID09PSAnKionKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgdHJlZSA9IHRoaXMubGlzdGVuZXJUcmVlO1xuICAgIHZhciBuYW1lID0gdHlwZS5zaGlmdCgpO1xuXG4gICAgd2hpbGUgKG5hbWUpIHtcblxuICAgICAgaWYgKCF0cmVlW25hbWVdKSB7XG4gICAgICAgIHRyZWVbbmFtZV0gPSB7fTtcbiAgICAgIH1cblxuICAgICAgdHJlZSA9IHRyZWVbbmFtZV07XG5cbiAgICAgIGlmICh0eXBlLmxlbmd0aCA9PT0gMCkge1xuXG4gICAgICAgIGlmICghdHJlZS5fbGlzdGVuZXJzKSB7XG4gICAgICAgICAgdHJlZS5fbGlzdGVuZXJzID0gbGlzdGVuZXI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZih0eXBlb2YgdHJlZS5fbGlzdGVuZXJzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgdHJlZS5fbGlzdGVuZXJzID0gW3RyZWUuX2xpc3RlbmVycywgbGlzdGVuZXJdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlzQXJyYXkodHJlZS5fbGlzdGVuZXJzKSkge1xuXG4gICAgICAgICAgdHJlZS5fbGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuXG4gICAgICAgICAgaWYgKCF0cmVlLl9saXN0ZW5lcnMud2FybmVkKSB7XG5cbiAgICAgICAgICAgIHZhciBtID0gZGVmYXVsdE1heExpc3RlbmVycztcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLl9ldmVudHMubWF4TGlzdGVuZXJzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICBtID0gdGhpcy5fZXZlbnRzLm1heExpc3RlbmVycztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG0gPiAwICYmIHRyZWUuX2xpc3RlbmVycy5sZW5ndGggPiBtKSB7XG5cbiAgICAgICAgICAgICAgdHJlZS5fbGlzdGVuZXJzLndhcm5lZCA9IHRydWU7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyZWUuX2xpc3RlbmVycy5sZW5ndGgpO1xuICAgICAgICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgbmFtZSA9IHR5cGUuc2hpZnQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuXG4gIC8vIDEwIGxpc3RlbmVycyBhcmUgYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaFxuICAvLyBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbiAgLy9cbiAgLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4gIC8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUuZGVsaW1pdGVyID0gJy4nO1xuXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICAgIHRoaXMuX2V2ZW50cyB8fCBpbml0LmNhbGwodGhpcyk7XG4gICAgdGhpcy5fZXZlbnRzLm1heExpc3RlbmVycyA9IG47XG4gICAgaWYgKCF0aGlzLl9jb25mKSB0aGlzLl9jb25mID0ge307XG4gICAgdGhpcy5fY29uZi5tYXhMaXN0ZW5lcnMgPSBuO1xuICB9O1xuXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUuZXZlbnQgPSAnJztcblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbihldmVudCwgZm4pIHtcbiAgICB0aGlzLm1hbnkoZXZlbnQsIDEsIGZuKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm1hbnkgPSBmdW5jdGlvbihldmVudCwgdHRsLCBmbikge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignbWFueSBvbmx5IGFjY2VwdHMgaW5zdGFuY2VzIG9mIEZ1bmN0aW9uJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGlzdGVuZXIoKSB7XG4gICAgICBpZiAoLS10dGwgPT09IDApIHtcbiAgICAgICAgc2VsZi5vZmYoZXZlbnQsIGxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgbGlzdGVuZXIuX29yaWdpbiA9IGZuO1xuXG4gICAgdGhpcy5vbihldmVudCwgbGlzdGVuZXIpO1xuXG4gICAgcmV0dXJuIHNlbGY7XG4gIH07XG5cbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICB0aGlzLl9ldmVudHMgfHwgaW5pdC5jYWxsKHRoaXMpO1xuXG4gICAgdmFyIHR5cGUgPSBhcmd1bWVudHNbMF07XG5cbiAgICBpZiAodHlwZSA9PT0gJ25ld0xpc3RlbmVyJyAmJiAhdGhpcy5uZXdMaXN0ZW5lcikge1xuICAgICAgaWYgKCF0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgfVxuXG4gICAgLy8gTG9vcCB0aHJvdWdoIHRoZSAqX2FsbCogZnVuY3Rpb25zIGFuZCBpbnZva2UgdGhlbS5cbiAgICBpZiAodGhpcy5fYWxsKSB7XG4gICAgICB2YXIgbCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICB2YXIgYXJncyA9IG5ldyBBcnJheShsIC0gMSk7XG4gICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGw7IGkrKykgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICBmb3IgKGkgPSAwLCBsID0gdGhpcy5fYWxsLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB0aGlzLmV2ZW50ID0gdHlwZTtcbiAgICAgICAgdGhpcy5fYWxsW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuXG4gICAgICBpZiAoIXRoaXMuX2FsbCAmJlxuICAgICAgICAhdGhpcy5fZXZlbnRzLmVycm9yICYmXG4gICAgICAgICEodGhpcy53aWxkY2FyZCAmJiB0aGlzLmxpc3RlbmVyVHJlZS5lcnJvcikpIHtcblxuICAgICAgICBpZiAoYXJndW1lbnRzWzFdIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICB0aHJvdyBhcmd1bWVudHNbMV07IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5jYXVnaHQsIHVuc3BlY2lmaWVkICdlcnJvcicgZXZlbnQuXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgaGFuZGxlcjtcblxuICAgIGlmKHRoaXMud2lsZGNhcmQpIHtcbiAgICAgIGhhbmRsZXIgPSBbXTtcbiAgICAgIHZhciBucyA9IHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyA/IHR5cGUuc3BsaXQodGhpcy5kZWxpbWl0ZXIpIDogdHlwZS5zbGljZSgpO1xuICAgICAgc2VhcmNoTGlzdGVuZXJUcmVlLmNhbGwodGhpcywgaGFuZGxlciwgbnMsIHRoaXMubGlzdGVuZXJUcmVlLCAwKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5ldmVudCA9IHR5cGU7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSlcbiAgICAgICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgLy8gc2xvd2VyXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHZhciBsID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGwgLSAxKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgbDsgaSsrKSBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBlbHNlIGlmIChoYW5kbGVyKSB7XG4gICAgICB2YXIgbCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICB2YXIgYXJncyA9IG5ldyBBcnJheShsIC0gMSk7XG4gICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGw7IGkrKykgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cbiAgICAgIHZhciBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdGhpcy5ldmVudCA9IHR5cGU7XG4gICAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAobGlzdGVuZXJzLmxlbmd0aCA+IDApIHx8ICEhdGhpcy5fYWxsO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiAhIXRoaXMuX2FsbDtcbiAgICB9XG5cbiAgfTtcblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcblxuICAgIGlmICh0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5vbkFueSh0eXBlKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignb24gb25seSBhY2NlcHRzIGluc3RhbmNlcyBvZiBGdW5jdGlvbicpO1xuICAgIH1cbiAgICB0aGlzLl9ldmVudHMgfHwgaW5pdC5jYWxsKHRoaXMpO1xuXG4gICAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PSBcIm5ld0xpc3RlbmVyc1wiISBCZWZvcmVcbiAgICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyc1wiLlxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgICBpZih0aGlzLndpbGRjYXJkKSB7XG4gICAgICBncm93TGlzdGVuZXJUcmVlLmNhbGwodGhpcywgdHlwZSwgbGlzdGVuZXIpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pIHtcbiAgICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gICAgfVxuICAgIGVsc2UgaWYodHlwZW9mIHRoaXMuX2V2ZW50c1t0eXBlXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzQXJyYXkodGhpcy5fZXZlbnRzW3R5cGVdKSkge1xuICAgICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuXG4gICAgICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICAgICAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG5cbiAgICAgICAgdmFyIG0gPSBkZWZhdWx0TWF4TGlzdGVuZXJzO1xuXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5fZXZlbnRzLm1heExpc3RlbmVycyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBtID0gdGhpcy5fZXZlbnRzLm1heExpc3RlbmVycztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuXG4gICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUub25BbnkgPSBmdW5jdGlvbihmbikge1xuXG4gICAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdvbkFueSBvbmx5IGFjY2VwdHMgaW5zdGFuY2VzIG9mIEZ1bmN0aW9uJyk7XG4gICAgfVxuXG4gICAgaWYoIXRoaXMuX2FsbCkge1xuICAgICAgdGhpcy5fYWxsID0gW107XG4gICAgfVxuXG4gICAgLy8gQWRkIHRoZSBmdW5jdGlvbiB0byB0aGUgZXZlbnQgbGlzdGVuZXIgY29sbGVjdGlvbi5cbiAgICB0aGlzLl9hbGwucHVzaChmbik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUub247XG5cbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigncmVtb3ZlTGlzdGVuZXIgb25seSB0YWtlcyBpbnN0YW5jZXMgb2YgRnVuY3Rpb24nKTtcbiAgICB9XG5cbiAgICB2YXIgaGFuZGxlcnMsbGVhZnM9W107XG5cbiAgICBpZih0aGlzLndpbGRjYXJkKSB7XG4gICAgICB2YXIgbnMgPSB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgPyB0eXBlLnNwbGl0KHRoaXMuZGVsaW1pdGVyKSA6IHR5cGUuc2xpY2UoKTtcbiAgICAgIGxlYWZzID0gc2VhcmNoTGlzdGVuZXJUcmVlLmNhbGwodGhpcywgbnVsbCwgbnMsIHRoaXMubGlzdGVuZXJUcmVlLCAwKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBkb2VzIG5vdCB1c2UgbGlzdGVuZXJzKCksIHNvIG5vIHNpZGUgZWZmZWN0IG9mIGNyZWF0aW5nIF9ldmVudHNbdHlwZV1cbiAgICAgIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKSByZXR1cm4gdGhpcztcbiAgICAgIGhhbmRsZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgICAgbGVhZnMucHVzaCh7X2xpc3RlbmVyczpoYW5kbGVyc30pO1xuICAgIH1cblxuICAgIGZvciAodmFyIGlMZWFmPTA7IGlMZWFmPGxlYWZzLmxlbmd0aDsgaUxlYWYrKykge1xuICAgICAgdmFyIGxlYWYgPSBsZWFmc1tpTGVhZl07XG4gICAgICBoYW5kbGVycyA9IGxlYWYuX2xpc3RlbmVycztcbiAgICAgIGlmIChpc0FycmF5KGhhbmRsZXJzKSkge1xuXG4gICAgICAgIHZhciBwb3NpdGlvbiA9IC0xO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBoYW5kbGVycy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChoYW5kbGVyc1tpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAgIChoYW5kbGVyc1tpXS5saXN0ZW5lciAmJiBoYW5kbGVyc1tpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHx8XG4gICAgICAgICAgICAoaGFuZGxlcnNbaV0uX29yaWdpbiAmJiBoYW5kbGVyc1tpXS5fb3JpZ2luID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3NpdGlvbiA8IDApIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRoaXMud2lsZGNhcmQpIHtcbiAgICAgICAgICBsZWFmLl9saXN0ZW5lcnMuc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0uc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoYW5kbGVycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICBpZih0aGlzLndpbGRjYXJkKSB7XG4gICAgICAgICAgICBkZWxldGUgbGVhZi5fbGlzdGVuZXJzO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoaGFuZGxlcnMgPT09IGxpc3RlbmVyIHx8XG4gICAgICAgIChoYW5kbGVycy5saXN0ZW5lciAmJiBoYW5kbGVycy5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHx8XG4gICAgICAgIChoYW5kbGVycy5fb3JpZ2luICYmIGhhbmRsZXJzLl9vcmlnaW4gPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBpZih0aGlzLndpbGRjYXJkKSB7XG4gICAgICAgICAgZGVsZXRlIGxlYWYuX2xpc3RlbmVycztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmZBbnkgPSBmdW5jdGlvbihmbikge1xuICAgIHZhciBpID0gMCwgbCA9IDAsIGZucztcbiAgICBpZiAoZm4gJiYgdGhpcy5fYWxsICYmIHRoaXMuX2FsbC5sZW5ndGggPiAwKSB7XG4gICAgICBmbnMgPSB0aGlzLl9hbGw7XG4gICAgICBmb3IoaSA9IDAsIGwgPSBmbnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmKGZuID09PSBmbnNbaV0pIHtcbiAgICAgICAgICBmbnMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2FsbCA9IFtdO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmY7XG5cbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICF0aGlzLl9ldmVudHMgfHwgaW5pdC5jYWxsKHRoaXMpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgaWYodGhpcy53aWxkY2FyZCkge1xuICAgICAgdmFyIG5zID0gdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnID8gdHlwZS5zcGxpdCh0aGlzLmRlbGltaXRlcikgOiB0eXBlLnNsaWNlKCk7XG4gICAgICB2YXIgbGVhZnMgPSBzZWFyY2hMaXN0ZW5lclRyZWUuY2FsbCh0aGlzLCBudWxsLCBucywgdGhpcy5saXN0ZW5lclRyZWUsIDApO1xuXG4gICAgICBmb3IgKHZhciBpTGVhZj0wOyBpTGVhZjxsZWFmcy5sZW5ndGg7IGlMZWFmKyspIHtcbiAgICAgICAgdmFyIGxlYWYgPSBsZWFmc1tpTGVhZl07XG4gICAgICAgIGxlYWYuX2xpc3RlbmVycyA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pIHJldHVybiB0aGlzO1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gICAgaWYodGhpcy53aWxkY2FyZCkge1xuICAgICAgdmFyIGhhbmRsZXJzID0gW107XG4gICAgICB2YXIgbnMgPSB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgPyB0eXBlLnNwbGl0KHRoaXMuZGVsaW1pdGVyKSA6IHR5cGUuc2xpY2UoKTtcbiAgICAgIHNlYXJjaExpc3RlbmVyVHJlZS5jYWxsKHRoaXMsIGhhbmRsZXJzLCBucywgdGhpcy5saXN0ZW5lclRyZWUsIDApO1xuICAgICAgcmV0dXJuIGhhbmRsZXJzO1xuICAgIH1cblxuICAgIHRoaXMuX2V2ZW50cyB8fCBpbml0LmNhbGwodGhpcyk7XG5cbiAgICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSkgdGhpcy5fZXZlbnRzW3R5cGVdID0gW107XG4gICAgaWYgKCFpc0FycmF5KHRoaXMuX2V2ZW50c1t0eXBlXSkpIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICB9O1xuXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzQW55ID0gZnVuY3Rpb24oKSB7XG5cbiAgICBpZih0aGlzLl9hbGwpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hbGw7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICB9O1xuXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgIGRlZmluZShmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBFdmVudEVtaXR0ZXI7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBleHBvcnRzLkV2ZW50RW1pdHRlcjIgPSBFdmVudEVtaXR0ZXI7XG4gIH1cbiAgZWxzZSB7XG4gICAgLy8gQnJvd3NlciBnbG9iYWwuXG4gICAgd2luZG93LkV2ZW50RW1pdHRlcjIgPSBFdmVudEVtaXR0ZXI7XG4gIH1cbn0oKTtcbiIsIi8qIFBvaW50cyAtIHYwLjEuMSAtIDIwMTMtMDctMTFcbiAqIEFub3RoZXIgUG9pbnRlciBFdmVudHMgcG9seWZpbGxcblxuICogaHR0cDovL3JpY2gtaGFycmlzLmdpdGh1Yi5pby9Qb2ludHNcbiAqIENvcHlyaWdodCAoYykgMjAxMyBSaWNoIEhhcnJpczsgUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlICovXG5cblxuXG4oZnVuY3Rpb24gKCkge1xuXG5cdCd1c2Ugc3RyaWN0JztcblxuXHR2YXIgYWN0aXZlUG9pbnRlcnMsXG5cdFx0bnVtQWN0aXZlUG9pbnRlcnMsXG5cdFx0cmVjZW50VG91Y2hTdGFydHMsXG5cdFx0bW91c2VEZWZhdWx0cyxcblx0XHRtb3VzZUV2ZW50cyxcblx0XHRpLFxuXHRcdHNldFVwTW91c2VFdmVudCxcblx0XHRjcmVhdGVVSUV2ZW50LFxuXHRcdGNyZWF0ZUV2ZW50LFxuXHRcdGNyZWF0ZU1vdXNlUHJveHlFdmVudCxcblx0XHRtb3VzZUV2ZW50SXNTaW11bGF0ZWQsXG5cdFx0Y3JlYXRlVG91Y2hQcm94eUV2ZW50LFxuXHRcdGJ1dHRvbnNNYXAsXG5cdFx0cG9pbnRlckV2ZW50UHJvcGVydGllcztcblxuXG5cdC8vIFBvaW50ZXIgZXZlbnRzIHN1cHBvcnRlZD8gR3JlYXQsIG5vdGhpbmcgdG8gZG8sIGxldCdzIGdvIGhvbWVcblx0aWYgKCB3aW5kb3cub25wb2ludGVyZG93biAhPT0gdW5kZWZpbmVkICkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdHBvaW50ZXJFdmVudFByb3BlcnRpZXMgPSAnc2NyZWVuWCBzY3JlZW5ZIGNsaWVudFggY2xpZW50WSBjdHJsS2V5IHNoaWZ0S2V5IGFsdEtleSBtZXRhS2V5IHJlbGF0ZWRUYXJnZXQgZGV0YWlsIGJ1dHRvbiBidXR0b25zIHBvaW50ZXJJZCBwb2ludGVyVHlwZSB3aWR0aCBoZWlnaHQgcHJlc3N1cmUgdGlsdFggdGlsdFkgaXNQcmltYXJ5Jy5zcGxpdCggJyAnICk7XG5cblx0Ly8gQ2FuIHdlIGNyZWF0ZSBldmVudHMgdXNpbmcgdGhlIE1vdXNlRXZlbnQgY29uc3RydWN0b3I/IElmIHNvLCBncmF2eVxuXHR0cnkge1xuXHRcdGkgPSBuZXcgVUlFdmVudCggJ3Rlc3QnICk7XG5cblx0XHRjcmVhdGVVSUV2ZW50ID0gZnVuY3Rpb24gKCB0eXBlLCBidWJibGVzICkge1xuXHRcdFx0cmV0dXJuIG5ldyBVSUV2ZW50KCB0eXBlLCB7IHZpZXc6IHdpbmRvdywgYnViYmxlczogYnViYmxlcyB9KTtcblx0XHR9O1xuXG5cdC8vIG90aGVyd2lzZSB3ZSBuZWVkIHRvIGRvIHRoaW5ncyBvbGRzY2hvb2xcblx0fSBjYXRjaCAoIGVyciApIHtcblx0XHRpZiAoIGRvY3VtZW50LmNyZWF0ZUV2ZW50ICkge1xuXHRcdFx0Y3JlYXRlVUlFdmVudCA9IGZ1bmN0aW9uICggdHlwZSwgYnViYmxlcyApIHtcblx0XHRcdFx0dmFyIHBvaW50ZXJFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCAnVUlFdmVudHMnICk7XG5cdFx0XHRcdHBvaW50ZXJFdmVudC5pbml0VUlFdmVudCggdHlwZSwgYnViYmxlcywgdHJ1ZSwgd2luZG93ICk7XG5cblx0XHRcdFx0cmV0dXJuIHBvaW50ZXJFdmVudDtcblx0XHRcdH07XG5cdFx0fVxuXHR9XG5cblx0aWYgKCAhY3JlYXRlVUlFdmVudCApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoICdDYW5ub3QgY3JlYXRlIGV2ZW50cy4gWW91IG1heSBiZSB1c2luZyBhbiB1bnN1cHBvcnRlZCBicm93c2VyLicgKTtcblx0fVxuXG5cdGNyZWF0ZUV2ZW50ID0gZnVuY3Rpb24gKCB0eXBlLCBvcmlnaW5hbEV2ZW50LCBwYXJhbXMsIG5vQnViYmxlICkge1xuXHRcdHZhciBwb2ludGVyRXZlbnQsIGk7XG5cblx0XHRwb2ludGVyRXZlbnQgPSBjcmVhdGVVSUV2ZW50KCB0eXBlLCAhbm9CdWJibGUgKTtcblxuXHRcdGkgPSBwb2ludGVyRXZlbnRQcm9wZXJ0aWVzLmxlbmd0aDtcblx0XHR3aGlsZSAoIGktLSApIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggcG9pbnRlckV2ZW50LCBwb2ludGVyRXZlbnRQcm9wZXJ0aWVzW2ldLCB7XG5cdFx0XHRcdHZhbHVlOiBwYXJhbXNbIHBvaW50ZXJFdmVudFByb3BlcnRpZXNbaV0gXSxcblx0XHRcdFx0d3JpdGFibGU6IGZhbHNlXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoIHBvaW50ZXJFdmVudCwgJ29yaWdpbmFsRXZlbnQnLCB7XG5cdFx0XHR2YWx1ZTogb3JpZ2luYWxFdmVudCxcblx0XHRcdHdyaXRhYmxlOiBmYWxzZVxuXHRcdH0pO1xuXG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KCBwb2ludGVyRXZlbnQsICdwcmV2ZW50RGVmYXVsdCcsIHtcblx0XHRcdHZhbHVlOiBwcmV2ZW50RGVmYXVsdCxcblx0XHRcdHdyaXRhYmxlOiBmYWxzZVxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHBvaW50ZXJFdmVudDtcblx0fTtcblxuXG5cdC8vIGFkZCBwb2ludGVyRW5hYmxlZCBwcm9wZXJ0eSB0byBuYXZpZ2F0b3Jcblx0bmF2aWdhdG9yLnBvaW50ZXJFbmFibGVkID0gdHJ1ZTtcblxuXG5cdC8vIElmIHdlJ3JlIGluIElFMTAsIHRoZXNlIGV2ZW50cyBhcmUgYWxyZWFkeSBzdXBwb3J0ZWQsIGV4Y2VwdCBwcmVmaXhlZFxuXHRpZiAoIHdpbmRvdy5vbm1zcG9pbnRlcmRvd24gIT09IHVuZGVmaW5lZCApIHtcblx0XHRbICdNU1BvaW50ZXJEb3duJywgJ01TUG9pbnRlclVwJywgJ01TUG9pbnRlckNhbmNlbCcsICdNU1BvaW50ZXJNb3ZlJywgJ01TUG9pbnRlck92ZXInLCAnTVNQb2ludGVyT3V0JyBdLmZvckVhY2goIGZ1bmN0aW9uICggcHJlZml4ZWQgKSB7XG5cdFx0XHR2YXIgdW5wcmVmaXhlZDtcblxuXHRcdFx0dW5wcmVmaXhlZCA9IHByZWZpeGVkLnRvTG93ZXJDYXNlKCkuc3Vic3RyaW5nKCAyICk7XG5cblx0XHRcdC8vIHBvaW50ZXJlbnRlciBhbmQgcG9pbnRlcmxlYXZlIGFyZSBzcGVjaWFsIGNhc2VzXG5cdFx0XHRpZiAoIHVucHJlZml4ZWQgPT09ICdwb2ludGVyb3ZlcicgfHwgdW5wcmVmaXhlZCA9PT0gJ3BvaW50ZXJvdXQnICkge1xuXHRcdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggcHJlZml4ZWQsIGZ1bmN0aW9uICggb3JpZ2luYWxFdmVudCApIHtcblx0XHRcdFx0XHR2YXIgdW5wcmVmaXhlZEV2ZW50ID0gY3JlYXRlRXZlbnQoIHVucHJlZml4ZWQsIG9yaWdpbmFsRXZlbnQsIG9yaWdpbmFsRXZlbnQsIGZhbHNlICk7XG5cdFx0XHRcdFx0b3JpZ2luYWxFdmVudC50YXJnZXQuZGlzcGF0Y2hFdmVudCggdW5wcmVmaXhlZEV2ZW50ICk7XG5cblx0XHRcdFx0XHRpZiAoICFvcmlnaW5hbEV2ZW50LnRhcmdldC5jb250YWlucyggb3JpZ2luYWxFdmVudC5yZWxhdGVkVGFyZ2V0ICkgKSB7XG5cdFx0XHRcdFx0XHR1bnByZWZpeGVkRXZlbnQgPSBjcmVhdGVFdmVudCggKCB1bnByZWZpeGVkID09PSAncG9pbnRlcm92ZXInID8gJ3BvaW50ZXJlbnRlcicgOiAncG9pbnRlcmxlYXZlJyApLCBvcmlnaW5hbEV2ZW50LCBvcmlnaW5hbEV2ZW50LCB0cnVlICk7XG5cdFx0XHRcdFx0XHRvcmlnaW5hbEV2ZW50LnRhcmdldC5kaXNwYXRjaEV2ZW50KCB1bnByZWZpeGVkRXZlbnQgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sIHRydWUgKTtcblx0XHRcdH1cblxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCBwcmVmaXhlZCwgZnVuY3Rpb24gKCBvcmlnaW5hbEV2ZW50ICkge1xuXHRcdFx0XHRcdHZhciB1bnByZWZpeGVkRXZlbnQgPSBjcmVhdGVFdmVudCggdW5wcmVmaXhlZCwgb3JpZ2luYWxFdmVudCwgb3JpZ2luYWxFdmVudCwgZmFsc2UgKTtcblx0XHRcdFx0XHRvcmlnaW5hbEV2ZW50LnRhcmdldC5kaXNwYXRjaEV2ZW50KCB1bnByZWZpeGVkRXZlbnQgKTtcblx0XHRcdFx0fSwgdHJ1ZSApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0bmF2aWdhdG9yLm1heFRvdWNoUG9pbnRzID0gbmF2aWdhdG9yLm1zTWF4VG91Y2hQb2ludHM7XG5cblx0XHQvLyBOb3RoaW5nIG1vcmUgdG8gZG8uXG5cdFx0cmV0dXJuO1xuXHR9XG5cblxuXHQvLyBodHRwczovL2R2Y3MudzMub3JnL2hnL3BvaW50ZXJldmVudHMvcmF3LWZpbGUvdGlwL3BvaW50ZXJFdmVudHMuaHRtbCNkZm4tY2hvcmRlZC1idXR0b25zXG5cdGJ1dHRvbnNNYXAgPSB7XG5cdFx0MDogMSxcblx0XHQxOiA0LFxuXHRcdDI6IDJcblx0fTtcblxuXHRjcmVhdGVNb3VzZVByb3h5RXZlbnQgPSBmdW5jdGlvbiAoIHR5cGUsIG9yaWdpbmFsRXZlbnQsIG5vQnViYmxlICkge1xuXHRcdHZhciBidXR0b24sIGJ1dHRvbnMsIHByZXNzdXJlLCBwYXJhbXMsIG1vdXNlRXZlbnRQYXJhbXMsIHBvaW50ZXJFdmVudFBhcmFtcztcblxuXHRcdC8vIG5vcm1hbGlzZSBidXR0b24gYW5kIGJ1dHRvbnNcblx0XHRpZiAoIG9yaWdpbmFsRXZlbnQuYnV0dG9ucyAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0YnV0dG9ucyA9IG9yaWdpbmFsRXZlbnQuYnV0dG9ucztcblx0XHRcdGJ1dHRvbiA9ICFvcmlnaW5hbEV2ZW50LmJ1dHRvbnMgPyAtMSA6IG9yaWdpbmFsRXZlbnQuYnV0dG9uO1xuXHRcdH1cblxuXHRcdGVsc2Uge1xuXHRcdFx0aWYgKCBldmVudC5idXR0b24gPT09IDAgJiYgZXZlbnQud2hpY2ggPT09IDAgKSB7XG5cdFx0XHRcdGJ1dHRvbiA9IC0xO1xuXHRcdFx0XHRidXR0b25zID0gMDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGJ1dHRvbiA9IG9yaWdpbmFsRXZlbnQuYnV0dG9uO1xuXHRcdFx0XHRidXR0b25zID0gYnV0dG9uc01hcFsgYnV0dG9uIF07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gUHJlc3N1cmUgaXMgMC41IGZvciBidXR0b25zIGRvd24sIDAgZm9yIG5vIGJ1dHRvbnMgZG93biAodW5sZXNzIHByZXNzdXJlIGlzXG5cdFx0Ly8gcmVwb3J0ZWQsIG9idnMpXG5cdFx0cHJlc3N1cmUgPSBvcmlnaW5hbEV2ZW50LnByZXNzdXJlIHx8IG9yaWdpbmFsRXZlbnQubW96UHJlc3N1cmUgfHwgKCBidXR0b25zID8gMC41IDogMCApO1xuXG5cblx0XHQvLyBUaGlzIGlzIHRoZSBxdWlja2VzdCB3YXkgdG8gY29weSBldmVudCBwYXJhbWV0ZXJzLiBZb3UgY2FuJ3QgZW51bWVyYXRlXG5cdFx0Ly8gb3ZlciBldmVudCBwcm9wZXJ0aWVzIGluIEZpcmVmb3ggKHBvc3NpYmx5IGVsc2V3aGVyZSksIHNvIGEgdHJhZGl0aW9uYWxcblx0XHQvLyBleHRlbmQgZnVuY3Rpb24gd29uJ3Qgd29ya1xuXHRcdHBhcmFtcyA9IHtcblx0XHRcdHNjcmVlblg6ICAgICAgIG9yaWdpbmFsRXZlbnQuc2NyZWVuWCxcblx0XHRcdHNjcmVlblk6ICAgICAgIG9yaWdpbmFsRXZlbnQuc2NyZWVuWSxcblx0XHRcdGNsaWVudFg6ICAgICAgIG9yaWdpbmFsRXZlbnQuY2xpZW50WCxcblx0XHRcdGNsaWVudFk6ICAgICAgIG9yaWdpbmFsRXZlbnQuY2xpZW50WSxcblx0XHRcdGN0cmxLZXk6ICAgICAgIG9yaWdpbmFsRXZlbnQuY3RybEtleSxcblx0XHRcdHNoaWZ0S2V5OiAgICAgIG9yaWdpbmFsRXZlbnQuc2hpZnRLZXksXG5cdFx0XHRhbHRLZXk6ICAgICAgICBvcmlnaW5hbEV2ZW50LmFsdEtleSxcblx0XHRcdG1ldGFLZXk6ICAgICAgIG9yaWdpbmFsRXZlbnQubWV0YUtleSxcblx0XHRcdHJlbGF0ZWRUYXJnZXQ6IG9yaWdpbmFsRXZlbnQucmVsYXRlZFRhcmdldCxcblx0XHRcdGRldGFpbDogICAgICAgIG9yaWdpbmFsRXZlbnQuZGV0YWlsLFxuXHRcdFx0YnV0dG9uOiAgICAgICAgYnV0dG9uLFxuXHRcdFx0YnV0dG9uczogICAgICAgYnV0dG9ucyxcblxuXHRcdFx0cG9pbnRlcklkOiAgICAgMSxcblx0XHRcdHBvaW50ZXJUeXBlOiAgICdtb3VzZScsXG5cdFx0XHR3aWR0aDogICAgICAgICAwLFxuXHRcdFx0aGVpZ2h0OiAgICAgICAgMCxcblx0XHRcdHByZXNzdXJlOiAgICAgIHByZXNzdXJlLFxuXHRcdFx0dGlsdFg6ICAgICAgICAgMCxcblx0XHRcdHRpbHRZOiAgICAgICAgIDAsXG5cdFx0XHRpc1ByaW1hcnk6ICAgICB0cnVlLFxuXG5cdFx0XHRwcmV2ZW50RGVmYXVsdDogcHJldmVudERlZmF1bHRcblx0XHR9O1xuXG5cdFx0cmV0dXJuIGNyZWF0ZUV2ZW50KCB0eXBlLCBvcmlnaW5hbEV2ZW50LCBwYXJhbXMsIG5vQnViYmxlICk7XG5cdH07XG5cblx0Ly8gU29tZSBtb3VzZSBldmVudHMgYXJlIHJlYWwsIG90aGVycyBhcmUgc2ltdWxhdGVkIGJhc2VkIG9uIHRvdWNoIGV2ZW50cy5cblx0Ly8gV2Ugb25seSB3YW50IHRoZSByZWFsIG9uZXMsIG9yIHdlJ2xsIGVuZCB1cCBmaXJpbmcgb3VyIGxvYWQgYXRcblx0Ly8gaW5hcHByb3ByaWF0ZSBtb21lbnRzLlxuXHQvL1xuXHQvLyBTdXJwcmlzaW5nbHksIHRoZSBjb29yZGluYXRlcyBvZiB0aGUgbW91c2UgZXZlbnQgd29uJ3QgZXhhY3RseSBjb3JyZXNwb25kXG5cdC8vIHdpdGggdGhlIHRvdWNoc3RhcnQgdGhhdCBvcmlnaW5hdGVkIHRoZW0sIHNvIHdlIG5lZWQgdG8gYmUgYSBiaXQgZnV6enkuXG5cdGlmICggd2luZG93Lm9udG91Y2hzdGFydCAhPT0gdW5kZWZpbmVkICkge1xuXHRcdG1vdXNlRXZlbnRJc1NpbXVsYXRlZCA9IGZ1bmN0aW9uICggZXZlbnQgKSB7XG5cdFx0XHR2YXIgaSA9IHJlY2VudFRvdWNoU3RhcnRzLmxlbmd0aCwgdGhyZXNob2xkID0gMTAsIHRvdWNoO1xuXHRcdFx0d2hpbGUgKCBpLS0gKSB7XG5cdFx0XHRcdHRvdWNoID0gcmVjZW50VG91Y2hTdGFydHNbaV07XG5cdFx0XHRcdGlmICggTWF0aC5hYnMoIGV2ZW50LmNsaWVudFggLSB0b3VjaC5jbGllbnRYICkgPCB0aHJlc2hvbGQgJiYgTWF0aC5hYnMoIGV2ZW50LmNsaWVudFkgLSB0b3VjaC5jbGllbnRZICkgPCB0aHJlc2hvbGQgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdG1vdXNlRXZlbnRJc1NpbXVsYXRlZCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9O1xuXHR9XG5cblxuXG5cdHNldFVwTW91c2VFdmVudCA9IGZ1bmN0aW9uICggdHlwZSApIHtcblx0XHRpZiAoIHR5cGUgPT09ICdvdmVyJyB8fCB0eXBlID09PSAnb3V0JyApIHtcblx0XHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnbW91c2UnICsgdHlwZSwgZnVuY3Rpb24gKCBvcmlnaW5hbEV2ZW50ICkge1xuXHRcdFx0XHR2YXIgcG9pbnRlckV2ZW50O1xuXG5cdFx0XHRcdGlmICggbW91c2VFdmVudElzU2ltdWxhdGVkKCBvcmlnaW5hbEV2ZW50ICkgKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cG9pbnRlckV2ZW50ID0gY3JlYXRlTW91c2VQcm94eUV2ZW50KCAncG9pbnRlcicgKyB0eXBlLCBvcmlnaW5hbEV2ZW50ICk7XG5cdFx0XHRcdG9yaWdpbmFsRXZlbnQudGFyZ2V0LmRpc3BhdGNoRXZlbnQoIHBvaW50ZXJFdmVudCApO1xuXG5cdFx0XHRcdGlmICggIW9yaWdpbmFsRXZlbnQudGFyZ2V0LmNvbnRhaW5zKCBvcmlnaW5hbEV2ZW50LnJlbGF0ZWRUYXJnZXQgKSApIHtcblx0XHRcdFx0XHRwb2ludGVyRXZlbnQgPSBjcmVhdGVNb3VzZVByb3h5RXZlbnQoICggdHlwZSA9PT0gJ292ZXInID8gJ3BvaW50ZXJlbnRlcicgOiAncG9pbnRlcmxlYXZlJyApLCBvcmlnaW5hbEV2ZW50LCB0cnVlICk7XG5cdFx0XHRcdFx0b3JpZ2luYWxFdmVudC50YXJnZXQuZGlzcGF0Y2hFdmVudCggcG9pbnRlckV2ZW50ICk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGVsc2Uge1xuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZScgKyB0eXBlLCBmdW5jdGlvbiAoIG9yaWdpbmFsRXZlbnQgKSB7XG5cdFx0XHRcdHZhciBwb2ludGVyRXZlbnQ7XG5cblx0XHRcdFx0aWYgKCBtb3VzZUV2ZW50SXNTaW11bGF0ZWQoIG9yaWdpbmFsRXZlbnQgKSApIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRwb2ludGVyRXZlbnQgPSBjcmVhdGVNb3VzZVByb3h5RXZlbnQoICdwb2ludGVyJyArIHR5cGUsIG9yaWdpbmFsRXZlbnQgKTtcblx0XHRcdFx0b3JpZ2luYWxFdmVudC50YXJnZXQuZGlzcGF0Y2hFdmVudCggcG9pbnRlckV2ZW50ICk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG5cblx0WyAnZG93bicsICd1cCcsICdvdmVyJywgJ291dCcsICdtb3ZlJyBdLmZvckVhY2goIGZ1bmN0aW9uICggZXZlbnRUeXBlICkge1xuXHRcdHNldFVwTW91c2VFdmVudCggZXZlbnRUeXBlICk7XG5cdH0pO1xuXG5cblxuXG5cblx0Ly8gVG91Y2ggZXZlbnRzOlxuXHRpZiAoIHdpbmRvdy5vbnRvdWNoc3RhcnQgIT09IHVuZGVmaW5lZCApIHtcblx0XHQvLyBTZXQgdXAgYSByZWdpc3RyeSBvZiBjdXJyZW50IHRvdWNoZXNcblx0XHRhY3RpdmVQb2ludGVycyA9IHt9O1xuXHRcdG51bUFjdGl2ZVBvaW50ZXJzID0gMDtcblxuXHRcdC8vIE1haW50YWluIGEgbGlzdCBvZiByZWNlbnQgdG91Y2hzdGFydHMsIHNvIHdlIGNhbiBlbGltaW5hdGUgc2ltdWxhdGVcblx0XHQvLyBtb3VzZSBldmVudHMgbGF0ZXJcblx0XHRyZWNlbnRUb3VjaFN0YXJ0cyA9IFtdO1xuXG5cdFx0Y3JlYXRlVG91Y2hQcm94eUV2ZW50ID0gZnVuY3Rpb24gKCB0eXBlLCBvcmlnaW5hbEV2ZW50LCB0b3VjaCwgbm9CdWJibGUsIHJlbGF0ZWRUYXJnZXQgKSB7XG5cdFx0XHR2YXIgcGFyYW1zO1xuXG5cdFx0XHRwYXJhbXMgPSB7XG5cdFx0XHRcdHNjcmVlblg6ICAgICAgIG9yaWdpbmFsRXZlbnQuc2NyZWVuWCxcblx0XHRcdFx0c2NyZWVuWTogICAgICAgb3JpZ2luYWxFdmVudC5zY3JlZW5ZLFxuXHRcdFx0XHRjbGllbnRYOiAgICAgICB0b3VjaC5jbGllbnRYLFxuXHRcdFx0XHRjbGllbnRZOiAgICAgICB0b3VjaC5jbGllbnRZLFxuXHRcdFx0XHRjdHJsS2V5OiAgICAgICBvcmlnaW5hbEV2ZW50LmN0cmxLZXksXG5cdFx0XHRcdHNoaWZ0S2V5OiAgICAgIG9yaWdpbmFsRXZlbnQuc2hpZnRLZXksXG5cdFx0XHRcdGFsdEtleTogICAgICAgIG9yaWdpbmFsRXZlbnQuYWx0S2V5LFxuXHRcdFx0XHRtZXRhS2V5OiAgICAgICBvcmlnaW5hbEV2ZW50Lm1ldGFLZXksXG5cdFx0XHRcdHJlbGF0ZWRUYXJnZXQ6IHJlbGF0ZWRUYXJnZXQgfHwgb3JpZ2luYWxFdmVudC5yZWxhdGVkVGFyZ2V0LCAvLyBUT0RPIGlzIHRoaXMgcmlnaHQ/IGFsc286IG1vdXNlZW50ZXIvbGVhdmU/XG5cdFx0XHRcdGRldGFpbDogICAgICAgIG9yaWdpbmFsRXZlbnQuZGV0YWlsLFxuXHRcdFx0XHRidXR0b246ICAgICAgICAwLFxuXHRcdFx0XHRidXR0b25zOiAgICAgICAxLFxuXG5cdFx0XHRcdHBvaW50ZXJJZDogICAgIHRvdWNoLmlkZW50aWZpZXIgKyAyLCAvLyBlbnN1cmUgbm8gY29sbGlzaW9ucyBiZXR3ZWVuIHRvdWNoIGFuZCBtb3VzZSBwb2ludGVyIElEc1xuXHRcdFx0XHRwb2ludGVyVHlwZTogICAndG91Y2gnLFxuXHRcdFx0XHR3aWR0aDogICAgICAgICAyMCwgLy8gcm91Z2hseSBob3cgZmF0IHBlb3BsZSdzIGZpbmdlcnMgYXJlXG5cdFx0XHRcdGhlaWdodDogICAgICAgIDIwLFxuXHRcdFx0XHRwcmVzc3VyZTogICAgICAwLjUsXG5cdFx0XHRcdHRpbHRYOiAgICAgICAgIDAsXG5cdFx0XHRcdHRpbHRZOiAgICAgICAgIDAsXG5cdFx0XHRcdGlzUHJpbWFyeTogICAgIGFjdGl2ZVBvaW50ZXJzWyB0b3VjaC5pZGVudGlmaWVyIF0uaXNQcmltYXJ5LFxuXG5cdFx0XHRcdHByZXZlbnREZWZhdWx0OiBwcmV2ZW50RGVmYXVsdFxuXHRcdFx0fTtcblxuXHRcdFx0cmV0dXJuIGNyZWF0ZUV2ZW50KCB0eXBlLCBvcmlnaW5hbEV2ZW50LCBwYXJhbXMsIG5vQnViYmxlICk7XG5cdFx0fTtcblxuXHRcdC8vIHRvdWNoc3RhcnRcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXHRcdFx0dmFyIHRvdWNoZXMsIHByb2Nlc3NUb3VjaDtcblxuXHRcdFx0dG91Y2hlcyA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzO1xuXG5cdFx0XHRwcm9jZXNzVG91Y2ggPSBmdW5jdGlvbiAoIHRvdWNoICkge1xuXHRcdFx0XHR2YXIgcG9pbnRlcmRvd25FdmVudCwgcG9pbnRlcm92ZXJFdmVudCwgcG9pbnRlcmVudGVyRXZlbnQsIHBvaW50ZXI7XG5cblx0XHRcdFx0cG9pbnRlciA9IHtcblx0XHRcdFx0XHR0YXJnZXQ6IHRvdWNoLnRhcmdldCxcblx0XHRcdFx0XHRpc1ByaW1hcnk6IG51bUFjdGl2ZVBvaW50ZXJzID8gZmFsc2UgOiB0cnVlXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0YWN0aXZlUG9pbnRlcnNbIHRvdWNoLmlkZW50aWZpZXIgXSA9IHBvaW50ZXI7XG5cdFx0XHRcdG51bUFjdGl2ZVBvaW50ZXJzICs9IDE7XG5cblx0XHRcdFx0cG9pbnRlcmRvd25FdmVudCA9IGNyZWF0ZVRvdWNoUHJveHlFdmVudCggJ3BvaW50ZXJkb3duJywgZXZlbnQsIHRvdWNoICk7XG5cdFx0XHRcdHBvaW50ZXJvdmVyRXZlbnQgPSBjcmVhdGVUb3VjaFByb3h5RXZlbnQoICdwb2ludGVyb3ZlcicsIGV2ZW50LCB0b3VjaCApO1xuXHRcdFx0XHRwb2ludGVyZW50ZXJFdmVudCA9IGNyZWF0ZVRvdWNoUHJveHlFdmVudCggJ3BvaW50ZXJlbnRlcicsIGV2ZW50LCB0b3VjaCwgdHJ1ZSApO1xuXG5cdFx0XHRcdHRvdWNoLnRhcmdldC5kaXNwYXRjaEV2ZW50KCBwb2ludGVyb3ZlckV2ZW50ICk7XG5cdFx0XHRcdHRvdWNoLnRhcmdldC5kaXNwYXRjaEV2ZW50KCBwb2ludGVyZW50ZXJFdmVudCApO1xuXHRcdFx0XHR0b3VjaC50YXJnZXQuZGlzcGF0Y2hFdmVudCggcG9pbnRlcmRvd25FdmVudCApO1xuXG5cdFx0XHRcdC8vIHdlIG5lZWQgdG8ga2VlcCB0cmFjayBvZiByZWNlbnQgdG91Y2hzdGFydCBldmVudHMsIHNvIHdlIGNhbiB0ZXN0XG5cdFx0XHRcdC8vIHdoZXRoZXIgbGF0ZXIgbW91c2UgZXZlbnRzIGFyZSBzaW11bGF0ZWRcblx0XHRcdFx0cmVjZW50VG91Y2hTdGFydHMucHVzaCggdG91Y2ggKTtcblx0XHRcdFx0c2V0VGltZW91dCggZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHZhciBpbmRleCA9IHJlY2VudFRvdWNoU3RhcnRzLmluZGV4T2YoIHRvdWNoICk7XG5cdFx0XHRcdFx0aWYgKCBpbmRleCAhPT0gLTEgKSB7XG5cdFx0XHRcdFx0XHRyZWNlbnRUb3VjaFN0YXJ0cy5zcGxpY2UoIGluZGV4LCAxICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LCAxNTAwICk7XG5cdFx0XHR9O1xuXG5cdFx0XHRmb3IgKCBpPTA7IGk8dG91Y2hlcy5sZW5ndGg7IGkrPTEgKSB7XG5cdFx0XHRcdHByb2Nlc3NUb3VjaCggdG91Y2hlc1tpXSApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly8gdG91Y2htb3ZlXG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaG1vdmUnLCBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXHRcdFx0dmFyIHRvdWNoZXMsIHByb2Nlc3NUb3VjaDtcblxuXHRcdFx0dG91Y2hlcyA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzO1xuXG5cdFx0XHRwcm9jZXNzVG91Y2ggPSBmdW5jdGlvbiAoIHRvdWNoICkge1xuXHRcdFx0XHR2YXIgcG9pbnRlcm1vdmVFdmVudCwgcG9pbnRlcm92ZXJFdmVudCwgcG9pbnRlcm91dEV2ZW50LCBwb2ludGVyZW50ZXJFdmVudCwgcG9pbnRlcmxlYXZlRXZlbnQsIHBvaW50ZXIsIHByZXZpb3VzVGFyZ2V0LCBhY3R1YWxUYXJnZXQ7XG5cblx0XHRcdFx0cG9pbnRlciA9IGFjdGl2ZVBvaW50ZXJzWyB0b3VjaC5pZGVudGlmaWVyIF07XG5cdFx0XHRcdGFjdHVhbFRhcmdldCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoIHRvdWNoLmNsaWVudFgsIHRvdWNoLmNsaWVudFkgKTtcblxuXHRcdFx0XHRpZiAoIHBvaW50ZXIudGFyZ2V0ID09PSBhY3R1YWxUYXJnZXQgKSB7XG5cdFx0XHRcdFx0Ly8ganVzdCBmaXJlIGEgdG91Y2htb3ZlIGV2ZW50XG5cdFx0XHRcdFx0cG9pbnRlcm1vdmVFdmVudCA9IGNyZWF0ZVRvdWNoUHJveHlFdmVudCggJ3BvaW50ZXJtb3ZlJywgZXZlbnQsIHRvdWNoICk7XG5cdFx0XHRcdFx0YWN0dWFsVGFyZ2V0LmRpc3BhdGNoRXZlbnQoIHBvaW50ZXJtb3ZlRXZlbnQgKTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXG5cdFx0XHRcdC8vIHRhcmdldCBoYXMgY2hhbmdlZCAtIHdlIG5lZWQgdG8gZmlyZSBhIHBvaW50ZXJvdXQgKGFuZCBwb3NzaWJseSBwb2ludGVybGVhdmUpXG5cdFx0XHRcdC8vIGV2ZW50IG9uIHRoZSBwcmV2aW91cyB0YXJnZXQsIGFuZCBhIHBvaW50ZXJvdmVyIChhbmQgcG9zc2libHkgcG9pbnRlcmVudGVyKVxuXHRcdFx0XHQvLyBldmVudCBvbiB0aGUgY3VycmVudCB0YXJnZXQuIFRoZW4gd2UgZmlyZSB0aGUgcG9pbnRlcm1vdmUgZXZlbnQgb24gdGhlIGN1cnJlbnRcblx0XHRcdFx0Ly8gdGFyZ2V0XG5cblx0XHRcdFx0cHJldmlvdXNUYXJnZXQgPSBwb2ludGVyLnRhcmdldDtcblx0XHRcdFx0cG9pbnRlci50YXJnZXQgPSBhY3R1YWxUYXJnZXQ7XG5cblx0XHRcdFx0Ly8gcG9pbnRlcmxlYXZlXG5cdFx0XHRcdGlmICggIXByZXZpb3VzVGFyZ2V0LmNvbnRhaW5zKCBhY3R1YWxUYXJnZXQgKSApIHtcblx0XHRcdFx0XHQvLyBuZXcgdGFyZ2V0IGlzIG5vdCBhIGNoaWxkIG9mIHByZXZpb3VzIHRhcmdldCwgc28gZmlyZSBwb2ludGVybGVhdmUgb24gcHJldmlvdXNcblx0XHRcdFx0XHRwb2ludGVybGVhdmVFdmVudCA9IGNyZWF0ZVRvdWNoUHJveHlFdmVudCggJ3BvaW50ZXJsZWF2ZScsIGV2ZW50LCB0b3VjaCwgdHJ1ZSwgYWN0dWFsVGFyZ2V0ICk7XG5cdFx0XHRcdFx0cHJldmlvdXNUYXJnZXQuZGlzcGF0Y2hFdmVudCggcG9pbnRlcmxlYXZlRXZlbnQgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIHBvaW50ZXJvdXRcblx0XHRcdFx0cG9pbnRlcm91dEV2ZW50ID0gY3JlYXRlVG91Y2hQcm94eUV2ZW50KCAncG9pbnRlcm91dCcsIGV2ZW50LCB0b3VjaCwgZmFsc2UgKTtcblx0XHRcdFx0cHJldmlvdXNUYXJnZXQuZGlzcGF0Y2hFdmVudCggcG9pbnRlcm91dEV2ZW50ICk7XG5cblx0XHRcdFx0Ly8gcG9pbnRlcm1vdmVcblx0XHRcdFx0cG9pbnRlcm1vdmVFdmVudCA9IGNyZWF0ZVRvdWNoUHJveHlFdmVudCggJ3BvaW50ZXJtb3ZlJywgZXZlbnQsIHRvdWNoLCBmYWxzZSApO1xuXHRcdFx0XHRhY3R1YWxUYXJnZXQuZGlzcGF0Y2hFdmVudCggcG9pbnRlcm1vdmVFdmVudCApO1xuXG5cdFx0XHRcdC8vIHBvaW50ZXJvdmVyXG5cdFx0XHRcdHBvaW50ZXJvdmVyRXZlbnQgPSBjcmVhdGVUb3VjaFByb3h5RXZlbnQoICdwb2ludGVyb3ZlcicsIGV2ZW50LCB0b3VjaCwgZmFsc2UgKTtcblx0XHRcdFx0YWN0dWFsVGFyZ2V0LmRpc3BhdGNoRXZlbnQoIHBvaW50ZXJvdmVyRXZlbnQgKTtcblxuXHRcdFx0XHQvLyBwb2ludGVyZW50ZXJcblx0XHRcdFx0aWYgKCAhYWN0dWFsVGFyZ2V0LmNvbnRhaW5zKCBwcmV2aW91c1RhcmdldCApICkge1xuXHRcdFx0XHRcdC8vIHByZXZpb3VzIHRhcmdldCBpcyBub3QgYSBjaGlsZCBvZiBjdXJyZW50IHRhcmdldCwgc28gZmlyZSBwb2ludGVyZW50ZXIgb24gY3VycmVudFxuXHRcdFx0XHRcdHBvaW50ZXJlbnRlckV2ZW50ID0gY3JlYXRlVG91Y2hQcm94eUV2ZW50KCAncG9pbnRlcmVudGVyJywgZXZlbnQsIHRvdWNoLCB0cnVlLCBwcmV2aW91c1RhcmdldCApO1xuXHRcdFx0XHRcdGFjdHVhbFRhcmdldC5kaXNwYXRjaEV2ZW50KCBwb2ludGVyZW50ZXJFdmVudCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0XHRmb3IgKCBpPTA7IGk8dG91Y2hlcy5sZW5ndGg7IGkrPTEgKSB7XG5cdFx0XHRcdHByb2Nlc3NUb3VjaCggdG91Y2hlc1tpXSApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly8gdG91Y2hlbmRcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoZW5kJywgZnVuY3Rpb24gKCBldmVudCApIHtcblx0XHRcdHZhciB0b3VjaGVzLCBwcm9jZXNzVG91Y2g7XG5cblx0XHRcdHRvdWNoZXMgPSBldmVudC5jaGFuZ2VkVG91Y2hlcztcblxuXHRcdFx0cHJvY2Vzc1RvdWNoID0gZnVuY3Rpb24gKCB0b3VjaCApIHtcblx0XHRcdFx0dmFyIHBvaW50ZXJ1cEV2ZW50LCBwb2ludGVyb3V0RXZlbnQsIHBvaW50ZXJsZWF2ZUV2ZW50LCBwcmV2aW91c1RhcmdldCwgYWN0dWFsVGFyZ2V0O1xuXG5cdFx0XHRcdGFjdHVhbFRhcmdldCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoIHRvdWNoLmNsaWVudFgsIHRvdWNoLmNsaWVudFkgKTtcblxuXHRcdFx0XHRwb2ludGVydXBFdmVudCA9IGNyZWF0ZVRvdWNoUHJveHlFdmVudCggJ3BvaW50ZXJ1cCcsIGV2ZW50LCB0b3VjaCwgZmFsc2UgKTtcblx0XHRcdFx0cG9pbnRlcm91dEV2ZW50ID0gY3JlYXRlVG91Y2hQcm94eUV2ZW50KCAncG9pbnRlcm91dCcsIGV2ZW50LCB0b3VjaCwgZmFsc2UgKTtcblx0XHRcdFx0cG9pbnRlcmxlYXZlRXZlbnQgPSBjcmVhdGVUb3VjaFByb3h5RXZlbnQoICdwb2ludGVybGVhdmUnLCBldmVudCwgdG91Y2gsIHRydWUgKTtcblxuXHRcdFx0XHRkZWxldGUgYWN0aXZlUG9pbnRlcnNbIHRvdWNoLmlkZW50aWZpZXIgXTtcblx0XHRcdFx0bnVtQWN0aXZlUG9pbnRlcnMgLT0gMTtcblxuXHRcdFx0XHRhY3R1YWxUYXJnZXQuZGlzcGF0Y2hFdmVudCggcG9pbnRlcnVwRXZlbnQgKTtcblx0XHRcdFx0YWN0dWFsVGFyZ2V0LmRpc3BhdGNoRXZlbnQoIHBvaW50ZXJvdXRFdmVudCApO1xuXHRcdFx0XHRhY3R1YWxUYXJnZXQuZGlzcGF0Y2hFdmVudCggcG9pbnRlcmxlYXZlRXZlbnQgKTtcblx0XHRcdH07XG5cblx0XHRcdGZvciAoIGk9MDsgaTx0b3VjaGVzLmxlbmd0aDsgaSs9MSApIHtcblx0XHRcdFx0cHJvY2Vzc1RvdWNoKCB0b3VjaGVzW2ldICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQvLyB0b3VjaGNhbmNlbFxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hjYW5jZWwnLCBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXHRcdFx0dmFyIHRvdWNoZXMsIHByb2Nlc3NUb3VjaDtcblxuXHRcdFx0dG91Y2hlcyA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzO1xuXG5cdFx0XHRwcm9jZXNzVG91Y2ggPSBmdW5jdGlvbiAoIHRvdWNoICkge1xuXHRcdFx0XHR2YXIgcG9pbnRlcmNhbmNlbEV2ZW50LCBwb2ludGVyb3V0RXZlbnQsIHBvaW50ZXJsZWF2ZUV2ZW50O1xuXG5cdFx0XHRcdHBvaW50ZXJjYW5jZWxFdmVudCA9IGNyZWF0ZVRvdWNoUHJveHlFdmVudCggJ3BvaW50ZXJjYW5jZWwnLCBldmVudCwgdG91Y2ggKTtcblx0XHRcdFx0cG9pbnRlcm91dEV2ZW50ID0gY3JlYXRlVG91Y2hQcm94eUV2ZW50KCAncG9pbnRlcm91dCcsIGV2ZW50LCB0b3VjaCApO1xuXHRcdFx0XHRwb2ludGVybGVhdmVFdmVudCA9IGNyZWF0ZVRvdWNoUHJveHlFdmVudCggJ3BvaW50ZXJsZWF2ZScsIGV2ZW50LCB0b3VjaCApO1xuXG5cdFx0XHRcdHRvdWNoLnRhcmdldC5kaXNwYXRjaEV2ZW50KCBwb2ludGVyY2FuY2VsRXZlbnQgKTtcblx0XHRcdFx0dG91Y2gudGFyZ2V0LmRpc3BhdGNoRXZlbnQoIHBvaW50ZXJvdXRFdmVudCApO1xuXHRcdFx0XHR0b3VjaC50YXJnZXQuZGlzcGF0Y2hFdmVudCggcG9pbnRlcmxlYXZlRXZlbnQgKTtcblxuXHRcdFx0XHRkZWxldGUgYWN0aXZlUG9pbnRlcnNbIHRvdWNoLmlkZW50aWZpZXIgXTtcblx0XHRcdFx0bnVtQWN0aXZlUG9pbnRlcnMgLT0gMTtcblx0XHRcdH07XG5cblx0XHRcdGZvciAoIGk9MDsgaTx0b3VjaGVzLmxlbmd0aDsgaSs9MSApIHtcblx0XHRcdFx0cHJvY2Vzc1RvdWNoKCB0b3VjaGVzW2ldICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXG5cdC8vIFNpbmdsZSBwcmV2ZW50RGVmYXVsdCBmdW5jdGlvbiAtIG5vIHBvaW50IHJlY3JlYXRpbmcgaXQgb3ZlciBhbmQgb3ZlclxuXHRmdW5jdGlvbiBwcmV2ZW50RGVmYXVsdCAoKSB7XG5cdFx0dGhpcy5vcmlnaW5hbEV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdH1cblxuXHQvLyBUT0RPIHN0b3BQcm9wYWdhdGlvbj9cblxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBpZiAoc2VsZi5mZXRjaCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgZnVuY3Rpb24gSGVhZGVycyhoZWFkZXJzKSB7XG4gICAgdGhpcy5tYXAgPSB7fVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgaWYgKGhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzKSB7XG4gICAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24obmFtZSwgdmFsdWVzKSB7XG4gICAgICAgIHZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgc2VsZi5hcHBlbmQobmFtZSwgdmFsdWUpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgfSBlbHNlIGlmIChoZWFkZXJzKSB7XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhoZWFkZXJzKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgc2VsZi5hcHBlbmQobmFtZSwgaGVhZGVyc1tuYW1lXSlcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICBuYW1lID0gbmFtZS50b0xvd2VyQ2FzZSgpXG4gICAgdmFyIGxpc3QgPSB0aGlzLm1hcFtuYW1lXVxuICAgIGlmICghbGlzdCkge1xuICAgICAgbGlzdCA9IFtdXG4gICAgICB0aGlzLm1hcFtuYW1lXSA9IGxpc3RcbiAgICB9XG4gICAgbGlzdC5wdXNoKHZhbHVlKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGVbJ2RlbGV0ZSddID0gZnVuY3Rpb24obmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLm1hcFtuYW1lLnRvTG93ZXJDYXNlKCldXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIHZhbHVlcyA9IHRoaXMubWFwW25hbWUudG9Mb3dlckNhc2UoKV1cbiAgICByZXR1cm4gdmFsdWVzID8gdmFsdWVzWzBdIDogbnVsbFxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZ2V0QWxsID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLm1hcFtuYW1lLnRvTG93ZXJDYXNlKCldIHx8IFtdXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwLmhhc093blByb3BlcnR5KG5hbWUudG9Mb3dlckNhc2UoKSlcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgdGhpcy5tYXBbbmFtZS50b0xvd2VyQ2FzZSgpXSA9IFt2YWx1ZV1cbiAgfVxuXG4gIC8vIEluc3RlYWQgb2YgaXRlcmFibGUgZm9yIG5vdy5cbiAgSGVhZGVycy5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGhpcy5tYXApLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgY2FsbGJhY2sobmFtZSwgc2VsZi5tYXBbbmFtZV0pXG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbnN1bWVkKGJvZHkpIHtcbiAgICBpZiAoYm9keS5ib2R5VXNlZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpKVxuICAgIH1cbiAgICBib2R5LmJvZHlVc2VkID0gdHJ1ZVxuICB9XG5cbiAgZnVuY3Rpb24gZmlsZVJlYWRlclJlYWR5KHJlYWRlcikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzb2x2ZShyZWFkZXIucmVzdWx0KVxuICAgICAgfVxuICAgICAgcmVhZGVyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KHJlYWRlci5lcnJvcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc0FycmF5QnVmZmVyKGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKVxuICAgIHJldHVybiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc1RleHQoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgcmVhZGVyLnJlYWRBc1RleHQoYmxvYilcbiAgICByZXR1cm4gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgfVxuXG4gIHZhciBzdXBwb3J0ID0ge1xuICAgIGJsb2I6ICdGaWxlUmVhZGVyJyBpbiBzZWxmICYmICdCbG9iJyBpbiBzZWxmICYmIChmdW5jdGlvbigpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIG5ldyBCbG9iKCk7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSkoKSxcbiAgICBmb3JtRGF0YTogJ0Zvcm1EYXRhJyBpbiBzZWxmXG4gIH1cblxuICBmdW5jdGlvbiBCb2R5KCkge1xuICAgIHRoaXMuYm9keVVzZWQgPSBmYWxzZVxuXG4gICAgaWYgKHN1cHBvcnQuYmxvYikge1xuICAgICAgdGhpcy5faW5pdEJvZHkgPSBmdW5jdGlvbihib2R5KSB7XG4gICAgICAgIHRoaXMuX2JvZHlJbml0ID0gYm9keVxuICAgICAgICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5XG4gICAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5ibG9iICYmIEJsb2IucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgICB0aGlzLl9ib2R5QmxvYiA9IGJvZHlcbiAgICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmZvcm1EYXRhICYmIEZvcm1EYXRhLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgICAgdGhpcy5fYm9keUZvcm1EYXRhID0gYm9keVxuICAgICAgICB9IGVsc2UgaWYgKCFib2R5KSB7XG4gICAgICAgICAgdGhpcy5fYm9keVRleHQgPSAnJ1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndW5zdXBwb3J0ZWQgQm9keUluaXQgdHlwZScpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5ibG9iID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5QmxvYilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgYmxvYicpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy5fYm9keVRleHRdKSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmFycmF5QnVmZmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2IoKS50aGVuKHJlYWRCbG9iQXNBcnJheUJ1ZmZlcilcbiAgICAgIH1cblxuICAgICAgdGhpcy50ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgICAgcmV0dXJuIHJlYWRCbG9iQXNUZXh0KHRoaXMuX2JvZHlCbG9iKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyB0ZXh0JylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlUZXh0KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2luaXRCb2R5ID0gZnVuY3Rpb24oYm9keSkge1xuICAgICAgICB0aGlzLl9ib2R5SW5pdCA9IGJvZHlcbiAgICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keVxuICAgICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuZm9ybURhdGEgJiYgRm9ybURhdGEucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgICB0aGlzLl9ib2R5Rm9ybURhdGEgPSBib2R5XG4gICAgICAgIH0gZWxzZSBpZiAoIWJvZHkpIHtcbiAgICAgICAgICB0aGlzLl9ib2R5VGV4dCA9ICcnXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bnN1cHBvcnRlZCBCb2R5SW5pdCB0eXBlJylcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgcmV0dXJuIHJlamVjdGVkID8gcmVqZWN0ZWQgOiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keVRleHQpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuZm9ybURhdGEpIHtcbiAgICAgIHRoaXMuZm9ybURhdGEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oZGVjb2RlKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuanNvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oSlNPTi5wYXJzZSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLy8gSFRUUCBtZXRob2RzIHdob3NlIGNhcGl0YWxpemF0aW9uIHNob3VsZCBiZSBub3JtYWxpemVkXG4gIHZhciBtZXRob2RzID0gWydERUxFVEUnLCAnR0VUJywgJ0hFQUQnLCAnT1BUSU9OUycsICdQT1NUJywgJ1BVVCddXG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplTWV0aG9kKG1ldGhvZCkge1xuICAgIHZhciB1cGNhc2VkID0gbWV0aG9kLnRvVXBwZXJDYXNlKClcbiAgICByZXR1cm4gKG1ldGhvZHMuaW5kZXhPZih1cGNhc2VkKSA+IC0xKSA/IHVwY2FzZWQgOiBtZXRob2RcbiAgfVxuXG4gIGZ1bmN0aW9uIFJlcXVlc3QodXJsLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgICB0aGlzLnVybCA9IHVybFxuXG4gICAgdGhpcy5jcmVkZW50aWFscyA9IG9wdGlvbnMuY3JlZGVudGlhbHMgfHwgJ29taXQnXG4gICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIHRoaXMubWV0aG9kID0gbm9ybWFsaXplTWV0aG9kKG9wdGlvbnMubWV0aG9kIHx8ICdHRVQnKVxuICAgIHRoaXMubW9kZSA9IG9wdGlvbnMubW9kZSB8fCBudWxsXG4gICAgdGhpcy5yZWZlcnJlciA9IG51bGxcblxuICAgIGlmICgodGhpcy5tZXRob2QgPT09ICdHRVQnIHx8IHRoaXMubWV0aG9kID09PSAnSEVBRCcpICYmIG9wdGlvbnMuYm9keSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQm9keSBub3QgYWxsb3dlZCBmb3IgR0VUIG9yIEhFQUQgcmVxdWVzdHMnKVxuICAgIH1cbiAgICB0aGlzLl9pbml0Qm9keShvcHRpb25zLmJvZHkpXG4gIH1cblxuICBmdW5jdGlvbiBkZWNvZGUoYm9keSkge1xuICAgIHZhciBmb3JtID0gbmV3IEZvcm1EYXRhKClcbiAgICBib2R5LnRyaW0oKS5zcGxpdCgnJicpLmZvckVhY2goZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIGlmIChieXRlcykge1xuICAgICAgICB2YXIgc3BsaXQgPSBieXRlcy5zcGxpdCgnPScpXG4gICAgICAgIHZhciBuYW1lID0gc3BsaXQuc2hpZnQoKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICB2YXIgdmFsdWUgPSBzcGxpdC5qb2luKCc9JykucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgZm9ybS5hcHBlbmQoZGVjb2RlVVJJQ29tcG9uZW50KG5hbWUpLCBkZWNvZGVVUklDb21wb25lbnQodmFsdWUpKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIGZvcm1cbiAgfVxuXG4gIGZ1bmN0aW9uIGhlYWRlcnMoeGhyKSB7XG4gICAgdmFyIGhlYWQgPSBuZXcgSGVhZGVycygpXG4gICAgdmFyIHBhaXJzID0geGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpLnRyaW0oKS5zcGxpdCgnXFxuJylcbiAgICBwYWlycy5mb3JFYWNoKGZ1bmN0aW9uKGhlYWRlcikge1xuICAgICAgdmFyIHNwbGl0ID0gaGVhZGVyLnRyaW0oKS5zcGxpdCgnOicpXG4gICAgICB2YXIga2V5ID0gc3BsaXQuc2hpZnQoKS50cmltKClcbiAgICAgIHZhciB2YWx1ZSA9IHNwbGl0LmpvaW4oJzonKS50cmltKClcbiAgICAgIGhlYWQuYXBwZW5kKGtleSwgdmFsdWUpXG4gICAgfSlcbiAgICByZXR1cm4gaGVhZFxuICB9XG5cbiAgUmVxdWVzdC5wcm90b3R5cGUuZmV0Y2ggPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXNcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICAgICAgaWYgKHNlbGYuY3JlZGVudGlhbHMgPT09ICdjb3JzJykge1xuICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gcmVzcG9uc2VVUkwoKSB7XG4gICAgICAgIGlmICgncmVzcG9uc2VVUkwnIGluIHhocikge1xuICAgICAgICAgIHJldHVybiB4aHIucmVzcG9uc2VVUkxcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEF2b2lkIHNlY3VyaXR5IHdhcm5pbmdzIG9uIGdldFJlc3BvbnNlSGVhZGVyIHdoZW4gbm90IGFsbG93ZWQgYnkgQ09SU1xuICAgICAgICBpZiAoL15YLVJlcXVlc3QtVVJMOi9tLnRlc3QoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSkge1xuICAgICAgICAgIHJldHVybiB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ1gtUmVxdWVzdC1VUkwnKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzdGF0dXMgPSAoeGhyLnN0YXR1cyA9PT0gMTIyMykgPyAyMDQgOiB4aHIuc3RhdHVzXG4gICAgICAgIGlmIChzdGF0dXMgPCAxMDAgfHwgc3RhdHVzID4gNTk5KSB7XG4gICAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgICBzdGF0dXM6IHN0YXR1cyxcbiAgICAgICAgICBzdGF0dXNUZXh0OiB4aHIuc3RhdHVzVGV4dCxcbiAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzKHhociksXG4gICAgICAgICAgdXJsOiByZXNwb25zZVVSTCgpXG4gICAgICAgIH1cbiAgICAgICAgdmFyIGJvZHkgPSAncmVzcG9uc2UnIGluIHhociA/IHhoci5yZXNwb25zZSA6IHhoci5yZXNwb25zZVRleHQ7XG4gICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKGJvZHksIG9wdGlvbnMpKVxuICAgICAgfVxuXG4gICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgfVxuXG4gICAgICB4aHIub3BlbihzZWxmLm1ldGhvZCwgc2VsZi51cmwsIHRydWUpXG4gICAgICBpZiAoJ3Jlc3BvbnNlVHlwZScgaW4geGhyICYmIHN1cHBvcnQuYmxvYikge1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2Jsb2InXG4gICAgICB9XG5cbiAgICAgIHNlbGYuaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUsIHZhbHVlcykge1xuICAgICAgICB2YWx1ZXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIHZhbHVlKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgeGhyLnNlbmQodHlwZW9mIHNlbGYuX2JvZHlJbml0ID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiBzZWxmLl9ib2R5SW5pdClcbiAgICB9KVxuICB9XG5cbiAgQm9keS5jYWxsKFJlcXVlc3QucHJvdG90eXBlKVxuXG4gIGZ1bmN0aW9uIFJlc3BvbnNlKGJvZHlJbml0LCBvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0ge31cbiAgICB9XG5cbiAgICB0aGlzLl9pbml0Qm9keShib2R5SW5pdClcbiAgICB0aGlzLnR5cGUgPSAnZGVmYXVsdCdcbiAgICB0aGlzLnVybCA9IG51bGxcbiAgICB0aGlzLnN0YXR1cyA9IG9wdGlvbnMuc3RhdHVzXG4gICAgdGhpcy5zdGF0dXNUZXh0ID0gb3B0aW9ucy5zdGF0dXNUZXh0XG4gICAgdGhpcy5oZWFkZXJzID0gb3B0aW9ucy5oZWFkZXJzXG4gICAgdGhpcy51cmwgPSBvcHRpb25zLnVybCB8fCAnJ1xuICB9XG5cbiAgQm9keS5jYWxsKFJlc3BvbnNlLnByb3RvdHlwZSlcblxuICBzZWxmLkhlYWRlcnMgPSBIZWFkZXJzO1xuICBzZWxmLlJlcXVlc3QgPSBSZXF1ZXN0O1xuICBzZWxmLlJlc3BvbnNlID0gUmVzcG9uc2U7XG5cbiAgc2VsZi5mZXRjaCA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QodXJsLCBvcHRpb25zKS5mZXRjaCgpXG4gIH1cbiAgc2VsZi5mZXRjaC5wb2x5ZmlsbCA9IHRydWVcbn0pKCk7XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBQb2ludGVyRXZlbnQge1xuICBjb25zdHJ1Y3RvcihldmVudCwgZWxlbWVudCkge1xuICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgIHRoaXMub3JpZ2luYWxFdmVudCA9IGV2ZW50O1xuICB9XG5cbiAgZ2V0IHBvaW50KCkge1xuICAgIC8vIFRPRE86IGRvIHdlIG5lZWQgdG8gcmVjYWxjdWxhdGUgdGhpcyBlYWNoIHRpbWUsIG9yIGNhbiB3ZSBvcHRpbWl6ZSBieSBjaGVja2luZyB1c2luZ1xuICAgIC8vIHNjcm9sbCBldmVudHM/XG4gICAgdmFyIGJvdW5kcyA9IHRoaXMuZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgICAgcG9pbnQgPSB0aGlzLnBhZ2VQb2ludDtcbiAgICBwb2ludC54IC09IGJvdW5kcy5sZWZ0O1xuICAgIHBvaW50LnkgLT0gYm91bmRzLnRvcDtcbiAgICByZXR1cm4gcG9pbnQ7XG4gIH1cblxuICBnZXQgcGFnZVBvaW50KCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHg6IHRoaXMub3JpZ2luYWxFdmVudC5jbGllbnRYLFxuICAgICAgICB5OiB0aGlzLm9yaWdpbmFsRXZlbnQuY2xpZW50WVxuICAgIH07XG4gIH1cblxuICBnZXQgdGltZSgpIHtcbiAgICByZXR1cm4gbmV3IERhdGUodGhpcy5vcmlnaW5hbEV2ZW50LnRpbWVTdGFtcCk7XG4gIH1cblxuICBnZXQgdHlwZSgpIHtcbiAgICByZXR1cm4gdGhpcy5vcmlnaW5hbEV2ZW50LnR5cGU7XG4gIH1cbn1cbiIsImltcG9ydCBldmVudGVtaXR0ZXIyIGZyb20gJ2V2ZW50ZW1pdHRlcjInO1xuaW1wb3J0IFBvaW50ZXJFdmVudCBmcm9tICcuL1BvaW50ZXJFdmVudCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBvaW50ZXJQcm94eSBleHRlbmRzIGV2ZW50ZW1pdHRlcjIuRXZlbnRFbWl0dGVyMiB7XG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIGZpbHRlcikge1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5maWx0ZXIgPSBmaWx0ZXI7XG5cbiAgICBsZXQgcmVsYXlFdmVudCA9IChvcmlnaW5hbEV2ZW50KSA9PiB7XG4gICAgICBpZiAodGhpcy5maWx0ZXIgJiYgdGhpcy5maWx0ZXIob3JpZ2luYWxFdmVudCkgPT09IGZhbHNlKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIHRoaXMuZW1pdChldmVudC50eXBlLCBuZXcgUG9pbnRlckV2ZW50KGV2ZW50LCB0aGlzLmVsZW1lbnQpKTtcbiAgICB9O1xuXG4gICAgZm9yIChsZXQgZXZlbnROYW1lIG9mIFBvaW50ZXJQcm94eS5ldmVudFR5cGVzKSB7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCByZWxheUV2ZW50KTtcbiAgICB9XG4gIH1cblxuICBmb3J3YXJkRXZlbnRzKGVtaXR0ZXIpIHtcbiAgICB0aGlzLm9uQW55KGZ1bmN0aW9uIGZvcndhcmQoZXZlbnQpIHtcbiAgICAgIGVtaXR0ZXIuZW1pdChldmVudC50eXBlLCBldmVudCk7XG4gICAgfSk7XG4gIH1cbn1cblxuUG9pbnRlclByb3h5LmV2ZW50VHlwZXMgPSBbXG4gICdwb2ludGVyb3ZlcicsXG4gICdwb2ludGVyZW50ZXInLFxuICAncG9pbnRlcmRvd24nLFxuICAncG9pbnRlcnVwJyxcbiAgJ3BvaW50ZXJtb3ZlJyxcbiAgJ3BvaW50ZXJjYW5jZWwnLFxuICAncG9pbnRlcm91dCcsXG4gICdwb2ludGVybGVhdmUnLFxuXTtcbiIsImV4cG9ydCBmdW5jdGlvbiByZWRpcmVjdFBhcmVudCh1cmwpIHtcbiAgcGFyZW50LnBvc3RNZXNzYWdlKCd7XCJzdGF0dXNcIjogXCJyZWRpcmVjdFwiLCBcImRvbWFpbl9wYXRoXCI6IFwiJyArIHVybCArICdcIn0nLCAnKicpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGl0bGVEYXRhKGNhbGxiYWNrKSB7XG5cbiAgLy8gU29tZWhvdyBkZXRlcm1pbmVzIGlmIHdlJ3JlIG9uIHRoZSBob21lcGFnZS4gbm8gaWRlYSB3aGF0IHRoZXkgY2FtZSB1cCBoZXJlLi4uXG4gIGZ1bmN0aW9uIGlzSG9tZXBhZ2UoKSB7XG4gICAgdmFyIG1hdGNoID0gUmVnRXhwKCdbPyZdaG9tZXBhZ2U9KFteJl0qKScpLmV4ZWMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG4gICAgcmV0dXJuIG1hdGNoICYmIGRlY29kZVVSSUNvbXBvbmVudChtYXRjaFsxXS5yZXBsYWNlKC9cXCsvZywgJyAnKSk7XG4gIH1cblxuICAvLyBSZWNlaXZlIGRhdGEgaGF2aW5nIHRpdGxlIGFuZCBzdWJ0aXRsZSBhbmQgcHV0IGluIG9uIHRoZSBwYWdlXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgbXNnID0gSlNPTi5wYXJzZShlLmRhdGEpO1xuICAgIGlmIChtc2cuZG9tYWluX3BhdGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgbXNnLmlzSG9tZXBhZ2UgPSBpc0hvbWVwYWdlKCk7XG4gICAgICBjYWxsYmFjayhtc2cpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gQ3JlYXRlIHVuaXF1ZSBjb3ZlciBpZFxuICB2YXIgY292ZXJJZCA9ICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpLnNwbGl0KCcvJylbNF07XG5cbiAgLy8gU2VuZCBpbmZvcm1hdGlvbiB0byBwYXJlbnQgc2F5aW5nIHRoYXQgbG9hZGluZyBvZiB0aGUgaWZyYW1lIGlzIHJlYWR5XG4gIHBhcmVudC5wb3N0TWVzc2FnZSgne1wic3RhdHVzXCI6IFwicmVhZHlcIiwgXCJjb3ZlcklkXCI6IFwiJyArIGNvdmVySWQgKyAnXCJ9JywgJyonKTtcbn1cbiJdfQ==
