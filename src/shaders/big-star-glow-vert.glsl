#version 300 es

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

out float scale;
out vec2 fs_Pos;
out vec3 fs_Transformed_Pos;
out vec4 fs_Col;

#define bigStarRadius 696100.0
#define smallStarRadius 100000.0
#define BIG_TEMP 4000.0
#define DSUN 1392684.0
#define TSUN 5778.0

float calculateGlowSize(float diameter, float temperature, float dist) {
    float d = dist;
    float D = diameter * DSUN;
    float L = (D * D) * pow(temperature / TSUN, 4.0);
    return 0.016 * pow(L, 0.25) / pow(d, 0.5);
}

void main()
{
  fs_Pos = vs_Pos.xy;
  fs_Col = vs_Col;

  vec3 offset = vs_Translate.xyz;
  float glowSize;
  vec2 scale;
  if (vs_Col.w > 1.5) {
    glowSize = calculateGlowSize(smallStarRadius * 2.0, vs_Col.z, length(vs_Translate.xyz - u_Eye));
    scale = vec2(glowSize, glowSize) * smallStarRadius * 8.0;
  } else {
    glowSize = calculateGlowSize(bigStarRadius * 2.0, BIG_TEMP, length(vs_Translate.xyz - u_Eye));
    scale = vec2(glowSize, glowSize) * bigStarRadius * 4.0;
  }
  fs_Transformed_Pos = vs_Pos.x * u_CameraAxes[0] * 2.0 + vs_Pos.y * u_CameraAxes[1] * 2.0;
  vec3 billboardPos = offset + vs_Pos.x * u_CameraAxes[0] * scale.x + vs_Pos.y * u_CameraAxes[1] * scale.y;

  gl_Position = u_ViewProj * vec4(billboardPos, 1.0);
}
