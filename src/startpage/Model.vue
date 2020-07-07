<template lang="html">
    <v-card
      class="mx-auto"
      max-width="400"
    >
      <v-img
        class="black--text align-end"
        height="200px"
        :src="this.endpoint + model.image_url"
      >
        <v-card-title class="wtf">{{ model.name }}</v-card-title>
      </v-img>
  
      <v-card-subtitle class="pb-0">{{ model.location }}</v-card-subtitle>
  
      <v-card-text class="text--primary">
    
  
        <div>Current Weather: 30°C, Sunny</div>
        <div>Type: {{ model.type }}</div>
        <div>Floors {{ model.floors }}</div>
        last anomalie: 26.06.2020
        {{ model.description }}
      </v-card-text>
  
      <v-card-actions>

  
        <v-btn
          color="orange"
          text
        >
        <router-link :to="{name: 'modelview', params: {id: model.id}}">
          Open in Modelview
          </router-link>
        </v-btn>
      </v-card-actions> 
    <div class="foobar1">
    <l-map
      v-if="showMap"
      :zoom="zoom"
      :center="center"
      :options="mapOptions"
      @update:center="centerUpdate"
      @update:zoom="zoomUpdate"
    >
      <l-tile-layer
        :url="url"
        :attribution="attribution"
      />
      <l-marker :lat-lng="withPopup">
        <l-popup>
          <div @click="innerClick">
            I am a popup
            <p v-show="showParagraph">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
              sed pretium nisl, ut sagittis sapien. Sed vel sollicitudin nisi.
              Donec finibus semper metus id malesuada.
            </p>
          </div>
        </l-popup>
      </l-marker>
    </l-map>
    </div>
    
    </v-card>
        
  
</template>

 
<script>
import axios from "axios";
import { latLng } from "leaflet";
import { LMap, LTileLayer, LMarker, LPopup, LTooltip } from "vue2-leaflet";

export default {
  props: ["id"],
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LTooltip
  },
  data() {
    return {
      zoom: 13,
      center: latLng(-51.725260, -72.507820),
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      withPopup: latLng(-51.725260, -72.507820),
      withTooltip: latLng(47.41422, -1.250482),
      currentZoom: 11.5,
      currentCenter: latLng(47.41322, -1.219482),
      showParagraph: false,
      mapOptions: {
        zoomSnap: 0.5
      },
      showMap: true,
      model: null,
      endpoint: process.env.API_URL + "/"
    };
  },
  methods: {
    zoomUpdate(zoom) {
      this.currentZoom = zoom;
    },
    centerUpdate(center) {
      this.currentCenter = center;
    },
    showLongText() {
      this.showParagraph = !this.showParagraph;
    },
    innerClick() {
      alert("Click!");
    },
    getModel(id) {
      axios(this.endpoint + "models/" + id)
        .then(response => {
          this.model = response.data;
        })
        .catch(error => {
          console.log(error);
        });
    }
  },
  created() {
    this.getModel(this.id);
  },
  watch: {
    $route() {
      this.getModel(this.id);
    }
  }
};
</script>

<style scoped lang="scss">
.foobar1 {
  width: 100%;
  height: 400px;
}
#mapid {
  height: 180px;
}

.model {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
  padding: 50px 20px 70px;
  &__title {
    position: relative;
    text-transform: uppercase;
    z-index: 1;
  }
  &__body {
    position: relative;
    z-index: 1;
  }
  &__id {
    position: absolute;
    font-size: 280px;
    bottom: -50px;
    margin: 0;
    color: #eeeeee;
    right: -20px;
    line-height: 1;
    font-weight: 900;
    z-index: 0;
  }
  &__image {
    width: 50%;
    height: 50%;
    position: absolute;
    bottom: -100px;
    margin: 0;
    right: 250px;
    line-height: 1;
    z-index: 0;
  }
}
</style>