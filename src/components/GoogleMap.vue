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

      if (this.points.length > 2) {
        if (this.polygon) {
          this.polygon.setMap(null);
        }

        const polygon = new this.google.maps.Polygon({
          paths: [
            ...this.points,
          ],
          draggable: true,
          geodesic: true,
          editable: true,
          strokeColor: '#f00',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#f00',
          fillOpacity: 0.35,
        });
        this.polygon = polygon;
        polygon.setMap(this.map);



        const deleteMenu = new DeleteMenu();
        google.maps.event.addListener(polygon, 'contextmenu', (e) => {
          // Check if click was on a vertex control point
          if (e.vertex === undefined) {
            return;
          }
          deleteMenu.open(map, polygon.getPath(), e.vertex);
        });
      }
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
