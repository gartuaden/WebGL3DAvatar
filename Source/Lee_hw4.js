// Author: Jung Won Lee

var canvas;
var gl;
var program;

var projectionMatrix; 
var modelViewMatrix;

var instanceMatrix;

var projectionMatrixLoc;

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

var vertexColors = [
    vec4( 1.0, 0.5, 0.0, 1.0 ),   // orange
    vec4( 1.0, 0.9, 0.8, 1.0 ),  // pink
    vec4( 0.97, 0.65, 1.0, 1.0 ),  // purple
    vec4( 1.0, 0.5, 0.0, 1.0 ),   // orange
    vec4( 1.0, 0.9, 0.8, 1.0 ),  // pink
    vec4( 0.97, 0.65, 1.0, 1.0 ),  // purple
    vec4( 1.0, 0.9, 0.8, 1.0 ),    // pink
    vec4( 1.0, 0.5, 0.0, 1.0 )   // orange
];
//-------------------------------------------
// Avatar & ground model variables

var torsoId = 0;
var headId  = 1;
var head1Id = 1;
var head2Id = 10;
var leftEarId = 11;
var rightEarId = 12;
var leftFrontLegId = 2;
var leftFrontFootId = 3;
var rightFrontLegId = 4;
var rightFrontFootId = 5;
var leftBackLegId = 6;
var leftBackFootId = 7;
var rightBackLegId = 8;
var rightBackFootId = 9;

var torsoHeight = 5.0;
var torsoWidth = 5.0;
var torsoDepth = 10.0;

var frontLegHeight = 2.0;
var frontLegWidth  = 1.0;
var frontFootHeight = 1.0;
var frontFootWidth  = 1.0;
var frontFootDepth = 1.5;
var backLegHeight = 2.0;
var backLegWidth  = 1.0;
var backFootHeight = 1.0;
var backFootWidth  = 1.0;
var backFootDepth = 1.5;

var headHeight = 3.5;
var headWidth = 5.0;
var headDepth = 4.0;

var earHeight = 2.0;
var earWidth = 1.0;

var torsoColor = vec4(1.0, 0.0, 0.0, 1.0);
var headColor = vec4(1.0, 1.0, 0.0, 1.0);
var earColor = vec4(0.5, 0.5, 0.5, 1.0);
var frontLegColor = vec4(1.0, 0.0, 1.0, 1.0);
var frontFootColor = vec4(0.0, 0.0, 1.0, 1.0);
var backLegColor = vec4(1.0, 0.0, 1.0, 1.0);
var backFootColor = vec4(0.0, 0.0, 1.0, 1.0);
var groundColor = vec4(0.0, 0.3, 0.0, 1.0);

var numNodes = 13;
var numAngles = 13;
var angle = 0;

//-------------------------------------------

var theta = [0, 0, 180, 0, 180, 0, 180, 0, 180, 0, 0, 0, 0];
var near = -10;
var far = 10;

//init eye on z-axis
var radius = 1.5;
var the  = 0.5;
//var phi    = Math.PI / 2.0;
var phi = 2.2;
var dr = 10.0 * Math.PI/180.0;

var left = -10.0;
var right = 10.0;
var ytop =10.0;
var bottom = -10.0;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var numVertices = 24;

var stack = [];

var figure = [];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;

var pointsArray = [];
var colorsArray = [];
var texCoordsArray = [];
var texCoordsArray2 = [];
var normalsArray = [];

//-------------------------------------------
// Animation variables

// theta variables
var theta_m = 0.0;
var theta_leg1 = 150.0;
var theta_leg2 = 240.0;
var theta_head = 30.0;
var theta_foot = -30.0;
var theta_ear1 = 30.0;
var theta_ear2 = -30.0;

var toggleFlag = true;
var legFlag1 = true;
var legFlag2 = true;
var headFlag = true;
var footFlag = true;
var earFlag1 = true;
var earFlag2 = true;


var texSize = 16;
var texture1, texture2;
var t1, t2;

