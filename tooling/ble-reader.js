const serviceUuid = '0000bcde-0000-1000-8000-00805f9b34fb';

let globalAccelData = { x: 0, y: 0, z: 0 };
let globalGyroData = { x: 0, y: 0, z: 0 };

const accelCharacteristicUuid = '0000abcd-0000-1000-8000-00805f9b34fb';

const gyroCharacteristicUuid = '0000cdef-0000-1000-8000-00805f9b34fb';

async function connectToPuck() {
  try {
    console.log('Requesting Bluetooth Device...');

    const device = await navigator.bluetooth.requestDevice({
      filters: [{ name: 'dashClicker' }],
      optionalServices: [serviceUuid],
    });

    console.log('Connecting to GATT Server...');
    const server = await device.gatt.connect();

    console.log('Getting Service...');
    let service = await server.getPrimaryService(serviceUuid);

    const chars = await service.getCharacteristics();

    console.log(chars);

    const accelCharacteristic = await service.getCharacteristic(
      accelCharacteristicUuid
    );

    accelCharacteristic.startNotifications();

    accelCharacteristic.addEventListener(
      'characteristicvaluechanged',
      handleAccelNotifications
    );

    device.addEventListener('gattserverdisconnected', onDisconnected);

    console.log('Connected and listening for data...');
  } catch (error) {
    console.log('Argh! ' + error);
  }
}

function onDisconnected(event) {
  const device = event.target;

  console.log(`Device ${device.name} is disconnected.`);
}

function handleAccelNotifications(event) {
  let value = event.target.value;

  let accX = value.getInt16(0, true);
  let accY = value.getInt16(2, true);
  let accZ = value.getInt16(4, true);

  globalAccelData = {
    x: accX,
    y: accY,
    z: accZ,
  };

  setPositionOfCircle({ x: accX, y: accY, z: accZ });
}

document.body.addEventListener('click', connectToPuck, { once: true });
