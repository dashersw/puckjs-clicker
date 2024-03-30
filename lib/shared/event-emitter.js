export default class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  emit(event, args) {
    if (this.events[event]) {
      this.events[event].forEach(listener => listener(args));
    }

    if (event != '*') setTimeout(() => this.emit('*', event, args), 1);
  }

  off(event, listener) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(l => l !== listener);
    }
  }
}
