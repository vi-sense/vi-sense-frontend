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
                  <v-btn class="button" color="rgba(82, 186, 162, 1)" dark raised block @click.prevent="startCameraMove(sensor.id)">Go to Sensor</v-btn>
                  <v-btn class="button" color="rgba(82, 186, 162, 1)" dark raised block @click.prevent="initSensor(sensor.id)">Init Sensor</v-btn>
              </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>
    </div>
</template>


<script>
import axios from "axios";
import SKEYS from '../storage/StorageKeys'

export default {
  props: ["modeID", "STORE"],
  data() {
    return {
      model: [],
      checkboxes: [],
      sensorData: [],
      endpoint: process.env.API_URL + "/"
    };
  },
  created() {
    this.loadSensorData(this.modeID);

    this.STORE.getSelectedSensors((sensorIds)=>{
      for(let id of sensorIds){
         this.checkboxes[id].checked; // TODO check sensor checkbox passiert im normalfall nicht aber der vollständigkeit halber
      }   
    })
    
    this.STORE.onSensorSelectionChanged((sensorId, action) => {
      if(action == "new") {
        this.checkboxes[sensorId-1].checked = true;
      } else if(action == "removed"){
        this.checkboxes[sensorId-1].checked = false;
      }
    })
  },
  methods: {
    onItemChecked(id, index) {
      event.stopPropagation()
      if (this.checkboxes[index].checked == true) {
        this.STORE.selectSensor(id);
      }
      else if (this.checkboxes[index].checked == false) {
        this.STORE.unselectSensor(id);
      }
    },
    startCameraMove(id) {
      this.STORE.set(SKEYS.CAMERA_DRIVE_SENSOR, id);
    },
    initSensor(id){
      this.STORE.set(SKEYS.INIT_SENSOR, id)
    },
    loadSensorData(id) {
      axios(this.endpoint + "models/" + id)
        .then(response => {
          this.model = response.data;
          this.sensorData = this.model.sensors;
          this.checkboxes = this.sensorData.map(sensor => {
            return {
              checked: false
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
  },
};
</script>


<style lang="scss">
// do we really need the scoped attribute? overriding vuetify styles doesnt work with that

/* information pane id is set from outsite */
#informationpane {
  width: 100%;
  height: 100%;
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

.button {
  margin-top: 5px;
}

</style>