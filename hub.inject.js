import * as moment from "moment"
// import * as data from "/dest/atlas.js"

AFRAME.registerSystem('clock', {
	init: function () {
    this.clockR = 2
    var textures = this.textures = []
    const loader = new THREE.TextureLoader();
    for (var i = 0; i < 10; i++) {
    }
		const clockGeo = new THREE.CircleGeometry(this.clockR, 36);
		const clockMat = new THREE.MeshBasicMaterial( {
      map: loader.load('src/clockface.png'),
    } );
		const clock = new THREE.Mesh( clockGeo, clockMat );
		clock.position.set(0,5,-10)
		this.el.object3D.add( clock );

		this.secHandLen= 1.7
		this.minHandLen = 1.5
    this.hourHandLen= 1
    
		const secMat = new THREE.LineBasicMaterial( { color: 'red' } );
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

		const minMat = new THREE.LineBasicMaterial( { color: 'black' } );
		const minPs = new Float32Array( 2 * 3 );
		for (let i = 0; i < 6; i++) {
			minPs[i] = 0;
		}
		minPs[4] = this.minHandLen;

		const minGeo = new THREE.BufferGeometry().setFromPoints( minPs );
		minGeo.addAttribute( 'position', new THREE.BufferAttribute( minPs, 3 ) );
		const minute = this.minute = new THREE.Line( minGeo, minMat );
    clock.add(minute);
    
    const numGeo = new THREE.PlaneGeometry( 1, 1.5, 1 );
    var dig1Mat = new THREE.MeshBasicMaterial( { 
      map: this.textures[0],
      side: THREE.DoubleSide,
      transparent: true, opacity: 0.99, } );
    var dig1 = this.dig1 = new THREE.Mesh( numGeo, dig1Mat );
    dig1.position.set(-2,-3,0)
    clock.add( dig1 );

    var dig2Mat = new THREE.MeshBasicMaterial( {
      map: this.textures[0],
      side: THREE.DoubleSide,
      transparent: true, opacity: 0.99, } );
    var dig2 = this.dig2 = new THREE.Mesh( numGeo, dig2Mat );
    dig2.position.set(-1,-3,0)
    clock.add( dig2 );

    var dig3Mat = new THREE.MeshBasicMaterial( {
      map: this.textures[0],
      side: THREE.DoubleSide,
      transparent: true, opacity: 0.99, } );
    var dig3 = this.dig3 = new THREE.Mesh( numGeo, dig3Mat );
    dig3.position.set(1,-3,0)
    clock.add( dig3 );

    var dig4Mat = new THREE.MeshBasicMaterial( {
      map: this.textures[0],
      side: THREE.DoubleSide,
      transparent: true, opacity: 0.99, } );
    var dig4 = this.dig4 = new THREE.Mesh( numGeo, dig4Mat );
    dig4.position.set(2,-3,0)
    clock.add( dig4 );

    var digCMat = new THREE.MeshBasicMaterial( { 
      map: loader.load('src/c.png'),
      side: THREE.DoubleSide,
      transparent: true, opacity: 0.99, } );
    var digC = new THREE.Mesh( numGeo, digCMat );
    digC.position.set(0,-3,0)
    clock.add( digC );

	},
	tick() {
		const s = moment().zone("America/New_York").second();
		const m = moment().zone("America/New_York").minute();
		const h = moment().zone("America/New_York").hour();
		// console.log(s)
		this.updateSec(s);
		this.second.geometry.attributes.position.needsUpdate = true; 
		this.updateMin(m);
    this.minute.geometry.attributes.position.needsUpdate = true; 
    this.dig3.material.needsUpdate = true;
    this.dig4.material.needsUpdate = true;
		this.updateHour(h,m);
    this.hour.geometry.attributes.position.needsUpdate = true; 
    this.dig1.material.needsUpdate = true;
    this.dig2.material.needsUpdate = true;
	},

	updateSec(s) {
		const pos = this.second.geometry.attributes.position.array;
		const x = s/30*Math.PI;
		pos[3] = this.secHandLen*Math.sin(x);
    pos[4] = this.secHandLen*Math.cos(x);
	},

	updateHour(h, m) {
		const pos = this.hour.geometry.attributes.position.array;
		const x = (h*60 + m)/360*Math.PI;
		pos[3] = this.hourHandLen*Math.sin(x);
    pos[4] = this.hourHandLen*Math.cos(x);
    this.dig1.material.map = this.textures[Math.floor(h/10)];
    this.dig2.material.map = this.textures[h%10];
	},

	updateMin(m) {
		const pos = this.minute.geometry.attributes.position.array;
		const x = m/30*Math.PI;
		pos[3] = this.minHandLen*Math.sin(x);
    pos[4] = this.minHandLen*Math.cos(x);
    this.dig3.material.map = this.textures[Math.floor(m/10)];
    this.dig4.material.map = this.textures[m%10];
	}
});

