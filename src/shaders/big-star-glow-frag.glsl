#version 300 es
precision highp float;

uniform float u_Time;
uniform sampler2D u_Tex1, u_Tex2, u_Tex3;
uniform mat3 u_CameraAxes;

in vec2 fs_Pos;
in vec3 fs_Transformed_Pos;
in vec4 fs_Col;

out vec4 out_Col;

#define BIG_TEMP 4000.0

float random1(vec3 p, vec3 seed) {
  return fract(sin(dot(p + seed, vec3(987.654, 123.456, 531.975))) * 85734.3545);
}

float quinticSmooth(float t) {
  float x = clamp(t, 0.0, 1.0);
  return x * x * x * (x * (x * 6.0  - 15.0) + 10.0);
}

float interpRand(float x, float y, float z) {
  vec3 seed = vec3(0, 0, 0);

  float intX = floor(x);
  float fractX = fract(x);
  float intY = floor(y);
  float fractY = fract(y);
  float intZ = floor(z);
  float fractZ = fract(z);

  vec3 c1 = vec3(intX, intY, intZ);
  vec3 c2 = vec3(intX + 1.0, intY, intZ);
  vec3 c3 = vec3(intX, intY, intZ + 1.0);
  vec3 c4 = vec3(intX + 1.0, intY, intZ + 1.0);
  vec3 c5 = vec3(intX, intY + 1.0, intZ);
  vec3 c6 = vec3(intX + 1.0, intY + 1.0, intZ);
  vec3 c7 = vec3(intX, intY + 1.0, intZ + 1.0);
  vec3 c8 = vec3(intX + 1.0, intY + 1.0, intZ + 1.0);

  float v1 = random1(c1, seed);
  float v2 = random1(c2, seed);
  float v3 = random1(c3, seed);
  float v4 = random1(c4, seed);
  float v5 = random1(c5, seed);
  float v6 = random1(c6, seed);
  float v7 = random1(c7, seed);
  float v8 = random1(c8, seed);

  float i1 = mix(v1, v2, quinticSmooth(fractX));
  float i2 = mix(v3, v4, quinticSmooth(fractX));
  float j1 = mix(i1, i2, quinticSmooth(fractZ));

  float i3 = mix(v5, v6, quinticSmooth(fractX));
  float i4 = mix(v7, v8, quinticSmooth(fractX));
  float j2 = mix(i3, i4, quinticSmooth(fractZ));

  return mix(j1, j2, quinticSmooth(fractY));
}

float glowTexture(vec3 pos, float t) {
  float total = 0.0;
  int octaves = 4;
  float persistence = 0.2;
  for (int i = 0; i < octaves; i++) {
    float freq = pow(2.0, float(i));
    float amp = pow(persistence, float(i));
    total += interpRand((pos.x + t) * freq, (pos.y + t) * freq, (pos.z + t) * freq) * amp;
  }
  return total;
}

void main()
{
  if (fs_Col.w > 1.5) {
    vec4 textureCol = texture(u_Tex3, fs_Pos.xy + 0.5) * 1.5;
    float texV = 1.0 - textureCol.r + 0.125;
    float u = (fs_Col.z - 800.0f) / 29200.0f;
    vec4 tint = texture(u_Tex2, vec2(u, texV));
    out_Col = vec4(textureCol.x * tint.x, textureCol.y * tint.y, textureCol.z * tint.z, 1.0);
  } else {
    vec3 nDistVec = normalize(fs_Transformed_Pos) * 50.0;
    float spikeVal = glowTexture(nDistVec, dot(u_CameraAxes[2], u_CameraAxes[2]) + dot(u_CameraAxes[0], u_CameraAxes[0])) + 0.2;
    float dist = length(fs_Transformed_Pos);
    float spikeBrightness = ((1.0 / pow(dist + 0.15, 0.25)) - 1.0);
    spikeBrightness = spikeBrightness * 0.5 * clamp(spikeVal, 0.0, 1.0);

    vec4 textureCol = texture(u_Tex1, fs_Pos.xy + 0.5) * 1.5;
    textureCol.rgb += spikeBrightness;

    float texV = 1.0 - textureCol.r + 0.125;
    float u = (BIG_TEMP - 800.0f) / 29200.0f;
    vec4 tint = texture(u_Tex2, vec2(u, texV));
    out_Col = vec4(textureCol.x * tint.x, textureCol.y * tint.y, textureCol.z * tint.z, 1.0);
  }
}
