/**
 * @author Tom Wendland
 */

import SensorGraph from "./SensorGraph.js";

import * as d3 from 'd3'
import { turnArrow } from "../babylon/sensorSelection"




const Timeline = (function(parentElement){

    const graphs = new Map()

    const width = parentElement.clientWidth // is on 100% width per default
    const height = parentElement.clientHeight
    const margin = ({top: 20, right: 20, bottom: 25, left: 30}) // used for labels, axis etc

    const svg = d3.create("svg").attr("viewBox", [0, 0, width, height])
    .attr("user-select", "none")
    parentElement.appendChild(svg.node())
    


    svg.append("clipPath")
    .attr("id", "clip")
    .append("rect")            
	.attr("x", margin.left)
	.attr("y",margin.top)
    .attr("height",height-margin.top-margin.bottom)
	.attr("width",width-margin.left-margin.right)

    const clipper = svg.append("g")
    .attr("clip-path","url(#clip)")


    /**
     _____     _     
    |  _  |_ _|_|___ 
    |     |_'_| |_ -|
    |__|__|_,_|_|___|
    */
   // time range showed when started the app
   const _start = new Date()
   _start.setTime(_start.getTime() - 7*24*60*60*1000)
   const _end = new Date()
   _end.setTime(_end.getTime() + 24*60*60*1000)

   const xScaleRef = d3.scaleUtc()
        .range([margin.left, width - margin.right])
        .domain([_start, _end])  
        // TODO scaleTick use 24 h

    const xScale = xScaleRef.copy() 

    const xAxis = g => g
        .attr("transform", `translate(0,${height-margin.bottom})`)
        .call(d3
            .axisBottom(xScale)
            .ticks(width/80)
            .tickSizeOuter(0))
        .style('cursor', 'ew-resize')

    const yScale = d3.scaleLinear()
        .range([height - margin.bottom, margin.top])
        .domain([-10, 100]).nice() //.domain([0, d3.max(data, d => d.value)]).nice()
        
    const yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("class", "domain")
            .attr("y", 0)
            .attr("x", 5)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text("C°/Bar"))

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
    const zoom = d3.zoom()
        .extent([[margin.left, 0], [width-margin.right, height]])
        .scaleExtent([0.5, 8]) // zoom factor range, depends on preselected domain 
        .translateExtent([[xScale(new Date(2020, 0, 1))], [xScale(_end)]]) // pan range
        .on("zoom", () => {

            // scaling reference https://stackoverflow.com/questions/56553384/d3-v5-axis-scale-change-panning-way-too-much
            let t = d3.event.transform
            xScale.domain(t.rescaleX(xScaleRef).domain()); // continous scale with transformed domain  
    
            redrawTimepin()
            gx.call(xAxis); 
            graphs.forEach(g => g.redraw())        
            if(selection) brushGroup.call(brush.move, [xScale(selection[0]), xScale(selection[1])]);    
        })

    svg.call(zoom)
    .on("dblclick.zoom", null)



    /**                              
     _____           __    _         
    |   | |___ _ _ _|  |  |_|___ ___ 
    | | | | . | | | |  |__| |   | -_|
    |_|___|___|_____|_____|_|_|_|___|                           
     */
    const endline = svg.append("g")
    .attr("transform", `translate(${xScale(Date.now())}, 0)`)

    endline.append("line")
    .attr("stroke", "grey")
    .attr("y1", margin.top)
    .attr("y2", height-margin.bottom)

    endline.append("text")
    .attr('text-anchor', 'start')
    .attr("x", 0)
    .attr("y", height-margin.bottom-2)
    .text(function(d) { return formatDate(new Date()); });



    /**                    
     _____ _               _     
    |_   _|_|_____ ___ ___|_|___ 
      | | | |     | -_| . | |   |
      |_| |_|_|_|_|___|  _|_|_|_|
                      |_|        
    */
    var timepinDate = new Date() 

    const timepin = svg.append("g")
    .style('cursor', 'ew-resize')

    timepin.append("line")
    .attr("stroke", "grey")
    .attr("stroke-dasharray", 4)
    .attr("y1", margin.top)
    .attr("y2", height-margin.bottom)

    timepin.append("circle")
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("cx", 0)
    .attr("cy", margin.top-5)
    .attr("r", 4)

    timepin.append("text")
    .attr('text-anchor', 'middle')
    .attr("x", 0)
    .attr("y", margin.top-5)


    timepin.call(d3.drag().on('drag', () => {
        let mouse_x = d3.mouse(svg.node())[0]
        clampTimelinePosAndSetDate(mouse_x)
        redrawTimepin()
    }));
    svg.on("click", function() {         
        let mouse_x = d3.mouse(this)[0]
        clampTimelinePosAndSetDate(mouse_x)
        redrawTimepin()
    }); 

    function clampTimelinePosAndSetDate(mouse_x){
        let max_x = width-margin.right
        let min_x = margin.left
        if(mouse_x > max_x) mouse_x = max_x
        if(mouse_x < min_x) mouse_x = min_x
        timepinDate.setTime(xScale.invert(mouse_x))        
    }

    function redrawTimepin(){  
        timepin.select("text").text(() => formatDate(timepinDate))
        timepin.attr("transform", `translate(${xScale(timepinDate)}, 0)`)
        Array.from(graphs.keys()).forEach(key => {turnArrow(key, graphs.get(key).getGradient(timepinDate))})
    }

    

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


    const brushGroup = clipper.append("g")
        .call(brush)
        .on("dblclick", () => {
            brushGroup.call(brush.move, null); 
            // brush.end event is called afterwards which removes the selection      
        })

    brushGroup.select(".selection")
        .attr("fill", "lightgrey")     
        .attr("stroke", "grey")     
        .attr("stroke-dasharray", 4)

    const _brushMouseDown = brushGroup.on('mousedown.brush'); // used for setTool()







    /**                    
     __ __       _     _       
    |  |  |___ _| |___| |_ ___ 
    |  |  | . | . | .'|  _| -_|
    |_____|  _|___|__,|_| |___|
          |_|                  
     */

    var speed = 1
    var playing = false
    
    function update() {
        requestAnimationFrame(update)

        const now = new Date()

        graphs.forEach(g => {
            g.dataFetcher.checkAndUpdateRealtimeData( () => g.redraw() )
        })

        // TODO update timeline max zoom date in realtime
        // idk why but its stuttering even if i only call this method once
        // -> dont update timeline in realtime but allow to scroll some hours ontop
        //zoom.translateExtent([[zoom.translateExtent[0]], [xScale(ttt)]]);

        endline.attr("transform", `translate(${xScale(now)}, 0)`)
        endline.select("text").text(() => formatDate(now))

        if(playing){
            timepinDate.setTime(timepinDate.getTime() + (speed*60*1000));
            
            if(selection != undefined && (timepinDate < selection[0] || timepinDate > selection[1])){
                timepinDate.setTime(selection[0].getTime())
            }
    
            if(!selection && timepinDate > now){
                playing = false
                timepinDate.setTime(now)
            }
            redrawTimepin()
        }
    }
    

    svg.selectAll("text")
    .attr("pointer-events", "none")

    setTool("pin")
    redrawTimepin() 
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
     * @param {Number} id sensor id
     */
    function showGraph(id){ 
        if(graphs.has(id)) {
            graphs.get(id).show()
        } else{
            let graph = new SensorGraph(id, clipper, xScale, yScale)
            graphs.set(id, graph)
        }
    }

    /**
     * 
     * @param {Number} id 
     */
    function hideGraph(id){
        if(graphs.has(id)){
            graphs.get(id).hide()
        }
        else throw new Error(`There is no graph with id ${id}`)
    }

    /**
     * 
     * @param {Date} date 
     */
    function setTimepinTime(date){
        timepinDate.setTime(date)
        redrawTimepin()
     }


     /**
     * 
     * @param {*} tool 
     */
    function setTool(tool){        
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
        showGraph, 
        hideGraph,  
        setTimepinTime, 
        setTool,

        play(){ playing = true },
        pause(){ playing = false },
        isPlaying(){ return playing },

        getSpeed(){ return speed },
        setSpeed(s){ speed = s },

        setDomainY(min, max){
            yScale.domain([min, max]).nice()
            gy.call(yAxis)
            graphs.forEach(g => g.redraw())
        },
        getDomainY(){
            return yScale.domain()
        }

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