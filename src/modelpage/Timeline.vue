<template>
  <div>
    <div id="chartWrapper"></div>
    <div id="tools">
      <v-icon large id="btnPlay" alt="play/pause">mdi-play</v-icon>
<!--      <img class="iconBtn" id="btnPlay" alt="play/pause" src="src\assets\playIcon.png">-->
      <img class="iconBtn" id="btnMove" alt="move tool" src="src\assets\moveIcon.png">
      <img class="iconBtn" id="btnSelect" alt="selection tool" src="src\assets\selectionIcon.png">
<!--      <v-icon>fas-fa-list</v-icon>-->
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

    padding: 8px;
    padding-top: 12px;

    > * {
      width: 100%;
      cursor: pointer;
    }
    > i{
      height: 20px;
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
    return { }
  },
  mounted(){      
    let chartWrapper = document.querySelector("#chartWrapper")
    chartWrapper.innerHTML = "" // clear old svg (in dev)

    let timeline = new Timeline(chartWrapper)      
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

    document.querySelector("#btnPlay").onclick = e => { timeline.isPlaying() ? timeline.pause() : timeline.play() }
    document.querySelector("#btnMove").onclick = e => { timeline.setTool("pin") }
    document.querySelector("#btnSelect").onclick = e => { timeline.setTool("brush") }
  }
};
</script>
