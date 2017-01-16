import './css/main.sass';
import $ from 'jquery';
import _ from 'underscore';
import City from './app/City';
import Simulation from './app/Simulation';
import Graph from './app/Graph';

var graphs = {
  mean_quality_of_life: new Graph(".graphs-qli", "mean_quality_of_life", 250, 60, "", false),
  mean_healthcare_price: new Graph(".graphs-healthcare", "mean_healthcare_price", 250, 60, "", false),
  mean_cash: new Graph(".graphs-cash", "mean_cash", 250, 60, "", false),
  n_sick: new Graph(".graphs-sick", "n_sick", 250, 60, "", false),
  mean_consumer_good_profit: new Graph(".graphs-consumer-good-profit", "mean_consumer_good_profit", 250, 60, "", false),
  mean_wage: new Graph(".graphs-wage", "mean_wage", 250, 60, "", false)
};


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

const delay = 300;
const cellSize = 2;
const layout = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,1,2,2,1,2,2,1,2,2,1,2],
  [1,2,2,1,2,2,1,2,2,1,2,2,1,2],
  [1,1,1,1,1,1,1,2,2,1,2,2,1,1],
  [1,2,2,1,2,2,1,1,1,1,1,1,1,2],
  [1,2,2,1,2,2,1,2,2,1,2,2,1,2],
  [1,1,1,1,1,1,1,2,2,1,2,2,1,1],
  [1,2,2,1,2,2,1,2,1,1,1,2,1,2],
  [1,2,2,1,2,2,1,1,1,2,1,1,1,2],
  [1,1,1,1,1,1,1,2,1,1,1,2,1,1],
  [1,2,2,1,2,2,1,2,2,1,2,2,1,2],
  [1,2,2,1,2,2,1,2,2,1,2,2,1,2],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,1,2,2,1,2,2,1,2,2,1,2],
  [1,2,2,1,2,2,1,2,2,1,2,2,1,2],
  [1,1,1,1,1,1,1,1,1,1,2,2,1,1],
  [1,2,2,1,2,2,1,2,2,1,1,1,1,2],
  [1,2,2,1,2,2,1,2,2,1,2,2,1,2],
  [1,1,1,1,1,1,1,1,1,1,2,2,1,1],
  [1,2,2,1,2,2,1,2,2,1,2,2,1,2],
  [1,2,2,1,2,2,1,2,2,1,2,2,1,2],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

$(function() {
  $('.setup .submit').on('click', function(ev) {
    ev.preventDefault();
    var food, tech, sick;

    $('.setup .submit').prop('disabled', true);
    $('.overlay').show();
    $('.overlay .alert').text('Preparing the simulation...');

    switch ($('[name=food]:checked').val()) {
      case "1":
        food = 'outstanding';
        break;
      case "2":
        food = 'average';
        break;
      case "3":
        food = 'poor';
        break;
    }

    switch ($('[name=tech]:checked').val()) {
      case "1":
        tech = 'automated';
        break;
      case "2":
        tech = 'average';
        break;
      case "3":
        tech = 'nothing';
        break;
    }

    switch ($('[name=sick]:checked').val()) {
      case "1":
        sick = 'virulent';
        break;
      case "2":
        sick = 'average';
        break;
      case "3":
        sick = 'healthy';
        break;
    }

    var fname = food + '.' + tech + '.' + sick + '.' + 'log.json';

    $.getJSON('/assets/json/'+fname, {}, function(data) {
      $('.simulation').show();
      $('input[type="radio"]:not(:checked)').parent().hide();
      $('.overlay').hide();

      var city = new City(layout, '#stage');
      var sim = new Simulation(city, graphs, data);
      city.debug();

      $('.select-random').on('click', function() {
        var person = _.sample(_.filter(data.start.population, p => p.avatar.mesh.visible));
        sim.selectui.selected = person.avatar.mesh;
        console.log(person);
        $('.info-tooltip').html(`
          <h4>${person.name} (${person.age})</h4>
          <h4>of ${person.neighborhood}</h4>
          <h4>${person.employed}</h4>
          <h4>attended ${EDUCATION[person.education]}</h4>
        `);
      });

      setInterval(sim.step.bind(sim), delay);
      sim.run();
    });

    return false;
  });
});
