# Puck.js Clicker

This project provides a custom firmware and associated tooling for the Puck.js, a Bluetooth Low Energy (BLE) smart button, to function as a versatile presentation clicker.

## Features

- **Presentation Control**: Navigate through slides using the Puck.js button.
- **Gyroscope Integration**: Control the mouse pointer with Puck.js's built-in gyroscope.
- **Battery Service**: Monitor the battery level of the Puck.js.
- **Customizable Modes**: Switch between different control modes, such as page navigation and arrow key navigation.
- **Auto Sleep/Wake**: Conserve battery by automatically sleeping and waking the device.

## Getting Started

### Prerequisites

- A Puck.js device.
- The Espruino Web IDE or similar for flashing the Puck.js.

### Installation

1. Connect your Puck.js to the Espruino Web IDE.
2. Upload the `dist/puckjs-clicker.js` script to the Puck.js.
3. Disconnect and reconnect the Puck.js to activate the new firmware.

### Usage

Press the Puck.js button to navigate through your presentation slides. The default mode allows for page up/down navigation. Double-click the button to switch to arrow key navigation.

Long press the button to activate the gyroscope and control the mouse pointer. Double long press to switch between control modes.

The device will automatically enter sleep mode after an hour of inactivity to save battery life. Press the button to wake it up.

## Tooling

The `tooling` directory contains a web application that visualizes the gyroscope data from the Puck.js in real-time.

### Setup

1. Open the `tooling/index.html` file in a web browser.
2. Click on the page to initiate a Bluetooth connection with the Puck.js.
3. Observe the real-time data visualization as you move the Puck.js.

## Contributing

Contributions are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## Acknowledgments

- Thanks to the Espruino community for their support and resources.
- Special thanks to all the contributors who have helped shape this project.
