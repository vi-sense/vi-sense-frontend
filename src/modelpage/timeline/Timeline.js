/**
 * @author Tom Wendland
 */

import Graph from "./Graph.js";

import * as d3 from 'd3'
import { turnArrow } from "../babylon/sensorSelection"
import { SENSOR_COLORS } from '../../storage/Settings';

//const SENSOR_COLORS = d3.schemeCategory10 // position mapped to sensorId



const Timeline = (function(parentElement){

    const graphs = new Map()

    const width = parentElement.clientWidth // is on 100% width per default
    const height = parentElement.clientHeight
    const margin = ({top: 20, right: 20, bottom: 22, left: 30}) // used for labels, axis etc

    const svg = d3.create("svg").attr("viewBox", [0, 0, width, height])
    .attr("user-select", "none")
    parentElement.appendChild(svg.node())
    



    /**
     _____     _     
    |  _  |_ _|_|___ 
    |     |_'_| |_ -|
    |__|__|_,_|_|___|
    */
    let _startdate = new Date()
    _startdate.setTime(_startdate.getTime() - 24*60*60*1000)

    const xScaleRef = d3.scaleUtc()
        .range([margin.left, width - margin.right])
        .domain([_startdate, new Date()]) // TODO scaleTick use 24 h

    const xScale = xScaleRef.copy() // scaling reference https://stackoverflow.com/questions/56553384/d3-v5-axis-scale-change-panning-way-too-much

    const yScale = d3.scaleLinear()
        .range([height - margin.bottom, margin.top])
        .domain([0, 50]).nice() //.domain([0, d3.max(data, d => d.value)]).nice()

    const xAxis = g => g
        .attr("transform", `translate(0,${height-margin.bottom})`)
        .call(d3
            .axisBottom(xScale)
            .ticks(width/80)
            .tickSizeOuter(0))
        .style('cursor', 'ew-resize')


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

    svg.selectAll("text")
    .attr("pointer-events", "none")



    /**
     _____               
    |__   |___ ___ _____ 
    |   __| . | . |     |
    |_____|___|___|_|_|_|
    */
    let _tExtendStartDate = new Date(2020, 1, 1)
    const zoom = d3.zoom()
        .extent([[margin.left, 0], [width-margin.right, height]])
        .scaleExtent([0.1, 5]) // zoom factor range, depends on preselected domain 
        .translateExtent([[xScale(_tExtendStartDate)], [xScale(new Date())]]) // pan range
        .on("zoom", zoomPan)

    svg.call(zoom)
    .on("dblclick.zoom", null)

    function zoomPan() {  
        let t = d3.event.transform
        xScale.domain(t.rescaleX(xScaleRef).domain()); // continous scale with transformed domain  

        replaceTimepin() 
        gx.call(xAxis); 
        graphs.forEach(g => g.area(xScale, yScale))        
        if(selection) brushGroup.call(brush.move, [xScale(selection[0]), xScale(selection[1])]);       
    }



    /**                    
     _____ _               _     
    |_   _|_|_____ ___ ___|_|___ 
      | | | |     | -_| . | |   |
      |_| |_|_|_|_|___|  _|_|_|_|
                      |_|        
    */
    const timepinDate = xScale.domain()[1] // upper domain value

    const timepin = svg.append("g")
    .style('cursor', 'ew-resize')

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
        clampTimelinePosAndSetDate(mouse_x)
        replaceTimepin()
    }));

    svg.on("click", function() {         
        let mouse_x = d3.mouse(this)[0]
        clampTimelinePosAndSetDate(mouse_x)
        replaceTimepin()
    }); 

    function clampTimelinePosAndSetDate(mouse_x){
        let max_x = width-margin.right
        let min_x = margin.left
        if(mouse_x > max_x) mouse_x = max_x
        if(mouse_x < min_x) mouse_x = min_x
        timepinDate.setTime(xScale.invert(mouse_x))        
    }

    function replaceTimepin(){   
        //console.log(timepinDate);   
        //let stringdate = formatDate(timepinDate)
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
        })

    brushGroup.select(".selection")
        .attr("fill", "lightgrey")     
        .attr("stroke", "grey")     
        .attr("stroke-dasharray", 4)




    /**
     _____ _         
    |  _  | |___ _ _ 
    |   __| | .'| | |
    |__|  |_|__,|_  |
                |___|
    */
    var speed = 1
    var playing = false



    /**                    
     __ __       _     _       
    |  |  |___ _| |___| |_ ___ 
    |  |  | . | . | .'|  _| -_|
    |_____|  _|___|__,|_| |___|
          |_|                  
     */
    function update() {
        requestAnimationFrame(update)

        // TODO fetch new data
        //zoom.translateExtent([[xScale(_tExtendStartDate)], [xScale(Date.now())]]);

        if(playing){
            timepinDate.setTime(timepinDate.getTime() + (speed*60*1000));

            if(selection){
                if(timepinDate < selection[0] || timepinDate > selection[1])
                    timepinDate.setTime(selection[0].getTime())
            }

            if(timepinDate > Date.now())
                timepinDate.setTime(Date.now())

            replaceTimepin()
        }
    }
    requestAnimationFrame(update)


    
    
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
        console.log(data);
        
        //console.log(data[0], data[data.length-1]);
        let color = SENSOR_COLORS[id]
        let graph = new Graph(svg, data, color)
        graph.area(xScale, yScale)
        
        let graphNode = graph.node()
        let idstr = "graphline"+id
        graphNode.attr("id", idstr);

        if(graphs.has(idstr)) throw new Error(`Graph with id ${id} already exists`)
        graphs.set(idstr, graph)
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
        timepinDate.setTime(date)
        replaceTimepin()
     }

    const _brushMouseDown = brushGroup.on('mousedown.brush');
    setTool("pin")
     /**
     * 
     * @param {*} tool 
     */
    function setTool(tool){
        console.log(tool);
        
        if(tool == "brush") {
            brushGroup.on('mousedown.brush', _brushMouseDown)
            brushGroup.select(".handle--w").style('cursor', 'ew-resize')
            brushGroup.select(".handle--e").style('cursor', 'ew-resize')
            brushGroup.select(".selection").style('cursor', 'move')
            svg.select(".overlay").style('cursor', 'crosshair')
        } else {
            brushGroup.on('mousedown.brush', () => {})
            brushGroup.select(".handle--w").style('cursor', 'unset')
            brushGroup.select(".handle--e").style('cursor', 'unset')
            brushGroup.select(".selection").style('cursor', 'unset')
            svg.select(".overlay").style('cursor', 'unset')
        }
    }

    return {
        plotGraph, 
        removeGraph,  
        setTimepinTime, 
        setTool,

        play(){ playing = true },
        pause(){ playing = false },
        isPlaying(){ return playing },

        getSpeed(){ return speed },
        setSpeed(s){ speed = s }
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