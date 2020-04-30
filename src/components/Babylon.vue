<template>
  <canvas id="canvas"></canvas>
</template>

<script>
import { MyScene } from '../assets/MyBabylonScene.js';
export default {
  data() {
    return {
      scene:null
    }
  },
  mounted() {
    var canvas = document.getElementById("canvas")
    this.scene = new MyScene(canvas);
  },
}
</script>