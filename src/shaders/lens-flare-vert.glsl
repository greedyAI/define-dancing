#version 300 es

uniform vec2 u_Dimensions;
uniform mat4 u_ViewProj;
uniform float u_Time;

uniform vec3 u_Eye;
uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.

in vec4 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color

out vec2 fs_Pos;
out float fs_Intensity;
out vec4 fs_Col;

#define bigStarRadius 696100.0


void main()
{
  fs_Pos = vs_Pos.xy;
  fs_Col = vs_Col;

  gl_Position = u_ViewProj * vec4(-8000000.0, -10000000.0, 0.0, 1.0);
  gl_Position.x /= gl_Position.w;
  gl_Position.y /= gl_Position.w;

  vec2 centerPos = gl_Position.xy;
  vec2 offsetVec = vec2(0.0) - centerPos;

  fs_Intensity = max(0.0, 1.0 - length(offsetVec) / 1.0) * 0.2;
  gl_Position.z = vs_Pos.z;
  gl_Position.w = vs_Pos.w;
  gl_Position.xy += vec2(vs_Pos.x * vs_Translate.w, vs_Pos.y * vs_Translate.w * u_Dimensions.x / u_Dimensions.y) + offsetVec * pow(vs_Translate.x, 2.0) * 0.5;
}
