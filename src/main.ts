import {vec3, vec4, mat3, mat4, quat} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL, readTextFile} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Particles from './Particles/Particles'
import Mesh from './geometry/Mesh'
import Cube from './geometry/Cube';
import ScreenQuad from './geometry/ScreenQuad';
import Texture from './rendering/gl/Texture';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {

};

let particles: Particles;
let feParticle: Cube;
let feSimulationSpeed: number = 0.1;

let walle: Mesh;
let walleTex: Texture;
let walleNor: Texture;
let walleTranslate: number[] = [];
let walleRotate: number[] = [];
let walleScale: number[] = [];
let walleColor: number[] = [];
let walleCount: number = 0;

let eve: Mesh;
let eveTex: Texture;
let eveTranslate: number[] = [];
let eveRotate: number[] = [];
let eveScale: number[] = [];
let eveColor: number[] = [];
let eveCount: number = 0;

let screenQuad: ScreenQuad;

let prevTime: number;
let startTime: number;

function loadScene() {
  prevTime = (new Date()).getTime();
  startTime = prevTime;

  screenQuad = new ScreenQuad();
  screenQuad.create();

  particles = new Particles(vec4.fromValues(1,1,1,1));
  particles.createFEParticles(1000, 0.5, 0.05, 1);
  particles.createInstanceArrays();

  feParticle = new Cube(vec3.fromValues(0,0,0));
  feParticle.create();
  feParticle.setInstanceVBOs(new Float32Array(particles.feTranslate), new Float32Array(particles.feRotate), new Float32Array(particles.feScale), new Float32Array(particles.feColor));
  feParticle.setNumInstances(particles.feCount);

  let walleString: string = readTextFile('./obj/walle2.obj')
  walle = new Mesh(walleString, vec3.fromValues(0,0,0));
  walle.create();
  // walleTex = new Texture('./textures/wall-e_diffuse.png', 0);
  // walleNor = new Texture('./textures/wall-e_normal_map.tga.png', 0);

  let eveString: string = readTextFile('./obj/eve.obj')
  eve = new Mesh(eveString, vec3.fromValues(0,0,0));
  eve.create();
  eveTex = new Texture('./textures/eve_eyes_05.png', 0);

  let startPos: vec3 = particles.feParticlesPath(0);
  let startDir: vec3 = particles.feParticlesTangent(0);
  let quaternion: quat = quat.fromValues(0,0,0,1);
  quat.rotationTo(quaternion, particles.upVector, startDir);
  quat.normalize(quaternion, quaternion);
  walleTranslate.push(startPos[0], startPos[1], startPos[2], 0);
  walleRotate.push(quaternion[0], quaternion[1], quaternion[2], quaternion[3]);
  walleScale.push(1, 1, 1, 1);
  walleColor.push(0.5, 0.25, 0, 1);
  walleCount += 1
  walle.setInstanceVBOs(new Float32Array(walleTranslate), new Float32Array(walleRotate), new Float32Array(walleScale), new Float32Array(walleColor));
  walle.setNumInstances(walleCount);

  let cross: vec3 = vec3.create();
  vec3.cross(cross, particles.upVector, startDir);
  eveTranslate.push(startPos[0] + 30 * cross[0], startPos[1] + 30 * cross[1], startPos[2] + 30 * cross[2], 0);
  eveRotate.push(quaternion[0], quaternion[1], quaternion[2], quaternion[3]);
  eveScale.push(0.02, 0.02, 0.02, 1);
  eveColor.push(0.98, 0.98, 0.98, 1);
  eveCount += 1
  eve.setInstanceVBOs(new Float32Array(eveTranslate), new Float32Array(eveRotate), new Float32Array(eveScale), new Float32Array(eveColor));
  eve.setNumInstances(eveCount);
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 50, 0), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  const walleShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/walle-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/walle-frag.glsl')),
  ]);

  const eveShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/eve-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/eve-frag.glsl')),
  ]);

  // walleShader.bindTexToUnit(walleShader.unifSampler1, walleTex, 0);
  // walleShader.bindTexToUnit(walleShader.unifSampler2, walleNor, 1);
  eveShader.bindTexToUnit(eveShader.unifSampler1, eveTex, 0);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    let newTime: number = (new Date()).getTime();
    instancedShader.setTime(newTime - startTime);
    flat.setTime(newTime - startTime);

    particles.updateFEParticles((newTime - prevTime) * feSimulationSpeed / 1000);
    prevTime = newTime;
    particles.createInstanceArrays();
    feParticle.setInstanceVBOs(new Float32Array(particles.feTranslate), new Float32Array(particles.feRotate), new Float32Array(particles.feScale), new Float32Array(particles.feColor));
    feParticle.setNumInstances(particles.feCount);

    let wallePos: vec3 = particles.feParticlesPath(particles.feTime);
    let walleDir: vec3 = particles.feParticlesTangent(particles.feTime);
    let quaternion: quat = quat.fromValues(0,0,0,1);
    quat.rotationTo(quaternion, particles.upVector, walleDir);
    quat.normalize(quaternion, quaternion);
    walleTranslate = [];
    walleRotate = [];
    walleScale = [];
    walleColor = [];
    walleCount = 0;
    walleTranslate.push(wallePos[0], wallePos[1], wallePos[2], 0);
    walleRotate.push(quaternion[0], quaternion[1], quaternion[2], quaternion[3]);
    walleScale.push(1, 1, 1, 1);
    walleColor.push(0.5, 0.25, 0, 1);
    walleCount += 1
    walle.setInstanceVBOs(new Float32Array(walleTranslate), new Float32Array(walleRotate), new Float32Array(walleScale), new Float32Array(walleColor));
    walle.setNumInstances(walleCount);

    let cross: vec3 = vec3.create();
    vec3.cross(cross, particles.upVector, walleDir);
    eveTranslate = [];
    eveRotate = [];
    eveScale = [];
    eveColor = [];
    eveCount = 0;
    eveTranslate.push(0, 0, 0, 0);
    eveRotate.push(quaternion[0], quaternion[1], quaternion[2], quaternion[3]);
    eveScale.push(0.02, 0.02, 0.02, 1);
    eveColor.push(0.98, 0.98, 0.98, 1);
    eveCount += 1
    eve.setInstanceVBOs(new Float32Array(eveTranslate), new Float32Array(eveRotate), new Float32Array(eveScale), new Float32Array(eveColor));
    eve.setNumInstances(eveCount);

    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, instancedShader, [
      feParticle
    ]);
    renderer.render(camera, walleShader, [
      walle
    ]);
    renderer.render(camera, eveShader, [
      eve
    ]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
