<template>
  <div>
    <v-app-bar>
      <img id="logo" src="../assets/logo.svg" alt="vuejs logo" />
      <h2>Vi-Sense Start</h2>
      <div class="account-title">Demo Account</div>
      <div class="account-logo">
        <v-dialog v-model="dialog" persistent max-width="290">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              @click.stop="dialog = true"
              icon
              width="auto"
              height="auto"
              class="pa-1"
              style="border: 2px solid #52baa2;"
            >
              <v-avatar size="20">DA</v-avatar>
            </v-btn>
          </template>
          <v-card>
            <v-card-title class="headline">This is a test account!</v-card-title>
            <v-card-text>This is a showtime prototype of a project of the HTW Berlin in cooperation with Metr. Please keep this in mind</v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="green darken-1" text @click="dialog = false">Ok</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </v-app-bar>

    <main>
      <div class="centerContent">
        <div
          v-for="model in models"
          active-class="not-active"
          class="modelCardWrapper"
          :key="model.id"
        >
          <v-card class="mx-auto" max-height="500" max-width="300">
            <v-img
              class="black--text align-end"
              height="200px"
              :src="'https://visense.f4.htw-berlin.de:44344/' + model.image_url"
            >
              <v-card-title class="modelTitle">{{ model.name }}</v-card-title>
            </v-img>

            <v-card-subtitle class="pb-0">{{ model.location.address }}</v-card-subtitle>

            <v-card-text class="text--primary">
              <div>
                Outdoor Temperature:
                <span
                  v-if="anomaliesLoaded"
                >{{lastTemperatures.has(model.id) ? lastTemperatures.get(model.id).value : "" }} °C</span>
              </div>
              <div>Type: {{ model.type }}</div>
              <div>Floors: {{ model.floors }}</div>
              <div>
                Last Anomaly:
                <span
                  v-if="anomaliesLoaded"
                >{{lastAnomalies.has(model.id) ? lastAnomalies.get(model.id).start_data.date : "" | formatDate}}</span>
              </div>
            </v-card-text>

            <v-card-actions>
                    <v-btn :href="`#/modelview/${model.id}`" color="rgba(82, 186, 162, 1)" dark elevation="2" block
                        style="color: white">
                        Open in Modelview
                    </v-btn>
            </v-card-actions>
            <div class="mapWrapper">
              <l-map
                :zoom="zoom"
                :center="getLatlong(model.location.latitude, model.location.longitude)"
              >
                <l-tile-layer :url="url" :attribution="attribution" />
                <l-marker :lat-lng="getLatlong(model.location.latitude, model.location.longitude)">
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
  filters: {
    formatDate: function(value) {
      if (value) {
        return moment(String(value)).format("DD.MM.YYYY HH:mm:ss");
      }
    }
  },
  components: {
    LMap,
    LTileLayer,
    LMarker,
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
      models: [],
      lastAnomalies: Map,
      lastTemperatures: Map,
      anomaliesLoaded: false,
      lat: null,
      long: null,
      dialog: false
    };
  },
  created() {
    this.fetchModels();
  },
  methods: {
    async getLatestData() {
      this.lastAnomalies = new Map();
      this.lastTemperatures = new Map();
      const current_date = moment().format("YYYY-MM-DD HH:mm:ss");
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
            console.log(this.lastTemperatures);
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
          this.models = response.data.sort((a) => a.name.includes("echanical")? -1:1);
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
.account-title {
  padding-left: 70%;
}
.account-logo {
  left: 20%;
  margin-left: 1%;
}
.modelTitle {
  background: #ffffffd1;
}
.title {
  grid-column: 1;
  position: absolute;
  top: 8%;
  left: 1%;
}

.mapWrapper {
  width: 100%;
  height: 150px;
}
.vue2leaflet-map{
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
</style>