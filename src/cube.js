import * as THREE from 'three';
import gsap from 'gsap';

// Get the canvas element
const canvas = document.querySelector('canvas.webgl');

// Create the scene
const scene = new THREE.Scene();

// Create the load manager
const loadingManager = new THREE.LoadingManager();

// Load the cube texture
const textureLoader = new THREE.TextureLoader(loadingManager);
const cubeTexture = textureLoader.load('dice_unwrap.png');
cubeTexture.colorSpace = THREE.SRGBColorSpace

// Create a cube and add it to the scene
const geometry = new THREE.BoxGeometry(1, 1, 1);

// Define the vertices of the cube (24 vertices for 6 faces)
const vertices = new Float32Array([
    // Front face (+Z)
    -0.5, -0.5,  0.5, // v0
     0.5, -0.5,  0.5, // v1
     0.5,  0.5,  0.5, // v2
    -0.5,  0.5,  0.5, // v3
    // Back face (-Z)
     0.5, -0.5, -0.5, // v4
    -0.5, -0.5, -0.5, // v5
    -0.5,  0.5, -0.5, // v6
     0.5,  0.5, -0.5, // v7
    // Top face (+Y)
    -0.5,  0.5,  0.5, // v8
     0.5,  0.5,  0.5, // v9
     0.5,  0.5, -0.5, // v10
    -0.5,  0.5, -0.5, // v11
    // Bottom face (-Y)
    -0.5, -0.5, -0.5, // v12
     0.5, -0.5, -0.5, // v13
     0.5, -0.5,  0.5, // v14
    -0.5, -0.5,  0.5, // v15
    // Right face (+X)
     0.5, -0.5,  0.5, // v16
     0.5, -0.5, -0.5, // v17
     0.5,  0.5, -0.5, // v18
     0.5,  0.5,  0.5, // v19
    // Left face (-X)
    -0.5, -0.5, -0.5, // v20
    -0.5, -0.5,  0.5, // v21
    -0.5,  0.5,  0.5, // v22
    -0.5,  0.5, -0.5  // v23
]);

// Define the indices for the cube faces (12 triangles)
const indices = [
    // Front face
    0,  1,  2,   2,  3,  0,
    // Back face
    4,  5,  6,   6,  7,  4,
    // Top face
    8,  9, 10,  10, 11,  8,
    // Bottom face
   12, 13, 14,  14, 15, 12,
    // Right face
   16, 17, 18,  18, 19, 16,
    // Left face
   20, 21, 22,  22, 23, 20
];

// Define the UV coordinates for each vertex
// Assuming a 4x3 grid texture layout
const tileUvWidth = 1 / 4;
const tileUvHeight = 1 / 3;

function flipV(v) {
    return 1 - v;
}

const uvs = new Float32Array([
    // Front face (+Z) - Tile (1, 1)
    tileUvWidth * 1, flipV(tileUvHeight * 2), // v0
    tileUvWidth * 2, flipV(tileUvHeight * 2), // v1
    tileUvWidth * 2, flipV(tileUvHeight * 1), // v2
    tileUvWidth * 1, flipV(tileUvHeight * 1), // v3
    // Back face (-Z) - Tile (3, 1)
    tileUvWidth * 3, flipV(tileUvHeight * 2), // v4
    tileUvWidth * 4, flipV(tileUvHeight * 2), // v5
    tileUvWidth * 4, flipV(tileUvHeight * 1), // v6
    tileUvWidth * 3, flipV(tileUvHeight * 1), // v7
    // Top face (+Y) - Tile (1, 0)
    tileUvWidth * 1, flipV(tileUvHeight * 3), // v8
    tileUvWidth * 2, flipV(tileUvHeight * 3), // v9
    tileUvWidth * 2, flipV(tileUvHeight * 2), // v10
    tileUvWidth * 1, flipV(tileUvHeight * 2), // v11
    // Bottom face (-Y) - Tile (1, 2)
    tileUvWidth * 1, flipV(tileUvHeight * 1), // v12
    tileUvWidth * 2, flipV(tileUvHeight * 1), // v13
    tileUvWidth * 2, flipV(tileUvHeight * 0), // v14
    tileUvWidth * 1, flipV(tileUvHeight * 0), // v15
    // Right face (+X) - Tile (2, 1)
    tileUvWidth * 2, flipV(tileUvHeight * 2), // v16
    tileUvWidth * 3, flipV(tileUvHeight * 2), // v17
    tileUvWidth * 3, flipV(tileUvHeight * 1), // v18
    tileUvWidth * 2, flipV(tileUvHeight * 1), // v19
    // Left face (-X) - Tile (0, 1)
    tileUvWidth * 0, flipV(tileUvHeight * 2), // v20
    tileUvWidth * 1, flipV(tileUvHeight * 2), // v21
    tileUvWidth * 1, flipV(tileUvHeight * 1), // v22
    tileUvWidth * 0, flipV(tileUvHeight * 1)  // v23
]);

// Build the geometry
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
geometry.setIndex(indices);
geometry.computeVertexNormals();

