/**
 * @author Tom Wendland
 * 
 * TODO
 * - y achse skalierung anhand der werte (dynamisch nach zoom find ich nicht so gut, evtl in option pane?)
 * - domain von jetzigem zeitpunkt bis -1 tag oder so (muss mit datan aufm server abgesprochen werden)
 * - legende + färbung der graphen
 */
import * as d3 from 'd3'
import Graph from "./Graph.js";
import {turnArrow, getSensorColor} from "../scripts/sensorSelection"

const Timeline = (function(parentElement){

    const width = parentElement.clientWidth // is set on 100% width
    const height = parentElement.clientHeight
    const margin = ({top: 20, right: 30, bottom: 30, left: 40}) // margin used for labels

    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height]);
    parentElement.appendChild(svg.node())

    const graphs = new Map()
    
    // scaling reference https://stackoverflow.com/questions/56553384/d3-v5-axis-scale-change-panning-way-too-much
    let xScaleRef = d3.scaleUtc()
        .range([margin.left, width - margin.right])
        //.domain(d3.extent(data, d => d.date))
        //.domain([new Date("2020-01-01T00:00:00Z"), new Date("2020-01-01T16:45:00Z")])
        .domain([new Date("2020-05-22T00:00:00Z"), new Date("2020-05-29T12:00:00Z")]) // TODO scaleTick auf 24 h

    let xScale = xScaleRef.copy()

    let yScale = d3.scaleLinear()
        .range([height - margin.bottom, margin.top])
        //.domain([0, d3.max(data, d => d.value)]).nice()
        .domain([0, 50]).nice()

    const xAxis = g => g
        .attr("transform", `translate(0,${height-margin.bottom})`)
        .call(d3
            .axisBottom(xScale)
            .ticks(width/80)
            .tickSizeOuter(0))

    const yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 3)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text("unit")

        )

    const gx = svg.append("g").call(xAxis);
    const gy = svg.append("g").call(yAxis);





    /**                    
     _____ _               _     
    |_   _|_|_____ ___ ___|_|___ 
      | | | |     | -_| . | |   |
      |_| |_|_|_|_|___|  _|_|_|_|
                      |_|        
    */
    const timepin = svg.append("g")
    var date = xScale.domain()[1] // upper domain value

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

    timepin.call(d3.drag().on('drag', () => {
        let mouse_x = d3.mouse(svg.node())[0]
        let max_x = width-margin.right
        let min_x = margin.left
        if(mouse_x > max_x) mouse_x = max_x
        if(mouse_x < min_x) mouse_x = min_x
        date = xScale.invert(mouse_x)        
        replaceTimepin()
    }));

    /*svg.on("mouseup", function() { 
        let mouse_x = d3.mouse(this)[0]
        let max_x = width-margin.right
        if(mouse_x > max_x) mouse_x = max_x
        date = x.invert(mouse_x)
        replaceTimepin(date)
    });*/
    
    function replaceTimepin(){   
        let el = document.querySelector("#testTimeOutput")
        if (el) el.innerHTML = formatDate(date)
        timepin.attr("transform", `translate(${xScale(date)}, 0)`)
        Array.from(graphs.keys()).forEach(key => {turnArrow(parseInt(key.slice(9)), graphs.get(key).gradient(xScale, yScale, date))})
    }

    replaceTimepin() 

    


    /**                 
     _____             _   
    | __  |___ _ _ ___| |_ 
    | __ -|  _| | |_ -|   |
    |_____|_| |___|___|_|_|                   
     */
 
     /*
    const brush = d3.brushX()
    .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
    .on("end", brushed);

    function brushed() {
        var e = brush.extent().call();
        let selection = d3.event.selection;
        let date = x.invert(selection[0]) 
        console.log("brush: "+ date)
    }

    svg.append("g")
    .call(brush)
    .attr("class", "brush")
    .select(".selection")
        .attr("fill", "lightgrey")     
        .attr("stroke", "grey")     
        .attr("stroke-dasharray", 4)

*/



    /**
     _____               
    |__   |___ ___ _____ 
    |   __| . | . |     |
    |_____|___|___|_|_|_|
    */

    svg.call(d3.zoom()
        .scaleExtent([1, 20]) // zoom factor range depending on preselected domain size
        .extent([[margin.left, 0], [width-margin.right, height]])
        //.translateExtent([[margin.left, -Infinity], [width - margin.right, Infinity]]) // pan range
        .on("zoom", zoomed))
        .on("dblclick.zoom", null)

    function zoomed() {
        var t = d3.event.transform;   

        xScale = t.rescaleX(xScaleRef); // continous scale with transformed domain  

        gx.call(xAxis); 
        graphs.forEach(g => g.area(xScale, yScale))
        replaceTimepin() 
        //svg.select(".brush").call(brush.move, xz);
    }



    
    /**
     _____       _     _ _          __                  _   _                 
    |  __ \     | |   | (_)        / _|                | | (_)                
    | |__) |   _| |__ | |_  ___   | |_ _   _ _ __   ___| |_ _  ___  _ __  ___ 
    |  ___/ | | |  _ \| | |/ __|  |  _| | | | '_ \ / __| __| |/ _ \| '_ \/ __|
    | |   | |_| | |_) | | | (__   | | | |_| | | | | (__| |_| | (_) | | | \__ \
    |_|    \ ___|_ __/|_|_|\___|  |_|  \__,_|_| |_|\___|\__|_|\___/|_| |_|___/      
    */

    function plotGraph(data, id){
        //console.log(data[0], data[data.length-1]);
        let color = getSensorColor(id)
        let graph = new Graph(svg, data, color)
        graph.area(xScale, yScale)
        
        let graphNode = graph.node()
        let idstr = "graphline"+id
        graphNode.attr("id", idstr);

        if(graphs.has(idstr)) throw new Error(`Graph with id ${id} already exists`)
        graphs.set(idstr, graph)

        replaceTimepin()
    }

    function removeGraph(id){
        let idstr = "graphline"+id
        if(!graphs.has(idstr)) throw new Error(`There is no graph with id ${id}`)
        
        d3.select("#"+idstr).remove();
        graphs.delete(idstr)        
    }

    function play(){ 
        // TODO
    }

    function setTimepinTime(){
        // TODO
     }

    return {
        setTimepinTime, 
        play, 
        plotGraph, 
        removeGraph
    }
})

    
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
        second: "numeric",
        timeZone: 'UTC'
    });
}

export default Timeline