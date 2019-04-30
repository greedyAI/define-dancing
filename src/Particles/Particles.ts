import {vec3, vec4, mat3, mat4, quat} from 'gl-matrix';
import Drawable from '.././rendering/gl/Drawable';
import {gl} from '.././globals';
import Particle from './Particle';

class Particles {
  upVector: vec3 = vec3.fromValues(0,1,0);

  feParticles: Particle[] = [];
  feCol: vec4;
  feDensity: number;
  feSpeed: number;
  feSize: number;
  feLife: number;
  feParticleCount: number;

  feTime: number;
  fePrevDensity: number;

  delta: number = 0.0001;

  eveParticles: Particle[] = [];
  eveDensity: number;
  eveSpeed: number;
  eveSize: number;
  eveLife: number;
  eveParticleCount: number;

  eveTime: number;
  evePrevDensity: number;

  feTranslate: number[] = [];
  feRotate: number[] = [];
  feScale: number[] = [];
  feColor: number[] = [];
  feCount: number = 0;

  eveTranslate: number[] = [];
  eveRotate: number[] = [];
  eveScale: number[] = [];
  eveColor: number[] = [];
  eveCount: number = 0;

  starsTranslate: number[] = [];
  starsRotate: number[] = [];
  starsScale: number[] = [];
  starsColor: number[] = [];
  starsCount: number = 0;

  constructor(feCol: vec4) {
    this.feCol = feCol;
    this.feTime = 0;
    this.eveTime = 0.01;
  }

  noise(p: vec3) {
    let val: number = Math.abs(Math.sin((p[0] + 100.0) * 987.654 + (p[1] + 100.0) * 123.456 + (p[2] + 100.0) * 531.975) * 85734.3545);
    return val - Math.floor(val);
  }

  noise2(p: vec3) {
    let val: number = Math.abs(Math.sin((p[0] * 10.0 + 500.0) * 789.456 + (p[1] * 10.0 + 500.0) * 321.654 + (p[2] * 10.0 + 500.0) * 135.579) * 37585.4534);
    return val - Math.floor(val);
  }

  noise3(p: vec3) {
    let val: number = Math.abs(Math.sin((p[0] * 10.0 - 300.0) * 654.987 + (p[1] * 10.0 - 300.0) * 456.123 + (p[2] * 10.0 - 300.0) * 975.531) * 43545.8573);
    return val - Math.floor(val);
  }

  noise4(p: vec3) {
    let val: number = Math.abs(Math.sin((p[0] * 10.0 + 100.0) * 456.789 + (p[1] * 10.0 + 100.0) * 654.321 + (p[2] * 10.0 + 100.0) * 579.135) * 54534.3758);
    return val - Math.floor(val);
  }

