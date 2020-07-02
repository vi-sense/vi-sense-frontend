<template>
  <div>
    <div id="chartWrapper"></div>
    <div id="tools">

      <div id="toolsTop">
        <img v-if="!playing" alt="play" v-on:click="togglePlayPause" src="../assets/playIcon.png">
        <img v-else alt="pause" v-on:click="togglePlayPause" src="../assets/pauseIcon.png">

        <img alt="move tool" v-on:click="timeline.setTool('pin')" src="../assets/moveIcon.png">
        <img alt="selection tool" v-on:click="timeline.setTool('brush')" src="../assets/selectIcon.png">
      </div>

      <div id="toolsBottom">
        <img alt="center to timepin" v-on:click="timeline.centerToTimepin()" src="../assets/pinIcon.png">

        <div id="datePicker">
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
#timeline > #chartWrapper{
  display: inline-block;
  vertical-align:top;
  height: 100%;
  width: calc(100% - 45px);
}
#tools{
  display: inline-block;
  vertical-align: top;
  box-sizing: border-box;
  width: 20px;
  height: 100%;
  margin-left: 10px;
  position: relative;

  img {
    cursor: pointer;
    width: 100%;
    opacity: 0.55; // adapt/fake material design greyisch icon design
  }

  #toolsTop{
    margin-top: 12px;
  }

  #toolsBottom{
    position: absolute;
    bottom: 4px;
    width: 100%;
    vertical-align: bottom;

    #datePicker{
      #calendarWrapper{
        position: absolute;
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
      showDatePicker: false
    }
  },
  mounted(){      
    let chartWrapper = document.querySelector("#chartWrapper")
    chartWrapper.innerHTML = "" // clear old svg (in dev)

    let timeline = new Timeline(chartWrapper)    
    this.timeline = timeline  

    this.playing = timeline.isPlaying() 
    this.timeline.setPlayPauseCallback(() => this.playing = timeline.isPlaying())

    window.onresize = timeline.resize

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
    pickDate(date){
      this.timeline.centerToDate(new Date(date))
    }
  },
};
</script>
