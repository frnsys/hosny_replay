import _ from 'underscore';
import config from 'config';
import * as THREE from 'three';

class Cloud {
  constructor() {
    var geo = new THREE.BoxGeometry(config.cellSize, _.random(1, 3) * config.cellSize, 1),
        mat = new THREE.MeshLambertMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.8
        });
    this.mesh = new THREE.Mesh(geo, mat);
    this.speed = 0.005 + Math.random()/30;
  }
}

export default Cloud;
