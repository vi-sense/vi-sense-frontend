<template>
  <div>
    <header>
      <h1>Vi-Sense Modelpage</h1>
      <p>{{ title }}</p>
    </header>

    <main>
      <InformationPane id="informationpane" :modeID="id" :STORE="STORE"/>

      <div id="mainpane">
        <div id="canvaswrapper">
          <canvas id="babyloncanvas"></canvas>
        </div>
        <div id="timeline">
          <Timeline :STORE="STORE" />
        </div>
      </div>
    </main>
  </div>
</template>


<script>
import BabylonApp from "./BabylonApp";
import Timeline from "./Timeline";
import InformationPane from "./InformationPane";
import Storage from "../storage/Storage";
import axios from "axios";

export default {
  props: ["id"],
  components: {
    Timeline, InformationPane
  },
  data() {
    return {
      STORE: new Storage(),
      title: ""
    };
  },
  created(){
    window.onbeforeunload = function () {
      return "Do you really want to close?";
    };
    this.getModelData(this.id).then(res=>{
      this.title = res.name
    })     
  },
  mounted() {
    var canvas = document.getElementById("babyloncanvas");
    var app = new BabylonApp(canvas, this.id, this.STORE);
  },
  methods: {
    async getModelData(id) {
        let response = await fetch(process.env.API_URL + `/models/${id}`)
            .then(res => { return res.json() })
            .catch(err => { throw err });
        return response;
    },
  }
};
</script>


<style scoped lang="scss">

header{
  height: 10%;
  width: 100%;
}

main{
  height: 90%;
  width: 100%;
  display: flex; // idk why but its not working with regular inline-block so i used flex as a quickfix..

  #mainpane{
    height: 100%;
    width: 80%;
    border: 1px solid grey;
    box-sizing: border-box;
    
    #canvaswrapper{
      width: 100%;
      height: 70%;
      canvas{
        width: 100%;
        height: 100%;
      }
    }
    #timeline{
      width: 100%;
      height: 30%;
    }
  }

  #informationpane {
    display: inline-block;
    height: 100%;
    width: 20%;
    border: 1px solid grey;
    box-sizing: border-box;
  }
}
</style>