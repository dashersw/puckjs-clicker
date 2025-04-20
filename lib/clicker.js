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
    this.sm = new StateMachine('Click', 'Idle', stateMap, context);
    this.sm.int = require('ble_hid_combo');

    context.resetLEDs = () => {
      LED1.write(0);
      LED2.write(0);
      LED3.write(0);
    };

    // Add flag to track if mouse movement is temporarily disabled
    context.mouseMovementDisabled = false;
    context.clicker = this;

    // Add flag to signal when mouse control should be exited
    context.exitMouseControl = false;

    this.button = new Button(context);

    this.button.on('*', event => {
      console.log('button event', event);
      this.sm.handleEvent(event);
      this.sm.emit(event);
    });

    this.sm.on('*', event => {
      console.log('state machine event', event);
    });

    context.resetLEDs();
  }
}

const stateMap = {
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
      global.mouseButtonState = 0;
      this.context.exitMouseControl = true;
      this.context.firstClickHappened = false;
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
    entry: handleEvent => {
      lightUpLED(LED1, handleEvent);
      lightUpLED(LED2, handleEvent);
    },
  },
  LongClick: {
    events: {
      MouseControl: 'MouseControl',
    },
    entry: handleEvent => {
      handleEvent('MouseControl');
    },
  },
  MouseControl: {
    events: {
      _button_pressed: '_ButtonPressed',
      LongDoubleClick: 'Idle',
    },
    entry: function (handleEvent) {
      console.log('MouseControl');

      this.context.exitMouseControl = false;

      Puck.accelOn(104);
      lightUpLED(LED3);
    },
    exit: handleEvent => {
      global.mouseButtonState = 0;
    },
  },
  _ButtonPressed: {
    events: {
      LongDoubleClick: 'Idle',
      LongClick: 'Drag',
      MouseControl: 'MouseControl',
    },
    entry: function (handleEvent) {
      console.log('ButtonPressed');
      if (this.context.enableHid) {
        console.log('disabling mouse movement');
        this.context.mouseMovementDisabled = true;
        if (!this.context.firstClickHappened) {
          console.log('left clicking for the first time');
          global.mouseButtonState = this.int.BUTTON.LEFT;
          LED1.write(1);
        } else {
          console.log(
            'trying to left click again, but this time waiting for the button to be released'
          );
          const cancel = this.once('_button_released', () => {
            console.log('left clicking again because we are in MouseControl');
            global.mouseButtonState = this.int.BUTTON.LEFT;
            LED1.write(1);

            setTimeout(() => {
              global.mouseButtonState = 0;
              this.context.mouseMovementDisabled = false;

              LED1.write(0);
            }, 100);

            setTimeout(() => {
              console.log('re-enabling mouse movement in 500ms');
              this.context.mouseMovementDisabled = false;
              cancel();
              handleEvent('MouseControl');
              LED1.write(0);
            }, shortDuration * 5);
          });
          return;
        }

        this.once('_button_released', () => {
          console.log('button released after first click');
          LED1.write(0);
          global.mouseButtonState = 0;
          this.context.firstClickHappened = true;
          handleEvent('MouseControl');
          setTimeout(() => {
            console.log('resetting first click happened flag');
            this.context.firstClickHappened = false;
            this.context.mouseMovementDisabled = false;
          }, shortDuration * 4);
        });
      }
    },
  },
  Drag: {
    events: {
      _button_released: 'MouseControl',
    },
    entry: function (handleEvent) {
      this.context.mouseMovementDisabled = false;
    },
  },
  LongDoubleClick: {
    events: {
      _timeout_idle: 'Idle',
    },
    entry: function (handleEvent) {
      this.context.mode =
        this.context.mode === 'pageupdown' ? 'rightleft' : 'pageupdown';

      lightUpLED(LED1, handleEvent);
      lightUpLED(LED2, handleEvent);
      lightUpLED(LED3, handleEvent);
    },
  },
  LongTripleClick: {
    events: {
      _timeout_idle: 'Idle',
    },
    entry: handleEvent => {
      reset();

      lightUpLED(LED2, handleEvent);
      lightUpLED(LED3, handleEvent);
    },
  },
};
