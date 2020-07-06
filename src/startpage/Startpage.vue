<template>
  <div>
    <v-app-bar>
      <img id="logo" src="../assets/logo.svg" alt="vuejs logo" />
      <h2>Vi-Sense Start</h2>
      <div class="account">Demo Account</div>
      <div class="v-avatar primary" style="height: 26px; width: 26px; margin-left: 1%">
        <span class="white--text">DA</span>
      </div>
    </v-app-bar>

    <main>
      <div class="content">
        <div class="title"></div>
        <div
          v-for="model in models"
          active-class="not-active"
          class="link"
          id="card"
          :key="model.id"
        >
          <v-card class="mx-auto" max-height="500" max-width="300">
            <v-img
              class="black--text align-end"
              height="200px"
              :src="'https://visense.f4.htw-berlin.de:44344/' + model.image_url"
            >
              <v-card-title class="wtf">{{ model.name }}</v-card-title>
            </v-img>

            <v-card-subtitle class="pb-0">{{ model.location.address }}</v-card-subtitle>

            <v-card-text class="text--primary">
              <div>Current Weather: 30°C, Sunny</div>
              <div>Type: {{ model.type }}</div>
              <div>Floors: {{ model.floors }}</div>
              <div>
                Last Anomalie:
                <span v-html="getLatestData(model.id)"></span>
              </div>
              {{ model.description }}
            </v-card-text>

            <v-card-actions>
              <v-btn color="rgba(82, 186, 162, 1)" dark elevation="2" block>
                <router-link
                  style="color: white"
                  :to="{name: 'modelview', params: {id: model.id}}"
                >Open in Modelview</router-link>
              </v-btn>
            </v-card-actions>
            <div class="foobar1">
              <l-map
                v-if="showMap"
                :zoom="zoom"
                :center="getLatlong(model.location.latitude, model.location.longitude)"
                :options="mapOptions"
                @update:center="centerUpdate"
                @update:zoom="zoomUpdate"
              >
                <l-tile-layer :url="url" :attribution="attribution" />
                <l-marker :lat-lng="getLatlong(model.location.latitude, model.location.longitude)">
                  <l-popup>
                    <div @click="innerClick">
                      {{ model.location.address }}
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
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import axios from "axios";
import { latLng } from "leaflet";
import { LMap, LTileLayer, LMarker, LPopup, LTooltip } from "vue2-leaflet";

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LTooltip
  },
  data() {
    return {
      endpoint: process.env.API_URL + "/",
      zoom: 12,
      center: latLng(1.44, 2.55),
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      withPopup: latLng(1.44, 2.55),
      withTooltip: latLng(1.44, 2.55),
      currentZoom: 11.5,
      currentCenter: latLng(1.44, 2.55),
      showParagraph: false,
      mapOptions: {
        zoomSnap: 0.5
      },
      showMap: true,
      models: [],
      model: null,
      sensorsById: Map,
      anomalies: [],
      anomaliesLoaded: false,
      lat: null,
      long: null
    };
  },
  created() {
    this.getAllModels();
  },
  methods: {
    async getLatestData(id) {
      try {
        const response = await fetch(this.endpoint + "models/" + id);
        this.model = await response.json();
      } catch (error) {
        console.log(error);
      }
      this.sensorsById = new Map();
      this.anomalies = [];
      await Promise.all(
        this.model.sensors.map(async sensor => {
          this.sensorsById.set(sensor.id, sensor);
          try {
            const sensorAnomalies = await fetch(
              `${this.endpoint}sensors/${sensor.id}/anomalies`
            );
            this.anomalies.push(...(await sensorAnomalies.json()));
          } catch (error) {
            console.log(error);
          }
        })
      );
      this.anomalies.sort((b, a) =>
        a.start_data.date.localeCompare(b.start_data.date)
      );
      this.anomaliesLoaded = true;
      for (var anomaly in this.anomalies[id]) {
        console.log("data is undefined" + anomaly);
        if (anomaly == 'start_data'){
        Promise.resolve(anomaly).then(function(anomaly) {
          
            console.log("inserting into IndexedDB", anomaly);
          });
           
        }
    
      }
    },
    getLatlong(lat, long) {
      return latLng(lat, long);
    },
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
    getAllModels() {
      axios
        .get(this.endpoint + "models")
        .then(response => {
          this.models = response.data;
        })
        .catch(error => {
          console.log(error);
        });
    }
  }
};
</script>

<style lang="scss">
.account {
  float: right;
  padding-left: 70%;
}
.wtf {
  background: #ffffffd1;
}
.title {
  grid-column: 1;
  position: absolute;
  top: 8%;
  left: 1%;
}
#card {
  margin: 2%;
  grid-column: 2;
}
.foobar1 {
  width: 100%;
  height: 150px;
}
#mapid {
  height: 180px;
}
header {
  height: 7% !important;
  z-index: 3;

  #logo {
    height: 100%;
    img {
      height: 100%;
    }
  }
  h2 {
    margin: 0;
    margin: auto 10px !important;
  }
  .v-toolbar__content {
    height: 100% !important;
  }
}

h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
header {
  width: 100%;
  min-height: 7%;
  height: 7%;
}
main {
  display: flex;
  height: 93%;
}
aside {
  flex: 1 0 20%;
  height: 100%;
  overflow-y: auto;
  width: 20%;
  padding: 1%;
  box-sizing: border-box;
  border-right: 1px solid #42b983;
}
.content {
  flex: 1 1 80%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.link {
  display: block;
  text-decoration: none;
  margin-bottom: 10px;
  color: #2c3e50;
  &--home {
    text-transform: uppercase;
    margin-bottom: 30px;
  }
  &.is-active {
    color: #42b983;
  }
}
</style>