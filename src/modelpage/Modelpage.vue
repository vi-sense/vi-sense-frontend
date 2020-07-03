<template>
  <div>
    <v-app-bar>
      <a id="logo" href="/"><img src="../assets/logo.svg" alt="visense logo"></a>
      <h2>{{ title }}</h2>
      <v-spacer></v-spacer>
      <v-btn icon v-on:click="showOptionPane=!showOptionPane"><v-icon>mdi-cog</v-icon></v-btn>
    </v-app-bar>

    <main>
      <div id="sidepane">
        <h3 class="pb-1">Sensors</h3>
        <information-pane class="pa-1" id="informationpane" v-if="model" :model="model" :STORE="STORE" :sensor-colors="sensorColors" v-on:sensor-limits-changed="sensorLimitsChanged" v-on:sensor-selection-changed="propagateSensorSelection"/>
        
        <h3 class="pb-1">Anomalies</h3>
        <history class="pa-1" id="historypane" ref="historyRef" v-if="model" :model="model" :STORE="STORE" :sensor-colors="sensorColors" :selected-sensors="this.selectedSensors"/>
      </div>

      <div id="mainpane">
        <div id="babylonwrapper">
          <canvas id="babyloncanvas"></canvas>
        </div>
        <div id="timelinewrapper">
          <div id="BTdragger"></div>
          <timeline id="timeline" :STORE="STORE" />
        </div>
      </div>

      <option-pane id="optionpane" v-show="showOptionPane" :STORE="STORE"/>
    </main>

    <pop-up :STORE="STORE"/>
  </div>
</template>


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

    #babylonwrapper {
      width: 100%;
      height: 75%;
      canvas {
        width: 100%;
        height: 100%;
        outline: none;
      }
    }

    #timelinewrapper{
      width: 100%;
      height: 25%;
      position: relative;
      *{
        user-select: none; 
      }
      #timeline {
        width: 100%;
        height: 100%;
        background-color: white;
      }
      #BTdragger{
        width: 10px;
        height: 10px;
        background-color: grey;
        opacity: 0.1;
        position: absolute;
        left: 50%;
        top: -5px;
        cursor: ns-resize;
        &:hover{opacity: 1}
      }
    }
  }
    
  #sidepane {
    display: inline-block;
    min-width: 200px;
    max-width: 280px;
    width: 16%;
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

    &::-webkit-scrollbar {
      display: none;
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
    this.getModelData(this.id).then(res => {
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

    let bW = document.querySelector("#babylonwrapper")
    let tW = document.querySelector("#timelinewrapper")
    let dragger = document.querySelector("#BTdragger")
    let startY

    dragger.onmousedown = e => {     
      startY = e.pageY;
    }
    window.addEventListener("mouseup", e => {
      startY = null
    })
    window.addEventListener("mousemove", e => {      
      if(startY == null) return
      let o = startY-e.pageY;
      startY = e.pageY

      if(bW.clientHeight-o<150 || tW.clientHeight+o<150) return

      bW.style.height = bW.clientHeight-o + "px"
      tW.style.height = tW.clientHeight+o + "px"
      app.engine.resize();
      this.STORE._timelineInstance.resize() 
    })
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
    sensorLimitsChanged(){
      this.$refs.historyRef.getAnomalies();
    }
  }
};
</script>

