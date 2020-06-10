/**
 * @author Tom Wendland
 */
import * as d3 from 'd3'
import Graph from "./Graph.js";
import {turnArrow, getSensorColor} from "../scripts/sensorSelection"

const Timeline = (function(parentElement){

    const width = parentElement.clientWidth // is on 100% width per default
    const height = parentElement.clientHeight
    const margin = ({top: 20, right: 20, bottom: 20, left: 30}) // used for labels, axis etc

    const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);
    parentElement.appendChild(svg.node())

    const graphs = new Map()
    
    // scaling reference https://stackoverflow.com/questions/56553384/d3-v5-axis-scale-change-panning-way-too-much
    const xScaleRef = d3.scaleUtc()
        .range([margin.left, width - margin.right])
        .domain([new Date("2020-05-22T00:00:00Z"), new Date("2020-05-29T12:00:00Z")]) // TODO scaleTick 24 h

    const xScale = xScaleRef.copy()

    const yScale = d3.scaleLinear()
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
            .attr("y", -10)
            .attr("x", -10)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text("unit"))

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
    var timepinDate = xScale.domain()[1] // upper domain value

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
        timepinDate = xScale.invert(mouse_x)        
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
        if (el) el.innerHTML = formatDate(timepinDate)
        timepin.attr("transform", `translate(${xScale(timepinDate)}, 0)`)
        Array.from(graphs.keys()).forEach(key => {turnArrow(parseInt(key.slice(9)), graphs.get(key).gradient(xScale, yScale, timepinDate))})
    }

    replaceTimepin() 

    


    /**                 
     _____             _   
    | __  |___ _ _ ___| |_ 
    | __ -|  _| | |_ -|   |
    |_____|_| |___|___|_|_|                   
     */
 
    var selection

    const brush = d3.brushX()
        .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
        .on("end", () => {
            if(d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return // ignore brush-by-zoom
            if(d3.event.selection == null){
                selection = null
            } else{
                if(!selection) selection = []
                selection[0] = xScale.invert(d3.event.selection[0]) 
                selection[1] = xScale.invert(d3.event.selection[1]) 
            }
        })

    const brushGroup = svg.append("g")
        .call(brush)
        .on("dblclick", () => {
            brushGroup.call(brush.move, null); 
            // brush.end event is called afterwards which removes the selection      
        });
        
    brushGroup.select(".selection")
        .attr("fill", "lightgrey")     
        .attr("stroke", "grey")     
        .attr("stroke-dasharray", 4)




    /**
     _____               
    |__   |___ ___ _____ 
    |   __| . | . |     |
    |_____|___|___|_|_|_|
    */

    // rechts un links icon zum ziehen
    // oben mitte ein zum draggen
    // erstellen/entfernen mit doppelklick und button
    // -> normale pan control ermöglichen

    svg.call(d3.zoom()
        .scaleExtent([1, 20]) // zoom factor range depending on preselected domain size
        .extent([[margin.left, 0], [width-margin.right, height]])
        //.translateExtent([[margin.left, -Infinity], [width - margin.right, Infinity]]) // pan range
        .on("zoom", zoomed))
        .on("dblclick.zoom", null)

    function zoomed() {
        let t = d3.event.transform
        xScale.domain(t.rescaleX(xScaleRef).domain()); // continous scale with transformed domain  

        replaceTimepin() 
        gx.call(xAxis); 
        graphs.forEach(g => g.area(xScale, yScale))        
        if(selection) brushGroup.call(brush.move, [xScale(selection[0]), xScale(selection[1])]);       
    }


    /**
     _____ _         
    |  _  | |___ _ _ 
    |   __| | .'| | |
    |__|  |_|__,|_  |
                |___|
    */

    var playing = false
    function animate(){
        requestAnimationFrame(animate)
        if(!playing) return

        let m = 1
        timepinDate.setTime(timepinDate.getTime() + (m*60*1000));

        if(selection){
            if(timepinDate < selection[0] || timepinDate > selection[1])
                timepinDate.setTime(selection[0].getTime())
        }
        replaceTimepin()
    }
    requestAnimationFrame(animate)


    
    
    /**
     _____       _     _ _          __                  _   _                 
    |  __ \     | |   | (_)        / _|                | | (_)                
    | |__) |   _| |__ | |_  ___   | |_ _   _ _ __   ___| |_ _  ___  _ __  ___ 
    |  ___/ | | |  _ \| | |/ __|  |  _| | | | '_ \ / __| __| |/ _ \| '_ \/ __|
    | |   | |_| | |_) | | | (__   | | | |_| | | | | (__| |_| | (_) | | | \__ \
    |_|    \ ___|_ __/|_|_|\___|  |_|  \__,_|_| |_|\___|\__|_|\___/|_| |_|___/      
    */

    /**
     * 
     * @param {Array} data in the form [{date: Date value: Number}, {...}, ...]
     * @param {Number} id a id which you want the graph to be identified with. Use the id for additional actions e.g. removing the graph
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

    /**
     * 
     * @param {Number} id 
     */
    function removeGraph(id){
        let idstr = "graphline"+id
        if(!graphs.has(idstr)) throw new Error(`There is no graph with id ${id}`)
        
        d3.select("#"+idstr).remove();
        graphs.delete(idstr)        
    }

    /**
     * 
     * @param {Date} date 
     */
    function setTimepinTime(date){
        timepinDate = date
        replaceTimepin()
     }

    return {
        plotGraph, 
        removeGraph,  
        setTimepinTime, 
  
        play(){ playing = true },
        pause(){ playing = false },
        isPlaying(){ return playing },
    }
})
export default Timeline



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