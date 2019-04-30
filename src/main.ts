import {glMatrix, vec3, vec4, mat3, mat4, quat} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL, readTextFile} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Particles from './Particles/Particles'
import Particle from './Particles/Particle'
import Mesh from './geometry/Mesh'
import Cube from './geometry/Cube';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import Texture from './rendering/gl/Texture';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {

};

let particles: Particles;
let feParticle: Cube;
let eveParticle: Mesh;
let eveParticleTex: Texture;
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

let bigStar: Mesh;
let bigStarBlackbody: Texture;
let bigStarLocation: vec3 = vec3.fromValues(-8000000, -10000000, 0);
let bigStarRadius: number = 696100;
let bigStarTranslate: number[] = [];
let bigStarRotate: number[] = [];
let bigStarScale: number[] = [];
let bigStarColor: number[] = [];
let bigStarCount: number = 0;

let bigStarCorona: Square;
let bigStarCoronaTranslate: number[] = [];
let bigStarCoronaRotate: number[] = [];
let bigStarCoronaScale: number[] = [];
let bigStarCoronaColor: number[] = [];
let bigStarCoronaCount: number = 0;

let bigStarGlow: Square;
let bigStarGlowTex: Texture;
let bigStarGlowCol: Texture;
let bigStarGlowTranslate: number[] = [];
let bigStarGlowColor: number[] = [];
let bigStarGlowCount: number = 0;

let smallStar: Mesh;
let smallStarRadius: number = 100000;
let smallStarTranslate: number[] = [];
let smallStarRotate: number[] = [];
let smallStarScale: number[] = [];
let smallStarColor: number[] = [];
let smallStarCount: number = 0;

let smallStarGlow: Square;
let smallStarGlowTex: Texture;
let smallStarGlowTranslate: number[] = [];
let smallStarGlowColor: number[] = [];
let smallStarGlowCount: number = 0;

let fireExtinguisher: Mesh;
let fireExtinguisherTex: Texture;
let fireExtinguisherTranslate: number[] = [];
let fireExtinguisherRotate: number[] = [];
let fireExtinguisherScale: number[] = [];
let fireExtinguisherColor: number[] = [];
let fireExtinguisherCount: number = 0;

let axiom: Mesh;
let axiomTex: Texture;
let axiomTranslate: number[] = [];
let axiomRotate: number[] = [];
let axiomScale: number[] = [];
let axiomColor: number[] = [];
let axiomCount: number = 0;

let lensFlare: Square;
let lensFlareTex1: Texture;
let lensFlareTex2: Texture;
let lensFlareTranslate: number[] = [];
let lensFlareColor: number[] = [];
let lensFlareCount: number = 0;

let occlusionQuery1: WebGLQuery;
let occlusionQuery2: WebGLQuery;

let screenQuad: ScreenQuad;

let prevTime: number;
let startTime: number;

function walleLocation(t: number) {

}

