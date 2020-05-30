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
import * as d3 from 'd3'
import Storage from '../storage/Storage';
import SKEYS from '../storage/StorageKeys';


export default {
  data() {
    return { }
  },
  mounted(){
      let chartWrapper = document.querySelector("#chartWrapper")
      this.getSensorData(1).then(data => {
        let tdata = []
        for(var d of data){
            tdata.push({date: new Date(d.date), value: d.value})        
        }  
        plot(chartWrapper, tdata)
      })
  },
  methods: {
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





function plot(parent, data){

    let width = parent.clientWidth // is set on on 100% width
    let height = parent.clientHeight
    let margin = ({top: 20, right: 30, bottom: 30, left: 40}) // margin used for labels

    const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height]);
    parent.appendChild(svg.node())

    let x = d3.scaleUtc()
    .domain(d3.extent(data, d => d.date))
    .range([margin.left, width - margin.right])

    let y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)]).nice()
    .range([height - margin.bottom, margin.top])

    let xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))

    let yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove())
    .call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", 3)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text(data.y))

    svg.append("g").call(xAxis);
    svg.append("g").call(yAxis);


    let line = d3.line()
        .defined(d => !isNaN(d.value) && !isNaN(d.date))
        .x(d => x(d.date))
        .y(d => y(d.value))

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line);



    /**                    
     _____ _               _     
    |_   _|_|_____ ___ ___|_|___ 
      | | | |     | -_| . | |   |
      |_| |_|_|_|_|___|  _|_|_|_|
                      |_|        
     */

    const timepin = svg.append("g")

    const ruler = timepin.append("line")
        .attr("stroke", "grey")
        .attr("stroke-dasharray", 4)
        .attr("y1", margin.top)
        .attr("y2", height-margin.bottom)

    const topmarker = timepin.append("circle")
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("cx", 0)
        .attr("cy", margin.top-5)
        .attr("r", 4)

    const marker = timepin.append("circle")
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 2)
    
    placeTimepin(data[data.length-1].date, data[data.length-1].value)
    
    timepin.call(d3.drag().on('drag', () => {
        let mouse_x = d3.mouse(svg.node())[0]
        let {date, value} = bisect(mouse_x);
        placeTimepin(date, value)
    }));

    svg.on("mouseup", function() { 
        let mouse_x = d3.mouse(this)[0]
        let {date, value} = bisect(mouse_x);
        placeTimepin(date, value)
    });
    

    function placeTimepin(date, value){
        timepin.attr("transform", `translate(${x(date)},0)`)
        marker.attr("transform", `translate(0,${y(value)})`)
    }

    var bisect = function() {
        const bisect = d3.bisector(d => d.date).left;
        return mx => {
            const date = x.invert(mx);
            const index = bisect(data, date, 1);
            const a = data[index-1];
            const b = data[index];
            return b != undefined && date-a.date > b.date-date ? b : a;
            };
    }()
}

function formatValue(value) {    
    return value.toFixed(2)
}

function formatDate(date) {
    return date.toLocaleString("de", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
    });
}
</script>
