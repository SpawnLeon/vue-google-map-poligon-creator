import { Loader } from '@googlemaps/js-api-loader';
const google = await loader.load();

export default class DeleteMenu extends google.maps.OverlayView {
  div_;

  divListener_;

  constructor() {
    super();
    this.div_ = document.createElement('div');
    this.div_.className = 'delete-menu';
    this.div_.innerHTML = 'Delete';
    const menu = this;
    google.maps.event.addDomListener(this.div_, 'click', () => {
      menu.removeVertex();
    });
  }

  onAdd() {
    const deleteMenu = this;
    const map = this.getMap();
    this.getPanes()
      .floatPane
      .appendChild(this.div_);
    // mousedown anywhere on the map except on the menu div will close the
    // menu.
    this.divListener_ = google.maps.event.addDomListener(
      map.getDiv(),
      'mousedown',
      (e) => {
        if (e.target !== deleteMenu.div_) {
          deleteMenu.close();
        }
      },
      true,
    );
  }

  onRemove() {
    if (this.divListener_) {
      google.maps.event.removeListener(this.divListener_);
    }
    this.div_.parentNode.removeChild(this.div_);
    // clean up
    this.set('position', null);
    this.set('path', null);
    this.set('vertex', null);
  }

  close() {
    this.setMap(null);
  }

  draw() {
    const position = this.get('position');
    const projection = this.getProjection();

    if (!position || !projection) {
      return;
    }
    const point = projection.fromLatLngToDivPixel(position);
    this.div_.style.top = `${point.y}px`;
    this.div_.style.left = `${point.x}px`;
  }

  /**
   * Opens the menu at a vertex of a given path.
   */
  open(map, path, vertex) {
    this.set('position', path.getAt(vertex));
    this.set('path', path);
    this.set('vertex', vertex);
    this.setMap(map);
    this.draw();
  }

  /**
   * Deletes the vertex from the path.
   */
  removeVertex() {
    const path = this.get('path');
    const vertex = this.get('vertex');

    if (!path || vertex === undefined) {
      this.close();
      return;
    }
    path.removeAt(vertex);
    this.close();
  }
}
