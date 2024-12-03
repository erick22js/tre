
function Tre(display){

/*
	simple TRIANGLE RASTERIZE ENGINE
*/
const tre = this;
const WIDTH = Number(display.width);
const HEIGHT = Number(display.height);
const ctx = display.getContext("2d");
const imd = ctx.getImageData(0, 0, WIDTH, HEIGHT);
const ddata = new Uint32Array(imd.data.buffer);

const _tre_vs = [
	/*
		pos X; pos Y; depth; W; col R; col G; col B; col A; uv X; uv Y;
	*/
	new Float32Array(10),
	new Float32Array(10),
	new Float32Array(10),
	new Float32Array(10),
];

const _tre_cb = ddata;//new Float32Array(ddata.buffer); // Color Buffer
const _tre_db = new Float32Array(_tre_cb.length); // Depth Buffer
let _tre_tb = new Float32Array([1,1,1,1, .5,.5,.5,1, .5,.5,.5,1, 1,1,1,1]); // Texture Buffer
let _tre_tw = 2; // Texture Width
let _tre_th = 2; // Texture Height

const _tre_m = []; // Array of matrices
let _tre_mi = 0; // Current matrix

/*
	Vertices Building
*/

let _tre_vi = 0;
function treFirstVertex(){
	_tre_vi = 0;
}
tre.firstVertex = treFirstVertex;

function treNextVertex(){
	if (_tre_vi<3){
		_tre_vi++;
	}
}
tre.nextVertex = treNextVertex;

function trePosition(x, y, z){
	// Matrix Transformation
	let d  =  x*_tre_m[_tre_mi][3] + y*_tre_m[_tre_mi][7] + z*_tre_m[_tre_mi][11] + _tre_m[_tre_mi][15];
	let tx = (x*_tre_m[_tre_mi][0] + y*_tre_m[_tre_mi][4] + z*_tre_m[_tre_mi][8]  + _tre_m[_tre_mi][12])/d;
	let ty = (x*_tre_m[_tre_mi][1] + y*_tre_m[_tre_mi][5] + z*_tre_m[_tre_mi][9]  + _tre_m[_tre_mi][13])/d;
	let tz = (x*_tre_m[_tre_mi][2] + y*_tre_m[_tre_mi][6] + z*_tre_m[_tre_mi][10] + _tre_m[_tre_mi][14])/d;
	
	// Viewport Transformation
	tx = (tx+1)*(WIDTH>>1);
	ty = (ty-1)*-(HEIGHT>>1);
	
	// Vertex Load
	_tre_vs[_tre_vi][0] = tx;
	_tre_vs[_tre_vi][1] = ty;
	_tre_vs[_tre_vi][2] = tz;
	_tre_vs[_tre_vi][3] = d;
}
tre.position = trePosition;

function treColor(r, g, b, a){
	_tre_vs[_tre_vi][4] = r;
	_tre_vs[_tre_vi][5] = g;
	_tre_vs[_tre_vi][6] = b;
	_tre_vs[_tre_vi][7] = a;
}
tre.color = treColor;

function treUv(x, y){
	_tre_vs[_tre_vi][8] = x;
	_tre_vs[_tre_vi][9] = y;
}
tre.uv = treUv;

/*
	Matrix Operations
*/

for (let i=0; i<256; i++){ _tre_m.push(new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1])); }

function trePush(){
	for (let i=0; i<16; i++){
		_tre_m[_tre_mi+1][i] = _tre_m[_tre_mi][i];
	}
	_tre_mi = (_tre_mi+1)&255;
}
tre.push = trePush;

function trePerspective(fov, near, far, aspect){
	let f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
	let nf = 1.0 / (near - far);
	_tre_m[_tre_mi][0] = f / aspect;
	_tre_m[_tre_mi][1] = 0;
	_tre_m[_tre_mi][2] = 0;
	_tre_m[_tre_mi][3] = 0;
	_tre_m[_tre_mi][4] = 0;
	_tre_m[_tre_mi][5] = f;
	_tre_m[_tre_mi][6] = 0;
	_tre_m[_tre_mi][7] = 0;
	_tre_m[_tre_mi][8] = 0;
	_tre_m[_tre_mi][9] = 0;
	_tre_m[_tre_mi][10] = (near + far) * nf;
	_tre_m[_tre_mi][11] = -1;
	_tre_m[_tre_mi][12] = 0;
	_tre_m[_tre_mi][13] = 0;
	_tre_m[_tre_mi][14] = 2 * far * near * nf;
	_tre_m[_tre_mi][15] = 0;
}
tre.perspective = trePerspective;

