const SPEED_X = 0.05;
const SPEED_Y = 0.15;
const SPEED_Z = 0.10;

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
//canvasContext.lineCap = "round"


let cubeCenterX = canvas.width / 2
let cubeCenterY = canvas.height / 2
let cubeCenterZ = 0
let cubeSize = canvas.height / 4

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

    // X Axis
    let angle = timeDelta * 0.001 * SPEED_X * Math.PI * 2
    for(let vertex of vertices) {
        let dy = vertex.y - cubeCenterY;
        let dz = vertex.z - cubeCenterZ;
        let y = dy * Math.cos(angle) - dz * Math.sin(angle);
        let z = dy * Math.sin(angle) + dz * Math.cos(angle);
        vertex.y = y + cubeCenterY;
        vertex.z = z + cubeCenterZ;
    }

    // Y Axis
    angle = timeDelta * 0.001 * SPEED_Y * Math.PI * 2
    for(let vertex of vertices) {
        let dx = vertex.x - cubeCenterX;
        let dz = vertex.z - cubeCenterZ;
        let x = dz * Math.sin(angle) + dx * Math.cos(angle);
        let z = dz * Math.cos(angle) - dx * Math.sin(angle);
        vertex.x = x + cubeCenterX;
        vertex.z = z + cubeCenterZ;
    }

    // Z Axis
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
