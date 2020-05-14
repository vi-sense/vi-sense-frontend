<template>
  <div>
    <canvas id="canvas"></canvas>
  </div>
</template>


<style scoped>
div:first-of-type, canvas {
  width: 100%;
  height: 100%;
}
</style>


<script>
import BabylonApp from "../babylon/BabylonApp";
import Storage from '../storage/Storage';
import SKEYS from '../storage/StorageKeys';
import { updateSelectedSensor } from '../babylon/scripts/sensorSelection';

export default {
  props: ["id", "name"],
  data() {
    return { };
  },
  mounted() {
    this.$route.meta.title = this.name;
    // add a temporary variable
    this.$router.replace({ query: { temp: Date.now() } });
    // remove the temporary variable query
    this.$router.replace({ query: { temp: undefined } });


    var canvas = document.getElementById("canvas");
    var STORE = new Storage()
    var app = new BabylonApp(canvas, this.id, STORE);

    STORE.registerOnUpdateCallback(SKEYS.SELECTED_SENSOR, (value) => {
      console.log("new sensor selected: ", value);
      updateSelectedSensor(value);
    })
    //SM.set(SKEYS.SELECTED_SENSOR, 60)
  },
};
</script>
