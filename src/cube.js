import * as THREE from 'three';
import gsap from 'gsap';

// Select the canvas element
const canvas = document.querySelector('canvas.webgl');

// Create a new scene
const scene = new THREE.Scene();

// Create a cube and add it to the scene
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Get the size of the canvas container
const sizes = {
    width: document.getElementById('main-canvas-container').clientWidth,
    height: document.getElementById('main-canvas-container').clientHeight
};

// Update sizes on window resize
window.addEventListener('resize', () => {
    sizes.width = document.getElementById('main-canvas-container').clientWidth;
    sizes.height = document.getElementById('main-canvas-container').clientHeight;

    // Update camera aspect ratio
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer size
    renderer.setSize(sizes.width, sizes.height);
});

// Set up the camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
scene.add(camera);

// Set up the renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);

// Define minimum and maximum rotation speeds
const MIN_ROTATION_SPEED = 0.005;
const MAX_ROTATION_SPEED = 0.015;

// Minimum mouse movement to consider
const MIN_MOUSE_MOVE_DISTANCE = 50; // in pixels

// Mouse state variables
let isMouseOver = false;
let lastMousePosition = new THREE.Vector2();
let lastTime = performance.now();

// Rotation variables
let rotationAxis = new THREE.Vector3(0, 1, 0); // Initial rotation axis
let rotationAngle = MIN_ROTATION_SPEED; // Initial rotation angle

// Quaternion for incremental rotation
let quaternionIncrement = new THREE.Quaternion();

// Mouse event listeners
document.addEventListener('mouseenter', (event) => {
    isMouseOver = true;
    lastMousePosition.set(event.clientX, event.clientY);
    lastTime = performance.now();
});

document.addEventListener('mouseleave', () => {
    isMouseOver = false;
});

document.addEventListener('mousemove', (event) => {
    if (isMouseOver) {
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
            let maxMouseSpeed = 1000;
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
    // Apply incremental rotation to the cube
    quaternionIncrement.setFromAxisAngle(rotationAxis, rotationAngle);
    mesh.quaternion.multiplyQuaternions(quaternionIncrement, mesh.quaternion);

    // Render the scene
    renderer.render(scene, camera);

    // Request the next animation frame
    window.requestAnimationFrame(tick);
};

tick();
