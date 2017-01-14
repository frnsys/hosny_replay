import _ from 'underscore';
import PF from 'pathfinding';
import Layout from './Layout';
import * as THREE from 'three';

const NEIGHBORHOOD = {
  VONNEUMANN: 0,
  MOORE: 1
};

class Surface {
  constructor(cellSize, layout, pos) {
    this.layout = new Layout(layout);
    this.rows = this.layout.height;
    this.cols = this.layout.width;
    this.cellSize = cellSize;
    this.grid = new PF.Grid(this.cols, this.rows);

    // set empty spaces in layout
    _.each(this.layout.emptyPositions, p => {
      var [c,r] = p;
      this.grid.setWalkableAt(c, r, false);
    });

    this.highlighted = {};
    this.setupMesh(pos);
  }

  c2p(c, r) {
    return {
      x: c * this.cellSize,
      y: r * this.cellSize
    };
  }

  p2c(x, y) {
    return {
      c: Math.floor(x/this.cellSize),
      r: Math.floor(y/this.cellSize)
    };
  }

  validCoord(c, r) {
    return c >= 0 && r >= 0 && c < this.cols && r < this.rows;
  }

  adjCoords(c, r, type=NEIGHBORHOOD.VONNEUMANN) {
    var coords = [
      [c, r+1],
      [c, r-1],
      [c+1, r],
      [c-1, r],
    ];
    if (type === NEIGHBORHOOD.MOORE) {
      coords.push([c-1, r+1]);
      coords.push([c-1, r-1]);
      coords.push([c+1, r+1]);
      coords.push([c+1, r-1]);
    }
    return _.filter(coords, c => this.validCoord(c[0], c[1]));
  }

  setupMesh(pos) {
    var shape = new THREE.Shape(),
        vertices = this.layout.computeVertices(),
        start = vertices[0];

    // draw the shape
    shape.moveTo(start[0] * this.cellSize, start[1] * this.cellSize);
    _.each(_.rest(vertices), v => {
      shape.lineTo(v[0] * this.cellSize, v[1] * this.cellSize);
    });
    shape.lineTo(start[0] * this.cellSize, start[1] * this.cellSize);

    var geo = new THREE.ShapeGeometry(shape),
        mat = new THREE.MeshLambertMaterial({
          opacity: 0.6,
          transparent: true,
          color: 0xaaaaaa
        });

    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.rotation.x = -Math.PI/2;
    this.mesh.rotation.z = -Math.PI/2;
    this.mesh.position.copy(pos);
    this.mesh.kind = 'surface';
    this.mesh.obj = this;
  }

  coordKey(c, r) {
    return `${c}_${r}`;
  }

  highlightCoord(c, r, color) {
    var key = this.coordKey(c, r);
    if (key in this.highlighted) {
      this.unhighlightCoord(c, r);
    }
    var pos = this.c2p(c, r),
        geo = new THREE.PlaneGeometry(this.cellSize, this.cellSize),
        mat = new THREE.MeshLambertMaterial({
          opacity: 0.6,
          color: color,
          side: THREE.DoubleSide
        }),
        p = new THREE.Mesh(geo, mat);

    // so the bottom-left corner is the origin
    geo.applyMatrix(
      new THREE.Matrix4().makeTranslation(this.cellSize/2, this.cellSize/2, 0));

    p.position.set(pos.x, pos.y, 0.01);
    this.mesh.add(p);
    this.highlighted[key] = p;
  }

  unhighlightCoord(c, r) {
    var key = this.coordKey(c, r);
    if (key in this.highlighted) {
      var mesh = this.highlighted[key];
      this.mesh.remove(mesh);
      delete this.highlighted[key];
    }
  }
}

Surface.NEIGHBORHOOD = NEIGHBORHOOD;

export default Surface;
