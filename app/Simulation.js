import $ from 'jquery';
import _ from 'underscore';
import * as THREE from 'three';
import SelectUI from './Select';
import Tooltip from './Tooltip';

class Simulation {
  constructor(city, graphs, playbackData) {
    this.curStep = 0;
    this.city = city;
    this.graphs = graphs;
    this.data = playbackData;
    this.clock = new THREE.Clock();
    this.selectui = new SelectUI(city.world.scene, this.describeObj.bind(this));

    city.setup(playbackData.start.population, playbackData.start.buildings);
  }

  describeObj(obj) {
    $('.info-tooltip').hide();
    if (obj.type === 'business') {
      this.selectui.selected = obj;
      var pos = Tooltip.abovePosition(obj, this.city.world.scene.camera, 0);
      $('.info-tooltip').show().css({
        top: pos.y,
        left: pos.x
      }).html(obj.data.type);
    }
  }

  step() {
    if (this.curStep < this.data.steps.length) {
      var data = this.data.steps[this.curStep];

      $(".datetime").text(data.datetime.month.toString() + "/" + data.datetime.day.toString() + "/" + data.datetime.year.toString());

      _.each(data.graphs, (data, name) => {
        if (name in this.graphs) {
          var graph = this.graphs[name];
          graph.update(data);
        }
      });

      _.each(data.buildings.removed_tenant, data => {
        var id = data.id,
            building = this.city.buildings[id];
        if (building) {
          var tenant = building.remove(data.tenant.id);
          this.selectui.selectables = _.without(this.selectui.selectables, tenant.mesh);
        }
      });

      _.each(data.buildings.added_tenant, data => {
        var id = data.id,
            building = this.city.buildings[id];
        if (building) {
          var tenant = building.add(data.tenant);
          this.selectui.selectables.push(tenant.mesh);
        }
      });

      _.each(data.people.fired, data => {
        var person = this.city.population[data.id];
        if (person) {
          person.status('unemployed');
          this.city.land.mesh.remove(person.mesh);
          this.city.land.mesh.add(person.mesh);
        }
      });

      _.each(data.people.hired, data => {
        var person = this.city.population[data.id];
        if (person) {
          person.status('employed');
          this.city.land.mesh.remove(person.mesh);
          this.city.land.mesh.add(person.mesh);
        }
      });

      _.each(data.people.started_firm, data => {
        var person = this.city.population[data.id];
        if (person) {
          person.status('owner');
          this.city.land.mesh.remove(person.mesh);
          this.city.land.mesh.add(person.mesh);
        }
      });

      _.each(data.people.died, data => {
        var person = this.city.population[data.id];
        if (person) {
          this.city.land.mesh.remove(person.mesh);
          delete this.city.population[data.id];
        }
      });

      this.curStep++;
    }
  }

  run() {
    requestAnimationFrame(this.run.bind(this));
    var delta = this.clock.getDelta();
    if (delta < 0.5) {
      // if the delta is really large,
      // (i.e. when the tab loses focus)
      // agents will take very large steps
      // and can end up off the map
      // so just ignore large deltas
      this.city.update(delta);
    }
    this.updateTooltip();
    this.city.world.scene.render();
  }

  updateTooltip() {
    var selected = this.selectui.selected;
    if (selected) {
      var pos = Tooltip.abovePosition(selected, this.city.world.scene.camera, 0);
      $('.info-tooltip').css({
        top: pos.y,
        left: pos.x
      }).show();
    } else {
      $('.info-tooltip').hide();
    }
  }
}

export default Simulation;
