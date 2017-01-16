import * as THREE from 'three';

class SelectUI {
  constructor(scene, onSelect) {
    this.onSelect = onSelect;
    this.mouse = new THREE.Vector2();
    this.renderer = scene.renderer;
    this.camera = scene.camera;
    this.selectables = [];
    this.selected = null;

    this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    this.renderer.domElement.addEventListener('touchstart', this.onTouchStart.bind(this), false);
  }

  onTouchStart(ev) {
    ev.preventDefault();
    ev.clientX = ev.touches[0].clientX;
    ev.clientY = ev.touches[0].clientY;
    this.onMouseDown(ev);
  }

  onMouseDown(ev) {
    if (ev.button !== 0) {
      return;
    }
    ev.preventDefault();

    // adjust browser mouse position for three.js scene
    var offsets = this.renderer.domElement.getBoundingClientRect(),
        client = {
          x: ev.clientX - offsets.left,
          y: ev.clientY - offsets.top
        };
    this.mouse.x = (client.x/this.renderer.domElement.clientWidth) * 2 - 1;
    this.mouse.y = -(client.y/this.renderer.domElement.clientHeight) * 2 + 1;

    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(this.mouse, this.camera);

    var intersects = raycaster.intersectObjects(this.selectables);
    if (intersects.length > 0) {
      var obj = intersects[0].object;
      this.onSelect(obj);
    }
  }
}

export default SelectUI;
