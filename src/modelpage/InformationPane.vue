<template>
  <div>
    <p>Sensors</p>
    <v-expansion-panels class="condensed" focusable accordion>
      <v-expansion-panel v-for="(sensor, index) in sensorData" :key="sensor.id">
        <v-expansion-panel-header>
          <v-checkbox
            color="rgba(82, 186, 162, 1)"
            @change="onItemChecked(sensor.id, index)"
            :key="sensor.id"
            v-model="checkboxes[index].checked"
          ></v-checkbox>
          <span>{{sensor.name}}</span>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          Description: {{sensor.description}}
          <v-btn
            class="button"
            color="rgba(82, 186, 162, 1)"
            dark
            raised
            block
            @click.prevent="startCameraMove(sensor.id)"
          >Go to Sensor</v-btn>
          <v-btn
            class="button"
            color="rgba(82, 186, 162, 1)"
            dark
            raised
            block
            @click.prevent="initSensor(sensor.id)"
          >Init Sensor</v-btn>
          <div>
            <v-subheader>Max Temperature</v-subheader>
            <v-slider
              v-model="temp"
              class="align-center"
              :max="temp_max"
              :min="temp_min"
              height="5"
              thumb-label
              thumb-size="26"
              color="rgba(82, 186, 162, 1)"
              track-color="rgba(0, 0, 0, 0.3)"
              v-on:change="onSliderChanged('temp', temp, sensor.id)"
            ></v-slider>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>


<script>
import axios from "axios";
import SKEYS from "../storage/StorageKeys";

export default {
  props: ["modeID", "STORE"],
  data() {
    return {
      model: [],
      checkboxes: [],
      sensorData: [],
      endpoint: process.env.API_URL + "/",
      temp_min: 10,
      temp_max: 80,
      temp: 50
    };
  },
  created() {
    this.loadSensorData(this.modeID);

    this.STORE.getSelectedSensors(sensorIds => {
      for (let id of sensorIds) {
        const i = this.indexWhere(this.checkboxes, item => item.id === id);
        this.checkboxes[i].checked; // TODO check sensor checkbox passiert im normalfall nicht aber der vollständigkeit halber
      }
    });

    this.STORE.onSensorSelectionChanged((sensorId, action) => {
      const i = this.indexWhere(this.checkboxes, item => item.id === sensorId);
      if (action == "new") {
        this.checkboxes[i].checked = true;
      } else if (action == "removed") {
        this.checkboxes[i].checked = false;
      }
    });
  },
  methods: {
    onSliderChanged(key, value, id) {
      //console.log(key, value);
      switch (key) {
        case "temp":
          //console.log(this.sensorData[id].latest_data.value);
          this.sensorData[id].latest_data.value = value;
          break;
        default:
          break;
      }
    },
    onItemChecked(id, index) {
      event.stopPropagation();
      if (this.checkboxes[index].checked == true) {
        this.STORE.selectSensor(id);
      } else if (this.checkboxes[index].checked == false) {
        this.STORE.unselectSensor(id);
      }
    },
    indexWhere(array, conditionFn) {
      const item = array.find(conditionFn);
      return array.indexOf(item);
    },
    startCameraMove(id) {
      this.STORE.set(SKEYS.CAMERA_DRIVE_SENSOR, id);
    },
    initSensor(id) {
      this.STORE.set(SKEYS.INIT_SENSOR, id);
    },
    loadSensorData(id) {
      axios(this.endpoint + "models/" + id)
        .then(response => {
          this.model = response.data;
          this.sensorData = this.model.sensors;
          this.checkboxes = this.sensorData.map(sensor => {
            return {
              checked: false,
              id: sensor.id
            };
          });
          this.$route.meta.title = this.model.name;
          // add a temporary variable
          this.$router.replace({ query: { temp: Date.now() } });
          // remove the temporary variable query
          this.$router.replace({ query: { temp: undefined } });
        })
        .catch(error => {
          console.log(error);
        });
    }
  }
};
</script>


<style lang="scss">
// do we really need the scoped attribute? overriding vuetify styles doesnt work with that

/* information pane id is set from outsite */
#informationpane {
  width: 100%;
  overflow-y: scroll;

  p {
    display: block;
    color: black;
    padding: 16px;
    margin: 0;
    text-decoration: none;
  }
}

.condensed {
  max-height: 15%;
}

.v-expansion-panel-header {
  padding: 10px;
}

.v-expansion-panel-content > div {
  padding: 10px 10px !important;
}

.v-expansion-panel-content button {
  margin: 10px 0;
}

.v-expansion-panel-header > :not(.v-expansion-panel-header__icon) {
  flex: unset;
}
</style>
