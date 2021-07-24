<template>
  <div class="wrapper">
    <div class="map"
         ref="map"></div>
    <br>
    <br>
    <br>
    <pre> {{ output }}</pre>
  </div>
</template>

<script>
import { Loader } from '@googlemaps/js-api-loader';
import { v4 as uuidv4 } from 'uuid';

export default {
  name: 'GoogleMap',
  data() {
    return {
      map: null,
      google: null,
      points: [],
      polygon: null,
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

      this.points.forEach((p) => console.log(p.getPosition()));
      const result = {
        coords: bounds,
        borderColor: '#c8c8b4',
        fillColor: '#c8c8b4',
      };

      return result;
    },
  },
  async mounted() {
    const loader = new Loader({
      apiKey: 'AIzaSyD5zqTuTJ9WQ349se_X8JNpamM5clXBtgY',
      version: 'weekly',
      libraries: ['places'],
    });

    const mapOptions = {
      center: {
        lat: 53.183330,
        lng: 50.116670,
      },
      draggableCursor: 'default',
      zoom: 8,
    };
    this.google = await loader.load();

    this.map = new this.google.maps.Map(this.$refs.map, mapOptions);

    this.map.addListener('click', (evt) => {
      // eslint-disable-next-line no-new
      const point = new this.google.maps.Marker({
        position: evt.latLng,
      });
      const uid = uuidv4();
      point.customID = uid;
      point.setMap(this.map);
      this.points.push(point);

      point.addListener('click', () => {
        point.setMap(null);
        this.points = this.points.filter((el) => el.customID !== uid);
      });
    });
  },
  watch: {
    points() {
      if (this.points.length > 2) {
        if (this.polygon) {
          this.polygon.setMap(null);
        }

        this.polygon = new this.google.maps.Polygon({
          paths: [
            ...this.points.map((p) => p.getPosition()),
          ],

          editable: true,
          strokeColor: '#f00',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#f00',
          fillOpacity: 0.35,
        });
        this.polygon.setMap(this.map);
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
