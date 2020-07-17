<template>
  <div v-on:click="OnClick">
    <v-overlay :value="overlay" :opacity="0.3" :z-index="5" v-if="sceneLoadedAfter">
      <div class="threed_content">
        <v-btn class="btn" icon @click="overlay = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <h3>Introduction</h3>
        1. Navigate the 3D view using your mouse.
        <br />2. Select a sensor either in the 3D view or in the sensors list on the left hand side.
        <br />3. Click on a anomaly to jump to its date of occurrence.
        <br />4. Hit play to animate the change of the sensor value(s) over time in timeline and 3D view.
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
        localStorage.setItem('overlay', JSON.stringify(this.overlay));
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
  },
  mounted() {
  console.log('App mounted!');
  if (localStorage.getItem('overlay')) this.overlay = false;
},
};
</script>

<style scoped lang="scss">
.threed_content {
  position: fixed;
  left: 33%;
  top: 17%;
  background-color: #52baa2ed;
  width: 37%;
  border: 3px solid silver;
  //box-shadow: -10px 10px 15px #7d7c7c;
  padding: 0.2% 0.5%;
  border-radius: 5px;
}
.btn {
  position: sticky;
  float: right;
}
</style>
