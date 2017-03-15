precision mediump float;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D uPalette;

uniform vec2 uScreenSize;
uniform vec2 uBufferSize;

vec3 tex(vec2 _uv){
	vec2 uvs = _uv*uBufferSize/uScreenSize;
	uvs = uvs/uBufferSize*uScreenSize;
	vec4 v = texture2D(uSampler, uvs);
	float l = v.a;
	return texture2D(uPalette, vec2(l*0.75+0.25, 0.5)).rgb;
}

void main(void){
	vec2 uvs = vTextureCoord.xy;
	vec3 fg = tex(uvs);
	// output
	gl_FragColor.rgb = fg;
	gl_FragColor.a = 1.0;
}