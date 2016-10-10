#version 410

uniform samplerCube cube_texture;

in VS_OUT {
	vec3 vertex;
} fs_in;

out vec4 color;

void main()
{
    color = texture(cube_texture, fs_in.vertex);
}
