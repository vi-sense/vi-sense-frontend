<template>
  <div>
    <div id="chartWrapper"></div>
    <div id="tools">

      <img v-if="!playing" class="iconBtn" alt="play" v-on:click="togglePlayPause" src="../assets/playIcon.png">
      <img v-else class="iconBtn" alt="pause" v-on:click="togglePlayPause" src="../assets/pauseIcon.png">

      <img class="iconBtn" alt="move tool" v-on:click="setTool('pin')" src="../assets/moveIcon.png">
      <img class="iconBtn" alt="selection tool" v-on:click="setTool('brush')" src="../assets/selectionIcon.png">
    </div>
  </div>
</template>


<style scoped lang="scss">
#timeline{

  #chartWrapper{
    display: inline-block;
    height: 100%;
    width: calc(100% - 45px);
    vertical-align:top;
  }
  #tools{
    display: inline-block;
    width: 40px;
    vertical-align:top;
    box-sizing: border-box;

    padding: 12px 10px 0 9px;

    > * {
      width: 100%;
      cursor: pointer;
      opacity: 0.55; // adapt material design greyisch icon design
    }
  }
}
</style>


<script>
import Timeline from './timeline/Timeline.js';
import moment from 'moment';

export default {
  props: ["STORE"],
  data() {
    return { 
      playing: false
    }
  },
  mounted(){      
    let chartWrapper = document.querySelector("#chartWrapper")
    chartWrapper.innerHTML = "" // clear old svg (in dev)

    let timeline = new Timeline(chartWrapper)    
    this.timeline = timeline  

    this.playing = timeline.isPlaying() 
    this.timeline.setPlayPauseCallback(() => this.playing = timeline.isPlaying())

    this.STORE._timelineInstance = timeline // easiets and lasiest way to pass timeline to options pane

    this.STORE.getSelectedSensors((sensorIds)=>{
        for(let id of sensorIds){
          timeline.showGraph(id)
        }
    })
      
    this.STORE.onSensorSelectionChanged((sensorId, action) => {      
      if(action == "new")
          timeline.showGraph(sensorId)
      else if(action == "removed"){
          timeline.hideGraph(sensorId)
      }
    })
  },
  methods:{
    togglePlayPause(){
      this.timeline.isPlaying() ? this.timeline.pause() : this.timeline.play(); 
      this.playing = this.timeline.isPlaying() 
    },
    setTool(tool){
      this.timeline.setTool(tool) // pin or brush
    }
  },
};
</script>
