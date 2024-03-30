const int = require('ble_hid_combo');

import Clicker from '../lib/clicker';
import throttle from '../lib/shared/throttle';

NRF.setServices(
  {
    // Battery Service
    0x180f: {
      // Battery Level characteristic
      0x2a19: {
        value: [Math.round(Puck.getBatteryPercentage())],
        readable: true,
        notify: true,
        description: 'Battery Level',
      },
    },
  },
  {
    hid: int.report,
  }
);

NRF.setAdvertising(
  {},
  {
    name: 'dashClicker',
    showName: true,
    discoverable: true,
    services: [0x180f],
  }
);

function reportBatteryLevel() {
  NRF.setServices({
    0x180f: {
      0x2a19: {
        value: [Math.round(Puck.getBatteryPercentage())],
        readable: true,
        notify: true,
        description: 'Battery Level',
      },
    },
  });
}

setInterval(reportBatteryLevel, 60000);

const deviceState = {};

const defaultState = {
  mode: 'pageupdown', // 'rightleft'
  enableHid: true,
};

function resetState() {
  Object.assign(deviceState, defaultState);
}

resetState();

new Clicker(deviceState);

let lastFilteredX = 0;
let lastFilteredY = 0;
const alpha = 0.5; // Adjust this value to control the smoothing effect

const scale = 0.01;

Puck.on(
  'accel',
  throttle(data => {
    const filteredX =
      lastFilteredX + Math.floor(alpha * (data.gyro.x * scale - lastFilteredX));
    const filteredY =
      lastFilteredY + Math.floor(alpha * (data.gyro.y * scale - lastFilteredY));

    lastFilteredX = filteredX;
    lastFilteredY = filteredY;

    deviceState.enableHid && int.moveMouse(filteredX, -filteredY);
  }, 10)
);
