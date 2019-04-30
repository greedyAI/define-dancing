#version 300 es
precision highp float;

uniform sampler2D u_Tex1, u_Tex2;
uniform float u_Visibility;

in vec2 fs_Pos;
in float fs_Intensity;
in vec4 fs_Col;

out vec4 out_Col;

void main()
{
  vec2 uv = fs_Pos + 0.5;
  vec4 textureCol;
  if (fs_Col.r > 0.5) {
    textureCol = texture(u_Tex2, uv);
  } else {
    textureCol = texture(u_Tex1, uv);
  }
  textureCol.a = fs_Intensity;
  out_Col = textureCol * u_Visibility;
}