function loadScene() {
  prevTime = (new Date()).getTime();
  startTime = prevTime;

  screenQuad = new ScreenQuad();
  screenQuad.create();

  particles = new Particles(vec4.fromValues(1,1,1,1));
  particles.createFEParticles(1000, 0.5, 0.05, 1);
  particles.createEveParticles(25, 0.1, 1, 1);
  particles.createInstanceArrays();

  feParticle = new Cube(vec3.fromValues(0, 0, 0));
  feParticle.create();
  feParticle.setInstanceVBOs(new Float32Array(particles.feTranslate), new Float32Array(particles.feRotate), new Float32Array(particles.feScale), new Float32Array(particles.feColor));
  feParticle.setNumInstances(particles.feCount);

  let eveParticleString: string = readTextFile('./obj/eve-exhaust.obj')
  eveParticle = new Mesh(eveParticleString, vec3.fromValues(0,0,0));
  eveParticle.create();
  eveParticle.setInstanceVBOs(new Float32Array(particles.eveTranslate), new Float32Array(particles.eveRotate), new Float32Array(particles.eveScale), new Float32Array(particles.eveColor));
  eveParticle.setNumInstances(particles.eveCount);
  eveParticleTex = new Texture('./textures/eve-exhaust.png', 0);

  let walleString: string = readTextFile('./obj/walle.obj')
  walle = new Mesh(walleString, vec3.fromValues(3.1,-2,-3.85));
  walle.create();
  walleTex = new Texture('./textures/wall-e_diffuse.png', 0);
  // walleNor = new Texture('./textures/wall-e_normal_map.tga.png', 0);

  let fireExtinguisherString: string = readTextFile('./obj/fire-extinguisher.obj')
  fireExtinguisher = new Mesh(fireExtinguisherString, vec3.fromValues(3.9,3,0.15));
  fireExtinguisher.create();
  fireExtinguisherTex = new Texture('./textures/fire-extinguisher.png', 0);

  let eveString: string = readTextFile('./obj/eve.obj')
  eve = new Mesh(eveString, vec3.fromValues(0,0,0));
  eve.create();
  eveTex = new Texture('./textures/eve-base-color.png', 0);

  let axiomString: string = readTextFile('./obj/spaceship.obj')
  axiom = new Mesh(axiomString, vec3.fromValues(0,0,0));
  axiom.create();
  axiomTex = new Texture('./textures/spaceship.png', 0);
  axiomTranslate.push(500, -1000, -250, 0);
  axiomRotate.push(0, 0, 0, 1);
  axiomScale.push(1, 1, 1, 1);
  axiomColor.push(1, 1, 1, 1);
  axiomCount = 1
  axiom.setInstanceVBOs(new Float32Array(axiomTranslate), new Float32Array(axiomRotate), new Float32Array(axiomScale), new Float32Array(axiomColor));
  axiom.setNumInstances(axiomCount);

  let bigStarString: string = readTextFile('./obj/detailed-sphere.obj')
  bigStar = new Mesh(bigStarString, vec3.fromValues(0,0,0));
  bigStar.create();
  bigStarBlackbody = new Texture('./textures/blackbody.png', 0);
  bigStarTranslate.push(bigStarLocation[0], bigStarLocation[1], bigStarLocation[2], 0);
  bigStarRotate.push(0, 0, 0, 1);
  bigStarScale.push(bigStarRadius, bigStarRadius, bigStarRadius, 1);
  bigStarColor.push(1, 1, 1, 1);
  bigStarCount = 1
  bigStar.setInstanceVBOs(new Float32Array(bigStarTranslate), new Float32Array(bigStarRotate), new Float32Array(bigStarScale), new Float32Array(bigStarColor));
  bigStar.setNumInstances(bigStarCount);

  bigStarCorona = new Square();
  bigStarCorona.create();
  bigStarCoronaTranslate.push(bigStarLocation[0], bigStarLocation[1], bigStarLocation[2], 0);
  bigStarCoronaColor.push(1, 1, 1, 1);
  bigStarCoronaCount = 1
  bigStarCorona.setInstanceVBOs(new Float32Array(bigStarCoronaTranslate), new Float32Array(bigStarCoronaColor));
  bigStarCorona.setNumInstances(bigStarCoronaCount);

  bigStarGlow = new Square();
  bigStarGlow.create();
  bigStarGlowTex = new Texture('./textures/lens-glow.png', 0);
  bigStarGlowCol = new Texture('./textures/glow.png', 0);
  bigStarGlowTranslate.push(bigStarLocation[0], bigStarLocation[1], bigStarLocation[2], 0);
  bigStarGlowColor.push(window.innerWidth / window.innerHeight, 1, 1, 1);
  bigStarGlowCount = 1
  bigStarGlow.setInstanceVBOs(new Float32Array(bigStarGlowTranslate), new Float32Array(bigStarGlowColor));
  bigStarGlow.setNumInstances(bigStarGlowCount);

  let smallStarString: string = readTextFile('./obj/simple-sphere.obj')
  smallStar = new Mesh(smallStarString, vec3.fromValues(0,0,0));
  smallStar.create();
  particles.createStars(1000, smallStarRadius);
  smallStar.setInstanceVBOs(new Float32Array(particles.starsTranslate), new Float32Array(particles.starsRotate), new Float32Array(particles.starsScale), new Float32Array(particles.starsColor));
  smallStar.setNumInstances(particles.starsCount);

  smallStarGlow = new Square();
  smallStarGlow.create();
  smallStarGlow.setInstanceVBOs(new Float32Array(particles.starsTranslate), new Float32Array(particles.starsColor));
  smallStarGlow.setNumInstances(particles.starsCount);
  smallStarGlowTex = new Texture('./textures/lens-glow2.png', 0);

  lensFlare = new Square();
  lensFlare.create();
  lensFlareTranslate.push(1, 0, 0, 0.13);
  lensFlareColor.push(1, 1, 1, 1);
  lensFlareTranslate.push(1.25, 0, 0, 0.1);
  lensFlareColor.push(1, 1, 1, 1);
  lensFlareTranslate.push(1.1, 0, 0, 0.175);
  lensFlareColor.push(0, 1, 1, 1);
  lensFlareTranslate.push(1.5, 0, 0, 0.065);
  lensFlareColor.push(0, 1, 1, 1);
  lensFlareTranslate.push(1.6, 0, 0, 0.09);
  lensFlareColor.push(0, 1, 1, 1);
  lensFlareTranslate.push(1.7, 0, 0, 0.045);
  lensFlareColor.push(0, 1, 1, 1);
  lensFlareCount = 6;
  lensFlare.setInstanceVBOs(new Float32Array(lensFlareTranslate), new Float32Array(lensFlareColor));
  lensFlare.setNumInstances(lensFlareCount);
  lensFlareTex1 = new Texture('./textures/lens-flare1.png', 0);
  lensFlareTex2 = new Texture('./textures/lens-flare2.png', 0);

  let startPos: vec3 = particles.feParticlesPath(0);
  let startDir: vec3 = particles.feParticlesTangent(0);
  let quaternion: quat = quat.fromValues(0,0,0,1);
  quat.rotationTo(quaternion, particles.upVector, startDir);
  quat.normalize(quaternion, quaternion);
  walleTranslate.push(startPos[0], startPos[1], startPos[2], 0);
  walleRotate.push(quaternion[0], quaternion[1], quaternion[2], quaternion[3]);
  walleScale.push(1, 1, 1, 1);
  walleColor.push(1, 1, 1, 1);
  walleCount = 1
  walle.setInstanceVBOs(new Float32Array(walleTranslate), new Float32Array(walleRotate), new Float32Array(walleScale), new Float32Array(walleColor));
  walle.setNumInstances(walleCount);

  fireExtinguisherTranslate.push(startPos[0], startPos[1], startPos[2], 0);
  fireExtinguisherRotate.push(quaternion[0], quaternion[1], quaternion[2], quaternion[3]);
  fireExtinguisherScale.push(0.75, 0.75, 0.75, 1);
  fireExtinguisherColor.push(1, 1, 1, 1);
  fireExtinguisherCount = 1
  fireExtinguisher.setInstanceVBOs(new Float32Array(fireExtinguisherTranslate), new Float32Array(fireExtinguisherRotate), new Float32Array(fireExtinguisherScale), new Float32Array(fireExtinguisherColor));
  fireExtinguisher.setNumInstances(fireExtinguisherCount);

  // let cross: vec3 = vec3.create();
  // vec3.cross(cross, particles.upVector, startDir);
  startPos = particles.feParticlesPath(.01);
  startDir = particles.feParticlesTangent(.01);
  quaternion = quat.fromValues(0,0,0,1);
  quat.rotationTo(quaternion, particles.upVector, startDir);
  quat.normalize(quaternion, quaternion);
  eveTranslate.push(startPos[0], startPos[1], startPos[2], 0);
  eveRotate.push(quaternion[0], quaternion[1], quaternion[2], quaternion[3]);
  eveScale.push(2, 2, 2, 1);
  eveColor.push(1, 1, 1, 1);
  eveCount = 1
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

  const feShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/fe-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/fe-frag.glsl')),
  ]);

  const eveShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/eve-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/eve-frag.glsl')),
  ]);

  const eveExhaustShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/eve-exhaust-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/eve-exhaust-frag.glsl')),
  ]);

  const axiomShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/axiom-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/axiom-frag.glsl')),
  ]);

  const bigStarShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/big-star-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/big-star-frag.glsl')),
  ]);

  const bigStarCoronaShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/big-star-corona-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/big-star-corona-frag.glsl')),
  ]);

  const bigStarGlowShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/big-star-glow-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/big-star-glow-frag.glsl')),
  ]);

  const lensFlareShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lens-flare-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lens-flare-frag.glsl')),
  ]);

  occlusionQuery1 = gl.createQuery();
  occlusionQuery2 = gl.createQuery();

  // This function will be called every frame
  function tick() {
    walleShader.bindTexToUnit(walleShader.unifSampler1, walleTex, 0);
    // walleShader.bindTexToUnit(walleShader.unifSampler2, walleNor, 1);
    eveShader.bindTexToUnit(eveShader.unifSampler1, eveTex, 2);
    eveExhaustShader.bindTexToUnit(eveExhaustShader.unifSampler1, eveParticleTex, 3);
    bigStarShader.bindTexToUnit(bigStarShader.unifSampler1, bigStarBlackbody, 4);
    bigStarGlowShader.bindTexToUnit(bigStarGlowShader.unifSampler1, bigStarGlowTex, 5);
    bigStarGlowShader.bindTexToUnit(bigStarGlowShader.unifSampler2, bigStarGlowCol, 6);
    bigStarGlowShader.bindTexToUnit(bigStarGlowShader.unifSampler3, smallStarGlowTex, 7);
    feShader.bindTexToUnit(feShader.unifSampler1, fireExtinguisherTex, 8);
    axiomShader.bindTexToUnit(axiomShader.unifSampler1, axiomTex, 9);
    lensFlareShader.bindTexToUnit(lensFlareShader.unifSampler1, lensFlareTex1, 10);
    lensFlareShader.bindTexToUnit(lensFlareShader.unifSampler2, lensFlareTex2, 11);

    camera.update();
    stats.begin();
    let newTime: number = (new Date()).getTime();
    instancedShader.setTime(newTime - startTime);
    eveExhaustShader.setTime(newTime - startTime);
    flat.setTime(newTime - startTime);
    bigStarShader.setTime(newTime - startTime);
    bigStarCoronaShader.setTime(newTime - startTime);
    bigStarGlowShader.setTime(newTime - startTime);

    particles.updateFEParticles((newTime - prevTime) * feSimulationSpeed / 1000);
    particles.updateEveParticles((newTime - prevTime) * feSimulationSpeed / 1000);
    prevTime = newTime;
    particles.createInstanceArrays();
    feParticle.setInstanceVBOs(new Float32Array(particles.feTranslate), new Float32Array(particles.feRotate), new Float32Array(particles.feScale), new Float32Array(particles.feColor));
    feParticle.setNumInstances(particles.feCount);
    eveParticle.setInstanceVBOs(new Float32Array(particles.eveTranslate), new Float32Array(particles.eveRotate), new Float32Array(particles.eveScale), new Float32Array(particles.eveColor));
    eveParticle.setNumInstances(particles.eveCount);

    let axiomQuat: quat = quat.fromValues(0,0,0,1);
    quat.rotateZ(axiomQuat, axiomQuat, glMatrix.toRadian(newTime - startTime) / 100);
    quat.normalize(axiomQuat, axiomQuat);
    axiomTranslate = [];
    axiomRotate = [];
    axiomScale = [];
    axiomColor = [];
    axiomTranslate.push(500, -1000, -250, 0);
    axiomRotate.push(axiomQuat[0], axiomQuat[1], axiomQuat[2], axiomQuat[3]);
    axiomScale.push(1, 1, 1, 1);
    axiomColor.push(1, 1, 1, 1);
    axiomCount = 1
    axiom.setInstanceVBOs(new Float32Array(axiomTranslate), new Float32Array(axiomRotate), new Float32Array(axiomScale), new Float32Array(axiomColor));
    axiom.setNumInstances(axiomCount);

    let wallePos: vec3 = particles.feParticlesPath(particles.feTime);
    let walleDir: vec3 = particles.feParticlesTangent(particles.feTime);
    let quaternion: quat = quat.fromValues(0,0,0,1);
    quat.rotationTo(quaternion, particles.upVector, walleDir);
    quat.normalize(quaternion, quaternion);
    walleTranslate = [];
    walleRotate = [];
    walleScale = [];
    walleColor = [];
    walleTranslate.push(wallePos[0], wallePos[1], wallePos[2], 0);
    walleRotate.push(quaternion[0], quaternion[1], quaternion[2], quaternion[3]);
    walleScale.push(1, 1, 1, 1);
    walleColor.push(0.5, 0.25, 0, 1);
    walleCount = 1
    walle.setInstanceVBOs(new Float32Array(walleTranslate), new Float32Array(walleRotate), new Float32Array(walleScale), new Float32Array(walleColor));
    walle.setNumInstances(walleCount);

    fireExtinguisherTranslate = [];
    fireExtinguisherRotate = [];
    fireExtinguisherScale = [];
    fireExtinguisherColor = [];
    fireExtinguisherTranslate.push(wallePos[0], wallePos[1], wallePos[2], 0);
    fireExtinguisherRotate.push(quaternion[0], quaternion[1], quaternion[2], quaternion[3]);
    fireExtinguisherScale.push(0.75, 0.75, 0.75, 1);
    fireExtinguisherColor.push(0.5, 0.25, 0, 1);
    fireExtinguisherCount = 1
    fireExtinguisher.setInstanceVBOs(new Float32Array(fireExtinguisherTranslate), new Float32Array(fireExtinguisherRotate), new Float32Array(fireExtinguisherScale), new Float32Array(fireExtinguisherColor));
    fireExtinguisher.setNumInstances(fireExtinguisherCount);

    // let cross: vec3 = vec3.create();
    // vec3.cross(cross, particles.upVector, walleDir);
    let evePos: vec3 = particles.feParticlesPath(particles.eveTime);
    let eveDir: vec3 = particles.feParticlesTangent(particles.eveTime);
    quaternion = quat.fromValues(0,0,0,1);
    quat.rotationTo(quaternion, particles.upVector, eveDir);
    quat.normalize(quaternion, quaternion);
    eveTranslate = [];
    eveRotate = [];
    eveScale = [];
    eveColor = [];
    eveTranslate.push(evePos[0], evePos[1], evePos[2], 0);
    eveRotate.push(quaternion[0], quaternion[1], quaternion[2], quaternion[3]);
    eveScale.push(2, 2, 2, 1);
    eveColor.push(1, 1, 1, 1);
    eveCount = 1
    eve.setInstanceVBOs(new Float32Array(eveTranslate), new Float32Array(eveRotate), new Float32Array(eveScale), new Float32Array(eveColor));
    eve.setNumInstances(eveCount);

    if (occlusionQuery1 == 0) {
      occlusionQuery1 = gl.createQuery();
      occlusionQuery2 = gl.createQuery();
    } else if (gl.getQueryParameter(occlusionQuery1, gl.QUERY_RESULT_AVAILABLE) && gl.getQueryParameter(occlusionQuery2, gl.QUERY_RESULT_AVAILABLE)) {
      var totalSamples = gl.getQueryParameter(occlusionQuery1, gl.QUERY_RESULT);
      lensFlareShader.setVisibility(Math.min(1, totalSamples));
    }

    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();

    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, bigStarCoronaShader, [
      bigStarCorona
    ]);

    gl.depthMask(false);
    gl.beginQuery(gl.ANY_SAMPLES_PASSED, occlusionQuery1);
    gl.disable(gl.DEPTH_TEST);
    renderer.render(camera, bigStarShader, [
      bigStar,
    ]);
    gl.enable(gl.DEPTH_TEST);
    gl.endQuery(gl.ANY_SAMPLES_PASSED);

    gl.beginQuery(gl.ANY_SAMPLES_PASSED, occlusionQuery2);
    renderer.render(camera, bigStarShader, [
      bigStar,
    ]);
    gl.endQuery(gl.ANY_SAMPLES_PASSED);
    gl.depthMask(true);

    gl.disable(gl.DEPTH_TEST);
    renderer.render(camera, bigStarShader, [
      smallStar
    ]);

    gl.blendFunc(gl.ONE, gl.ONE);
    renderer.render(camera, bigStarGlowShader, [
      bigStarGlow,
      smallStarGlow
    ]);
    renderer.render(camera, lensFlareShader, [
      lensFlare
    ]);

    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.DEPTH_TEST);
    renderer.render(camera, axiomShader, [
      axiom
    ]);
    renderer.render(camera, walleShader, [
      walle
    ]);
    renderer.render(camera, feShader, [
      fireExtinguisher
    ]);
    renderer.render(camera, eveShader, [
      eve
    ]);
    gl.depthMask(false);
    renderer.render(camera, instancedShader, [
      feParticle
    ]);
    renderer.render(camera, eveExhaustShader, [
      eveParticle
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
    lensFlareShader.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);
  lensFlareShader.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