// Create the material using the loaded texture
const material = new THREE.MeshBasicMaterial({
    map: cubeTexture,
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Get the size of the canvas container
const sizes = {
    width: document.getElementById('main-canvas-container').clientWidth,
    height: document.getElementById('main-canvas-container').clientHeight
};

// Set up the camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
scene.add(camera);

// Set up the renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Update sizes on window resize
window.addEventListener('resize', () => {
    sizes.width = document.getElementById('main-canvas-container').clientWidth;
    sizes.height = document.getElementById('main-canvas-container').clientHeight;

    // Update camera aspect ratio
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer size
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Define minimum and maximum rotation speeds
const MIN_ROTATION_SPEED = 0.005;
const MAX_ROTATION_SPEED = 0.015;

// Minimum mouse movement to consider
const MIN_MOUSE_MOVE_DISTANCE = 10; // in pixels

// Mouse state variables
let isMouseOver = false;
let isMouseOverButton = false; // Track if the mouse is over a button
let lastMousePosition = new THREE.Vector2();
let lastTime = performance.now();

// Rotation variables
let rotationAxis = new THREE.Vector3(0, 1, 0); // Initial rotation axis
let rotationAngle = MIN_ROTATION_SPEED; // Initial rotation angle

// Quaternion for incremental rotation
let quaternionIncrement = new THREE.Quaternion();

// Flag to indicate if the cube is animating to a face
let isAnimatingToFace = false;

// Define target quaternions for each face
const faceQuaternions = [
    // Face 1: Front
    new THREE.Quaternion(),
    // Face 2: Right
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 2, 0)),
    // Face 3: Back
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0)),
    // Face 4: Left
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0)),
    // Face 5: Top
    new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)),
    // Face 6: Bottom
    new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)),
];

// Select the buttons
const buttons = [];
for (let i = 1; i <= 6; i++) {
    buttons.push(document.getElementById(`example-${i}`));
}

// Add event listeners to the buttons
buttons.forEach((button, index) => {
    button.addEventListener('mouseenter', () => {
        // Update mouse over button state
        isMouseOverButton = true;
        // Rotate the cube to show the corresponding face
        rotateCubeToFace(index);
    });
    button.addEventListener('mouseleave', () => {
        // Update mouse over button state
        isMouseOverButton = false;
        // Resume continuous rotation
        isAnimatingToFace = false;
    });
});

function rotateCubeToFace(faceIndex) {
    isAnimatingToFace = true;

    // Stop any ongoing animation
    gsap.killTweensOf(mesh.quaternion);

    // Get the target quaternion
    const targetQuaternion = faceQuaternions[faceIndex];

    // Animate the quaternion
    gsap.to(mesh.quaternion, {
        x: targetQuaternion.x,
        y: targetQuaternion.y,
        z: targetQuaternion.z,
        w: targetQuaternion.w,
        duration: .5,
        //ease: "power2.inOut",
        onUpdate: () => {
            // Keep the quaternion normalized
            mesh.quaternion.normalize();
        },
        onComplete: () => {
        }
    });
}

// Mouse event listeners
canvas.addEventListener('mouseenter', (event) => {
    isMouseOver = true;
    lastMousePosition.set(event.clientX, event.clientY);
    lastTime = performance.now();
});

canvas.addEventListener('mouseleave', () => {
    isMouseOver = false;
});

canvas.addEventListener('mousemove', (event) => {
    if (isMouseOver && !isAnimatingToFace && !isMouseOverButton) {
        let currentTime = performance.now();
        let deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds

        // Prevent extremely small deltaTime values
        if (deltaTime < 0.001) {
            deltaTime = 0.001;
        }

        let deltaX = event.clientX - lastMousePosition.x;
        let deltaY = event.clientY - lastMousePosition.y;

        // Calculate the distance the mouse moved
        let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Only proceed if the mouse moved enough
        if (distance >= MIN_MOUSE_MOVE_DISTANCE) {
            // Calculate mouse speed in pixels per second
            let mouseSpeed = distance / deltaTime;

            // Cap the mouse speed to avoid extreme values
            let maxPossibleMouseSpeed = 3000;
            if (mouseSpeed > maxPossibleMouseSpeed) {
                mouseSpeed = maxPossibleMouseSpeed;
            }

            // Map mouse speed to rotation angle within defined limits
            let maxMouseSpeed = 10000;
            rotationAngle = THREE.MathUtils.clamp(
                (mouseSpeed / maxMouseSpeed) * (MAX_ROTATION_SPEED - MIN_ROTATION_SPEED) + MIN_ROTATION_SPEED,
                MIN_ROTATION_SPEED,
                MAX_ROTATION_SPEED
            );

            // Set the rotation axis based on mouse movement
            rotationAxis.set(deltaY, deltaX, 0);
            rotationAxis.normalize();

            // Update last mouse position and time
            lastMousePosition.set(event.clientX, event.clientY);
            lastTime = currentTime;
        }
    }
});





// Animation loop
const tick = () => {
    // Apply incremental rotation only if not animating to a face and mouse not over a button
    if (!isAnimatingToFace && !isMouseOverButton) {
        quaternionIncrement.setFromAxisAngle(rotationAxis, rotationAngle);
        mesh.quaternion.multiplyQuaternions(quaternionIncrement, mesh.quaternion);
    }

    // Render the scene
    renderer.render(scene, camera);

    // Request the next animation frame
    window.requestAnimationFrame(tick);
};

tick();
