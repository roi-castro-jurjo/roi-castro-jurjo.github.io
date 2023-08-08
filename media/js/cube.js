let SPEED_X = 0.00;
let SPEED_Y = 0.00;
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
let cubeSize = Math.min(canvas.height / 5, canvas.width / 5)

let vertices = [
    new POINT_3D(cubeCenterX - cubeSize, cubeCenterY - cubeSize, cubeCenterZ - cubeSize), // -1, -1, -1
    new POINT_3D(cubeCenterX + cubeSize, cubeCenterY - cubeSize, cubeCenterZ - cubeSize), // 1, -1, -1
    new POINT_3D(cubeCenterX + cubeSize, cubeCenterY + cubeSize, cubeCenterZ - cubeSize), // 1, 1, -1
    new POINT_3D(cubeCenterX - cubeSize, cubeCenterY + cubeSize, cubeCenterZ - cubeSize), // -1, 1, -1
    new POINT_3D(cubeCenterX - cubeSize, cubeCenterY - cubeSize, cubeCenterZ + cubeSize), // -1, -1, 1
    new POINT_3D(cubeCenterX + cubeSize, cubeCenterY - cubeSize, cubeCenterZ + cubeSize), // 1, -1, 1
    new POINT_3D(cubeCenterX + cubeSize, cubeCenterY + cubeSize, cubeCenterZ + cubeSize), // 1, 1, 1
    new POINT_3D(cubeCenterX - cubeSize, cubeCenterY + cubeSize, cubeCenterZ + cubeSize)  // -1, 1, 1
];

let edges = [
    [0, 1], [1, 2], [2, 3], [3, 0], // back face
    [4, 5], [5, 6], [6, 7], [7, 4], // front face
    [0, 4], [1, 5], [2, 6], [3, 7] // connecting sides
];

let faces = [
    [4, 5, 6, 7], // front face
    [0, 1, 2, 3], // back face
    [5, 1, 2, 6], // right face
    [0, 4, 7, 3], // left face
    [4, 5, 1, 0], // bottom face
    [6, 7, 2, 3]  // top face 
]

let startingEdges = [
    [0, 1], [2, 3], [4, 5], [6, 7],
    [8, 9], [10, 11], [12, 13], [14, 15],
    [16, 17], [18, 19], [20, 21], [22, 23]
]

let startingVertices = [
    new POINT_3D(vertices[0].x - document.documentElement.clientWidth, vertices[0].y - document.documentElement.clientHeight, vertices[0].z),
    new POINT_3D(vertices[1].x - document.documentElement.clientWidth, vertices[1].y - document.documentElement.clientHeight, vertices[1].z),
    new POINT_3D(vertices[1].x + document.documentElement.clientWidth, vertices[1].y + document.documentElement.clientHeight, vertices[1].z),
    new POINT_3D(vertices[2].x + document.documentElement.clientWidth, vertices[2].y + document.documentElement.clientHeight, vertices[2].z),
    new POINT_3D(vertices[2].x - document.documentElement.clientWidth, vertices[2].y + document.documentElement.clientHeight, vertices[2].z),
    new POINT_3D(vertices[3].x - document.documentElement.clientWidth, vertices[3].y + document.documentElement.clientHeight, vertices[3].z),
    new POINT_3D(vertices[2].x + document.documentElement.clientWidth, vertices[2].y - document.documentElement.clientHeight, vertices[2].z),
    new POINT_3D(vertices[3].x + document.documentElement.clientWidth, vertices[3].y - document.documentElement.clientHeight, vertices[3].z),

    new POINT_3D(vertices[0].x - document.documentElement.clientWidth, vertices[0].y - document.documentElement.clientHeight, vertices[0].z),
    new POINT_3D(vertices[1].x - document.documentElement.clientWidth, vertices[1].y - document.documentElement.clientHeight, vertices[1].z),
    new POINT_3D(vertices[1].x + document.documentElement.clientWidth, vertices[1].y + document.documentElement.clientHeight, vertices[1].z),
    new POINT_3D(vertices[2].x + document.documentElement.clientWidth, vertices[2].y + document.documentElement.clientHeight, vertices[2].z),
    new POINT_3D(vertices[2].x - document.documentElement.clientWidth, vertices[2].y + document.documentElement.clientHeight, vertices[2].z),
    new POINT_3D(vertices[3].x - document.documentElement.clientWidth, vertices[3].y + document.documentElement.clientHeight, vertices[3].z),
    new POINT_3D(vertices[2].x + document.documentElement.clientWidth, vertices[2].y - document.documentElement.clientHeight, vertices[2].z),
    new POINT_3D(vertices[3].x + document.documentElement.clientWidth, vertices[3].y - document.documentElement.clientHeight, vertices[3].z),

    new POINT_3D(vertices[0].x - document.documentElement.clientWidth, vertices[0].y - document.documentElement.clientHeight, vertices[0].z),
    new POINT_3D(vertices[1].x - document.documentElement.clientWidth, vertices[1].y - document.documentElement.clientHeight, vertices[1].z),
    new POINT_3D(vertices[1].x + document.documentElement.clientWidth, vertices[1].y + document.documentElement.clientHeight, vertices[1].z),
    new POINT_3D(vertices[2].x + document.documentElement.clientWidth, vertices[2].y + document.documentElement.clientHeight, vertices[2].z),
    new POINT_3D(vertices[2].x - document.documentElement.clientWidth, vertices[2].y + document.documentElement.clientHeight, vertices[2].z),
    new POINT_3D(vertices[3].x - document.documentElement.clientWidth, vertices[3].y + document.documentElement.clientHeight, vertices[3].z),
    new POINT_3D(vertices[2].x + document.documentElement.clientWidth, vertices[2].y - document.documentElement.clientHeight, vertices[2].z),
    new POINT_3D(vertices[3].x + document.documentElement.clientWidth, vertices[3].y - document.documentElement.clientHeight, vertices[3].z),
    
]


