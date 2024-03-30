let sphere;
let secondSphere;
let thirdSphere;
let fourthSphere;

const xCorrection = 0;
const yCorrection = 8.7;
const zCorrection = 0;

let xRotAngle = 45;
let yRotAngle = 30;

function setPositionOfSphere(position) {
  if (!sphere) return;

  const incomingPosition = new THREE.Vector3(position.y / 4, 0, position.z / 4);
  const incomingPosition2 = new THREE.Vector3(
    0,
    -position.x / 4,
    position.z / 4
  );
  sphere.position.set(
    incomingPosition.x,
    incomingPosition.y,
    incomingPosition.z
  );

  secondSphere.position.set(
    incomingPosition2.x,
    incomingPosition2.y,
    incomingPosition2.z
  );
}

let trail;
const trailVertices = [];
const trailLength = 10000; // Number of positions to keep in the trail

function create3DPointGraph(x, y, z) {
  // Define the size of the scene
  const width = 800;
  const height = 600;
  const depth = 300; // Define the depth to match the height for a consistent look

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  const labelDiv = document.createElement('div');
  renderer.setPixelRatio(window.devicePixelRatio);
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  // Initialize the trail geometry and material
  const trailGeometry = new THREE.BufferGeometry();
  const trailMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });

  // Initialize the positions array with zeros to prevent NaN values
  const positions = new Float32Array(trailLength * 3).fill(0);
  trailGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
  );

  // Create the line and add it to the scene
  trail = new THREE.Line(trailGeometry, trailMaterial);
  scene.add(trail);

  // Create axes helpers to visualize the x, y, and z axes
  const axesHelper = new THREE.AxesHelper(10);
  scene.add(axesHelper);

  // Create a sphere geometry and add it to the scene at the specified coordinates
  const geometry = new THREE.SphereGeometry(0.25, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0xffff00 });
  sphere = new THREE.Mesh(geometry, material);
  sphere.position.set(x, y, z);
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  scene.add(sphere);

  // Create a second sphere geometry and add it to the scene
  const secondGeometry = new THREE.SphereGeometry(0.25, 32, 32); // Same size as the first sphere
  const secondMaterial = new THREE.MeshStandardMaterial({ color: 0x800080 }); // Purple color
  secondSphere = new THREE.Mesh(secondGeometry, secondMaterial);
  secondSphere.position.set(x, 0, z); // Initially only move on the y-axis
  secondSphere.castShadow = true;
  secondSphere.receiveShadow = true;
  scene.add(secondSphere);

  // Create a third sphere geometry and add it to the scene
  const thirdGeometry = new THREE.SphereGeometry(0.25, 32, 32); // Same size as the other Spheres
  const thirdMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Green color for the third sphere
  thirdSphere = new THREE.Mesh(thirdGeometry, thirdMaterial);
  // Set the initial position of the third sphere based on the first and second Spheres
  thirdSphere.position.set(sphere.position.x, secondSphere.position.y, z);
  thirdSphere.castShadow = true;
  thirdSphere.receiveShadow = true;
  scene.add(thirdSphere);

  // Create a fourth sphere geometry and add it to the scene
  const fourthGeometry = new THREE.SphereGeometry(0.5, 32, 32); // Bigger sphere with a radius of 0.5
  const fourthMaterial = new THREE.MeshStandardMaterial({ color: 0xff00ff }); // Magenta color for the fourth sphere
  fourthSphere = new THREE.Mesh(fourthGeometry, fourthMaterial);
  // Set the initial position of the fourth sphere
  fourthSphere.position.set(0, 0, z);
  fourthSphere.castShadow = true;
  fourthSphere.receiveShadow = true;
  scene.add(fourthSphere);

  // Create a canvas for the text label
  const labelCanvas = document.createElement('canvas');
  const labelContext = labelCanvas.getContext('2d');
  labelCanvas.width = 256;
  labelCanvas.height = 128;
  labelContext.fillStyle = '#ffffff';
  labelContext.font = '18px Arial';
  labelContext.textAlign = 'center';
  labelContext.textBaseline = 'middle';

  // Create a texture from the canvas
  const labelTexture = new THREE.CanvasTexture(labelCanvas);

  // Create a sprite material with the canvas texture
  const labelMaterial = new THREE.SpriteMaterial({ map: labelTexture });

  // Create a sprite with the material
  const labelSprite = new THREE.Sprite(labelMaterial);
  labelSprite.scale.set(2, 1, 1); // Scale the sprite to the size of the canvas
  scene.add(labelSprite);

  // Function to update the label text and position
  function updateLabel() {
    const text = `Position: (${sphere.position.x.toFixed(
      2
    )}, ${sphere.position.y.toFixed(2)}, ${sphere.position.z.toFixed(2)})`;
    labelContext.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
    labelContext.fillText(text, labelCanvas.width / 2, labelCanvas.height / 2);
    labelTexture.needsUpdate = true;
    labelSprite.position.set(
      sphere.position.x + 0.5,
      sphere.position.y,
      sphere.position.z
    );
  }

  // Call updateLabel to initialize the text
  updateLabel();
  // Create a rectangle around the screen using edges geometry
  const rectangleGeometry = new THREE.BoxGeometry(
    width / 10,
    height / 10,
    depth / 2
  );
  const edges = new THREE.EdgesGeometry(rectangleGeometry);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    linewidth: 2,
  });
  const rectangle = new THREE.LineSegments(edges, lineMaterial);
  rectangle.position.z = depth / 4; // Push the rectangle to the front
  scene.add(rectangle);

  function updateTrail() {
    const positionIncrement = 0.1;
    const lastPosition =
      trailVertices.length > 0
        ? new THREE.Vector3().fromArray(trailVertices.slice(-3))
        : new THREE.Vector3();

    const currentPosition = thirdSphere.position.clone();
    const distance = lastPosition.distanceTo(currentPosition);
    const steps = distance / positionIncrement;

    for (let i = 1; i <= steps; i++) {
      const interpolatedPosition = lastPosition
        .clone()
        .lerp(currentPosition, i / steps);
      trailVertices.push(
        interpolatedPosition.x,
        interpolatedPosition.y,
        interpolatedPosition.z
      );
    }

    // Ensure the trailVertices array does not exceed the trailLength
    while (trailVertices.length > trailLength * 3) {
      trailVertices.shift();
    }

    // Update the trail geometry
    const positions = trail.geometry.attributes.position.array;
    positions.set(trailVertices);
    trail.geometry.attributes.position.needsUpdate = true;
    trail.geometry.setDrawRange(0, trailVertices.length / 3);
  }

  // Add a directional light to create shadows
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 7.5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 512;
  directionalLight.shadow.mapSize.height = 512;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 500;
  scene.add(directionalLight);

  // Add an ambient light to softly illuminate the entire scene
  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  // Set the camera position
  camera.position.set(0, 0, 5); // Position the camera to look directly at the x/y plane
  controls.update();

  // Render the scene
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    updateLabel();
    // Update the position of the third sphere to match the x of the first and y of the second
    thirdSphere.position.x = sphere.position.x;
    thirdSphere.position.y = secondSphere.position.y;
    thirdSphere.position.z = sphere.position.z;

    // Integrate the third sphere's positive x/y movements into the fourth sphere's position and clamp the position
    fourthSphere.position.x = Math.min(
      Math.max(
        fourthSphere.position.x + thirdSphere.position.x / 10,
        -width / 20
      ),
      width / 20
    );
    fourthSphere.position.y = Math.min(
      Math.max(
        fourthSphere.position.y + thirdSphere.position.y / 10,
        -height / 20
      ),
      height / 20
    );
    updateTrail();
    renderer.render(scene, camera);
  }
  animate();

  // Add keyboard event listener to move the sphere with WASD keys
  document.addEventListener('keydown', function (event) {
    const moveDistance = 0.1;
    switch (event.key) {
      case 'w': // move up
        sphere.position.y += moveDistance;
        secondSphere.position.y += moveDistance; // Move the second sphere on the y-axis
        break;
      case 's': // move down
        sphere.position.y -= moveDistance;
        secondSphere.position.y -= moveDistance; // Move the second sphere on the y-axis
        break;
      case 'a': // move left
        sphere.position.x -= moveDistance;
        break;
      case 'd': // move right
        sphere.position.x += moveDistance;
        break;
      case 'r': // move forward (increase z)
        sphere.position.z -= moveDistance;
        break;
      case 'f': // move backward (decrease z)
        sphere.position.z += moveDistance;
        break;
      case 'z': // reset trails
        trailVertices.length = 0; // Clear the trail vertices array
        updateTrail(); // Update the trail with the cleared array
        break;
      case 'x': // reset 4th sphere position
        fourthSphere.position.set(0, 0, 0);
        break;
    }
  });
}

create3DPointGraph(0, 0, 0);
