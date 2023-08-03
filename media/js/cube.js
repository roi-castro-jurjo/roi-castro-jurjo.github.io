let SPEED_X = 0.00;
let SPEED_Y = -0.01;
let SPEED_Z = 0.0;

const POINT_3D = function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}

let canvas = document.getElementsByTagName("canvas")[0]
canvas.width = document.documentElement.clientWidth * 2;
canvas.height = document.documentElement.clientHeight * 2;

let canvasContext = canvas.getContext("2d")

canvasContext.fillStyle = "black"
canvasContext.strokeStyle = "white"
canvasContext.lineWidth = 1

let cubeCenterX = canvas.width / 2
let cubeCenterY = canvas.height / 2
let cubeCenterZ = 0
let cubeSize = Math.min(canvas.height / 4, canvas.width / 4)

let vertices = [
    new POINT_3D(cubeCenterX - cubeSize, cubeCenterY - cubeSize, cubeCenterZ - cubeSize),
    new POINT_3D(cubeCenterX + cubeSize, cubeCenterY - cubeSize, cubeCenterZ - cubeSize),
    new POINT_3D(cubeCenterX + cubeSize, cubeCenterY + cubeSize, cubeCenterZ - cubeSize),
    new POINT_3D(cubeCenterX - cubeSize, cubeCenterY + cubeSize, cubeCenterZ - cubeSize),
    new POINT_3D(cubeCenterX - cubeSize, cubeCenterY - cubeSize, cubeCenterZ + cubeSize),
    new POINT_3D(cubeCenterX + cubeSize, cubeCenterY - cubeSize, cubeCenterZ + cubeSize),
    new POINT_3D(cubeCenterX + cubeSize, cubeCenterY + cubeSize, cubeCenterZ + cubeSize),
    new POINT_3D(cubeCenterX - cubeSize, cubeCenterY + cubeSize, cubeCenterZ + cubeSize)
];

let edges = [
    [0, 1], [1, 2], [2, 3], [3, 0], // back face
    [4, 5], [5, 6], [6, 7], [7, 4], // front face
    [0, 4], [1, 5], [2, 6], [3, 7] // connecting sides
];



let timeDelta
let timeLast = 0

requestAnimationFrame(loop)

function loop(timeNow){
    timeDelta = timeNow - timeLast
    timeLast = timeNow

    canvasContext.fillRect(0, 0, canvas.width, canvas.height)

    // X Axis Rotation
    let angle = timeDelta * 0.001 * SPEED_X * Math.PI * 2
    for(let vertex of vertices) {
        let dy = vertex.y - cubeCenterY;
        let dz = vertex.z - cubeCenterZ;
        let y = dy * Math.cos(angle) - dz * Math.sin(angle);
        let z = dy * Math.sin(angle) + dz * Math.cos(angle);
        vertex.y = y + cubeCenterY;
        vertex.z = z + cubeCenterZ;
    }

    // Y Axis Rotation
    angle = timeDelta * 0.001 * SPEED_Y * Math.PI * 2
    for(let vertex of vertices) {
        let dx = vertex.x - cubeCenterX;
        let dz = vertex.z - cubeCenterZ;
        let x = dz * Math.sin(angle) + dx * Math.cos(angle);
        let z = dz * Math.cos(angle) - dx * Math.sin(angle);
        vertex.x = x + cubeCenterX;
        vertex.z = z + cubeCenterZ;
    }

    // Z Axis Rotation
    angle = timeDelta * 0.001 * SPEED_Z * Math.PI * 2
    for(let vertex of vertices) {
        let dx = vertex.x - cubeCenterX;
        let dy = vertex.y - cubeCenterY;
        let x = dx * Math.cos(angle) - dy * Math.sin(angle);
        let y = dx * Math.sin(angle) + dy * Math.cos(angle);
        vertex.x = x + cubeCenterX;
        vertex.y = y + cubeCenterY;
    }

    
    for (let edge of edges) {
        canvasContext.beginPath();
        canvasContext.moveTo(vertices[edge[0]].x, vertices[edge[0]].y);
        canvasContext.lineTo(vertices[edge[1]].x, vertices[edge[1]].y);
        canvasContext.stroke();
    }

    requestAnimationFrame(loop)
    
}

