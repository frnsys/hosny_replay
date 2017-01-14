import $ from 'jquery';
import * as THREE from 'three';

function toXYCoords(pos, camera) {
  var vector = pos.clone().project(camera);
  vector.x = (vector.x + 1)/2 * $('#stage').width();
  vector.y = -(vector.y - 1)/2 * $('#stage').height();
  return vector;
}

export default {
  abovePosition: function(mesh, camera, y_offset) {
    var pos = new THREE.Vector3();
    pos.setFromMatrixPosition(mesh.matrixWorld);
    pos.y += y_offset; // a little y offset
    return toXYCoords(pos, camera);
  }
};
