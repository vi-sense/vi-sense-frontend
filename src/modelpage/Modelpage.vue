<template>
  <div>
    <v-app-bar>
      <a id="logo" href="/"><img src="../assets/logo.svg" alt="visense logo"></a>
      <h2>{{ title }}</h2>
      <v-spacer></v-spacer>
      <v-app-bar-nav-icon></v-app-bar-nav-icon>
    </v-app-bar>

    <main>
      <div id="sidepane">
        <InformationPane id="informationpane" :modeID="id" :STORE="STORE"/>
        <History id="historypane" :modelId="id"/>
      </div>

      <div id="mainpane">
        <div id="canvaswrapper">
          <canvas id="babyloncanvas"></canvas>
        </div>
        <Timeline id="timeline" :STORE="STORE" />
      </div>

      <OptionPane id="optionpane" :STORE="STORE"/>
    </main>
  </div>
</template>


<script>
import BabylonApp from "./babylon/BabylonApp";
import Timeline from "./Timeline";
import InformationPane from "./InformationPane";
import OptionPane from "./OptionPane";
import Storage from "../storage/Storage";
import axios from "axios";
import History from "./History";

export default {
  props: ["id"],
  components: {
    History,
    Timeline, InformationPane, OptionPane
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


<style lang="scss">
header {
  min-height: 7%;
  height: 7% !important;
  z-index: 3;
  
  #logo {
    display: contents;
    img {
      height: 100%;
    }
  }
  h2 {
    margin: 0;
    margin: auto 10px !important;
  }
  .v-toolbar__content {
    height: 100% !important;
  }
}

main {
  height: 93%;
  width: 100%;
  display: flex;

  #mainpane {
    height: 100%;
    width: 85%;

    #canvaswrapper {
      width: 100%;
      height: 75%;

      canvas {
        width: 100%;
        height: 100%;
        outline: none;
      }
    }

    #timeline {
      width: 100%;
      height: 25%;
      background-color: white;
    }
  }
  div::-webkit-scrollbar {
    display: none;
  }
  #informationpane{
    height:60%;
  }
  #historypane{
    height:40%;
    overflow-y: scroll;
  }
  #sidepane {
    display: inline-block;
    min-width: 200px;
    width: 15%;
    height: 100%;
    background-color: white;
  }

  #optionpane{
    min-width: 200px;
    width: 15%;
    position: absolute;
    right: 1%;
    margin-top: 1%;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 5px;
  }
}
</style>