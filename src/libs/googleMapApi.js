import { Loader } from '@googlemaps/js-api-loader';

export const initGoogleMap = async (el) => {
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
  const google = await loader.load();
  const map = new google.maps.Map(el, mapOptions);
  return {
    google,
    map,
  };
};


