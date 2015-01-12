import eventemitter2 from 'eventemitter2';
import PointerEvent from './PointerEvent';

export default class PointerProxy extends eventemitter2.EventEmitter2 {
  constructor(element, filter) {
    this.element = element;
    this.filter = filter;

    let relayEvent = (originalEvent) => {
      if (this.filter && this.filter(originalEvent) === false)
        return;

      this.emit(event.type, new PointerEvent(event, this.element));
    };

    for (let eventName of PointerProxy.eventTypes) {
      element.addEventListener(eventName, relayEvent);
    }
  }

  forwardEvents(emitter) {
    this.onAny(function forward(event) {
      emitter.emit(event.type, event);
    });
  }
}

PointerProxy.eventTypes = [
  'pointerover',
  'pointerenter',
  'pointerdown',
  'pointerup',
  'pointermove',
  'pointercancel',
  'pointerout',
  'pointerleave',
];
