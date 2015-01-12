export default class PointerEvent {
  constructor(event, element) {
      this.element = element;
      this.originalEvent = event;
  }

  get point() {
    // TODO: do we need to recalculate this each time, or can we optimize by checking using
    // scroll events?
    var bounds = this.element.getBoundingClientRect(),
        point = this.pagePoint;
    point.x -= bounds.left;
    point.y -= bounds.top;
    return point;
  }

  get pagePoint() {
    return {
        x: this.originalEvent.clientX,
        y: this.originalEvent.clientY
    };
  }

  get time() {
    return new Date(this.originalEvent.timeStamp);
  }

  get type() {
    return this.originalEvent.type;
  }
}
