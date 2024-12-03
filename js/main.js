
let tre = new Tre(display);

let vertices = new Float32Array([
	// R Face
	0, 1, 1,  1, 1, 1,  0, 0,
	1, 1, 1,  1, 1, 1,  1, 0,
	1, 0, 1,  1, 1, 1,  1, 1,
	0, 0, 1,  1, 1, 1,  0, 1,
	
	// L Face
	0, 1, 0,  1, 1, 1,  0, 0,
	1, 1, 0,  1, 1, 1,  1, 0,
	1, 0, 0,  1, 1, 1,  1, 1,
	0, 0, 0,  1, 1, 1,  0, 1,
	
	// D Face
	0, 0, 1,  1, 1, 1,  0, 0,
	1, 0, 1,  1, 1, 1,  1, 0,
	1, 0, 0,  1, 1, 1,  1, 1,
	0, 0, 0,  1, 1, 1,  0, 1,
	
	// T Face
	0, 1, 1,  1, 1, 1,  0, 0,
	1, 1, 1,  1, 1, 1,  1, 0,
	1, 1, 0,  1, 1, 1,  1, 1,
	0, 1, 0,  1, 1, 1,  0, 1,
	
	// B Face
	0, 1, 0,  1, 1, 1,  0, 0,
	0, 1, 1,  1, 1, 1,  1, 0,
	0, 0, 1,  1, 1, 1,  1, 1,
	0, 0, 0,  1, 1, 1,  0, 1,
	
	// F Face
	1, 1, 0,  1, 1, 1,  0, 0,
	1, 1, 1,  1, 1, 1,  1, 0,
	1, 0, 1,  1, 1, 1,  1, 1,
	1, 0, 0,  1, 1, 1,  0, 1,
]);

let input = {};
let _lt = 0;
let _a = 0;
let _r = 0;
function animate(tm){
	let dt = (tm-_lt)/1000;
	_lt = tm;
	stdout.textContent = (1/dt).toFixed(0)+" FPS ("+(dt*1000).toFixed(2)+"ms)";
	
	// Rendering presets
	tre.push();
	tre.perspective(Math.PI/2, 0.5, 1000, 1);
	tre.translate(0, 0, -1.5);
	tre.rotateX(.5);
	tre.rotateY(_r);
	tre.translate(-0.5, -0.5, -0.5);
	tre.clear();
	
	for (let fi=0; fi<(vertices.length>>5); fi++){
		let ofs = fi*32;
		// #1
		tre.firstVertex();
		tre.position(vertices[ofs+0], vertices[ofs+1], vertices[ofs+2]);
		tre.color(vertices[ofs+3], vertices[ofs+4], vertices[ofs+5], 1.0);
		tre.uv(vertices[ofs+6], vertices[ofs+7]);
		tre.nextVertex();
		tre.position(vertices[ofs+8], vertices[ofs+9], vertices[ofs+10]);
		tre.color(vertices[ofs+11], vertices[ofs+12], vertices[ofs+13], 1.0);
		tre.uv(vertices[ofs+14], vertices[ofs+15]);
		tre.nextVertex();
		tre.position(vertices[ofs+24], vertices[ofs+25], vertices[ofs+26]);
		tre.color(vertices[ofs+27], vertices[ofs+28], vertices[ofs+29], 1.0);
		tre.uv(vertices[ofs+30], vertices[ofs+31]);
		tre.draw();
		// #2
		tre.firstVertex();
		tre.position(vertices[ofs+8], vertices[ofs+9], vertices[ofs+10]);
		tre.color(vertices[ofs+11], vertices[ofs+12], vertices[ofs+13], 1.0);
		tre.uv(vertices[ofs+14], vertices[ofs+15]);
		tre.nextVertex();
		tre.position(vertices[ofs+16], vertices[ofs+17], vertices[ofs+18]);
		tre.color(vertices[ofs+19], vertices[ofs+20], vertices[ofs+21], 1.0);
		tre.uv(vertices[ofs+22], vertices[ofs+23]);
		tre.nextVertex();
		tre.position(vertices[ofs+24], vertices[ofs+25], vertices[ofs+26]);
		tre.color(vertices[ofs+27], vertices[ofs+28], vertices[ofs+29], 1.0);
		tre.uv(vertices[ofs+30], vertices[ofs+31]);
		tre.draw();
	}
	_r -= 0.02;
	tre.pop();
	
	// Rendering on Screen
	tre.refresh();
	requestAnimationFrame(animate);
}

window.onload = function(){
	tre.bindTexture(TEXFCOLORS/*TEXXCOLORS*/, 64, 64);
	animate();
}

display.ontouchstart = function(ev){
	input.x = ev.touches[0].clientX;
	input.y = ev.touches[0].clientY;
	input.press = true;
}
display.ontouchend = function(){
	input.press = false;
}
