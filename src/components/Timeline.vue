<template>
  <div>
    <apexchart id="chart" :options="options" :series="series"></apexchart>
  </div>
</template>


<style scoped>
div:first-of-type {
  background-color: lightgrey;
  height: 250px
}
#chart{
    width: 100%;
}
</style>


<script>
/**
 * TODO
 * - select time on click not on hover
 * - set time from outsite
 * 
 */
import VueApexCharts from 'vue-apexcharts'
import Storage from '../storage/Storage';
import SKEYS from '../storage/StorageKeys';

const API_URL = process.env.API_URL

export default {
  props: ["id"],
  components: {
      "apexchart": VueApexCharts
  },
  data() {
    return {
      series: [{
        name: "STOCK ABC",
        data: [],
      }],
      options: {
        chart: {
          type: 'area',
          height: "250px",
          zoom: {
            enabled: false
          },
          toolbar: {
            show: true
          },
          selection: {
            enabled: true,
            type: 'x',
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'straight'
        },
        title: {
          text: 'Fundamental Analysis of Stocks',
          align: 'left'
        },
        subtitle: {
          text: 'Price Movements',
          align: 'left'
        },
        labels: [],
        xaxis: {
          type: 'datetime',
        },
        yaxis: {
          opposite: true
        },
        legend: {
          horizontalAlign: 'left'
        }
      },
    }
  },
  created(){
    //let c = document.querySelector("#chart")
    //c.height = c.parentElement.clientHeight

    var values = []
    var dates = []
    this.getSensorData(1).then(data => {
        for(var d of data){
          values.push(d.value)
          dates.push(d.date)
        }
        // update the whole options config and not just a single property to allow the Vue watch catch the change
        this.series = [{data: values}]
        this.options = {labels: dates}
    })
  },
  methods: {
    async getModelData(id) {
        let response = await fetch(API_URL + `/models/${id}`)
            .then(res => { return res.json() })
            .catch(err => { throw new Error("Can not load model data") });
        return response;
    },
    async getSensorData(id) {
        let response = await fetch(API_URL + `/sensors/${id}/data`)
            .then(res => { return res.json() })
            .catch(err => { throw new Error("Can not load sensor data") });
        return response;
    },
  }
};
</script>
