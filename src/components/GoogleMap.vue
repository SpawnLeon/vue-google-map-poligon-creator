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

export default {
  name: 'GoogleMap',
  data() {
    return {
      map: null,
      google: null,
      points: [],
    };
  },
  computed: {
    output() {
      this.points.forEach((p) => console.log(p.getPosition()));
      const result = {
        coords: [
          ...this.points.map((p) => p.getPosition()),
        ],
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
      point.setMap(this.map);
      this.points.push(point);
      const pointCounter = this.points.length;
      point.addListener('click', () => {
        point.setMap(null);
        this.points = this.points.splice(pointCounter, 1);
      });
    });
  },
};
</script>

<style lang="scss"
       scoped>
.map {
  min-height : 600px;
}
</style>
