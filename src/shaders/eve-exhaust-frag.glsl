#version 300 es
precision highp float;

uniform sampler2D u_Tex1;
uniform float u_Time;

in vec4 fs_Original_Pos;
in vec4 fs_Original_Nor;
in vec4 fs_Nor;
in vec4 fs_LightVec;
in vec4 fs_Col;

out vec4 out_Col;

void main()
{
  float radius = sqrt(fs_Original_Pos.x * fs_Original_Pos.x + fs_Original_Pos.z * fs_Original_Pos.z);
  float innerRing = 0.9;

  vec4 diffuseColor;
  if (fs_Original_Pos.y < 0.1 && radius > innerRing) {
    float len = abs(radius - innerRing - (1.0 - innerRing) / 2.0);
    vec2 uv = vec2(len * fs_Original_Pos.x / radius + 0.5, len * fs_Original_Pos.z / radius + 0.5);
    vec4 textureCol = texture(u_Tex1, uv);
    diffuseColor = vec4(48.0/255.0, 48.0/255.0, textureCol.z, 0.5 * fs_Col.w);
  } else {
    // float len = 1.5 - radius;
    vec2 uv = vec2(0.2 + 0.1 * cos(u_Time / 2000.0), 0.2 + 0.1 * sin(u_Time / 2000.0));
    vec4 textureCol = texture(u_Tex1, uv);
    diffuseColor = vec4(0.0, 0.0, textureCol.z, 0.0);
  }

  out_Col = diffuseColor;

  // float diffuseTerm = clamp(abs(dot(normalize(fs_Nor), normalize(fs_LightVec))), 0.0f, 1.0f);
  // float ambientTerm = 0.5;
  // float lightIntensity = diffuseTerm + ambientTerm;
  // out_Col = vec4(diffuseColor.rgb * lightIntensity, diffuseColor.a);
}
