<template>
    <div id="chartWrapper"></div>
</template>


<style scoped>
div:first-of-type {
  background-color: lightgrey;
}
#chartWrapper{
  width: 100%;
  height: 100%;
}
</style>


<script>
import Storage from '../storage/Storage';
import SKEYS from '../storage/StorageKeys';
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

      //setTimeout(() => this.STORE.selectSensor(1), 1000)
      //setTimeout(() => this.STORE.selectSensor(4), 2000)
      //setTimeout(() => this.STORE.unselectSensor(4), 8000)
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
