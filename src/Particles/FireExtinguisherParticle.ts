import {glMatrix, vec3, vec4, mat3, mat4, quat} from 'gl-matrix';
import Drawable from '.././rendering/gl/Drawable';
import {gl} from '.././globals';

class FireExtinguisherParticle {
  position: vec3;
  orientation: vec3; // index 0 = right, index 1 = up, index 2 = forward
  speed: number;
  scale: number;
  life: number;

  constructor(position: vec3, orientation: vec3, speed: number, scale: number, life: number) {
    this.position = position;
    this.orientation = orientation;
    this.speed = speed;
    this.scale = scale;
    this.life = life;
  }

  rotate(axisOfRotation: vec3, angle: number) {
    let quaternion: quat = quat.create();
    let newOrientation: vec4 = vec4.fromValues(this.orientation[0], this.orientation[1], this.orientation[2], 0);
    vec3.normalize(axisOfRotation, axisOfRotation);
    quat.setAxisAngle(quaternion, axisOfRotation, glMatrix.toRadian(angle));
    quat.normalize(quaternion, quaternion);
    vec4.transformQuat(newOrientation, newOrientation, quaternion);
    this.orientation = vec3.fromValues(newOrientation[0], newOrientation[1], newOrientation[2]);
    vec3.normalize(this.orientation, this.orientation);
  }

  update(dt: number) {
    this.life -= dt;

    if (this.life > 0) {
      vec3.add(this.position, this.position, vec3.fromValues(this.speed * this.orientation[0], this.speed * this.orientation[1], this.speed * this.orientation[2]));
    }
  }


};

export default FireExtinguisherParticle;
