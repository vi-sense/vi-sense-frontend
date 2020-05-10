<template>
  <div>
    <canvas id="canvas"></canvas>
    <div id="toggleCameraButton"></div>
  </div>
</template>


<style scoped>
div, canvas {
  width: 100%;
  height: 100%;
}
</style>


<script>
import BabylonApp from "../babylon/BabylonApp";

export default {
  props: ["id", "name"],
  data() {
    return {
      scene: null
    };
  },
  mounted() {
    this.$route.meta.title = this.name;
    // add a temporary variable
    this.$router.replace({ query: { temp: Date.now() } });
    // remove the temporary variable query
    this.$router.replace({ query: { temp: undefined } });


    var canvas = document.getElementById("canvas");
    var app = new BabylonApp(canvas, this.id, true);
  },
};
</script>