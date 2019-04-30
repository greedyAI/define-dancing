#version 300 es
precision highp float;

uniform sampler2D u_Tex1;

in vec2 fs_UV;
in vec4 fs_Nor;
in vec4 fs_LightVec;
in vec4 fs_Col;

out vec4 out_Col;

void main()
{
  vec2 uv = fs_UV;
  vec4 textureCol = texture(u_Tex1, uv);
  vec4 diffuseColor = textureCol;

  // vec3 normal = texture(u_Tex2, fs_UV).rgb;
  // normal = normalize(normal * 2.0 - 1.0);

  float diffuseTerm = clamp(abs(dot(normalize(fs_Nor), normalize(fs_LightVec))), 0.0f, 1.0f);
  float ambientTerm = 0.5;
  float lightIntensity = diffuseTerm + ambientTerm;
  out_Col = vec4(diffuseColor.rgb * lightIntensity, diffuseColor.a);
}
