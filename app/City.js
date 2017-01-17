import _ from 'underscore';
import config from 'config';
import World from './Space/World';
import Building from './Building';
import Person from './Person';
import Cloud from './Cloud';

const VAL = {
  ROAD: 1,
  PLOT: 2
};
const nClouds = 12;

class City {
  constructor(layout, selector) {
    this.layout = layout;
    this.world = new World(config.cellSize, selector);
    this.land = this.world.addSurface(layout, {
      c: -Math.floor(layout.length/2),
      r: -Math.floor(layout[0].length/2),
      l: 0
    });

    this.buildings = {};
    this.population = {};
    this.firms = {};
  }

  setup(population, buildings) {
    // one building per plot
    var plotCoords = this.land.layout.positionsValued(VAL.PLOT);
    console.log(plotCoords.length.toString() + ' plots');
    console.log(buildings.length.toString() + ' buildings');
    _.each(plotCoords, coord => {
      var [c, r] = coord;
      // these are unwalkable for agents
      this.land.grid.setWalkableAt(c, r, false);

      if (buildings.length === 0) {
        // more plots than buildings
        return;
      }
      var data = buildings.shift(),
          building = new Building(c, r);
      this.buildings[data.id] = building;
      this.place(building.group, c, r);
    });
    if (buildings.length > 0) {
      console.log('not enough plots for the number of buildings!');
    }

    var roadCoords = this.land.layout.positionsValued(VAL.ROAD);
    var targets = _.chain(plotCoords)
      .map(c => this.land.adjCoords(c[0], c[1]))
      .flatten(true)
      .filter(c => this.land.layout.val(c) === 1)
      .value();
    _.each(population, p => {
      var [c, r] = _.sample(roadCoords),
          person = new Person(p);
      this.population[p.id] = person;
      person.coord = {c: c, r: r};
      this.place(person.mesh, c, r, {z: config.person.radius});
      person.wander(this.land, targets);
    });

    // clouds
    this.clouds = _.map(_.range(0, nClouds), () => {
      var cloud = new Cloud(),
          c = _.random(0, this.land.cols),
          r = _.random(0, this.land.rows);
      this.place(cloud.mesh, c, r);
      cloud.mesh.position.setZ(_.random(4, 8) * config.cellSize);
      return cloud;
    });
  }

  debug() {
    var gridSize = Math.max(this.layout.length, this.layout[0].length);
    this.world.debug(gridSize);

    // color highlights
    _.each(this.land.layout.positions, p => {
      var [c, r] = p,
          val = this.land.layout.val(p),
          color;
      switch (val) {
        case VAL.ROAD:
            color = 0x838aa0;
            break;
        case VAL.PLOT:
            color = 0x1e9e2a;
            break;
      }
      this.land.highlightCoord(c, r, color);
    });
  }

  place(obj, c, r, offsets) {
    var pos = this.land.c2p(c, r),
        offsets = offsets || {};
    obj.position.set(
      pos.x + config.cellSize/2 + (offsets.x || 0),
      pos.y + config.cellSize/2 + (offsets.y || 0),
      (offsets.z || 0));
    this.land.mesh.add(obj);
  }

  update(delta) {
    _.each(this.population, p => {
      p.update(delta, this.land);
    });

    _.each(this.clouds, (c, i) => {
      c.mesh.position.y += c.speed;
      var coord = this.land.p2c(c.mesh.position.x, c.mesh.position.y);
      if (coord.r > this.land.rows) {
        var pos = this.land.c2p(_.random(0, this.land.cols), 0);
        c.mesh.position.x = pos.x;
        c.mesh.position.y = pos.y;
      }
    });
  }
}

export default City;