var image1 = new Uint8Array(4*texSize*texSize);

    for ( var i = 0; i < texSize; i++ ) {
        for ( var j = 0; j <texSize; j++ ) {
            image1[4*i*texSize+4*j] = 127+127*Math.cos(0.5*i*j)-Math.tan(0.5*i*j);
            image1[4*i*texSize+4*j+1] = 127+127*Math.cos(0.5*i*j)-Math.tan(0.5*i*j);
            image1[4*i*texSize+4*j+2] = 127+127*Math.cos(0.5*i*j)-Math.tan(0.5*i*j);
            image1[4*i*texSize+4*j+3] = 255;
           }
    }

// texture for avatar
var texCoord = [
    vec2(0, 1),
    vec2(2, 3),
    vec2(3, 2),
    vec2(1, 0)
];

// texture for ground
var texCoord2 = [
    vec2(0, 50),
    vec2(100, 150),
    vec2(150, 100),
    vec2(50, 0)
];

var lightPosition = vec4(-500.0,0.0,-500.0, 1.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;
var ctm;
var ambientColor, diffuseColor, specularColor;

//-------------------------------------------


function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}


function initNodes(Id) {

    var m = mat4();
    var angle = 0.0;
    
    switch(Id) {
    
    case torsoId:
    
    angle = radians(theta[torsoId]);
    m = translate(15.0 * Math.cos(angle), 0.0, 15.0 * Math.sin(angle));
    m = mult(m, rotate(theta[torsoId], 0, -1, 0 ));
    figure[torsoId] = createNode( m, torso, null, headId );
    break;

    case headId: 
    case head1Id: 
    case head2Id:
    
    m = translate(0.0, torsoHeight, torsoDepth*0.5);
	m = mult(m, rotate(theta[head1Id], 1, 0, 0))
	m = mult(m, rotate(theta[head2Id], 0, 1, 0));
    figure[headId] = createNode( m, head, leftFrontLegId, leftEarId);
    break;
    
    case leftEarId:
    m = translate(-(headWidth*0.2+earWidth), headHeight, -headDepth*0.5);
    m = mult(m, rotate(theta[leftEarId], 0, 0, 1));
        figure[leftEarId] = createNode( m, leftEar, rightEarId, null);
    break;
            
    case rightEarId:
    m = translate(headWidth*0.2+earWidth, headHeight, -headDepth*0.5);
    m = mult(m, rotate(theta[rightEarId], 0, 0, 1));
        figure[rightEarId] = createNode( m, rightEar, null, null);
    break;
    
    case leftFrontLegId:
    
    m = translate(-(torsoWidth*0.2+frontLegWidth), 0.0, torsoDepth*0.4);
	m = mult(m, rotate(theta[leftFrontLegId], 1, 0, 0));
    figure[leftFrontLegId] = createNode( m, leftFrontLeg, rightFrontLegId, leftFrontFootId );
    break;

    case rightFrontLegId:
    
    m = translate((torsoWidth*0.2+frontLegWidth), 0.0, torsoDepth*0.4);
	m = mult(m, rotate(theta[rightFrontLegId], 1, 0, 0));
    figure[rightFrontLegId] = createNode( m, rightFrontLeg, leftBackLegId, rightFrontFootId );
    break;
    
    case leftBackLegId:
    
    m = translate(-(torsoWidth*0.2+frontLegWidth), 0.0, -torsoDepth*0.4);
	m = mult(m , rotate(theta[leftBackLegId], 1, 0, 0));
    figure[leftBackLegId] = createNode( m, leftBackLeg, rightBackLegId, leftBackFootId );
    break;

    case rightBackLegId:
    
    m = translate((torsoWidth*0.2+frontLegWidth), 0.0, -torsoDepth*0.4);
	m = mult(m, rotate(theta[rightBackLegId], 1, 0, 0));
    figure[rightBackLegId] = createNode( m, rightBackLeg, null, rightBackFootId );
    break;
    
    case leftFrontFootId:

    m = translate(0.0, frontLegHeight, -frontLegWidth*(0.3));
    m = mult(m, rotate(theta[leftFrontFootId], 1, 0, 0));
    figure[leftFrontFootId] = createNode( m, leftFrontFoot, null, null );
    break;
    
    case rightFrontFootId:

    m = translate(0.0, frontLegHeight, -frontLegWidth*(0.3));
    m = mult(m, rotate(theta[rightFrontFootId], 1, 0, 0));
    figure[rightFrontFootId] = createNode( m, rightFrontFoot, null, null );
    break;
    
    case leftBackFootId:

    m = translate(0.0, frontLegHeight, -frontLegWidth*(0.3));
    m = mult(m, rotate(theta[leftBackFootId], 1, 0, 0));
    figure[leftBackFootId] = createNode( m, leftBackFoot, null, null );
    break;
    
    case rightBackFootId:

    m = translate(0.0, frontLegHeight, -frontLegWidth*(0.3));
    m = mult(m, rotate(theta[rightBackFootId], 1, 0, 0));
    figure[rightBackFootId] = createNode( m, rightBackFoot, null, null );
    break;
    
    }

}