// Reset the cube when window is resized
window.addEventListener("resize", () => {
    canvas.width = document.documentElement.clientWidth * 2;
    canvas.height = document.documentElement.clientHeight * 2;

    canvasContext = canvas.getContext("2d")

    canvasContext.fillStyle = "black"
    canvasContext.strokeStyle = "white"
    canvasContext.lineWidth = 1

    cubeCenterX = canvas.width / 2
    cubeCenterY = canvas.height / 2
    cubeCenterZ = 0
    cubeSize = Math.min(canvas.height / 4, canvas.width / 4)

    vertices = [
        new POINT_3D(cubeCenterX - cubeSize, cubeCenterY - cubeSize, cubeCenterZ - cubeSize),
        new POINT_3D(cubeCenterX + cubeSize, cubeCenterY - cubeSize, cubeCenterZ - cubeSize),
        new POINT_3D(cubeCenterX + cubeSize, cubeCenterY + cubeSize, cubeCenterZ - cubeSize),
        new POINT_3D(cubeCenterX - cubeSize, cubeCenterY + cubeSize, cubeCenterZ - cubeSize),
        new POINT_3D(cubeCenterX - cubeSize, cubeCenterY - cubeSize, cubeCenterZ + cubeSize),
        new POINT_3D(cubeCenterX + cubeSize, cubeCenterY - cubeSize, cubeCenterZ + cubeSize),
        new POINT_3D(cubeCenterX + cubeSize, cubeCenterY + cubeSize, cubeCenterZ + cubeSize),
        new POINT_3D(cubeCenterX - cubeSize, cubeCenterY + cubeSize, cubeCenterZ + cubeSize)
    ];

    edges = [
        [0, 1], [1, 2], [2, 3], [3, 0], // back face
        [4, 5], [5, 6], [6, 7], [7, 4], // front face
        [0, 4], [1, 5], [2, 6], [3, 7] // connecting sides
    ];
    
})

// Variables para el seguimiento del dedo táctil
let lastTouchX = null;
let lastTouchY = null;


// Función para manejar el evento del ratón
function handleMouseMove(event) {

    // Obtener la velocidad del ratón en los ejes X e Y
    let mouseXSpeed = 0
    let mouseYSpeed = 0

    if (event.type == "mousemove") {
        // Evento del ratón
        mouseXSpeed = event.movementX;
        mouseYSpeed = event.movementY;
      } else if (event.type === "touchmove") {
        // Evento táctil
        const touch = event.touches[0];
        if (lastTouchX !== null && lastTouchY !== null) {
          mouseXSpeed = touch.clientX - lastTouchX;
          mouseYSpeed = touch.clientY - lastTouchY;
        }
        // Actualizar la última posición del dedo táctil
        lastTouchX = touch.clientX;
        lastTouchY = touch.clientY;
      }

    // Actualizar las velocidades sumando o restando el valor del movimiento del ratón
    SPEED_X += mouseYSpeed * 0.005; 
    SPEED_Y -= mouseXSpeed * 0.005;

    // Limitar las velocidades máximas y mínimas
    SPEED_X = Math.min(Math.max(SPEED_X, -0.5), 0.5);
    SPEED_Y = Math.min(Math.max(SPEED_Y, -0.5), 0.5);
}

// Función para reducir gradualmente las velocidades cuando el ratón está quieto
function reduceSpeed() {
    if (Math.abs(SPEED_X) !== 0.05) {
    if (SPEED_X > 0){
        SPEED_X += (0.05 - SPEED_X) * 0.05;
    } else {
        SPEED_X -= (0.05 + SPEED_X) * 0.05;
    }
    
    }

    if (Math.abs(SPEED_Y) !== 0.05) {
    if (SPEED_Y > 0){
        SPEED_Y += (0.05 - SPEED_Y) * 0.05;
    } else {
        SPEED_Y -= (0.05 + SPEED_Y) * 0.05;
    }
    }
}

// Evento para manejar el movimiento del ratón
window.addEventListener("mousemove", handleMouseMove);
window.addEventListener("touchmove", handleMouseMove);


// Evento para reducir gradualmente las velocidades cuando el ratón está fuera de la pantalla
window.addEventListener("mouseout", function() {
    window.requestAnimationFrame(reduceSpeed);
});

window.addEventListener("touchend", function() {
    window.requestAnimationFrame(reduceSpeed);
});

// Función para actualizar las velocidades periódicamente y reducir su valor cuando el ratón está fuera de la pantalla
function updateSpeed() {
    reduceSpeed();
    window.requestAnimationFrame(updateSpeed);
}

// Iniciar el bucle para actualizar las velocidades
updateSpeed();
