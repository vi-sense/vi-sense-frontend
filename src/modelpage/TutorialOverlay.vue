<template>
  <div v-on:click="OnClick">
    <v-overlay :value="overlay" :opacity="0.3" :z-index="5" v-if="sceneLoadedAfter">
      <v-btn class="btn" icon @click="overlay = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <div class="threed_content">
        <h2>3D View</h2>displaying the Model with all registered Sensors inside
      </div>
      <div class="sensor_content">
        <h2>Sensors</h2>expandable List of all Sensors
      </div>
      <div class="anomalies_content">
        <h2>Anomalies</h2>List of all Anomalies – Press to jump to them directly
      </div>
      <div class="timeline_content">
        <h2>Timeline</h2>shows progression of the measured date – selected Sensors from timline
      </div>
      <div class="controls_content">
        <h2>Controls</h2>Free Movement Camera – WASD + Mouse
        <br />Rotation only Camera – Mouse (Press on Sensor to reposition)
      </div>
      <div id="parent" style="margin:0 auto; width:100%; height:100%; position:relative;">
        <div class="timelineControls_content">
          Play on the currently selected Timestamp →
          <br />Move in Timeline and place the Timepin →
          <br />Select area for playback →
          <br />Center to Timepin →
          <br />Calendar →
        </div>
      </div>
    </v-overlay>
  </div>
</template>

<script>
import { eventBus } from "../main";
export default {
  name: "TutorialOverlay",
  data() {
    return {
      sceneLoadedAfter: false,
      overlay: true
    };
  },
  watch: {
    overlay: {
      handler() {
        eventBus.$on("overlay-changed", activeOverlay => {
          this.overlay = activeOverlay;
        });
      }
    }
  },
  created() {
    eventBus.$on("loading-finished", () => (this.sceneLoadedAfter = true));
  },
  methods: {
    OnClick: function(event) {
      if (event) {
        this.overlay = false;
      }
    }
  }
};
</script>

<style scoped lang="scss">
.threed_content {
  position: fixed;
  left: 43%;
  top: 28%;
  background-color: #42b983bf;
  width: 30%;
  border: 3px solid silver;
  box-shadow: -10px 10px 15px #7d7c7c;
  padding: 0% 0.5%;
  border-radius: 5px;
}
.sensor_content {
  position: fixed;
  right: 86%;
  top: 36%;
  width: 12%;
  background-color: #42b983db;
  border: 3px solid silver;
  box-shadow: -10px 10px 15px #7d7c7c;
  padding: 0% 0.5%;
  border-radius: 5px;
}
.anomalies_content {
  position: fixed;
  right: 86%;
  top: 80%;
  width: 12%;
  background-color: #42b983db;
  border: 3px solid silver;
  box-shadow: -10px 10px 15px #7d7c7c;
  padding: 0% 0.5%;
  border-radius: 5px;
}
.timeline_content {
  position: fixed;
  left: 30%;
  top: 79%;
  background-color: #42b983bf;
  width: 30%;
  border: 3px solid silver;
  box-shadow: -10px 10px 15px #7d7c7c;
  padding: 0% 0.5%;
  border-radius: 5px;
}
.controls_content {
  position: fixed;
  left: 43%;
  background-color: #42b983bf;
  border: 3px solid silver;
  box-shadow: -10px 10px 15px #7d7c7c;
  top: 43%;
  padding: 0% 0.5%;
  border-radius: 5px;
  width: 30%;
}
.timelineControls_content {
  position: fixed;
  left: 75%;
  top: 78.5%;
  width: auto;
  text-align: end;
  line-height: 2;
  padding: 0% 0.2%;
  border-radius: 5px;
  background-color: #42b983bf;
  border: 3px solid silver;
  box-shadow: -10px 10px 15px #7d7c7c;
}
.btn {
  position: fixed;
  top: 10%;
  left: 96%;
}
</style>
