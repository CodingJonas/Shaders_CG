#version 410

uniform sampler2D diffuse_texture;
uniform sampler2D bump_texture;

uniform vec3 ka;
uniform vec3 ks;
uniform float shininess;
uniform vec3 light_position;
uniform vec3 camera_position;

uniform mat4 normal_model_to_world;

in VS_OUT {
	vec3 vertex;
    vec3 normal;
    vec2 texcoord;
    vec3 tangent;
    vec3 binormal;
} fs_in;

out vec4 color;

void main()
{
    mat4 tbn;
    tbn[0] = vec4(fs_in.tangent, 0);
    tbn[1] = vec4(fs_in.binormal, 0);
    tbn[2] = vec4(fs_in.normal, 0);
    tbn[3] = vec4(0);

    vec3 normal = texture(bump_texture, fs_in.texcoord).rgb * 2 - 1;
    vec4 normalTrans = normal_model_to_world * tbn * vec4(normal, 1);

    vec3 N = normalize(vec3(normalTrans));
    vec3 L = normalize(light_position);
    vec3 V = normalize(camera_position);
    vec3 R = normalize(reflect(-L, N));
    vec3 tex_col = vec3(texture(diffuse_texture, fs_in.texcoord));
    vec3 diffuse = tex_col * max(dot(L, N), 0.0);
    vec3 specular = ks * pow(max(dot(V, R), 0.0), shininess);
	color.xyz = ka + diffuse + specular;
	color.w = 1.0;
}
