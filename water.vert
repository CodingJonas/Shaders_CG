#version 410

layout(location = 0) in vec3 vertex;
layout(location = 2) in vec3 texcoord;

uniform mat4 vertex_model_to_world;
uniform mat4 normal_model_to_world;
uniform mat4 vertex_world_to_clip;

uniform float t; // time

const vec2 bump_scale = vec2(4, 2);
const vec2 bump_speed = vec2(-0.09, 0.04);

out VS_OUT {
    vec3 vertex;
    vec2 bump_coord_0;
    vec2 bump_coord_1;
    vec2 bump_coord_2;
    vec3 t;
    vec3 b;
    vec3 n;
} vs_out;

mat4x3 compute_wave_tbn(vec3 d, float a, float f, float p, float k) {
    mat4x3 ret;

    // tbn for bump map
    float x = vertex.x;
    float y = vertex.y;
    float z = vertex.z;

    float inner = a * pow(sin((d.x*x + d.z*z) * f + t * p) * 0.5 + 0.5, k - 1);
    float dGdx = 0.5 * k * f * inner * cos((d.x * x + d.z * z) * f + t * p) * d.x;
    float dGdz = 0.5 * k * f * inner * cos((d.x * x + d.z * z) * f + t * p) * d.z;
    ret[0] = normalize(vec3(0, dGdz, 1)); // t
    ret[1] = normalize(vec3(1, dGdx, 0)); // b
    ret[2] = normalize(vec3(-dGdx, 1, -dGdz)); // n

    ret[3][0] = a * pow(sin((d.x*x + d.z*z) * f + t * p) * 0.5 + 0.5, k); // y displacement

    return ret;
}

void main() {
    // bump texture displacement
    float bump_time = mod(t, 100);
    vs_out.bump_coord_0 = texcoord.xy * bump_scale + bump_time * bump_speed;
    vs_out.bump_coord_1 = texcoord.xy * bump_scale * 2 + bump_time * bump_speed * 4;
    vs_out.bump_coord_2 = texcoord.xy * bump_scale * 4 + bump_time * bump_speed * 8;

    mat4x3 tbn =
        compute_wave_tbn(vec3(8, 0, 8), 0.07, 1.5, 1, 1.3) +
        compute_wave_tbn(vec3(-2, 0, 3), 0.1, 0.4, 1.5, 3) +
        compute_wave_tbn(vec3(10, 0, 0), 0.1, 0.2, 1, 10);
    vs_out.t = tbn[0];
    vs_out.b = tbn[1];
    vs_out.n = tbn[2];

    // wave displacement
    vec3 displaced_vertex = vertex;
    displaced_vertex.y += tbn[3][0];

    vs_out.vertex = vec3(vertex_model_to_world * vec4(displaced_vertex, 1));

    gl_Position = vertex_world_to_clip * vertex_model_to_world * vec4(displaced_vertex, 1.0);
}
