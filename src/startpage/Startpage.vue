<template>
  <div>
    <v-app-bar>
      <img id="logo" src="../assets/logo.svg" alt="vuejs logo" />
      <h2>Vi-Sense</h2>
      <v-spacer></v-spacer>
      <AccountInfo/>
    </v-app-bar>

    <main>
      <div class="centerContent">
        <div v-for="model in models" active-class="not-active" class="modelCardWrapper buildingCard" :key="model.id">
          <v-card class="buildingCard mx-auto" max-height="500" max-width="300" width="100%" :elevation="model.name==optimizedModelTitel ? 20 : 1">
            <div v-if="model.name==optimizedModelTitel" class="optiBadge"><span>Optimized for Show-time</span></div>  

            <v-img class="black--text align-end" height="200px" :src="endpoint + model.image_url" style="border-radius: 0">
              <v-card-title class="modelTitle">{{ model.name }}</v-card-title>
            </v-img>

            <v-card-text class="text--primary">
              <div>{{model.location.address}}</div>
              <div>Type: {{ model.type }}</div>
              <div>Floors: {{ model.floors }}</div>
              <div>
                Outdoor Temperature:
                <span
                  v-if="anomaliesLoaded"
                >{{lastTemperatures.has(model.id) ? lastTemperatures.get(model.id).value : "" | formatNumber}} °C</span>
              </div>
              <div v-if="anomaliesLoaded">
                Last Anomaly:
                <span
                  class="colorAnomalies"
                >{{lastAnomalies.has(model.id) ? lastAnomalies.get(model.id).start_data.date : "" | formatDate}}</span>
              </div>
            </v-card-text>

            <v-card-actions>
              <v-btn :href="`#/modelview/${model.id}`" color="rgba(82, 186, 162, 1)" dark elevation="2" block
                  style="color: white">
                  Open in 3D
              </v-btn>
            </v-card-actions>
            <div class="mapWrapper">
              <l-map
                :zoom="zoom"
                :center="getLatlong(model.location.latitude, model.location.longitude)"
              >
                <l-tile-layer :url="url" :attribution="attribution" />
                <l-marker :lat-lng="getLatlong(model.location.latitude, model.location.longitude)">
                  <l-popup :content="model.location.address"></l-popup>
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
import { LMap, LTileLayer, LMarker, LPopup, LTooltip, LIcon } from "vue2-leaflet";
import moment from "moment";
require("../../node_modules/leaflet/dist/leaflet.css");
import AccountInfo from './AccountInfo.vue'

// FIX leaflet's default icon path problems with webpack
L.Icon.Default.imagePath = "/";
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
    LTooltip,
    LIcon,
    AccountInfo,
    LPopup
  },
  data() {
    return {
      endpoint: process.env.API_URL + "/",
      zoom: 12,
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      models: [],
      lastAnomalies: Map,
      lastTemperatures: Map,
      anomaliesLoaded: false,
      lat: null,
      long: null,
      dialog: false,
      optimizedModelTitel: "Mechanical Room, Cape Town"
    };
  },
  created() {
    this.fetchModels();
  },
  filters: {
    formatDate: function(value) {
      if (value) {
        return moment(String(value)).format("DD.MM.YYYY HH:mm:ss");
      }
    },
    formatNumber: function(value) {
      if (value) {
        return Number((value).toFixed(1));
      }
    }
  },
  methods: {
    async getLatestData() {
      this.lastAnomalies = new Map();
      this.lastTemperatures = new Map();
      const current_date = moment.utc().format("YYYY-MM-DD HH:mm:ss");
      await Promise.all(
        this.models.map(async model => {
          let modelAnomalies = [];
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
          let modelSensors = [];
          const latestValue = model.sensors.find(
            sensor => sensor.name === "Outdoor Temperature"
          );
          //console.log(latestValue.id);
          try {
            const sensorValues = await fetch(
              `${this.endpoint}sensors/${latestValue.id}/data?start_date=${current_date}`
            );
            modelSensors.push(...(await sensorValues.json()));
            //console.log(JSON.stringify(modelSensors));
          } catch (error) {
            console.log(error);
          }

          if (modelSensors.length > 0) {
            const latestTemperature = modelSensors[0];
            this.lastTemperatures.set(model.id, latestTemperature);
            //console.log(this.lastTemperatures);
          }
          if (modelAnomalies.length > 0) {
            const latestAnomaly = modelAnomalies.sort((b, a) =>
              a.start_data.date.localeCompare(b.start_data.date)
            )[0];
            this.lastAnomalies.set(model.id, latestAnomaly);
            //console.log(this.lastAnomalies);
          }
        })
      );
      this.anomaliesLoaded = true;
    },
    getLatlong(lat, long) {
      return latLng(lat, long);
    },

    async fetchModels() {
      axios
        .get(this.endpoint + "models")
        .then(response => {
          this.models = response.data.sort(a =>
            a.name.includes("echanical") ? -1 : 1
          );
          this.getLatestData();
        })
        .catch(error => {
          console.log(error);
        });
    }
  }
};
</script>

<style lang="scss">
.leaflet-popup-content {
  font-size: xx-small;
}
.modelTitle {
  background: #ffffffd1;
  font-weight: normal;
  padding-top: 12px;
  padding-bottom: 10px;
}
.title {
  grid-column: 1;
  position: absolute;
  top: 8%;
  left: 1%;
}
.colorAnomalies {
  color: red;
}
.mapWrapper {
  width: 100%;
  height: 150px;
}
.vue2leaflet-map {
  z-index: 1;
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

.centerContent {
  flex: 1 1 80%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.modelCardWrapper {
  margin: 2% 2% 2% 10px;
  grid-column: 2;
  display: block;
  text-decoration: none;
  color: #2c3e50;
  &--home {
    text-transform: uppercase;
    margin-bottom: 30px;
  }
  &.is-active {
    color: #42b983;
  }
}

.buildingCard{
  position: relative;
}
.optiBadge{
  z-index: 5;
  position: absolute;
  right: -10px;
  top: -10px;
  width: 70px;
  height: 70px;
  border-radius: 50px !important;
  border: 1px solid white;
  background-color: rgba(82, 186, 162, 1);
  text-align: center;
  line-height: 0.9 !important;

  // vertical center
  display: flex;
  justify-content: center;
  flex-direction: column;

  span{
    display: inline-block;
    color: white;
    font-size: 1em;
    text-align: center;
    margin: auto;
    vertical-align: middle;
    //transform: rotate(10deg)
  }
}
</style>
