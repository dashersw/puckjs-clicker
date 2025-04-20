const int = require('ble_hid_combo');

import Clicker from '../lib/clicker';

NRF.setServices(
  undefined,
  // {
  // // Battery Service
  // '0x180f': {
  //   // Battery Level characteristic
  //   '0x2a19': {
  //     value: [Math.round(Puck.getBatteryPercentage())],
  //     readable: true,
  //     notify: true,
  //     description: 'Battery Level',
  //   },
  // },
  { hid: int.report }
);

NRF.setAdvertising(
  {},
  {
    name: 'dashClicker',
    showName: true,
    discoverable: true,
    services: ['0x180f', '0x1812'],
  }
);

// function reportBatteryLevel() {
//   NRF.setServices({
//     '0x180f': {
//       '0x2a19': {
//         value: [Math.round(Puck.getBatteryPercentage())],
//         readable: true,
//         notify: true,
//         description: 'Battery Level',
//       },
//     },
//   });
// }

// setInterval(reportBatteryLevel, 60000);

const deviceState = {};

const defaultState = {
  mode: 'pageupdown', // 'rightleft'
  enableHid: true,
};

function resetState() {
  Object.assign(deviceState, defaultState);
}

resetState();

const clicker = new Clicker(deviceState);

let lastFilteredX = 0;
let lastFilteredY = 0;
const alpha = 0.5; // Adjust this value to control the smoothing effect

const scale = 0.01;
// Global flags for coordination between modules
global.sendingHID = false;
global.mouseButtonState = 0; // Tracks which buttons are pressed (0 = none)

// Properly handle mouse movements with callbacks
Puck.on('accel', data => {
  // Skip if already sending HID data
  if (global.sendingHID || !deviceState.enableHid) return;

  // Set flag before sending and clear when done
  global.sendingHID = true;

  // Check if we need to reset mouse state (exiting mouse control)
  if (deviceState.exitMouseControl) {
    console.log('exiting mouse control');
    int.moveMouse(0, 0, 0, 0, 0, () => {
      global.sendingHID = false;
      deviceState.exitMouseControl = false;
      Puck.accelOff();
    });
    return;
  }

  const filteredX =
    lastFilteredX + Math.floor(alpha * (data.gyro.x * scale - lastFilteredX));
  const filteredY =
    lastFilteredY + Math.floor(alpha * (data.gyro.y * scale - lastFilteredY));

  lastFilteredX = filteredX;
  lastFilteredY = filteredY;

  if (deviceState.mouseMovementDisabled) {
    console.log('mouse movement disabled', clicker.sm.currentState);
  } else {
    console.log('mouse movement enabled', clicker.sm.currentState);
  }

  // If mouse movement is temporarily disabled, only send button state with zero movement
  const moveX = deviceState.mouseMovementDisabled ? 0 : filteredX;
  const moveY = deviceState.mouseMovementDisabled ? 0 : -filteredY;

  // Pass the current button state to support click and drag
  int.moveMouse(
    moveX,
    moveY,
    global.mouseButtonState, // Include button state for click & drag
    0, // wheelX (vertical scroll)
    0, // wheelY (horizontal scroll)
    () => {
      global.sendingHID = false;
    }
  );
});

// Add an indicator that the device is ready
setTimeout(() => {
  LED1.write(1);
  setTimeout(() => LED1.write(0), 500);
}, 1000);
