<template>
    <div>
        <a class="active" href="#home">Information Pane</a>
        <a href="#sensor">Sensoren</a>
        <v-expansion-panels class="condensed" focusable>
            <v-expansion-panel v-for="(sensor, index) in sensorData" :key="sensor.id">
            <v-expansion-panel-header>
                <v-checkbox
                @change="onItemChecked(sensor.id, index)"
                :key="sensor.id"
                v-model="checkboxes[index].checked"
                ></v-checkbox>
                {{sensor.name}}
            </v-expansion-panel-header>
            <v-expansion-panel-content>
                Description: {{sensor.description}}
                <v-btn color="primary" rounded @click.prevent="startCameraMove(sensor.id)">Go to Sensor</v-btn>
            </v-expansion-panel-content>
            </v-expansion-panel>
            <a href="#room">Rooms</a>
            <a href="#pipe">Buildings</a>
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
      if(action == "new")
        this.checkboxes[sensorId].checked;
      else if(action == "removed"){
        this.checkboxes[sensorId].unchecked;
      }
    })
  },
  methods: {
    onItemChecked(id, index) {
      if (this.checkboxes[index].checked == true) {
        this.STORE.selectSensor(id);
      }
      else if (this.checkboxes[index].checked == false) {
        this.STORE.unselectSensor(id);
      }
    },
    startCameraMove(id) {
      this.STORE.set(SKEYS.CAMERA_DRIVE_SENSOR, id);
      console.log("id:" + id);
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


<style scoped lang="scss">
/* information pane id is set from outsite */
#informationpane {
  width: 100%;
  height: 100%;

  background-color: lightgrey;
  overflow: scroll;

  a {
    display: block;
    color: black;
    padding: 16px;
    text-decoration: none;
  
    .active {
      background-color: #4caf50;
      color: white;
    }
  
    &:hover:not(.active) {
      background-color: #555;
      color: white;
    }
  }
}

.condensed {
  max-height: 15%;
}

.v-expansion-panels:not(.v-expansion-panels--accordion):not(.v-expansion-panels--tile)
  > .v-expansion-panel--active {
  height: auto;
}

.v-btn .v-btn--contained .v-btn--rounded .theme--light .v-size--default primary {

  color: black !important;

}
</style>