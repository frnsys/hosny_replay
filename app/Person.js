import _ from 'underscore';
import config from 'config';
import * as THREE from 'three';
import PF from 'pathfinding';

const colors = [
  0xffffff,
  0x444444,
  0x26b743,
  0x2671b7,
  0xb73526,
  0x497596,
  0x4a9649,
  0xc18b3a,
  0xa275d6
];
// https://usa.ipums.org/usa-action/variables/EDUC#codes_section
const EDUCATION = [
  'none',
  'preschool',
  'primary school',
  'high school',
  'high school',
  'high school',
  'high school',
  'college',
  'college',
  'college',
  'college',
  'graduate school'
];
const radius = config.person.radius;
const speed = config.person.speed;
const pathfinder = new PF.AStarFinder({
  allowDiagonal: false,
  dontCrossCorners: true
});

class Person {
  constructor(data) {
    var mat = new THREE.MeshLambertMaterial({
          color: colors[data.race-1]
        }),
        geo;

    // flatland-esque rankings
    if (data.firm_owner) {
        geo = new THREE.SphereGeometry(radius);
    } else if (data.employed) {
        geo = new THREE.BoxGeometry(radius*1.5, radius*1.5, radius*1.5);
    } else {
        geo = new THREE.TetrahedronGeometry(radius*1.5);
    }

    this.id = data.id;
    this.mesh = new THREE.Mesh(geo, mat);
    this.data = data;
    this.mesh.data = data;
    data.avatar = this;

    this.path = [];
    this.target = null;
    this.speed = _.random(speed[0], speed[1]);
  }

  get html() {
    return`
      <h4>${this.data.name} (${this.data.age})</h4>
      <h4>of ${this.data.neighborhood}</h4>
      <h4>attended ${EDUCATION[this.data.education]}</h4>
      <h4>${this.data.employmentStatus}</h4>`;
  }

  status(status) {
    if (status === 'owner') {
        this.mesh.geometry = new THREE.SphereGeometry(radius);
    } else if (status === 'employed') {
        this.mesh.geometry = new THREE.BoxGeometry(radius*1.5, radius*1.5, radius*1.5);
    } else {
        this.mesh.geometry = new THREE.TetrahedronGeometry(radius*1.5);
    }
    this.data.employmentStatus = status;
    // note that the mesh needs to removed then readded to the scene for the update to take place
  }

  wander(land, targets) {
    var [ct, rt] = _.sample(targets);
    this.mesh.visible = true;
    this.goTo(ct, rt, land, () => {
      this.mesh.visible = false;
      setTimeout(() => {
        this.wander(land, targets);
      }, _.random(2000,12000));
    });
  }

  goTo(c, r, land, onArrive=_.noop) {
    var coordPath = pathfinder.findPath(this.coord.c, this.coord.r, c, r, land.grid.clone());
    this.path = _.map(coordPath, coord => {
      var [c, r] = coord,
          pos = land.c2p(c,r);
      // adjust to center of cells
      return new THREE.Vector3(
        pos.x + config.cellSize/2,
        pos.y + config.cellSize/2,
        radius/2);
    });
    this.onArrive = onArrive;
  }

  update(delta, land) {
    if (this.path.length === 0) {
      return;
    }
    var target = this.path[0],
        vel = target.clone().sub(this.mesh.position);

    // it seems the higher the speed,
    // the higher this value needs to be to prevent stuttering
    if (vel.lengthSq() > 0.04) {
      vel.normalize();
      this.mesh.position.add(vel.multiplyScalar(delta * this.speed));
      this.mesh.lookAt(target);
      this.coord = land.p2c(this.mesh.position.x, this.mesh.position.y);
    } else {
      this.path.shift();
      if (!this.path.length) {
        this.onArrive();
      }
    }
  }
}

export default Person;
