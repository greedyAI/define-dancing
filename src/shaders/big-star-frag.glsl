#version 300 es
precision highp float;

uniform float u_Time;
uniform sampler2D u_Tex1;

in vec2 fs_UV;
in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_Col;

out vec4 out_Col;

#define PERCEIVED_RADIUS 10.0
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

float starTexture(vec3 pos, float t) {
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

float sunspotTexture(vec3 pos, float t) {
  float total = 0.0;
  int octaves = 4;
  float persistence = 0.4;
  for (int i = 0; i < octaves; i++) {
    float freq = pow(2.0, float(i));
    float amp = pow(persistence, float(i));
    total += interpRand((pos.x + t) * freq, (pos.y + t) * freq, (pos.z + t) * freq) * amp;
  }
  return total;
}

vec3 getTempColorShift(float temperature) {
  return vec3(temperature * (0.0534 / 255.0) - (43.0 / 255.0), temperature * (0.0628 / 255.0) - (77.0 / 255.0), temperature * (0.0735 / 255.0) - (115.0 / 255.0)) * 0.8;
}

void main()
{
  float n = starTexture(fs_Pos.xyz * PERCEIVED_RADIUS * 1.5, u_Time / 1000.0);

  // Sunspots
  vec3 ssPos = fs_Pos.xyz * PERCEIVED_RADIUS;
  float s = 0.1;
  float frequency = 0.5;
  float t1 = sunspotTexture(ssPos * frequency, 0.0) / 2.0 - s;
  float t2 = sunspotTexture((ssPos + PERCEIVED_RADIUS) * frequency, 0.0) / 2.0 - s;
  float ss = (max(t1, 0.0) * max(t2, 0.0)) * 4.0;
  float total = n / 5.0 - ss;
  float u;
  if (fs_Col.w > 1.5) {
    u = (fs_Col.z - 800.0f) / 29200.0f;
    // Blackbody radiation
    vec4 textureCol = texture(u_Tex1, vec2(u, 1.0));

    vec3 colorShift = getTempColorShift(fs_Col.z);
    out_Col = vec4(total * textureCol.x + colorShift.x, total * textureCol.y + colorShift.y, total * textureCol.z + colorShift.z, 1.0);
  } else {
    u = (BIG_TEMP - 800.0f) / 29200.0f;
    // Blackbody radiation
    vec4 textureCol = texture(u_Tex1, vec2(u, 1.0));

    vec3 colorShift = getTempColorShift(BIG_TEMP);
    out_Col = vec4(total * textureCol.x + colorShift.x, total * textureCol.y + colorShift.y, total * textureCol.z + colorShift.z, 1.0);
  }


  // float diffuseTerm = clamp(abs(dot(normalize(fs_Nor), normalize(fs_LightVec))), 0.0f, 1.0f);
  // float ambientTerm = 0.5;
  // float lightIntensity = diffuseTerm + ambientTerm;
  // out_Col = vec4(diffuseColor.rgb * lightIntensity, diffuseColor.a);
}
