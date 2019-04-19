import {mat4, vec3, vec4, mat3} from 'gl-matrix';
import Drawable from './Drawable';
import Camera from '../../Camera';
import {gl} from '../../globals';
import ShaderProgram from './ShaderProgram';

// In this file, `gl` is accessible because it is imported above
class OpenGLRenderer {
  constructor(public canvas: HTMLCanvasElement) {
  }

  setClearColor(r: number, g: number, b: number, a: number) {
    gl.clearColor(r, g, b, a);
  }

  setSize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  clear() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  render(camera: Camera, prog: ShaderProgram, drawables: Array<Drawable>) {
    let model = mat4.create();
    let viewProj = mat4.create();
    let cross: vec3 = vec3.create();
    vec3.cross(cross, camera.up, camera.direction);
    // Each column of the axes matrix is an axis. Right, Up, Forward.
    let axes = mat3.fromValues(cross[0], cross[1], cross[2],
                               camera.up[0], camera.up[1], camera.up[2],
                               camera.direction[0], camera.direction[1], camera.direction[2]);


    prog.setEyeRefUp(camera.controls.eye, camera.controls.center, camera.controls.up);
    mat4.identity(model);
    mat4.multiply(viewProj, camera.projectionMatrix, camera.viewMatrix);
    prog.setModelMatrix(model);
    prog.setViewProjMatrix(viewProj);
    prog.setCameraAxes(axes);

    for (let drawable of drawables) {
      prog.draw(drawable);
    }
  }
};

export default OpenGLRenderer;
