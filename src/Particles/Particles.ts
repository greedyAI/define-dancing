import {vec3, vec4, mat3, mat4, quat} from 'gl-matrix';
import Drawable from '.././rendering/gl/Drawable';
import {gl} from '.././globals';
import FireExtinguisherParticle from './FireExtinguisherParticle';

class Particles {
  upVector: vec3 = vec3.fromValues(0,1,0);

  feParticles: FireExtinguisherParticle[] = [];
  feCol: vec4;
  feDensity: number;
  feSpeed: number;
  feSize: number;
  feLife: number;
  feParticleCount: number;

  feTime: number;
  fePrevDensity: number;
  delta: number = 0.0001;

  feTranslate: number[] = [];
  feRotate: number[] = [];
  feScale: number[] = [];
  feColor: number[] = [];
  feCount: number = 0;

  constructor(feCol: vec4) {
    this.feCol = feCol;
    this.feTime = 0;
  }

  noise(p: vec3) {
    let val: number = Math.abs(Math.sin((p[0] + 100.0) * 987.654 + (p[1] + 100.0) * 123.456 + (p[2] + 100.0) * 531.975) * 85734.3545);
    return val - Math.floor(val);
  }

  feParticlesPath(t: number) {
    // Use for graphing: https://christopherchudzicki.github.io/MathBox-Demos/parametric_curves_3D.html
    let x: number = Math.cos(2 * t) + Math.cos(7 * t) / 2 + Math.sin(3 * t) / 3;
    let y: number = Math.sin(10 * t);
    let z: number = Math.sin(2 * t) + Math.sin(7 * t) / 2 + Math.cos(3 * t) / 3;
    return vec3.fromValues(x * 10, y * 10, z * 10);
  }

  feParticlesTangent(t: number) {
    let f1: vec3 = this.feParticlesPath(t + this.delta);
    let f2: vec3 = this.feParticlesPath(t);
    let diff: vec3 = vec3.create();
    vec3.sub(diff, f1, f2);
    vec3.normalize(diff, diff);
    return diff;
  }

  feParticlesDensity(t: number, dt: number) {
    let pos: vec3 = this.feParticlesPath(t);
    let oldTangent: vec3 = this.feParticlesTangent(t - dt);
    let newTangent: vec3 = this.feParticlesTangent(t);
    let diff: vec3 = vec3.create();
    vec3.sub(diff, newTangent, oldTangent);
    let len: number = vec3.len(diff) * 2;
    return Math.max(0, len - 0.02) + Math.max(0, this.noise(pos) - 0.9) * 2;
  }

  createFEParticles(density: number, initSpeed: number, initScale: number, life: number) {
    this.feDensity = density;
    this.feSpeed = initSpeed;
    this.feSize = initScale;
    this.feLife = life;
    for (var i = 0; i < density; i++) {
      let initPos: vec3 = this.feParticlesPath(0);
      let initTangent: vec3 = this.feParticlesTangent(0);
      //vec3.scale(initTangent, initTangent, -1);
      let newParticle: FireExtinguisherParticle = new FireExtinguisherParticle(initPos, initTangent, initSpeed, initScale, 0);
      let cross: vec3 = vec3.create();
      vec3.cross(cross, this.upVector, initTangent);
      newParticle.rotate(cross, 30 * Math.random() - 15);
      vec3.cross(cross, cross, initTangent);
      newParticle.rotate(cross, 30 * Math.random() - 15);
      this.feParticles.push(newParticle);
    }
    this.feParticleCount = density;
    this.fePrevDensity = density;
  }

  updateFEParticles(dt: number) {
    for (var i = 0; i < this.feParticleCount; i++) {
      this.feParticles[i].update(dt);
      if (this.feParticles[i].life <= 0) {
        let deadParticle: FireExtinguisherParticle = this.feParticles[i];
        this.feParticles[i] = this.feParticles[this.feParticleCount - 1];
        this.feParticles[this.feParticleCount - 1] = deadParticle;
        this.feParticleCount--;
      }
    }
    this.feTime += dt * (1 + this.fePrevDensity);
    let density: number = this.feParticlesDensity(this.feTime, dt * (1 + this.fePrevDensity));
    for (var i = 0; i < Math.floor(density * this.feDensity); i++) {
      let pos: vec3 = this.feParticlesPath(this.feTime);
      let tangent: vec3 = this.feParticlesTangent(this.feTime);
      vec3.scale(tangent, tangent, -1);
      let newParticle: FireExtinguisherParticle = new FireExtinguisherParticle(pos, tangent, this.feSpeed, this.feSize, this.feLife);
      let cross: vec3 = vec3.create();
      vec3.cross(cross, this.upVector, tangent);
      newParticle.rotate(cross, 30 * Math.random() - 15);
      vec3.cross(cross, cross, tangent);
      newParticle.rotate(cross, 30 * Math.random() - 15);
      if (this.feParticles.length > this.feParticleCount) {
        this.feParticles[this.feParticleCount] = newParticle;
        this.feParticleCount++;
      } else {
        this.feParticles.push(newParticle);
      }
    }
    this.fePrevDensity = density;
  }

  createInstanceArrays() {
    this.feTranslate = [];
    this.feRotate = [];
    this.feScale = [];
    this.feColor = [];
    this.feCount = 0;
    for (var i = 0; i < this.feParticleCount; i++) {
      let fep: FireExtinguisherParticle = this.feParticles[i];
      let quaternion: quat = quat.fromValues(0,0,0,1);
      quat.rotationTo(quaternion, this.upVector, fep.orientation);
      quat.normalize(quaternion, quaternion);
      this.feTranslate.push(fep.position[0], fep.position[1], fep.position[2], 0);
      this.feRotate.push(quaternion[0], quaternion[1], quaternion[2], quaternion[3]);
      this.feScale.push(fep.scale, fep.scale, fep.scale, 1);
      this.feColor.push(this.feCol[0], this.feCol[1], this.feCol[2], this.feCol[3]);
      this.feCount += 1
    }
  }
};

export default Particles;