function treTransform(m){
	let t = [];
	for (let i=0; i<16; i++){
		let v = 0;
		for (let r=0; r<4; r++){
			v += _tre_m[_tre_mi][(i&12)+r]*m[(r*4)+(i&3)];
			//v += _tre_m[_tre_mi][(r*4)+(i&3)]*m[(i&12)+r];
		}
		t[i] = v;
	}
	for (let i=0; i<16; i++){
		_tre_m[_tre_mi][i] = t[i];
	}
}
tre.transform = treTransform;

function treTranslate(x=0, y=0, z=0){
	_tre_m[_tre_mi][12] = x*_tre_m[_tre_mi][0] + y*_tre_m[_tre_mi][4] + z*_tre_m[_tre_mi][8] + _tre_m[_tre_mi][12];
	_tre_m[_tre_mi][13] = x*_tre_m[_tre_mi][1] + y*_tre_m[_tre_mi][5] + z*_tre_m[_tre_mi][9] + _tre_m[_tre_mi][13];
	_tre_m[_tre_mi][14] = x*_tre_m[_tre_mi][2] + y*_tre_m[_tre_mi][6] + z*_tre_m[_tre_mi][10] + _tre_m[_tre_mi][14];
	_tre_m[_tre_mi][15] = x*_tre_m[_tre_mi][3] + y*_tre_m[_tre_mi][7] + z*_tre_m[_tre_mi][11] + _tre_m[_tre_mi][15];
}
tre.translate = treTranslate;

function treScale(x=1, y=1, z=1){
	_tre_m[_tre_mi][0] *= x;
	_tre_m[_tre_mi][1] *= x;
	_tre_m[_tre_mi][2] *= x;
	_tre_m[_tre_mi][3] *= x;
	_tre_m[_tre_mi][4] *= y;
	_tre_m[_tre_mi][5] *= y;
	_tre_m[_tre_mi][6] *= y;
	_tre_m[_tre_mi][7] *= y;
	_tre_m[_tre_mi][8] *= z;
	_tre_m[_tre_mi][9] *= z;
	_tre_m[_tre_mi][10] *= z;
	_tre_m[_tre_mi][11] *= z;
}
tre.scale = treScale;

function treRotateX(ang){
	let cos = Math.cos(ang);
	let sin = Math.sin(ang);
	let m04 = _tre_m[_tre_mi][4];
	let m05 = _tre_m[_tre_mi][5];
	let m06 = _tre_m[_tre_mi][6];
	let m07 = _tre_m[_tre_mi][7];
	let m08 = _tre_m[_tre_mi][8];
	let m09 = _tre_m[_tre_mi][9];
	let m10 = _tre_m[_tre_mi][10];
	let m11 = _tre_m[_tre_mi][11];
	_tre_m[_tre_mi][4] = cos * m04 + sin * m08;
	_tre_m[_tre_mi][5] = cos * m05 + sin * m09;
	_tre_m[_tre_mi][6] = cos * m06 + sin * m10;
	_tre_m[_tre_mi][7] = cos * m07 + sin * m11;
	_tre_m[_tre_mi][8] = cos * m08 - sin * m04;
	_tre_m[_tre_mi][9] = cos * m09 - sin * m05;
	_tre_m[_tre_mi][10] = cos * m10 - sin * m06;
	_tre_m[_tre_mi][11] = cos * m11 - sin * m07;
}
tre.rotateX = treRotateX;

function treRotateY(ang){
	let cos = Math.cos(ang);
	let sin = Math.sin(ang);
	let m00 = _tre_m[_tre_mi][0];
	let m01 = _tre_m[_tre_mi][1];
	let m02 = _tre_m[_tre_mi][2];
	let m03 = _tre_m[_tre_mi][3];
	let m08 = _tre_m[_tre_mi][8];
	let m09 = _tre_m[_tre_mi][9];
	let m10 = _tre_m[_tre_mi][10];
	let m11 = _tre_m[_tre_mi][11];
	_tre_m[_tre_mi][0] = cos * m00 - sin * m08;
	_tre_m[_tre_mi][1] = cos * m01 - sin * m09;
	_tre_m[_tre_mi][2] = cos * m02 - sin * m10;
	_tre_m[_tre_mi][3] = cos * m03 - sin * m11;
	_tre_m[_tre_mi][8] = cos * m08 + sin * m00;
	_tre_m[_tre_mi][9] = cos * m09 + sin * m01;
	_tre_m[_tre_mi][10] = cos * m10 + sin * m02;
	_tre_m[_tre_mi][11] = cos * m11 + sin * m03;
}
tre.rotateY = treRotateY;

