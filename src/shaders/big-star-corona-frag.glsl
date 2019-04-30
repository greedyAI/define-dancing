#version 300 es
precision highp float;

uniform float u_Time;
uniform sampler2D u_Tex1;

in vec3 fs_Pos;
in vec4 fs_Col;

out vec4 out_Col;

#define PERCEIVED_RADIUS 10.0
#define TEMP 4000.0

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

float coronaTexture(vec3 pos, float t) {
  float total = 0.0;
  int octaves = 4;
  float persistence = 0.5;
  for (int i = 0; i < octaves; i++) {
    float freq = pow(2.0, float(i));
    float amp = pow(persistence, float(i));
    total += interpRand((pos.x + t) * freq, (pos.y + t) * freq, (pos.z + t) * freq) * amp;
  }
  return total;
}

void main()
{
  float t = u_Time / 5000.0 - length(fs_Pos);

  float frequency = 1.5;
  float ox = coronaTexture(fs_Pos * frequency, t);
  float oy = coronaTexture((fs_Pos + 2000.0) * frequency, t);
  float oz = coronaTexture((fs_Pos + 4000.0) * frequency, t);
  vec3 offsetVec = vec3(ox, oy, oz) * 0.1;

  vec3 nDistVec = normalize(fs_Pos + offsetVec) * 5.0;
  float coronaBrightness = coronaTexture(nDistVec, t);
  float dist = length(fs_Pos) * 5.0;
  float brightness = (1.0 / (dist * dist) - 0.1) * 0.7;


  out_Col = vec4(brightness * coronaBrightness, brightness * coronaBrightness, brightness * coronaBrightness, 1.0);
}
