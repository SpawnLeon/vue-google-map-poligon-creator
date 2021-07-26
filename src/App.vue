<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        <h1>Polygon creator</h1>
      </div>

      <v-spacer></v-spacer>

      <v-btn
        href="https://github.com/SpawnLeon"
        target="_blank"
        text
      >
        <span class="mr-2">Github</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <GoogleMap/>
    </v-main>
  </v-app>
</template>
<script>
import '@/assets/style.css';
import GoogleMap from '@/components/GoogleMap.vue';

export default {
  name: 'App',

  components: { GoogleMap },

  data: () => ({
    //
  }),
};
</script>
