import EventEmitter from './event-emitter';
import StateMachine from './state-machine';

const shortDuration = 100;
const midDuration = 500;
const longDuration = 1000;

export default class Button extends EventEmitter {
  constructor(context) {
    super();

    this.sm = new StateMachine('Button', 'Idle', stateMap, context);

    setWatch(
      () => {
        this.sm.handleEvent('_button_pressed');
        this.emit('_button_pressed'); // Directly emit the raw event
      },
      BTN,
      {
        repeat: true,
        edge: 'rising',
        debounce: 50,
      }
    );
    setWatch(
      () => {
        this.sm.handleEvent('_button_released');
        this.emit('_button_released'); // Directly emit the raw event
      },
      BTN,
      {
        repeat: true,
        edge: 'falling',
        debounce: 50,
      }
    );

    this.sm.on('*', event => this.emit(event));
  }
}

const stateMap = {
  Idle: {
    events: {
      _button_pressed: '_PressDetected',
    },
    entry: () => {
      LED1.write(0);
      LED2.write(0);
      LED3.write(0);
    },
  },
  _PressDetected: {
    events: {
      _button_released: '_ReleaseBeforeTimeout',
      _timeout_longClick: 'LongClick',
    },
    entry: handleEvent =>
      setTimeout(() => handleEvent('_timeout_longClick'), midDuration),
    exit: clearTimeout,
  },
  _ReleaseBeforeTimeout: {
    events: {
      _button_pressed: '_SecondPressDetected',
      _timeout_click: 'SingleClick',
    },
    entry: handleEvent =>
      setTimeout(() => handleEvent('_timeout_click'), shortDuration),
    exit: clearTimeout,
  },
  _SecondPressDetected: {
    events: {
      _button_released: '_ReleaseSecondPressBeforeTimeout',
      _timeout_longDoubleClick: 'LongDoubleClick',
    },
    entry: handleEvent =>
      setTimeout(() => handleEvent('_timeout_longDoubleClick'), midDuration),
    exit: clearTimeout,
  },
  _ReleaseSecondPressBeforeTimeout: {
    events: {
      _button_pressed: '_ThirdPressDetected',
      _timeout_doubleClick: 'DoubleClick',
    },
    entry: handleEvent =>
      setTimeout(() => handleEvent('_timeout_doubleClick'), shortDuration),
    exit: clearTimeout,
  },
  _ThirdPressDetected: {
    events: {
      _button_released: '_ReleaseThirdPressBeforeTimeout',
      _timeout_longTripleClick: 'LongTripleClick',
    },
    entry: handleEvent =>
      setTimeout(() => handleEvent('_timeout_longTripleClick'), midDuration),
    exit: clearTimeout,
  },
  _ReleaseThirdPressBeforeTimeout: {
    events: {
      _timeout_tripleClick: 'TripleClick',
    },
    entry: handleEvent =>
      setTimeout(() => handleEvent('_timeout_tripleClick'), shortDuration),
    exit: clearTimeout,
  },
};
