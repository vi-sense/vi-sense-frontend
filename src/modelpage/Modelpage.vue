<template>
  <div>
    <header>
      <h1>Vi-Sense Modelpage</h1>
      <h2>{{ $route.meta.title }}</h2>
    </header>

    <main>
      <div id="informationpane">
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

      <div id="mainpane">
        <div id="canvaswrapper">
          <canvas id="babyloncanvas"></canvas>
        </div>
        <div id="timeline">
          <Timeline :STORE="STORE" />
        </div>
      </div>

    </main>
  </div>
</template>


<script>
import BabylonApp from "./BabylonApp";
import Timeline from "./Timeline";
import Storage from "../storage/Storage";
import axios from "axios";

export default {
  props: ["id", "name"],
  components: {
    Timeline
  },
  data() {
    return {
      STORE: new Storage(),
      model: [],
      checkboxes: [],
      sensorData: [],
      endpoint: process.env.API_URL + "/"
    };
  },
  created() {
    this.getSensor(this.id);
    // TODO implement Store onSensorSelection
  },
  mounted() {
    var canvas = document.getElementById("babyloncanvas");
    var app = new BabylonApp(canvas, this.id, this.STORE);
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
    getSensor(id) {
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

header{
  height: 15%;
  width: 100%;
}

main{
  height: 85%;
  width: 100%;
  display: flex; // idk why but its not working with regular inline-block so i used flex as a quickfix..

  #mainpane{
    height: 100%;
    width: 80%;

    #canvaswrapper{
      width: 100%;
      height: 70%;
      canvas{
        width: 100%;
        height: 100%;
      }
    }
    #timeline{
      width: 100%;
      height: 30%;
    }
  }

  #informationpane {
    display: inline-block;
    height: 100%;
    width: 20%;
  }
}


#informationpane {
  background-color: #969494;
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