function areVerticesEqualWithTolerance(vertex1, vertex2, tolerance) {
    return (
        Math.abs(vertex1.x - vertex2.x) <= tolerance &&
        Math.abs(vertex1.y - vertex2.y) <= tolerance &&
        Math.abs(vertex1.z - vertex2.z) <= tolerance
    );
}

function compareEdgesWithTolerance(edges, startingEdges, vertices, startingVertices, tolerance) {
    if (edges.length !== startingEdges.length) {
        return false;
    }

    for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        const startingEdge = startingEdges[i];

        const vertex1 = vertices[edge[0]];
        const vertex2 = vertices[edge[1]];

        const startingVertex1 = startingVertices[startingEdge[0]];
        const startingVertex2 = startingVertices[startingEdge[1]];

        if (
            !areVerticesEqualWithTolerance(vertex1, startingVertex1, tolerance) ||
            !areVerticesEqualWithTolerance(vertex2, startingVertex2, tolerance)
        ) {
            return false;
        }
    }

    return true;
}


let timeDelta
let timeLast = 0
let timeSinceResize = 0

function updateVertexPosition(){
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
}

let SPEED = 3
let isIdle = false


function modifyConstructionSpeed(totalTime) {
    let initialValue = 15;
    let accelerationDuration = totalTime * 0.99;
    let currentTime = 0;

    const interval = setInterval(() => {
    if (currentTime < accelerationDuration) {
        let accelerationFactor = 1 - (currentTime / accelerationDuration);
        let newValue = initialValue * accelerationFactor;
        SPEED = newValue;
    } else {
        let timeAfterAcceleration = currentTime - accelerationDuration;
        let accelerationFactor = timeAfterAcceleration / (totalTime - accelerationDuration);
        let newValue = initialValue + (3 - initialValue) * accelerationFactor;
        SPEED = newValue;
    }

    currentTime += 8; // Incremento de tiempo en milisegundos
    if (currentTime > totalTime) {
        clearInterval(interval);
    }
    }, 10);
}





function constructCube(timeNow){
    timeDelta = timeNow - timeLast
    timeSinceResize += timeDelta
    timeLast = timeNow

    let currentVertex = 0

    canvasContext.fillRect(0, 0, canvas.width, canvas.height)

    updateVertexPosition()
    

    for (let edge of startingEdges){
        let direction = [
            new POINT_3D(
                (vertices[edges[startingEdges.indexOf(edge)][0]].x - startingVertices[edge[0]].x),
                (vertices[edges[startingEdges.indexOf(edge)][0]].y - startingVertices[edge[0]].y),
                (vertices[edges[startingEdges.indexOf(edge)][0]].z - startingVertices[edge[0]].z)),
            new POINT_3D(
                (vertices[edges[startingEdges.indexOf(edge)][1]].x - startingVertices[edge[1]].x),
                (vertices[edges[startingEdges.indexOf(edge)][1]].y - startingVertices[edge[1]].y),
                (vertices[edges[startingEdges.indexOf(edge)][1]].z - startingVertices[edge[1]].z))
        ]

        let directionMagnitude = [
            Math.sqrt(Math.pow(direction[0].x, 2) + Math.pow(direction[0].y, 2) + Math.pow(direction[0].z, 2)),
            Math.sqrt(Math.pow(direction[1].x, 2) + Math.pow(direction[1].y, 2) + Math.pow(direction[1].z, 2))
        ]

        startingVertices[edge[0]].x += direction[0].x / directionMagnitude[0] *  SPEED 
        startingVertices[edge[0]].y += direction[0].y / directionMagnitude[0] *  SPEED
        startingVertices[edge[0]].z += direction[0].z / directionMagnitude[0] *  SPEED

        startingVertices[edge[1]].x += direction[1].x / directionMagnitude[1] *  SPEED
        startingVertices[edge[1]].y += direction[1].y / directionMagnitude[1] *  SPEED
        startingVertices[edge[1]].z += direction[1].z / directionMagnitude[1] *  SPEED
    }
    

    for(let edge of startingEdges){
        canvasContext.beginPath();
        canvasContext.moveTo(startingVertices[edge[0]].x, startingVertices[edge[0]].y);
        canvasContext.lineTo(startingVertices[edge[1]].x, startingVertices[edge[1]].y);
        canvasContext.stroke();
    }

    if(compareEdgesWithTolerance(edges, startingEdges, vertices, startingVertices, 10)){
        isIdle = true
    }
    

    if(!isIdle){
        requestAnimationFrame(constructCube)
    } else {
        requestAnimationFrame(idle)
    }
}



