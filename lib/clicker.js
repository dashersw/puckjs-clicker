import StateMachine from './shared/state-machine';
import Button from './shared/button';

const shortDuration = 100;

function lightUpLED(led, handleEvent) {
  led.write(1);
  setTimeout(() => {
    if (handleEvent) handleEvent('_timeout_idle');
  }, shortDuration);
}

export default class Clicker {
  constructor(context) {
    this.sm = new StateMachine('Click', 'Idle', Clicker.stateMap, context);
    this.sm.int = require('ble_hid_combo');

    context.resetLEDs = () => {
      LED1.write(0);
      LED2.write(0);
      LED3.write(0);
    };

    this.button = new Button(context);

    this.button.on('*', event => {
      this.sm.handleEvent(event);
      this.sm.emit(event);
    });

    context.resetLEDs();
  }
}

Clicker.stateMap = {
  Idle: {
    events: {
      SingleClick: 'SingleClick',
      DoubleClick: 'DoubleClick',
      LongClick: 'LongClick',
      LongDoubleClick: 'LongDoubleClick',
      TripleClick: 'TripleClick',
      LongTripleClick: 'LongTripleClick',
    },
    entry: function () {
      this.context.resetLEDs();
    },
  },
  SingleClick: {
    events: {
      _timeout_idle: 'Idle',
    },
    entry: function (handleEvent) {
      lightUpLED(LED1, handleEvent);

      switch (this.context.mode) {
        case 'pageupdown':
          this.context.enableHid && this.int.tapKey(this.int.KEY.PAGE_DOWN);
          break;
        case 'rightleft':
          this.context.enableHid && this.int.tapKey(this.int.KEY.RIGHT);
      }
    },
  },
  DoubleClick: {
    events: {
      _timeout_idle: 'Idle',
    },
    entry: function (handleEvent) {
      lightUpLED(LED2, handleEvent);

      switch (this.context.mode) {
        case 'pageupdown':
          this.context.enableHid && this.int.tapKey(this.int.KEY.PAGE_UP);
          break;
        case 'rightleft':
          this.context.enableHid && this.int.tapKey(this.int.KEY.LEFT);
      }
    },
  },
  TripleClick: {
    events: {
      _timeout_idle: 'Idle',
    },
    entry: function (handleEvent) {
      lightUpLED(LED1, handleEvent);
      lightUpLED(LED2, handleEvent);
    },
  },
  LongClick: {
    events: {
      MouseControl: 'MouseControl',
    },
    entry: function (handleEvent) {
      handleEvent('MouseControl');
    },
  },
  MouseControl: {
    events: {
      LongClick: 'Idle',
    },
    entry: function (handleEvent) {
      Puck.accelOn(104);

      this.clickHandler = () => {
        if (this.context.enableHid) {
          this.int.clickButton(this.int.BUTTON.LEFT);
          this.int.releaseButton(this.int.BUTTON.LEFT);
        }
      };

      this.on('SingleClick', this.clickHandler);

      lightUpLED(LED3);
    },
    exit: function (handleEvent) {
      this.off('SingleClick', this.clickHandler);
      Puck.accelOff();
    },
  },
  LongDoubleClick: {
    events: {
      _timeout_idle: 'Idle',
    },
    entry: function (handleEvent) {
      this.context.mode =
        this.context.mode == 'pageupdown' ? 'rightleft' : 'pageupdown';

      lightUpLED(LED1, handleEvent);
      lightUpLED(LED2, handleEvent);
      lightUpLED(LED3, handleEvent);
    },
  },
  LongTripleClick: {
    events: {
      _timeout_idle: 'Idle',
    },
    entry: function (handleEvent) {
      // E.reboot();

      lightUpLED(LED2, handleEvent);
      lightUpLED(LED3, handleEvent);
    },
  },
};
