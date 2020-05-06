<template>
  <div>
    <canvas id="canvas"></canvas>
    <div id="toggleCameraButton"></div>
  </div>
</template>
<style scoped>
div,
canvas {
  width: 100%;
  height: 100%;
}
</style>
<script>
import App from "../assets/App";
import JSZip from "jszip";
export default {
  props: ["id", "name"],
  data() {
    return {
      scene: null
    };
  },
  mounted() {
    var canvas = document.getElementById("canvas");
    var fromServer = false;
    var app = new App(canvas, this.id, fromServer);
    console.log(this.id);
  },
  created() {
    // Creation cycle
    //this.getBaseData() // Execute during the creation cycle
  },
  methods: {
    getBaseData() {
      var Zip = new JSZip();
      console.log(Zip);
      var url = "http://visense.f4.htw-berlin.de:8080/files/mep-building-model/model.zip/"; // Introducing static files
      console.log("WTF!!!!" + this.id);
      console.log("WTF!!!!2 " + this.name);

      var xmlhttp = null;
      if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        /* eslint-disable no-new */
        xmlhttp = new window.XMLHttpRequest();
      } else {
        // code for IE6, IE5
        /* eslint-disable no-new */
        xmlhttp = new window.ActiveXObject("Microsoft.XMLHTTP");
      }
      xmlhttp.open("GET", url, true);
      //xmlhttp.withCredentials = true // TO-DO: Should be working

      // recent browsers
      if ("responseType" in xmlhttp) {
        xmlhttp.responseType = "arraybuffer";
      }

      // older browser
      if (xmlhttp.overrideMimeType) {
        xmlhttp.overrideMimeType("text/plain; charset=x-user-defined");
      }
      xmlhttp.send();
      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
          var file = xmlhttp.response || xmlhttp.responseText;

          JSZip.loadAsync(file).then(function(zip) {
            console.log(zip);
          });
        }
      };
    },
  }
};
</script>