<template>
  <div id="model">
    <header>
      <h1>Vi-Sense Modelpage</h1>
      <h2 class="header__title title-header">{{ $route.meta.title }}</h2>
    </header>
    <main class="main">
      <aside class="sidebar">
        <a class="active" href="#home">Information Pane</a>
        <a href="#sensor">Sensors</a>
        <v-expansion-panels focusable>
          <v-expansion-panel class="expansion" v-for="sensor in model.sensors" :key="sensor.id">
            <v-expansion-panel-header>{{sensor.name}}</v-expansion-panel-header>
            <v-expansion-panel-content>Description: {{sensor.description}}
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        <a href="#room">Room</a>
        <a href="#pipe">Pipe</a>
        <a href="#temperature">Temperature</a>
        <a href="#pressure">Pressure</a>
      </aside>

      <canvas id="canvas"></canvas>
    </main>
  </div>
</template>



<style scoped>
div,
canvas {
  width: 100%;
  height: 100%;
}

.main{

  width:100%;
  height:100%;
}

.expansion {

  max-height:30%;
  max-width:100%;

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
  background-color: #4caf50;
  color: white;
}

.sidebar a:hover:not(.active) {
  background-color: #555;
  color: white;
}
</style>


<script>
import BabylonApp from "../../babylon/BabylonApp";
import StateMachine from "../../storage/Storage";
import STATES from "../../storage/StorageKeys";
import axios from "axios";

export default {
  props: ["id", "name", "model"],
  data() {
    return {
      sensorData: null,
      endpoint: "http://visense.f4.htw-berlin.de:8080/sensors/"

    };
  },
  mounted() {
    this.$route.meta.title = this.name;
    // add a temporary variable
    this.$router.replace({ query: { temp: Date.now() } });
    // remove the temporary variable query
    this.$router.replace({ query: { temp: undefined } });

    var canvas = document.getElementById("canvas");
    var SM = new StateMachine();
    var app = new BabylonApp(canvas, this.id, SM);

  },
  methods: {
    onItemClick(event, item) {
      console.log("WTF");
    },
    getSensor(id) {
      axios(this.endpoint + id)
        .then(response => {
          this.sensorData = response.data;
          console.log(this.sensorData);
        })
        .catch(error => {
          console.log("-----error-------");
          console.log(error);
        });
    },
  },
    created() {
    this.getSensor(this.id);
  },
  watch: {
    $route() {
      this.getSensor(this.id);
    }
  }
};
</script>
