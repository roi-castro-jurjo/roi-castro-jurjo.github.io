var canvas = document.getElementById('canvasCube');
GL =  canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

if (!GL)
    alert("This browser doesn't support WebGL!");

/*============ Defining and storing the geometry =========*/

var vertices = [
    -1,-1,-1, 1,-1,-1, 1, 1,-1, -1, 1,-1,
    -1,-1, 1, 1,-1, 1, 1, 1, 1, -1, 1, 1,
    -1,-1,-1, -1, 1,-1, -1, 1, 1, -1,-1, 1,
    1,-1,-1, 1, 1,-1, 1, 1, 1, 1,-1, 1,
    -1,-1,-1, -1,-1, 1, 1,-1, 1, 1,-1,-1,
    -1, 1,-1, -1, 1, 1, 1, 1, 1, 1, 1,-1, 
];

var colors = [
    5,3,7, 5,3,7, 5,3,7, 5,3,7,
    1,1,3, 1,1,3, 1,1,3, 1,1,3,
    0,0,1, 0,0,1, 0,0,1, 0,0,1,
    1,0,0, 1,0,0, 1,0,0, 1,0,0,
    1,1,0, 1,1,0, 1,1,0, 1,1,0,
    0,1,0, 0,1,0, 0,1,0, 0,1,0
];

var indices = [
    0,1,2, 0,2,3, 4,5,6, 4,6,7,
    8,9,10, 8,10,11, 12,13,14, 12,14,15,
    16,17,18, 16,18,19, 20,21,22, 20,22,23 
];

// Create and store data into vertex buffer
var vertex_buffer = GL.createBuffer ();
GL.bindBuffer(GL.ARRAY_BUFFER, vertex_buffer);
GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(vertices), GL.STATIC_DRAW);

// Create and store data into color buffer
var color_buffer = GL.createBuffer ();
GL.bindBuffer(GL.ARRAY_BUFFER, color_buffer);
GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(colors), GL.STATIC_DRAW);

// Create and store data into index buffer
var index_buffer = GL.createBuffer ();
GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, index_buffer);
GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), GL.STATIC_DRAW);



/*=================== Shaders =========================*/

var vertCode  = `
    attribute vec3 position;
    uniform mat4 Pmatrix;
    uniform mat4 Vmatrix;
    uniform mat4 Mmatrix;
    attribute vec3 color; // the color of the point
    varying vec3 vColor;

    void main(void) {
        gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.);
        vColor = color;
    }
`;
var fragCode  = `
    precision mediump float;
    varying vec3 vColor;

    void main(void) {
        gl_FragColor = vec4(vColor, 1.);
    }
`;

var vertShader = GL.createShader(GL.VERTEX_SHADER);
GL.shaderSource(vertShader, vertCode);
GL.compileShader(vertShader);

var fragShader = GL.createShader(GL.FRAGMENT_SHADER);
GL.shaderSource(fragShader, fragCode);
GL.compileShader(fragShader);

var shaderProgram = GL.createProgram();
GL.attachShader(shaderProgram, vertShader);
GL.attachShader(shaderProgram, fragShader);
GL.linkProgram(shaderProgram);



/* ====== Associating attributes to vertex shader =====*/

var Pmatrix = GL.getUniformLocation(shaderProgram, "Pmatrix");
var Vmatrix = GL.getUniformLocation(shaderProgram, "Vmatrix");
var Mmatrix = GL.getUniformLocation(shaderProgram, "Mmatrix");

GL.bindBuffer(GL.ARRAY_BUFFER, vertex_buffer);
var position = GL.getAttribLocation(shaderProgram, "position");
GL.vertexAttribPointer(position, 3, GL.FLOAT, false,0,0) ;

// Position
GL.enableVertexAttribArray(position);
GL.bindBuffer(GL.ARRAY_BUFFER, color_buffer);
var color = GL.getAttribLocation(shaderProgram, "color");
GL.vertexAttribPointer(color, 3, GL.FLOAT, false,0,0) ;

// Color
GL.enableVertexAttribArray(color);
GL.useProgram(shaderProgram);



/*==================== MATRIX =====================*/

function get_projection(angle, a, zMin, zMax) {
    var ang = Math.tan((angle*.5)*Math.PI/180);//angle*.5
    return [
            0.5/ang, 0 , 0, 0,
            0, 0.5*a/ang, 0, 0,
            0, 0, -(zMax+zMin)/(zMax-zMin), -1,
            0, 0, (-2*zMax*zMin)/(zMax-zMin), 0 
        ];
}

var proj_matrix = get_projection(40, canvas.width/canvas.height, 1, 100);

var mov_matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
var view_matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];

// translating z
view_matrix[14] = view_matrix[14]-6;//zoom



/*==================== Rotation ====================*/

function rotateZ(m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv0 = m[0], mv4 = m[4], mv8 = m[8];

    m[0] = c*m[0]-s*m[1];
    m[4] = c*m[4]-s*m[5];
    m[8] = c*m[8]-s*m[9];

    m[1]=c*m[1]+s*mv0;
    m[5]=c*m[5]+s*mv4;
    m[9]=c*m[9]+s*mv8;
}

function rotateX(m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv1 = m[1], mv5 = m[5], mv9 = m[9];

    m[1] = m[1]*c-m[2]*s;
    m[5] = m[5]*c-m[6]*s;
    m[9] = m[9]*c-m[10]*s;

    m[2] = m[2]*c+mv1*s;
    m[6] = m[6]*c+mv5*s;
    m[10] = m[10]*c+mv9*s;
}

function rotateY(m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv0 = m[0], mv4 = m[4], mv8 = m[8];

    m[0] = c*m[0]+s*m[2];
    m[4] = c*m[4]+s*m[6];
    m[8] = c*m[8]+s*m[10];

    m[2] = c*m[2]-s*mv0;
    m[6] = c*m[6]-s*mv4;
    m[10] = c*m[10]-s*mv8;
}



/*================= Drawing ===========================*/
var time_old = 0;

var animate = function(time) {
    var dt = time-time_old;
    rotateZ(mov_matrix, dt*0.005);//time
    rotateY(mov_matrix, dt*0.002);
    rotateX(mov_matrix, dt*0.003);
    time_old = time;

    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);
    GL.clearColor(0.5, 0.5, 0.5, 0.9);
    GL.clearDepth(1.0);

    GL.viewport(0.0, 0.0, canvas.width, canvas.height);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    GL.uniformMatrix4fv(Pmatrix, false, proj_matrix);
    GL.uniformMatrix4fv(Vmatrix, false, view_matrix);
    GL.uniformMatrix4fv(Mmatrix, false, mov_matrix);
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, index_buffer);
    GL.drawElements(GL.TRIANGLES, indices.length, GL.UNSIGNED_SHORT, 0);

    window.requestAnimationFrame(animate);
}

animate(0);