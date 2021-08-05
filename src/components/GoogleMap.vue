<template>
  <div class="wrapper">
    <v-container class="grey lighten-5 mt-6">
      <v-row>
        <v-col
          cols="12"
          sm="8"
        >
          <div
            class="map"
            ref="map"></div>
        </v-col>
        <v-col
          cols="12"
          sm="4"
        >
          <v-btn
            @click.prevent="addPolygon"
            elevation="2"
          >New polygon
          </v-btn>
          <br>
          <br>

          <v-card class="pa-2 my-4"
                  v-for="(p, idx) in polygons"
                  :key="idx"
                  elevation="2"
          >
            Polygon {{ idx + 1 }}

            <v-btn
              @click.prevent="editPolygon(idx)"
              color="success ml-6"
              fab
              x-small
              dark
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              @click.prevent="savePolygon(idx)"
              color="cyan ml-6"
              fab
              x-small
              dark
            >
              <v-icon>mdi-content-save</v-icon>
            </v-btn>

            <v-btn
              @click.prevent="removePolygon(idx)"
              color="error ml-1"
              fab
              x-small
              dark
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-card>

          <br>
          <br>
          <v-btn
            v-clipboard="() => JSON.stringify(this.output, null, 2)"
            elevation="2"
          >Copy code to clipboard
          </v-btn>


          <br><br>

          <pre class="code mt-6">{{ output }}</pre>
        </v-col>
      </v-row>
    </v-container>


  </div>
</template>

<script>

import { initGoogleMap } from '@/libs/googleMapApi.js';

export default {
  name: 'GoogleMap',
  data() {
    return {
      polygons: [],
      google: null,
      map: null,
      currentPolygonIdx: null,
      codeKey: Date.now(),

    };
  },
  computed: {
    currentPolygon() {

      if (this.currentPolygonIdx === null) {
        return null;
      }
      return this.polygons[this.currentPolygonIdx];
    },
    output() {

      if (!this.polygons.length) {
        return {};
      }

      //TODO: this hack is updating output where polygon change vertex coordinates
      let result = this.codeKey;
      result = [];
      this.polygons.forEach((polygon => {
        const polygonBounds = polygon.getPath();
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

        result.push({
          coords: bounds,
          borderColor: '#c8c8b4',
          fillColor: '#c8c8b4',
        });
      }));

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

    const vm = this;
    this.map.addListener('click', (evt) => {

      if (!vm.currentPolygon) {
        vm.polygons.push(vm.createPolygon());
        vm.currentPolygonIdx = vm.polygons.length - 1;
      }

      const currentPolygon = vm.polygons[vm.currentPolygonIdx];

      const path = currentPolygon.getPath();
      path.push(evt.latLng);
      currentPolygon.setPath(path);

      google.maps.event.addListener(currentPolygon.getPath(), 'set_at', function () {
        vm.codeKey = Date.now();
      });
      google.maps.event.addListener(currentPolygon.getPath(), 'insert_at', function () {
        vm.codeKey = Date.now();
      });

    });

  },

  methods: {

    addPolygon() {
      if (!this.currentPolygon) {
        return;
      }

      this.currentPolygon.setEditable(false);
      // this.currentPolygon.setDraggable(false);
      this.currentPolygonIdx = null;

    },

    removePolygon(idx) {
      const polygon = this.polygons[idx];
      polygon.setMap(null);
      this.polygons.splice(idx, 1);
      if (idx <= this.currentPolygonIdx) {
        this.currentPolygonIdx -= 1;
      }

    },

    editPolygon(idx) {
      this.currentPolygonIdx = idx;
      this.currentPolygon.setEditable(true);
      //this.currentPolygon.setDraggable(true);
    },

    savePolygon(idx) {
      this.currentPolygonIdx = idx;
      this.currentPolygon.setEditable(false);
      //this.currentPolygon.setDraggable(false);
    },

    createPolygon() {
      const polygon = new this.google.maps.Polygon({

        //draggable: true,
        geodesic: false,
        editable: true,
        strokeColor: '#f00',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#f00',
        fillOpacity: 0.35,
      });

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
      return polygon;
    },

  },
};
</script>

<style lang="scss"
       scoped>
.map {
  min-height : 600px;
}

.code {
  font-size   : 11px;
  font-family : monospace;
  line-height : 1.6;
}
</style>
