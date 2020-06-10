<template>
  <div>
      <div id="chartWrapper"></div>
      <div id="tools">
        <input id="btnPlay" type="button" value="play">

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
          this.getSensorData(id).then(json => { timeline.plotGraph(this.transformData(json), id) })
        }
    })
      
    this.STORE.onSensorSelectionChanged((sensorId, action) => {
      if(action == "new")
          this.getSensorData(sensorId).then(json => { timeline.plotGraph(this.transformData(json), sensorId) })
      else if(action == "removed"){
          timeline.removeGraph(sensorId)
      }
    })

    document.querySelector("#btnPlay").onclick = e => {
      timeline.isPlaying() ? timeline.pause() : timeline.play()
    }
  },
  methods: {
    transformData(api_json_data){
        let data = []
        for(var d of api_json_data){
            data.push({date: new Date(d.date), value: d.value})        
        }  
        return data
    },
    async getModelData(id) {
        let response = await fetch(process.env.API_URL + `/models/${id}`)
            .then(res => { return res.json() })
            .catch(err => { throw err });
        return response;
    },
    async getSensorData(id) {
        let response = await fetch(process.env.API_URL + `/sensors/${id}/data`)
            .then(res => { return res.json() })
            .catch(err => { throw err });
        return response;
    },
  }
};
</script>
