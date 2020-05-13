<template>
  <div id="model">
    <header>
      <h1>Vi-Sense Modelpage</h1>
      <h2 class="header__title title-header">{{ $route.meta.title }}</h2>
    </header>
    <main>
      <aside class="sidebar">
        <a class="active" href="#home">Information Pane Dummy</a>
        <router-link
            v-for="sensor in model.Sensors"
            active-class="is-active"
            class="link"
            :key="sensor.ID"
            :to="{ name: 'sensor', params: { id: sensor.ID } }">
          {{sensor.ID}}. {{sensor.Name}}
        </router-link>
        <a href="#room">Room</a>
        <a href="#sensor">Sensor</a>
        <a href="#pipe">Pipe</a>
        <a href="#temperature">Temperature</a>
        <a href="#pressure">Pressure</a>
      </aside>

      <canvas id="canvas"></canvas>
      <div id="toggleCameraButton"></div>
    </main>
  </div>
</template>



<style scoped>
div,
canvas {
  width: 100%;
  height: 100%;
}

.sidebar {
  margin: 0;
  padding: 0;
  width: 200px;
  background-color: #f1f1f1;
  position: fixed;
  height: 100%;
  overflow: auto;
}

.sidebar a {
  display: block;
  color: black;
  padding: 16px;
  text-decoration: none;
}
 
.sidebar a.active {
  background-color: #4CAF50;
  color: white;
}

.sidebar a:hover:not(.active) {
  background-color: #555;
  color: white;
}
</style>


<script>
import BabylonApp from "../../babylon/BabylonApp";
export default {
  props: ["id", "name", "model"],
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
    var app = new BabylonApp(canvas, this.id, false);
  }
};
</script>