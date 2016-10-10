#version 410

uniform vec3 ka;
uniform vec3 kd;
uniform vec3 ks;
uniform float shininess;
uniform vec3 light_position;
uniform vec3 camera_position;

in VS_OUT {
    vec3 vertex;
	vec3 normal;
} fs_in;

out vec4 color;

void main()
{
    vec3 N = normalize(fs_in.normal);
    vec3 L = normalize(light_position - fs_in.vertex);
    vec3 V = normalize(camera_position - fs_in.vertex);
    vec3 R = normalize(reflect(-L, N));
    vec3 diffuse = kd * max(dot(L, N), 0.0);
    vec3 specular = ks * pow(max(dot(V, R), 0.0), shininess);
	color.xyz = ka + diffuse + specular;
	color.w = 1.0;
}
