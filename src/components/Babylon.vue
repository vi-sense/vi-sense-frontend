<template>
  <div>
    <canvas id="babyloncanvas"></canvas>
    <div id="timeline">
      <Timeline/>
    </div>
  </div>
</template>


<style scoped>
div:first-of-type {
  width: 100%;
  height: 100%;
}

#babyloncanvas{
  width: 100%;
  height: 50%;
}

#timeline{
  width: 100%;
  height: 50%;
}
</style>


<script>
import Timeline from "./Timeline.vue"
import BabylonApp from "../babylon/BabylonApp";
import Storage from '../storage/Storage';
import SKEYS from '../storage/StorageKeys';

export default {
  props: ["id", "name"],
  components: {
    Timeline
  },
  data() {
    return { };
  },
  mounted() {
    this.$route.meta.title = this.name;
    // add a temporary variable
    this.$router.replace({ query: { temp: Date.now() } });
    // remove the temporary variable query
    this.$router.replace({ query: { temp: undefined } });


    var canvas = document.getElementById("babyloncanvas");
    var STORE = new Storage()
    var app = new BabylonApp(canvas, this.id, STORE);
  },
};
</script>