function idle(timeNow){
    timeDelta = timeNow - timeLast
        timeSinceResize += timeDelta

    timeLast = timeNow

    canvasContext.fillRect(0, 0, canvas.width, canvas.height)

    updateVertexPosition()

    for (let edge of edges) {
        canvasContext.beginPath();
        canvasContext.moveTo(vertices[edge[0]].x, vertices[edge[0]].y);
        canvasContext.lineTo(vertices[edge[1]].x, vertices[edge[1]].y);
        canvasContext.stroke();
    }


    requestAnimationFrame(idle)
    
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
        new POINT_3D(cubeCenterX - cubeSize, cubeCenterY - cubeSize, cubeCenterZ - cubeSize), // -1, -1, -1
        new POINT_3D(cubeCenterX + cubeSize, cubeCenterY - cubeSize, cubeCenterZ - cubeSize), // 1, -1, -1
        new POINT_3D(cubeCenterX + cubeSize, cubeCenterY + cubeSize, cubeCenterZ - cubeSize), // 1, 1, -1
        new POINT_3D(cubeCenterX - cubeSize, cubeCenterY + cubeSize, cubeCenterZ - cubeSize), // -1, 1, -1
        new POINT_3D(cubeCenterX - cubeSize, cubeCenterY - cubeSize, cubeCenterZ + cubeSize), // -1, -1, 1
        new POINT_3D(cubeCenterX + cubeSize, cubeCenterY - cubeSize, cubeCenterZ + cubeSize), // 1, -1, 1
        new POINT_3D(cubeCenterX + cubeSize, cubeCenterY + cubeSize, cubeCenterZ + cubeSize), // 1, 1, 1
        new POINT_3D(cubeCenterX - cubeSize, cubeCenterY + cubeSize, cubeCenterZ + cubeSize)  // -1, 1, 1
    ];


    let angle = timeSinceResize * 0.001 * SPEED_X * Math.PI * 2
    for(let vertex of vertices) {
        let dy = vertex.y - cubeCenterY;
        let dz = vertex.z - cubeCenterZ;
        let y = dy * Math.cos(angle) - dz * Math.sin(angle);
        let z = dy * Math.sin(angle) + dz * Math.cos(angle);
        vertex.y = y + cubeCenterY;
        vertex.z = z + cubeCenterZ;
    }

    // Y Axis Rotation
    angle = timeSinceResize * 0.001 * SPEED_Y * Math.PI * 2
    for(let vertex of vertices) {
        let dx = vertex.x - cubeCenterX;
        let dz = vertex.z - cubeCenterZ;
        let x = dz * Math.sin(angle) + dx * Math.cos(angle);
        let z = dz * Math.cos(angle) - dx * Math.sin(angle);
        vertex.x = x + cubeCenterX;
        vertex.z = z + cubeCenterZ;
    }

    // Z Axis Rotation
    angle = timeSinceResize * 0.001 * SPEED_Z * Math.PI * 2
    for(let vertex of vertices) {
        let dx = vertex.x - cubeCenterX;
        let dy = vertex.y - cubeCenterY;
        let x = dx * Math.cos(angle) - dy * Math.sin(angle);
        let y = dx * Math.sin(angle) + dy * Math.cos(angle);
        vertex.x = x + cubeCenterX;
        vertex.y = y + cubeCenterY;
    }
    
})

// Variables para el seguimiento del dedo táctil
let lastTouchX = null;
let lastTouchY = null;


// Función para manejar el evento del ratón
function handleMouseMove(event) {
    if(isIdle){
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

document.addEventListener('DOMContentLoaded', function () {
    // Iniciar el bucle para actualizar las velocidades
    updateSpeed();

    //requestAnimationFrame(idle)
    requestAnimationFrame(constructCube)
    modifyConstructionSpeed(3000);
});
