// The world makes sure everything within it conforms to the correct 3d grid/voxel positioning
// If you ever need to place something in the scene, place it using this object, using col/row coordinates
// There are two coordinate systems: the Continuous Coordinate System (CCS) which is ignorant of the grid/voxel system. These are notated (x,y,z) and called "positions".
// and the Voxel Coordinate System which can only have discrete coordinates. These are notated (c,r,l) for (column, row, layer) and called "coordinates".

import * as THREE from 'three';
import Scene from './Scene';
import Surface from './Surface';

class World {
  constructor(cellSize, selector) {
    this.scene = new Scene(selector);
    this.cellSize = cellSize;
  }

  p2c(pos) {
    // takes a CCS position
    // snaps to a VCS coord
    return new THREE.Vector3(
      Math.floor(pos.x/this.cellSize) * this.cellSize,
      Math.floor(pos.y/this.cellSize) * this.cellSize,
      Math.floor(pos.z/this.cellSize) * this.cellSize
    );
  }

  c2p(coord) {
    // converts a VCS coord to a CCS position
    return new THREE.Vector3(
      coord.c * this.cellSize,
      coord.l * this.cellSize,
      coord.r * this.cellSize
    );
  }

  addSurface(layout, coord) {
    // creates a surface of rows x cols
    // placing it at the CCS pos, snapped-to-grid
    var pos = this.c2p(coord),
        sur = new Surface(this.cellSize, layout, pos);
    this.scene.add(sur.mesh, true);
    return sur;
  }

  debug(gridSize) {
    var gridHelper = new THREE.GridHelper(gridSize * (this.cellSize/2), gridSize);
    this.scene.add(gridHelper);
    var axes = new THREE.AxisHelper(20);
    this.scene.add(axes);
  }
}

export default World;
