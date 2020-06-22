<template>
  <div>
    <div id="chartWrapper"></div>
    <div id="tools">
      <img class="iconBtn" id="btnPlay" src="src\assets\playIcon.png">
      <img class="iconBtn" id="btnMove" src="src\assets\moveIcon.png">
      <img class="iconBtn" id="btnSelect" src="src\assets\selectionIcon.png">
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

    .iconBtn {
      width: 100%;
      cursor: pointer;
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
