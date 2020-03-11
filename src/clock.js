import * as moment from "moment"

export class Clock {	
    constructor() {
        const clockGeo = new THREE.CircleGeometry(3, 12);
		const clockMat = new THREE.MeshBasicMaterial( { color: 'skyblue' } );
		const clock = this.root = new THREE.Mesh( clockGeo, clockMat );
		clock.position.set(0,5,0)

		this.secHandLen= 2.5
		this.minHandLen = 2
		this.hourHandLen= 1.2

		const markmat = new THREE.LineBasicMaterial( { color: 'black' } );
		const points1 = [new THREE.Vector3(0,2.5,0), new THREE.Vector3(0,3,0)]
		const mark1geo = new THREE.BufferGeometry().setFromPoints( points1 );
		const line1 = new THREE.Line(mark1geo, markmat);
		clock.add(line1);

		const points2 = [new THREE.Vector3(2.5,0,0), new THREE.Vector3(3,0,0)]
		const mark2geo = new THREE.BufferGeometry().setFromPoints( points2 );
		const line2 = new THREE.Line(mark2geo, markmat);
		clock.add(line2);

		const points3 = [new THREE.Vector3(0,-2.5,0), new THREE.Vector3(0,-3,0)]
		const mark3geo = new THREE.BufferGeometry().setFromPoints( points3 );
		const line3 = new THREE.Line(mark3geo, markmat);
		clock.add(line3);

		const points4 = [new THREE.Vector3(-2.5,0,0), new THREE.Vector3(-3,0,0)]
		const mark4geo = new THREE.BufferGeometry().setFromPoints( points4 );
		const line4 = new THREE.Line(mark4geo, markmat);
		clock.add(line4);

		const secMat = new THREE.LineBasicMaterial( { color: 'white' } );
		const secPs = new Float32Array( 2 * 3 );
		for (let i = 0; i < 6; i++) {
			secPs[i] = 0;
		}
		secPs[4] = this.secHandLen;
		const secGeo = new THREE.BufferGeometry().setFromPoints( secPs );
		secGeo.addAttribute( 'position', new THREE.BufferAttribute( secPs, 3 ) );
		const second = this.second = new THREE.Line( secGeo, secMat );
		clock.add(second);

		const hourMat = new THREE.LineBasicMaterial( { color: 'black'} );
		const hourPs = new Float32Array( 2 * 3 );
		for (let i = 0; i < 6; i++) {
			hourPs[i] = 0;
		}
		hourPs[4] = this.hourHandLen;

		const hourGeo = new THREE.BufferGeometry().setFromPoints( hourPs );
		hourGeo.addAttribute( 'position', new THREE.BufferAttribute( hourPs, 3 ) );
		const hour = this.hour = new THREE.Line( hourGeo, hourMat );
		clock.add(hour);

		const minMat = new THREE.LineBasicMaterial( { color: 'gray' } );
		const minPs = new Float32Array( 2 * 3 );
		for (let i = 0; i < 6; i++) {
			minPs[i] = 0;
		}
		minPs[4] = this.minHandLen;

		const minGeo = new THREE.BufferGeometry().setFromPoints( minPs );
		minGeo.addAttribute( 'position', new THREE.BufferAttribute( minPs, 3 ) );
		const minute = this.minute = new THREE.Line( minGeo, minMat );
		clock.add(minute);
    }
    
	tick() {
		const s = moment().zone("America/New_York").second();
		const m = moment().zone("America/New_York").minute();
		const h = moment().zone("America/New_York").hour();
		// console.log(s)
		this.updateSec(s);
		this.second.geometry.attributes.position.needsUpdate = true; 
		this.updateMin(m);
		this.minute.geometry.attributes.position.needsUpdate = true; 
		this.updateHour(h,m);
		this.hour.geometry.attributes.position.needsUpdate = true; 
	}

	updateSec(s) {
		const pos = this.second.geometry.attributes.position.array;
		const x = s/30*Math.PI;
		pos[3] = this.secHandLen*Math.sin(x);
		pos[4] = this.secHandLen*Math.cos(x);
	}

	updateHour(h, m) {
		const pos = this.hour.geometry.attributes.position.array;
		const x = (h*60 + m)/360*Math.PI;
		pos[3] = this.hourHandLen*Math.sin(x);
		pos[4] = this.hourHandLen*Math.cos(x);
	}

	updateMin(m) {
		const pos = this.minute.geometry.attributes.position.array;
		const x = m/30*Math.PI;
		pos[3] = this.minHandLen*Math.sin(x);
		pos[4] = this.minHandLen*Math.cos(x);
	}
}