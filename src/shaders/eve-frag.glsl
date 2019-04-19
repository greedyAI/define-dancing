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
  // vec2 uv = 0.5 * (fs_UV + vec2(1.0));
  // vec4 textureCol = texture(u_Tex1, uv);

  vec4 diffuseColor = fs_Col;

  // vec3 normal = texture(u_Tex2, fs_UV).rgb;
  // normal = normalize(normal * 2.0 - 1.0);

  float diffuseTerm = clamp(abs(dot(normalize(fs_Nor), normalize(fs_LightVec))), 0.0f, 1.0f);
  float ambientTerm = 0.5;
  float lightIntensity = diffuseTerm + ambientTerm;
  out_Col = vec4(diffuseColor.rgb * lightIntensity, diffuseColor.a);
}
