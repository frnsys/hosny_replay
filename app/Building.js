import _ from 'underscore';
import config from 'config';
import * as THREE from 'three';

const tenantHeight = 2 * config.cellSize; // must be a whole number
const colors = {
  'Hospital': 0xfc5353,
  'CapitalEquipmentFirm': 0xfff899,
  'ConsumerGoodFirm': 0xadf2f7,
  'RawMaterialFirm': 0x5879e8
};

class Tenant {
  constructor(id, type) {
    this.id = id;
    this.type = type;

    var geo = new THREE.BoxGeometry(config.cellSize, config.cellSize, tenantHeight),
        mat = new THREE.MeshLambertMaterial({
          color: colors[type]
        });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.obj = this;
  }

  get html() {
    return `
      <h3>${this.mesh.data.name}</h3>
      <h5>${this.mesh.data.type}</h5>
      <h5>Owned by ${this.mesh.data.owner}</h5>
      <h5>${this.mesh.data.employees} employees</h5>
      <h5>$${this.mesh.data.revenue.toFixed(2)} revenue</h5>
    `;
  }
}

class Building {
  constructor(c, r) {
    this.c = c;
    this.r = r;
    this.tenants = {};

    // create parent group for tenants
    this.group = new THREE.Group();
  }

  add(tenantData) {
    var tenant = new Tenant(tenantData.id, tenantData.type);
    tenant.mesh.type = 'business';
    tenant.mesh.data = tenantData;
    tenant.mesh.position.set(0, 0, this.height + tenantHeight/2);
    this.group.add(tenant.mesh);
    this.tenants[tenantData.id] = tenant;
    return tenant;
  }

  remove(tenantId) {
    var tenant = this.tenants[tenantId];
    this.group.remove(tenant.mesh);
    delete this.tenants[tenantId];

    var i = 0;
    _.each(this.tenants, t => {
      t.mesh.position.setZ((i * tenantHeight) + tenantHeight/2);
      i++;
    });
    return tenant;
  }

  // in voxels
  get height() {
    return Object.keys(this.tenants).length * tenantHeight;
  }
}

export default Building;