/*
AFRAME.registerSystem('posters', {
    init: function() {
      var inbloc = this.inbloc = [-1,-1];
      const scale = this.scale = 200; // image size/200 = size in VR

      const coordsData = data.default.frames;
      var coordsArray = this.coordsArray = [];
      var linkArray = this.linkArray = []
      for (const property in coordsData) {
        this.coordsArray.push(coordsData[property].frame);
        this.linkArray.push('src/' + property+'.jpg');
      }

      var k = this.k = 3; //number of posters in a row
    
      var planeMat = new THREE.MeshBasicMaterial( {color: "grey"} );

      var loader = this.loader = new THREE.TextureLoader();
      var material = new THREE.MeshBasicMaterial({
      map: loader.load('./dest/atlas.png')
      });
      var blocks = this.blocks = []; 
      var atlas = {width: 1000, height: 1000, cols: 2, rows: 3};

      for (var j=0; j<2; j++) {
        for (var i = 0; i < k; i ++) {
          var idx = j*k + i
          var image = {width: coordsArray[idx].w/scale, height: coordsArray[idx].h/scale}; 
          var coords = {
            x: i * 4,
            y: 0,
            z: 0 - j * 2
          };
          var geometry = new THREE.Geometry();
          
          geometry.vertices.push(
            new THREE.Vector3(
            coords.x,
            coords.y,
            coords.z
            ),
            new THREE.Vector3(
            coords.x + image.width,
            coords.y,
            coords.z
            ),
            new THREE.Vector3(
            coords.x + image.width,
            coords.y + image.height,
            coords.z
            ),
            new THREE.Vector3(
            coords.x,
            coords.y + image.height,
            coords.z
            )
          );
          var faceOne = new THREE.Face3(
            geometry.vertices.length-4,
            geometry.vertices.length-3,
            geometry.vertices.length-2
          )
          var faceTwo = new THREE.Face3(
            geometry.vertices.length-4,
            geometry.vertices.length-2,
            geometry.vertices.length-1
          )
          geometry.faces.push(faceOne, faceTwo);
          
          var xOffset = coordsArray[idx].x / atlas.width;
          var xRange = coordsArray[idx].w / atlas.width;
          var yOffset =  1- (coordsArray[idx].y + coordsArray[idx].h)/atlas.height
          var yRange = coordsArray[idx].h / atlas.height;
          
          geometry.faceVertexUvs[0].push([
            new THREE.Vector2(xOffset, yOffset),
            new THREE.Vector2(xOffset+xRange, yOffset),
            new THREE.Vector2(xOffset+xRange, yOffset+yRange)
          ]);

          geometry.faceVertexUvs[0].push([
            new THREE.Vector2(xOffset, yOffset),
            new THREE.Vector2(xOffset+xRange, yOffset+yRange),
            new THREE.Vector2(xOffset, yOffset+yRange)
          ]);
          var block = new THREE.Mesh(geometry, material)
          block.position.set(-2, 1, 0);
          blocks.push(block);
          this.el.object3D.add(blocks[blocks.length-1])

          var planeGeo = new THREE.BoxGeometry( image.width, image.height, 0.05 );
          var plane = new THREE.Mesh(planeGeo, planeMat);
          plane.position.set(coords.x+image.width/2,coords.y + image.height/2, coords.z - 0.05/1.9);
          block.add(plane)
        }
      }
    },
    tick: function() {
      close = false;
      var pos = this.el.object3D.children[0].position;
      for (var i = 0; i < this.blocks.length; i++) {
          var block_pos = {x:-2 + i%this.k*4 + this.coordsArray[i].w/this.scale/2,
                          y: 1.6,
                          z: 0 - Math.floor(i/this.k)*2}
          var dis = this.dis(block_pos, pos);
          if (dis < 1 ) {
              close = true;
              if (this.inbloc[0] == -1) {
                  console.log("enter")
                  console.log(Math.floor(i/this.k), i %this.k)
                  this.loadPoster(Math.floor(i/this.k), i %this.k);
                  this.inbloc = [Math.floor(i/this.k), i %this.k];
                  break;
              }
          }
      }
      if (close == false && this.inbloc[0] != -1 && this.inbloc[1] != -1) {
          console.log(this.inbloc)
          console.log("leave")
          this.leave(this.inbloc[0], this.inbloc[1]);
          this.inbloc = [-1,-1];
      }
    },
    loadPoster(i, j) {
      //i,j coords of the poster
      var idx = j+i*this.k
      var coords = this.coordsArray[idx];
      this.blocks[idx].visible = false;
      // console.log(this.linkArray[idx]);
      var mat1 = new THREE.MeshBasicMaterial({
          map: this.loader.load(this.linkArray[idx])
      });
      var geo1 = new THREE.PlaneGeometry( coords.w/this.scale, coords.h/this.scale);
      var plane = new THREE.Mesh(geo1, mat1);
      plane.position.set(-2 + coords.w/this.scale/2 + j*4, 1+coords.h/this.scale/2, 0 - i* 2);
      this.el.object3D.add(plane);
    },
    leave(i, j) {
      this.el.object3D.remove(this.el.object3D.children[this.el.object3D.children.length -1]);
      this.blocks[i*this.k + j].visible = true;
    },
    dis(i, j) {
      return Math.pow(i.x - j.x, 2) + Math.pow(i.y - j.y, 2) + Math.pow(i.z - j.z, 2);
    }
});
*/