function traverse(Id) {
   if(Id == null) return; 
   stack.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
   figure[Id].render();
    
   if(figure[Id].child != null) traverse(figure[Id].child);
    
    modelViewMatrix = stack.pop();
    
   if(figure[Id].sibling != null) traverse(figure[Id].sibling); 
}

function torso() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( torsoWidth, torsoHeight, torsoDepth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(torsoColor) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head() {
   
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale4(headWidth, headHeight, headWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(headColor) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftEar(){
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * earHeight, 0.0 ));
    instanceMatrix = mult(instanceMatrix, scale4(earWidth, earHeight, earWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    gl.uniform4fv(colorLoc, flatten(earColor) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightEar(){
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * earHeight, 0.0 ));
    instanceMatrix = mult(instanceMatrix, scale4(earWidth, earHeight, earWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    gl.uniform4fv(colorLoc, flatten(earColor) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
    
}

function leftFrontLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * frontLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(frontLegWidth, frontLegHeight, frontLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(frontLegColor) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftFrontFoot() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * frontFootHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(frontFootWidth, frontFootHeight, frontFootDepth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(frontFootColor) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightFrontLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * frontLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(frontLegWidth, frontLegHeight, frontLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(frontLegColor) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightFrontFoot() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * frontFootHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(frontFootWidth, frontFootHeight, frontFootDepth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(frontFootColor) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function  leftBackLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * backLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(backLegWidth, backLegHeight, backLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(backLegColor) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftBackFoot() {
    
    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * backFootHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(backFootWidth, backFootHeight, backFootDepth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(backFootColor) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightBackLeg() {
    
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * backLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(backLegWidth, backLegHeight, backLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(backLegColor) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightBackFoot() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * backFootHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(backFootWidth, backFootHeight, backFootDepth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(backFootColor) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}


function configureTexture() {
    texture2 = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture2 );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image1);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

function quad(a, b, c, d) {
     pointsArray.push(vertices[a]);
    normalsArray.push(vertices[a]);
    colorsArray.push(vertexColors[a]);
    texCoordsArray.push(texCoord[0]);
    texCoordsArray2.push(texCoord2[0]);

     pointsArray.push(vertices[b]);
        normalsArray.push(vertices[b]);
    colorsArray.push(vertexColors[b]);
    texCoordsArray.push(texCoord[1]);
     texCoordsArray2.push(texCoord2[1]);
    
     pointsArray.push(vertices[c]);
        normalsArray.push(vertices[c]);
    colorsArray.push(vertexColors[c]);
    texCoordsArray.push(texCoord[2]);
        texCoordsArray2.push(texCoord2[2]);

     pointsArray.push(vertices[d]);
        normalsArray.push(vertices[d]);
    colorsArray.push(vertexColors[d]);
    texCoordsArray.push(texCoord[3]);
        texCoordsArray2.push(texCoord2[3]);
}


function cube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
	
	gl.enable(gl.DEPTH_TEST);
    
    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");
    gl.useProgram( program);
    
    ambientProduct = mult(lightAmbient, materialAmbient);
     diffuseProduct = mult(lightDiffuse, materialDiffuse);
     specularProduct = mult(lightSpecular, materialSpecular);

    instanceMatrix = mat4();
    
  //  projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    
    projectionMatrix = ortho(-35.0,35.0,-35.0, 35.0,-35.0,35.0);
    modelViewMatrix = mat4();

        
	modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
		
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix) );
    
    	
	colorLoc = gl.getUniformLocation(program, "color");
	gl.uniform4fv(colorLoc, flatten(torsoColor) );
    
    cube();
    
    // load the light
    pointsArray.push(lightPosition[0]);
    pointsArray.push(lightPosition[1]);
    pointsArray.push(lightPosition[2]);
    pointsArray.push(lightPosition[3]);
    // not used, but size should match points
    normalsArray.push(1.0);
    normalsArray.push(0.0);
    normalsArray.push(0.0);
    normalsArray.push(1.0);
    
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
       gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
       gl.enableVertexAttribArray( vNormal);
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
    
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );
    
    var tBuffer2 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer2);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray2), gl.STATIC_DRAW );
    
    var vTexCoord2 = gl.getAttribLocation( program, "vTexCoord2" );
    gl.vertexAttribPointer( vTexCoord2, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord2 );
    
    configureTexture();
               
    gl.activeTexture( gl.TEXTURE1 );
    gl.bindTexture( gl.TEXTURE_2D, texture2 );
    gl.uniform1i(gl.getUniformLocation( program, "Tex1"), 1);
    
    
    for(i=0; i<numNodes; i++) initNodes(i);
    
    
    document.getElementById("ButtonOFF").onclick = function(){toggleFlag = false;};
    document.getElementById("ButtonON").onclick = function(){toggleFlag = true;};
    
    
    gl.uniform4fv( gl.getUniformLocation(program,
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program,
       "shininess"),materialShininess );
    
    render();
}

// Upadate theta of joint id with t angle
function updateTheta(id, t){
    theta[id] = t;
    initNodes(id);
}

// Animate the joints with specific value
function animationNodes(){
    if(theta_head > 30.0 ) {theta_head -= 1.0; headFlag = false;}
    else if(theta_head < -30.0) {theta_head += 1.0; headFlag = true;}
    else if(theta_head <=  30.0 && theta_head >= -30.0 && headFlag) theta_head += 1.0;
    else if(theta_head <=  30.0 && theta_head >= -30.0 && !headFlag) theta_head -= 1.0;
           
    if(theta_ear1 > 30.0 ) {theta_ear1 -= 2.0; earFlag1 = false;}
    else if(theta_ear1 < -30.0) {theta_ear1 += 2.0; earFlag1 = true;}
    else if(theta_ear1 <=  30.0 && theta_ear1 >= -30.0 && earFlag1) theta_ear1 += 3.0;
    else if(theta_ear1 <=  30.0 && theta_ear1 >= -30.0 && !earFlag1) theta_ear1 -= 3.0;
              
    if(theta_ear2 > 30.0 ) {theta_ear2 -= 2.0; earFlag2 = false;}
    else if(theta_ear2 < -30.0) {theta_ear2 += 2.0; earFlag2 = true;}
    else if(theta_ear2<=  30.0 && theta_ear2>= -30.0 && earFlag2) theta_ear2 += 3.0;
    else if(theta_ear2 <=  30.0 && theta_ear2 >= -30.0 && !earFlag2) theta_ear2 -= 3.0;
           
    if(theta_leg1 > 240.0 ) {theta_leg1 -= 3.0; legFlag1 = false;}
    else if(theta_leg1 < 150.0) {theta_leg1 += 3.0; legFlag1 = true;}
    else if(theta_leg1 <=  240.0 && theta_leg1 >= 150.0 && legFlag1) theta_leg1 += 3.0;
    else if(theta_leg1 <=  240.0 && theta_leg1 >= 150.0 && !legFlag1) theta_leg1 -= 3.0;

    if(theta_leg2 > 240.0 ) {theta_leg2 -= 3.0; legFlag2 = false;}
    else if(theta_leg2 < 150.0) {theta_leg2 += 3.0; legFlag2 = true;}
    else if(theta_leg2 <=  240.0 && theta_leg2 >= 150.0 && legFlag2) theta_leg2 += 3.0;
    else if(theta_leg2 <=  240.0 && theta_leg2 >= 150.0 && !legFlag2) theta_leg2 -= 3.0;
           
    if(theta_foot > 30.0 ) {theta_foot -= 2.0; footFlag = false;}
    else if(theta_foot < -30.0) {theta_foot += 2.0; footFlag = true;}
    else if(theta_foot <=  30.0 && theta_foot >= -30.0 && footFlag) theta_foot += 2.0;
    else if(theta_foot <=  30.0 && theta_foot >= -30.0 && !footFlag) theta_foot -= 2.0;
}

var render = function() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform1i(gl.getUniformLocation( program, "groundFlag" ), 0);
    gl.uniform1i(gl.getUniformLocation( program, "fgroundFlag" ), 0);

    // Toggle animation
    if(toggleFlag) {
        // theta master goes between 0 and 360 degrees
        if(theta_m >= 360.0) theta_m = 0.0;
        theta_m += 0.5;

        animationNodes();
    }
    for ( var i = 0; i < texSize; i++ ) {
        for ( var j = 0; j <texSize; j++ ) {
            image1[4*i*texSize+4*j] = 127+127*Math.cos(0.5*i*j+theta_m)-Math.tan(0.5*i*j+theta_m);
            image1[4*i*texSize+4*j+1] = 127+127*Math.cos(0.5*i*j+theta_m)-Math.tan(0.5*i*j+theta_m);
            image1[4*i*texSize+4*j+2] = 127+127*Math.cos(0.5*i*j+theta_m)-Math.tan(0.5*i*j+theta_m);
            image1[4*i*texSize+4*j+3] = 255;
           }
    }
    configureTexture();
                  
    gl.activeTexture( gl.TEXTURE1 );
    gl.bindTexture( gl.TEXTURE_2D, texture2 );
    gl.uniform1i(gl.getUniformLocation( program, "Tex1"), 1);
    
    updateTheta(torsoId, theta_m);
    updateTheta(head2Id, theta_head);
    updateTheta(leftEarId, theta_ear1);
    updateTheta(rightEarId, theta_ear2);
    updateTheta(leftFrontLegId, theta_leg1);
    updateTheta(rightBackLegId, theta_leg1);
    updateTheta(rightFrontLegId, theta_leg2);
    updateTheta(leftBackLegId, theta_leg2);
    updateTheta(leftFrontFootId, theta_foot);
    updateTheta(rightFrontFootId, theta_foot);
    updateTheta(leftBackFootId, theta_foot);
    updateTheta(rightBackFootId, theta_foot);

    
    eye = vec3(radius*Math.sin(the)*Math.cos(phi),
               radius*Math.sin(the)*Math.sin(phi), radius*Math.cos(the));
    
    modelViewMatrix = lookAt(eye, at , up);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
      
    
    traverse(torsoId);
    
    // Create and display a ground plane

    gl.uniform1i(gl.getUniformLocation( program, "groundFlag" ), 1);
    gl.uniform1i(gl.getUniformLocation( program, "fgroundFlag" ), 1);
    m = translate(0.0, -frontLegHeight-frontFootHeight-0.5,0.0);
    modelViewMatrix = mult(modelViewMatrix, m);
    instanceMatrix = mult(modelViewMatrix, scale4(50.0,1.0, 50.0) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    gl.uniform4fv(colorLoc, flatten(groundColor) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
    
    requestAnimFrame(render);
}
