<template>
  <div>
    <v-app-bar>
      <a id="logo" href="/"><img src="../assets/logo.svg" alt="visense logo"></a>
      <h2>{{ title }}</h2>
      <v-spacer></v-spacer>
      <v-app-bar-nav-icon v-on:click="showOptionPane=!showOptionPane"></v-app-bar-nav-icon>
    </v-app-bar>

    <main>
      <div id="sidepane">
        <h3 class="pb-1">Sensors</h3>
        <information-pane  class="pa-1" id="informationpane" v-if="model" :model="model" :STORE="STORE" :sensor-colors="sensorColors" v-on:sensor-limits-changed="sensorLimitsChanged" v-on:sensor-selection-changed="propagateSensorSelection"/>
        <h3 class="pb-1">Anomalies</h3>
        <history class="pa-1" id="historypane" ref="historyRef" v-if="model" :model="model" :s-t-o-r-e="STORE" :sensor-colors="sensorColors" :selected-sensors="this.selectedSensors"/>
      </div>

      <div id="mainpane">
        <div id="canvaswrapper">
          <canvas id="babyloncanvas"></canvas>
        </div>
        <timeline id="timeline" :STORE="STORE" />
      </div>

      <option-pane id="optionpane" v-show="showOptionPane" :STORE="STORE"/>
    </main>

    <pop-up :STORE="STORE"/>
  </div>
</template>


<script>
import BabylonApp from "./babylon/BabylonApp";
import Timeline from "./Timeline";
import InformationPane from "./InformationPane";
import OptionPane from "./OptionPane";
import Storage from "../storage/Storage";
import History from "./History";
import PopUp from "./PopUp";
import {registerSensorColors} from "../storage/SensorColors";

export default {
  props: ["id"],
  components: {
    History, Timeline, InformationPane, OptionPane, PopUp
  },
  data() {
    return {
      STORE: new Storage(),
      title: "",
      model: undefined,
      sensorColors: Map,
      selectedSensors:[],
      showOptionPane: false
    };
  },
  created(){
    if(process.env.PRODUCTION && !process.env.API_URL.includes("localhost")) window.onbeforeunload = function () {
      return "Do you really want to close?";
    };
    this.getModelData(this.id).then(res=>{
      this.model = res
      this.title = res.name
      const ordinalScale = registerSensorColors(res.sensors.map(sensor => sensor.id))
      this.sensorColors = new Map()
      res.sensors.map(sensor => sensor.id).sort().forEach(sensorID => this.sensorColors.set(sensorID, ordinalScale(sensorID)))
    })
  },
  mounted() {
    var canvas = document.getElementById("babyloncanvas");
    var app = new BabylonApp(canvas, this.id, this.STORE);
  },
  methods: {
    async getModelData(id) {
        let response = await fetch(process.env.API_URL + `/models/${id}`)
            .then(res => { return res.json() })
            .catch(err => { throw err });
        return response;
    },
    propagateSensorSelection(selectedSensors){
      this.selectedSensors=selectedSensors
    },
  }
};
</script>


<style lang="scss">
header {
  min-height: 7%;
  height: 7% !important;
  z-index: 3;

  #logo {
    display: contents;
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

main {
  height: 93%;
  width: 100%;
  display: flex;

  #mainpane {
    height: 100%;
    width: 85%;

    #canvaswrapper {
      width: 100%;
      height: 75%;

      canvas {
        width: 100%;
        height: 100%;
        outline: none;
      }
    }

    #timeline {
      width: 100%;
      height: 25%;
      background-color: white;
    }
  }
  div::-webkit-scrollbar {
    display: none;
  }

  #sidepane {
    display: inline-block;
    min-width: 200px;
    width: 15%;
    height: 100%;
    background-color: white;
    overflow-y: scroll;
    h3 {
        display: block;
        color: black;
        padding: 16px;
        margin: 0;
        text-decoration: none;
      }
    }


  #optionpane{
    min-width: 200px;
    width: 15%;
    max-height: 65%;
    overflow-y: auto;
    position: absolute;
    right: 1%;
    margin-top: 1%;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 5px;
  }
}
</style>
