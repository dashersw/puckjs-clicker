NRF.setServices({
  0xbcde: {
    0xabcd: {
      readable: true,
      notify: true,
      value: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  },
});

NRF.setAdvertising({}, { name: 'Puck.js', services: [0xbcde] });

let accelEnabled = false;

function updateSensorData() {
  if (!accelEnabled) return;

  var accData = new Int16Array(6);

  Puck.on('accel', function (data) {
    accData[0] = data.gyro.x / 100;
    accData[1] = data.gyro.y / 100;
    accData[2] = data.gyro.z / 100;
    accData[3] = data.accel.x / 100;
    accData[4] = data.accel.y / 100;
    accData[5] = data.accel.z / 100;

    // Update the accelerometer characteristic
    NRF.updateServices({
      0xbcde: {
        0xabcd: { value: accData.buffer, notify: true },
      },
    });
  });
}

function toggleAccel() {
  accelEnabled = !accelEnabled;
  LED1.write(accelEnabled);
  if (accelEnabled) {
    Puck.accelOn(416);
    updateSensorData();
  } else {
    Puck.accelOff();
    Puck.removeListener('accel');
  }
}

setWatch(toggleAccel, BTN, { edge: 'rising', repeat: true, debounce: 50 });
