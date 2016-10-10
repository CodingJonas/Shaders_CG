#version 410

uniform samplerCube cube_texture;
uniform sampler2D water_bump_texture;

uniform vec3 light_position;
uniform vec3 camera_position;

uniform mat4 normal_model_to_world;

const vec4 color_deep = vec4(0, 0, 0.1, 1);
const vec4 color_shallow = vec4(0, 0.5, 0.5, 1);
const float R0 = 0.02037; // fresnel term air to water

in VS_OUT {
	vec3 vertex;
    vec2 bump_coord_0;
    vec2 bump_coord_1;
    vec2 bump_coord_2;
    vec3 t;
    vec3 b;
    vec3 n;
} fs_in;

out vec4 color;

void main()
{
    vec3 V = normalize(camera_position - fs_in.vertex); // points into camera

    // bump map
    vec3 n0 = texture(water_bump_texture, fs_in.bump_coord_0).rgb * 2 - 1;
    vec3 n1 = texture(water_bump_texture, fs_in.bump_coord_1).rgb * 2 - 1;
    vec3 n2 = texture(water_bump_texture, fs_in.bump_coord_2).rgb * 2 - 1;
    vec3 n_bump = normalize(n0 + n1 + n2);

    mat4 tbn;
    tbn[0] = vec4(normalize(fs_in.t), 0);
    tbn[1] = vec4(normalize(fs_in.b), 0);
    tbn[2] = vec4(normalize(fs_in.n), 0);
    tbn[3] = vec4(0, 0, 0, 1);
    vec3 n = normalize(vec3(normal_model_to_world * tbn * vec4(n_bump, 0)));

    // reflection
    vec3 R = normalize(reflect(-V, n));
    vec4 reflect = texture(cube_texture, R);

    // water color
    float facing = 1.0f - max(dot(V, n), 0);
    vec4 color_water = mix(color_deep, color_shallow, facing);

    // fresnel term
    float fresnel = R0 + (1 - R0) * pow(1 - dot(V, n), 5);

    // refraction
    vec3 refract = normalize(refract(-V, n, 1/1.33));

    color = color_water + reflect * fresnel + texture(cube_texture, refract) * (1 - fresnel);
}
