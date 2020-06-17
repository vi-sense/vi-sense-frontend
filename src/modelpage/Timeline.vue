<template>
  <div>
      <div id="chartWrapper"></div>
      <div id="tools">
        <input id="btnPlay" type="button" value="play">
        <input id="btnPin" type="button" value="pin">
        <input id="btnBrush" type="button" value="brush">
        <input id="nmbSpeed" type="number" value="1" min=1 max=20>
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
    padding: 2px;
    padding-left: 0;
    box-sizing: border-box;
  }

  input[type=button]{
    width: 100%;
    border: 1px solid grey;
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
    document.querySelector("#nmbSpeed").oninput = e => { timeline.setSpeed( e.target.value) }
    document.querySelector("#btnPin").onclick = e => { timeline.setTool("pin") }
    document.querySelector("#btnBrush").onclick = e => { timeline.setTool("brush") }
  }
};
</script>