function treRotateZ(ang){
	let cos = Math.cos(ang);
	let sin = Math.sin(ang);
	let m00 = _tre_m[_tre_mi][0];
	let m01 = _tre_m[_tre_mi][1];
	let m02 = _tre_m[_tre_mi][2];
	let m03 = _tre_m[_tre_mi][3];
	let m04 = _tre_m[_tre_mi][4];
	let m05 = _tre_m[_tre_mi][5];
	let m06 = _tre_m[_tre_mi][6];
	let m07 = _tre_m[_tre_mi][7];
	_tre_m[_tre_mi][0] = cos * m00 + sin * m04;
	_tre_m[_tre_mi][1] = cos * m01 + sin * m05;
	_tre_m[_tre_mi][2] = cos * m02 + sin * m06;
	_tre_m[_tre_mi][3] = cos * m03 + sin * m07;
	_tre_m[_tre_mi][4] = cos * m04 - sin * m00;
	_tre_m[_tre_mi][5] = cos * m05 - sin * m01;
	_tre_m[_tre_mi][6] = cos * m06 - sin * m02;
	_tre_m[_tre_mi][7] = cos * m07 - sin * m03;
}
tre.rotateZ = treRotateZ;

function trePop(){
	_tre_mi = (_tre_mi-1)&255;
}
tre.pop = trePop;

/*
	Texture Operations
*/
function treBindTexture(buffer, width, height){
	_tre_tb = buffer;
	_tre_tw = width;
	_tre_th = height;
}
tre.bindTexture = treBindTexture;

/*
	Draw Modules
*/

function treClear(){
	for (let i=0; i<_tre_cb.length; i++){
		_tre_cb[i] = 0x00000000;
		_tre_db[i] = 1;
	}
}
tre.clear = treClear;

