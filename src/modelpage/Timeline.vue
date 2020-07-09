<template>
  <div>
    <div id="chartWrapper"></div>
    
    <div id="toolBox">
      <div id="toolsTop">
        <div class="tool">
          <img v-if="!playing" alt="play" v-on:click="togglePlayPause" src="../assets/playIcon.png">
          <img v-else alt="pause" v-on:click="togglePlayPause" src="../assets/pauseIcon.png">
        </div>
        <hr>
        <div class="tool" :class="{'selected': tool == 'pin'}"><img alt="move tool" v-on:click="tool='pin'" src="../assets/moveIcon.png"></div>
        <div class="tool" :class="{'selected': tool == 'brush'}"><img alt="brush tool" v-on:click="tool='brush'" src="../assets/selectIcon.png"></div>
      </div>
      <hr>

      <div id="toolsBottom">
        <div class="tool"><img alt="center to timepin" v-on:click="timeline.centerToTimepin()" src="../assets/pinIcon.png"></div>

        <div class="tool" id="datePicker">
          <img v-on:click="showDatePicker=!showDatePicker" src="../assets/datepicker.png">
          <div id="calendarWrapper">
            <v-date-picker id="calendar" 
              v-show="showDatePicker"
              :no-title=true
              min="2019-10-01"
              :max=maxdate
              width="250px"
              @click:date="pickDate"
            ></v-date-picker>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>


<style scoped lang="scss">
*{
    line-height: initial;
}

#timeline > #chartWrapper{
  display: inline-block;
  vertical-align:top;
  height: 100%;
  width: calc(100% - 45px);
}

#timeline > #toolBox{
  display: inline-block;
  vertical-align: top;
  box-sizing: border-box;
  height: 100%;
  margin-left: 10px;
  position: relative;

  #toolsTop .tool:first-of-type{
      margin-bottom: 8px;;
  }

  .tool {
    cursor: pointer;
    width: 20px;
    height: 20px;
    margin: 4px 0;
    position: relative;

    &.selected:before{
      position: absolute;
      content: "";
      width: 120%;
      height: 120%;
      left: -10%;
      top: -10%;
      background-color: rgba(82, 186, 162, 0.2);
    }
    img{ 
      width: 100%;
      opacity: 0.52; // adapt/fake material design greyisch icon design 
    }
  }

  #toolsTop{
    margin-top: 12px;
  }

  hr{
    box-sizing: border-box;
    border: none;
    border-top: 1.5px solid lightgrey;
  }

  #toolsBottom{
    position: absolute;
    bottom: 4px;
    width: 100%;
    vertical-align: bottom;

    #datePicker{
      #calendarWrapper{
        position: absolute;
        z-index: 5;
        #calendar{
          position: relative;
          left: -260px; // datepicker-icon width
          top: -290px;
        }
      }
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
      playing: false,
      maxdate: moment(new Date()).format("YYYY-MM-DD"),
      showDatePicker: false,
      tool: ""
    }
  },
  mounted(){      
    let chartWrapper = document.querySelector("#chartWrapper")
    chartWrapper.innerHTML = "" // clear old svg (only necessary in dev)

    let timeline = new Timeline(chartWrapper)    
    this.timeline = timeline  

    this.playing = timeline.isPlaying() 
    this.tool = timeline.getTool()
    this.timeline.setPlayPauseCallback(() => this.playing = timeline.isPlaying())

    window.addEventListener("resize", timeline.resize)

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
  watch:{
    tool(){
      if(this.tool) this.timeline.setTool(this.tool)      
    }
  },
  methods:{
    togglePlayPause(){
      this.timeline.isPlaying() ? this.timeline.pause() : this.timeline.play(); 
      this.playing = this.timeline.isPlaying() 
    },
    pickDate(date){
      this.timeline.centerToDate(new Date(date))
    }
  },
};
</script>
