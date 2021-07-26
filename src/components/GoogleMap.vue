<template>
  <div class="wrapper">
    <div class="map"
         ref="map"></div>

    <br>
    <pre> {{ output }}</pre>
  </div>
</template>

<script>

import { initGoogleMap } from '@/libs/googleMapApi.js';

export default {
  name: 'GoogleMap',
  data() {
    return {
      points: [],
      polygon: null,
      google: null,
      map: null,
    };
  },
  computed: {
    output() {
      if (!this.polygon) {
        return {};
      }
      const polygonBounds = this.polygon.getPath();
      const bounds = [];

      for (let i = 0; i < polygonBounds.length; i += 1) {
        const point = {
          lat: polygonBounds.getAt(i)
            .lat(),
          lng: polygonBounds.getAt(i)
            .lng(),
        };
        bounds.push(point);
      }

      const result = {
        coords: bounds,
        borderColor: '#c8c8b4',
        fillColor: '#c8c8b4',
      };

      return result;
    },
  },
  async mounted() {
    const {
      map,
      google,
    } = await initGoogleMap(this.$refs.map);
    this.map = map;
    this.google = google;

    this.map.addListener('click', (evt) => {
      this.points.push(evt.latLng);
    });
  },
  watch: {
    points() {

      if (this.polygon) {
        this.polygon.setMap(null);
      }

      const polygon = new this.google.maps.Polygon({
        paths: [
          ...this.points,
        ],
        draggable: true,
        geodesic: false,
        editable: true,
        strokeColor: '#f00',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#f00',
        fillOpacity: 0.35,
      });
      this.polygon = polygon;
      polygon.setMap(this.map);

      const {
        map,
        google,
      } = this;

      class DeleteMenu extends google.maps.OverlayView {
        div_;

        divListener_;

        constructor() {
          super();
          this.div_ = document.createElement('div');
          this.div_.className = 'delete-menu';
          this.div_.innerHTML = 'Delete';
          const menu = this;
          google.maps.event.addDomListener(this.div_, 'click', (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            menu.removeVertex();
          });
        }

        onAdd() {
          const deleteMenu = this;
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

      const deleteMenu = new DeleteMenu();
      google.maps.event.addListener(polygon, 'contextmenu', (e) => {
        // Check if click was on a vertex control point
        if (e.vertex === undefined) {
          return;
        }
        deleteMenu.open(map, polygon.getPath(), e.vertex);
      });
    },
  },
  
};
</script>

<style lang="scss"
       scoped>
.map {
  min-height : 600px;
}

</style>