function treDraw(){
	let varys = new Float32Array(_tre_vs[0].length);
	
	// Sort the vertices in a array (from top to bottom)
	let svs = [_tre_vs[0], _tre_vs[1], _tre_vs[2]];
	if (svs[0][1]>svs[1][1]){
		let tmp = svs[1];
		svs[1] = svs[0]; svs[0] = tmp;
	}
	if (svs[0][1]>svs[2][1]){
		let tmp = svs[2];
		svs[2] = svs[0]; svs[0] = tmp;
	}
	if (svs[1][1]>svs[2][1]){
		let tmp = svs[2];
		svs[2] = svs[1]; svs[1] = tmp;
	}
	//stdout.textContent += "PT "+svs[0][0].toFixed(3)+"/"+svs[0][1].toFixed(3)+"\n";
	//stdout.textContent += "PM "+svs[1][0].toFixed(3)+"/"+svs[1][1].toFixed(3)+"\n";
	//stdout.textContent += "PB "+svs[2][0].toFixed(3)+"/"+svs[2][1].toFixed(3)+"\n";
	
	// Calculate the intermediate vertex X position
	let via = svs[1][1]==svs[0][1]? 0: (svs[1][1]-svs[0][1])/(svs[2][1]-svs[0][1]);
	let vip = svs[0][0] + (svs[2][0]-svs[0][0])*via;
	//stdout.textContent += svs[1][0].toFixed(3)+" for "+vip.toFixed(3)+"\n";
	
	// Draw lines
	for (let y=svs[0][1]<0? 0: Math.floor(svs[0][1]); y<=svs[2][1] && y<HEIGHT; y++){
		let ma = 0; // To middle point
		let fa = (y-svs[0][1])/(svs[2][1]-svs[0][1]); // To bottom point
		let left = 0, right = 0;
		let v1f_left = 0, v1f_right = 0;
		let v3f_left = 0, v3f_right = 0;
		// Top part
		if (y<svs[1][1]){
			//stdout.textContent += "top\n";
			ma = (y-svs[0][1])/(svs[1][1]-svs[0][1]);
			// Middle point is after intersection
			if (svs[1][0]>vip){
				right = svs[0][0] + (svs[1][0]-svs[0][0])*ma;
				left = svs[0][0] + (svs[2][0]-svs[0][0])*fa;
				v1f_left = 1-fa; v1f_right = 1-ma;
				v3f_left = fa; v3f_right = 0;
			}
			// Middle point is in or before intersection
			else {
				left = svs[0][0] + (svs[1][0]-svs[0][0])*ma;
				right = svs[0][0] + (svs[2][0]-svs[0][0])*fa;
				v1f_left = 1-ma; v1f_right = 1-fa;
				v3f_left = 0; v3f_right = fa;
			}
		}
		// Bottom part
		else {
			//stdout.textContent += "bottom\n";
			ma = 1-((y-svs[1][1])/(svs[2][1]-svs[1][1]));
			// Middle point is after intersection
			if (svs[1][0]>vip){
				right = svs[2][0] + (svs[1][0]-svs[2][0])*ma;
				left = svs[0][0] + (svs[2][0]-svs[0][0])*fa;
				v1f_left = 1-fa; v1f_right = 0;
				v3f_left = fa; v3f_right = 1-ma;
			}
			// Middle point is in or before intersection
			else {
				left = svs[2][0] + (svs[1][0]-svs[2][0])*ma;
				right = svs[0][0] + (svs[2][0]-svs[0][0])*fa;
				v1f_left = 0; v1f_right = 1-fa;
				v3f_left = 1-ma; v3f_right = fa;
			}
		}
		left = Math.floor(left);
		right = Math.floor(right);
		// Draw individual pixels
		//stdout.textContent += y+" => "+left.toFixed(2)+" :: "+right.toFixed(2)+"\n";
		for (let x=left<0? 0: left; x<=right && x<WIDTH; x++){
			let i = y*WIDTH + x;
			let xa = (x-left)/(right-left);
			let mxa = svs[1][0]>vip? 1-xa: xa;
			let v1f = v1f_left + (v1f_right-v1f_left)*xa;//(1-fa)*(1-ma)*mxa;
			let v2f = ma*(1-mxa);
			let v3f = v3f_left + (v3f_right-v3f_left)*xa;
			// Projection mapping fixes
			{
				//let pu = v2f, pv = v3f;
				let w = svs[0][3]*v1f + svs[1][3]*v2f + svs[2][3]*v3f;
				let d1 = svs[0][2], d2 = svs[1][2], d3 = svs[2][2];
				// w = ((1-a)*(u0/z0) + a*(u1/z1)) / ((1-a)*(1/z0) + a*(1/z1))
				// na = ((1-a)*(0/z0) + a*(1/z1)) / ((1-a)*(1/z0) + a*(1/z1))
				//   na = (a/z1) / ((1-a)*(1/z0) + (a/z1))
				// na = a / (((1-a)*(1/z0) + a*(1/z1))*z1)
				// na = a / ((1-a)*(z1/z0) + a)
				
				let t = (v1f/d1) / ((1-v1f)/(d1) + (v1f/d1));
				let u = (v2f/d2) / ((1-v2f)/d1 + (v2f/d2));
				let v = (v3f/d3) / ((1-v3f)/d1 + (v3f/d3));
				let s = 1/(t+u+v);
				t *= s; u *= s; v *= s;
			}
			for (let v=0; v<svs[0].length; v++){
				varys[v] = v1f*svs[0][v] + v2f*svs[1][v] + v3f*svs[2][v];
			}
			if (_tre_db[i]<varys[2] || varys[2]<-1){
				continue;
			}
			// Calculate color
			let ti = (Math.floor(varys[9]*_tre_th)*_tre_tw + Math.floor(varys[8]*_tre_tw))*4;
			let color = [
				varys[4]*_tre_tb[ti+0],
				varys[5]*_tre_tb[ti+1],
				varys[6]*_tre_tb[ti+2],
				varys[7]*_tre_tb[ti+3],
				0, 0, 0, 1
				//v1f+v2f+v3f, 0, 0, 1
			];
			_tre_cb[i] = (((color[3]*255)&255)<<24)|(((color[2]*255)&255)<<16)|(((color[1]*255)&255)<<8)|(((color[0]*255)&255)<<0);
			_tre_db[i] = varys[2];
		}
	}
}
tre.draw = treDraw;

/*
	Core
*/
function displayRefresh(){
	ctx.putImageData(imd, 0, 0);
}
tre.refresh = displayRefresh;
};