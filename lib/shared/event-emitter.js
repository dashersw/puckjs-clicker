export default class EventEmitter {
  constructor() {
    this.events = {};
    this.listenerIds = 0;
    this.listenerMap = {};
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    // Assign an ID to this listener for easier removal
    const id = this.listenerIds++;
    this.listenerMap[id] = { event, listener };

    this.events[event].push(listener);

    // Return a function that cancels this specific listener when called
    return () => this.cancel(id);
  }

  once(event, listener) {
    // Create a reference for the cancel function
    const cancelRef = { fn: null };

    const onceListener = () => {
      /* biome-ignore lint: using arguments intentionally */
      listener.apply(this, arguments);
      // Use the cancel function instead of off to properly clean up
      if (cancelRef.fn) cancelRef.fn();
    };

    // Get the cancel function from on() and store it in the reference
    cancelRef.fn = this.on(event, onceListener);

    // Return the same cancel function so it can be called externally too
    return cancelRef.fn;
  }

  emit(event, args) {
    if (this.events[event]) {
      for (const listener of this.events[event]) {
        listener(args);
      }
    }

    if (event !== '*') setTimeout(() => this.emit('*', event, args), 1);
  }

  off(event, listener) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(l => l !== listener);
    }
  }

  // Cancel a listener by its ID
  cancel(id) {
    if (id in this.listenerMap) {
      const listenerMap = this.listenerMap[id];
      this.off(listenerMap.event, listenerMap.listener);
      delete this.listenerMap[id];
      return true;
    }
    return false;
  }
}
