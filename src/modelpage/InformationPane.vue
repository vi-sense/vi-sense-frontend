<template>
    <div>
        <a class="active" href="#home">Information Pane</a>
        <a href="#sensor">Sensoren</a>
        <v-expansion-panels class="condensed" focusable>
            <v-expansion-panel v-for="(sensor, index) in sensorData" :key="sensor.id">
            <v-expansion-panel-header>
                <v-checkbox
                @change="onItemChecked(index)"
                :key="sensor.id"
                v-model="checkboxes[index].checked"
                ></v-checkbox>
                {{sensor.name}}
            </v-expansion-panel-header>
            <v-expansion-panel-content>
                Description: {{sensor.description}}
                <v-btn color="primary" rounded @click.prevent="startCameraMove(index)">Go to Sensor</v-btn>
            </v-expansion-panel-content>
            </v-expansion-panel>
            <a href="#room">Room</a>
            <a href="#pipe">Pipe</a>
            <a href="#temperature">Temperature</a>
            <a href="#pressure">Pressure</a>
        </v-expansion-panels>
    </div>
</template>


<script>
import axios from "axios";

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
        ; // TODO check sensor checkbox passiert im normalfall nicht aber der vollständigkeit halber
      }   
    })
    
    this.STORE.onSensorSelectionChanged((sensorId, action) => {
      if(action == "new")
        ; // TODO check sensor checkbox
      else if(action == "removed"){
        ; // TODO uncheck sensor sensor
      }
    })
  },
  methods: {
    onItemChecked(id) {
      if (this.checkboxes[id].checked == true) {
        this.STORE.selectSensor(id);
      }
      else if (this.checkboxes[id].checked == false) {
        this.STORE.unselectSensor(id);
      }
    },
    startCameraMove(id) {
      // TODO connect with lennarts stuff properly
      console.log("startID:" + id);
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
</style>