  feParticlesPath(t: number) {
    // Use for graphing: https://christopherchudzicki.github.io/MathBox-Demos/parametric_curves_3D.html
    let x: number = Math.cos(2 * t) + Math.cos(7 * t) / 2 + Math.sin(3 * t) / 3;
    let y: number = Math.sin(10 * t);
    let z: number = Math.sin(2 * t) + Math.sin(7 * t) / 2 + Math.cos(3 * t) / 3;
    return vec3.fromValues(x * 20, y * 20, z * 20);
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
      vec3.scale(initTangent, initTangent, -1);
      let newParticle: Particle = new Particle(initPos, initTangent, initSpeed, initScale, 0);
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

  createEveParticles(density: number, initSpeed: number, initScale: number, life: number) {
    this.eveDensity = density;
    this.eveSpeed = initSpeed;
    this.eveSize = initScale;
    this.eveLife = life;
  }

  createStars(density: number, scale: number) {
    var seed1 = 1;
    var seed2 = 1;
    var seed3 = 1;
    for (var i = 0; i < density; i++) {
      var x = this.noise2(vec3.fromValues(seed1, seed1, seed1));
      var distance = (x - Math.floor(x)) * 60000000 + 15000000;
      var y = this.noise3(vec3.fromValues(seed2, seed2, seed2));
      var theta = (y - Math.floor(y)) * 360;
      var z = this.noise4(vec3.fromValues(seed3, seed3, seed3));
      var phi = (z - Math.floor(z)) * 180;
      var starCoord = vec3.fromValues(distance * Math.sin(phi) * Math.cos(theta), distance * Math.sin(phi) * Math.sin(theta), distance * Math.cos(phi));
      var w = this.noise(vec3.fromValues(seed1, seed1, seed1));
      var temp = (w - Math.floor(w)) * 10000 + 2000;

      this.starsTranslate.push(starCoord[0], starCoord[1], starCoord[2], 0);
      this.starsRotate.push(0, 0, 0, 1);
      this.starsScale.push(scale, scale, scale, 1);
      this.starsColor.push(1, 1, temp, 2);
      this.starsCount += 1

      seed1++;
      seed2++;
      seed3++;
    }
  }

  updateFEParticles(dt: number) {
    for (var i = 0; i < this.feParticleCount; i++) {
      this.feParticles[i].update(dt);
      if (this.feParticles[i].life <= 0) {
        let deadParticle: Particle = this.feParticles[i];
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
      let newParticle: Particle = new Particle(pos, tangent, this.feSpeed, this.feSize, this.feLife);
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

  updateEveParticles(dt: number) {
    this.eveTime += dt;
    if (this.eveParticles.length == 0) {
      for (var i = 0; i < this.eveDensity; i++) {
        let initPos: vec3 = this.feParticlesPath(this.eveTime - 0.01 * i);
        let initTangent: vec3 = this.feParticlesTangent(this.eveTime - 0.01 * i);
        vec3.scale(initTangent, initTangent, -1);
        let newParticle: Particle = new Particle(initPos, initTangent, this.eveSpeed, this.eveSize, this.eveLife);
        newParticle.t = this.eveTime - 0.01 * i;
        this.eveParticles.push(newParticle);
      }
      this.eveParticleCount = this.eveDensity;
      this.evePrevDensity = this.eveDensity;
    } else {
      for (var i = 0; i < this.eveParticleCount; i++) {
        this.eveParticles[i].t += dt;
        this.eveParticles[i].orientation = this.feParticlesTangent(this.eveParticles[i].t);
        this.eveParticles[i].position = this.feParticlesPath(this.eveParticles[i].t);
        if (this.eveParticles[i].life <= 0) {
          let deadParticle: Particle = this.eveParticles[i];
          this.eveParticles[i] = this.eveParticles[this.eveParticleCount - 1];
          this.eveParticles[this.eveParticleCount - 1] = deadParticle;
          this.eveParticleCount--;
        }
      }
    }
    // this.eveTime += dt * (1 + this.evePrevDensity);
    // let density: number = this.feParticlesDensity(this.eveTime, dt * (1 + this.evePrevDensity));
    // for (var i = 0; i < Math.floor(density * this.eveDensity); i++) {
    //   let pos: vec3 = this.feParticlesPath(this.eveTime + .01);
    //   let tangent: vec3 = this.feParticlesTangent(this.eveTime + .01);
    //   vec3.scale(tangent, tangent, -1);
    //   let newParticle: Particle = new Particle(pos, tangent, this.eveSpeed, this.eveSize, this.eveLife);
    //   if (this.eveParticles.length > this.eveParticleCount) {
    //     this.eveParticles[this.eveParticleCount] = newParticle;
    //     this.eveParticleCount++;
    //   } else {
    //     this.eveParticles.push(newParticle);
    //   }
    // }
    // this.evePrevDensity = density;
  }

  createInstanceArrays() {
    this.feTranslate = [];
    this.feRotate = [];
    this.feScale = [];
    this.feColor = [];
    this.feCount = 0;
    for (var i = 0; i < this.feParticleCount; i++) {
      let fep: Particle = this.feParticles[i];
      let quaternion: quat = quat.fromValues(0,0,0,1);
      quat.rotationTo(quaternion, this.upVector, fep.orientation);
      quat.normalize(quaternion, quaternion);
      this.feTranslate.push(fep.position[0], fep.position[1], fep.position[2], 0);
      this.feRotate.push(quaternion[0], quaternion[1], quaternion[2], quaternion[3]);
      this.feScale.push(fep.scale, fep.scale, fep.scale, 1);
      this.feColor.push(this.feCol[0], this.feCol[1], this.feCol[2], this.feCol[3]);
      this.feCount += 1
    }

    this.eveTranslate = [];
    this.eveRotate = [];
    this.eveScale = [];
    this.eveColor = [];
    this.eveCount = 0;
    for (var i = 0; i < this.eveParticleCount; i++) {
      let scaleFactor: number = (this.eveParticleCount - i / 2) / this.eveParticleCount;
      let evep: Particle = this.eveParticles[i];
      let quaternion: quat = quat.fromValues(0,0,0,1);
      quat.rotationTo(quaternion, this.upVector, evep.orientation);
      quat.normalize(quaternion, quaternion);
      this.eveTranslate.push(evep.position[0], evep.position[1], evep.position[2], 0);
      this.eveRotate.push(quaternion[0], quaternion[1], quaternion[2], quaternion[3]);
      if (i > 0) {
        let prev: Particle = this.eveParticles[i - 1];
        let dist: vec3 = vec3.create();
        vec3.sub(dist, evep.position, prev.position);
        this.eveScale.push(evep.scale * scaleFactor, vec3.length(dist), evep.scale * scaleFactor, 1);
      } else {
        this.eveScale.push(evep.scale * scaleFactor, evep.scale, evep.scale * scaleFactor, 1);
      }
      this.eveColor.push(1,1,1, (this.eveParticleCount - i) / this.eveParticleCount);
      this.eveCount += 1
    }
  }
};

export default Particles;
