#version 300 es
precision highp float;

uniform sampler2D u_Tex1, u_Tex2;

in vec2 fs_UV;
in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_LightVec;
in vec4 fs_Col;

out vec4 out_Col;

#define EPSILON 0.0001

float random1(vec2 p, vec2 seed) {
  return fract(sin(dot(p + seed, vec2(127.1, 311.7))) * 43758.5453);
}

vec2 randvec3(vec2 n, vec2 seed) {
  float x = sin(dot(n + seed, vec2(14.92, 64.42)));
  float y = sin(dot(n + seed, vec2(48.12, 32.42)));
  return fract(334.963f * vec2(x, y));
}

float bias(float b, float t) {
  return pow(t, log(b) / log(0.5));
}

float quinticSmooth(float t) {
  float x = clamp(t, 0.0, 1.0);
  return x * x * x * (x * (x * 6.0  - 15.0) + 10.0);
}

float worleyNoise(vec2 pos) {
  float factor = 8.0;
  vec2 seed = vec2(0.0, 0.0);

  int x = int(floor(pos.x / factor));
  int y = int(floor(pos.y / factor));
  vec2 minWorley = factor * randvec3(vec2(float(x), float(y)), seed) + vec2(float(x) * factor, float(y) * factor);
  float minDist = distance(minWorley, pos);
  for (int i = x - 1; i <= x + 1; i++) {
      for (int j = y - 1; j <= y + 1; j++) {
          vec2 worley = factor * randvec3(vec2(float(i), float(j)), seed) + vec2(float(i) * factor, float(j) * factor);
          if (minDist > distance(pos, worley)) {
              minDist = distance(pos, worley);
              minWorley = worley;
          }
      }
  }
  return clamp(minDist / (factor * 2.0), 0.0, 0.5);
}

float interpRand(float x, float z) {
  vec2 seed = vec2(0.0, 0.0);

  float intX = floor(x);
  float fractX = fract(x);
  float intZ = floor(z);
  float fractZ = fract(z);

  vec2 c1 = vec2(intX, intZ);
  vec2 c2 = vec2(intX + 1.0, intZ);
  vec2 c3 = vec2(intX, intZ + 1.0);
  vec2 c4 = vec2(intX + 1.0, intZ + 1.0);

  float v1 = random1(c1, seed);
  float v2 = random1(c2, seed);
  float v3 = random1(c3, seed);
  float v4 = random1(c4, seed);

  float i1 = mix(v1, v2, quinticSmooth(fractX));
  float i2 = mix(v3, v4, quinticSmooth(fractX));
  return mix(i1, i2, quinticSmooth(fractZ));
}

float axiomTexture(float x, float y) {
  float total = 0.0;
  int octaves = 6;
  float persistence = 0.6;
  for (int i = 0; i < octaves; i++) {
    float freq = pow(2.0, float(i)) * 0.02;
    float amp = pow(persistence, float(i));
    total += worleyNoise(vec2(x * freq, y * freq)) * amp;
  }
  return total;
}

void main()
{
  vec2 uv = fs_UV;
  vec4 textureCol = texture(u_Tex1, uv);

  vec4 diffuseColor = textureCol;
  float r = axiomTexture(fs_Pos.x, fs_Pos.y) * 2.0;
  float g = axiomTexture(fs_Pos.x, fs_Pos.z) * 2.0;
  float b = axiomTexture(fs_Pos.y, fs_Pos.z) * 2.0;

  diffuseColor *= vec4(r, g, b, 1.0);

  // vec3 normal = texture(u_Tex2, fs_UV).rgb;
  // normal = normalize(normal * 2.0 - 1.0);

  float diffuseTerm = clamp(abs(dot(normalize(fs_Nor), normalize(fs_LightVec))), 0.0f, 1.0f);
  float ambientTerm = 0.5;
  float lightIntensity = diffuseTerm + ambientTerm;
  out_Col = vec4(diffuseColor.rgb * lightIntensity, 1.0);
}
