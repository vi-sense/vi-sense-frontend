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
                Last Anomaly:
                <div v-if="anomaliesLoaded">
                  {{lastAnomalies.has(model.id) ? lastAnomalies.get(model.id).start_data.date : ""}}
                </div>
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
              >
                <l-tile-layer :url="url" :attribution="attribution" />
                <l-marker :lat-lng="getLatlong(model.location.latitude, model.location.longitude)">
                  <l-popup>
                    <div @click="innerClick">
                      {{ model.location.address }}
                      <p v-show="showParagraph">{{ model.description }}</p>
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
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup,
  LTooltip,
  LIcon
} from "vue2-leaflet";
import moment from "moment";
require("../../node_modules/leaflet/dist/leaflet.css");

// FIX leaflet's default icon path problems with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LTooltip,
    LIcon
  },
  data() {
    return {
      endpoint: process.env.API_URL + "/",
      zoom: 12,
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      showParagraph: false,
      showMap: true,
      models: [],
      lastAnomalies: Map,
      anomaliesLoaded: false,
      lat: null,
      long: null
    };
  },
  created() {
    this.getAllModels();
  },
  methods: {
    async getLatestData() {
      this.lastAnomalies = new Map();
      const current_date = moment().format("YYYY-MM-DD HH:mm:ss")
      await Promise.all(this.models.map(async model => {
        let modelAnomalies = []
        await Promise.all(
                model.sensors.map(async sensor => {
                  try {
                    const sensorAnomalies = await fetch(
                            `${this.endpoint}sensors/${sensor.id}/anomalies?end_date=${current_date}`
                    );
                    modelAnomalies.push(...(await sensorAnomalies.json()));
                  } catch (error) {
                    console.log(error);
                  }
                })
        );
        if (modelAnomalies.length > 0) {
          const latestAnomaly = modelAnomalies.sort((b, a) =>
                  a.start_data.date.localeCompare(b.start_data.date)
          )[0]
          this.lastAnomalies.set(model.id, latestAnomaly)
        }
      }));
      this.anomaliesLoaded = true;
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
    async getAllModels() {
      axios
        .get(this.endpoint + "models")
        .then(response => {
          this.models = response.data;
          this.getLatestData()
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