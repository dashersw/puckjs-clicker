import EventEmitter from './event-emitter';

export default class StateMachine extends EventEmitter {
  constructor(name, initialState, states, context) {
    super();
    this.name = name;
    this.defaultState = this.currentState = initialState;
    this.states = states;
    this.context = context;
  }

  transition(eventType) {
    //console.log('transition', eventType);
    const currentStateDef = this.states[this.currentState];
    const nextState = currentStateDef.events[eventType];

    if (nextState && this.states[nextState]) {
      if (currentStateDef.exit)
        currentStateDef.exit.call(this, currentStateDef.output);

      this.currentState = nextState;
      // console.log(this.name, 'current state updated to', this.currentState);

      const nextStateDef = this.states[nextState];
      if (nextStateDef.entry)
        nextStateDef.output = nextStateDef.entry.call(
          this,
          this.handleEvent.bind(this)
        );
    } else if (nextState) {
      // console.log('emit nextState', nextState);
      this.emit(nextState);
      this.currentState = this.defaultState;
    } else {
      //this.currentState = this.defaultState;
    }
  }

  handleEvent(eventType) {
    this.transition(eventType);
  }
}
