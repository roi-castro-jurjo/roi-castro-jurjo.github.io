import * as THREE from 'three'
import gsap from 'gsap'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Axes
const axesHelper = new THREE.AxesHelper(2)
axesHelper.setColors('white', 'green', 'blue')
scene.add(axesHelper)

// Cube
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Sizes
const sizes = {
    width: document.getElementById('main-canvas-container').clientWidth,
    height: document.getElementById('main-canvas-container').clientHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = document.getElementById('main-canvas-container').clientWidth
    sizes.height = document.getElementById('main-canvas-container').clientHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
})


// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3
scene.add(camera)

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)

// Clock
const clock = new THREE.Clock()

// Animation
const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    mesh.rotation.y = elapsedTime * Math.PI/2 * 0.1
    mesh.rotation.x = elapsedTime * Math.PI/2
    mesh.rotation.z = elapsedTime * Math.PI/2 * 0.1

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()