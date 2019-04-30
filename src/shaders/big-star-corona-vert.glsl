#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.

in vec4 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color

out vec3 fs_Pos;
out vec4 fs_Col;

#define bigStarRadius 696100.0

void main()
{
  fs_Col = vs_Col;

  vec3 offset = vs_Translate.xyz;
  float scale = bigStarRadius * 10.0;
  fs_Pos = vs_Pos.x * u_CameraAxes[0] * 2.0 + vs_Pos.y * u_CameraAxes[1] * 2.0;
  vec3 billboardPos = offset + vs_Pos.x * u_CameraAxes[0] * scale + vs_Pos.y * u_CameraAxes[1] * scale;

  gl_Position = u_ViewProj * vec4(billboardPos, 1.0);
}
