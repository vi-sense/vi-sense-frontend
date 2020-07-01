/**
 * @author Tom Wendland
 */

import SensorGraph from "./SensorGraph.js";

import * as d3 from 'd3'
import moment from 'moment';
import { turnArrow, updateShader } from "../babylon/sensorSelection"




const Timeline = (function(parentElement){

    const graphs = new Map()

    const width = parentElement.clientWidth // is on 100% width per default
    const height = parentElement.clientHeight
    const margin = ({top: 15, right: 0, bottom: 25, left: 30}) // used for labels, axis etc

    const svg = d3.create("svg").attr("viewBox", [0, 0, width, height])
    .attr("user-select", "none")
    parentElement.appendChild(svg.node())

    svg.append("clipPath").attr("id", "clipXY").append("rect").attr("y", margin.top).attr("x", margin.left).attr("height",height-margin.top-margin.bottom).attr("width",width-margin.left-margin.right)
    svg.append("clipPath").attr("id", "clipX").append("rect").attr("y", 0).attr("x", margin.left).attr("height",height).attr("width",width-margin.left-margin.right)
    const clipperXY = svg.append("g").attr("clip-path","url(#clipXY)")
    const clipperX = svg.append("g").attr("clip-path","url(#clipX)")



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

    // scaling reference https://stackoverflow.com/questions/56553384/d3-v5-axis-scale-change-panning-way-too-much
    const xScaleRef = d3.scaleUtc()
        .range([margin.left, width-margin.right-1]) // -1 otherwise tickSizeOuter() is not visible on xAxis end
        .domain([_start, _end]).nice()

    const xScale = xScaleRef.copy()


    let formatMinute = (date) => moment(date).format("HH:mm")
    let formatHour = (date) => moment(date).format("HH:mm")
    let formatDay = (date) => moment(date).format("DD.MM.YY")
    let formatMonth = (date) => "1 " + moment(date).format("MMMM")
    let formatYear = (date) => moment(date).format("YYYY")

    // https://stackoverflow.com/a/42043782/7764088 idee: timeDay zb gibt date mit selbem tag 0 uhr zurück. durch die vergleiche wird geringster abstand gesucht zum nächsten umschwung
    function multiFormat(date) {
        return (d3.utcHour(date) < date.getTime() ? formatMinute
          : d3.utcDay(date) < date.getTime() ? formatHour
          : d3.utcMonth(date) < date.getTime() ? formatDay
          : d3.utcYear(date) < date.getTime() ? formatMonth : formatYear
        )(date);
    }

    const xAxis = g => g
        .attr("transform", `translate(0,${height-margin.bottom})`)
        .call(d3
            .axisBottom(xScale)
            .ticks(width/110)
            .tickSizeOuter(18)
            .tickFormat(multiFormat)
        )
        .call(g => g.selectAll(".xgrid").remove())
        .call(g => g.selectAll(".tick line").clone().attr("class", "xgrid"))
        .call(g => g.selectAll(".xgrid")
            .attr("y1", -height+margin.bottom+margin.top)
            .attr("y2", 0)
            .attr("stroke-opacity", 0.05)
            .filter(d => d > Date.now()).remove())


    const yScale = d3.scaleLinear()
        .range([height - margin.bottom, margin.top])
        .domain([-10, 80])

    const yLabel = g => g
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("class", "domain")
            .attr("y", 0)
            .attr("x", 5)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text("°C/Bar"))

    const yGrid = g => g
        .call(g => g.selectAll(".ygrid")
            .attr("x2", xScale(Date.now())-margin.left)
            .attr("stroke-opacity", 0.05))

    const yAxis = g => g
        .attr("transform", `translate(${margin.left-2},0)`)
        .call(d3.axisLeft(yScale))
        .call(yLabel)
        .call(g => g.selectAll(".ygrid").remove())
        .call(g => g.selectAll(".tick line").clone().attr("class", "ygrid"))
        .call(yGrid)




    const gx = clipperX.append("g").call(xAxis);
    const gy = svg.append("g").call(yAxis);

    svg.selectAll("text")
    .attr("pointer-events", "none")




    /**
     _____
    |__   |___ ___ _____
    |   __| . | . |     |
    |_____|___|___|_|_|_|
    */
    const _endTransform = new Date()
    _endTransform.setTime(_end.getTime() + 24*60*60*1000)

    const zoom = d3.zoom()
        .extent([[margin.left], [width-margin.right]])
        .scaleExtent([0.3, 20]) // zoom factor range, depends on preselected domain. first value ist zoom out
        .translateExtent([[xScale(new Date(2019, 9, 1))], [xScale(_endTransform)]]) // pan range
        .on("zoom", () => {

            let t = d3.event.transform
            xScale.domain(t.rescaleX(xScaleRef).domain());

            gx.call(xAxis);
            gy.call(yGrid);
            if(selection) brushGroup.call(brush.move, [xScale(selection[0]), xScale(selection[1])]);
            graphs.forEach(g => g.redraw())
            redrawTimepin()
        })

    svg.call(zoom)
    .on("dblclick.zoom", null)




    /**
     _____             _
    | __  |___ _ _ ___| |_
    | __ -|  _| | |_ -|   |
    |_____|_| |___|___|_|_|
     */

    var selection

    const brush = d3.brushX()
        .extent([[margin.left, margin.top], [width-margin.right, height-margin.bottom]])
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


    const brushGroup = clipperXY.append("g")
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
     _____       _ _ _
    |   __|___ _| | |_|___ ___
    |   __|   | . | | |   | -_|
    |_____|_|_|___|_|_|_|_|___|
     */
    const endline = clipperXY.append("g")
    .attr("transform", `translate(${xScale(Date.now())}, 0)`)

    endline.append("line")
    .attr("stroke", "grey")
    .attr("y1", margin.top)
    .attr("y2", height-margin.bottom)

    const endlineText = endline.append("text")
    .attr('text-anchor', 'start')
    .attr("y", margin.top)
    .attr("font-family", "sans-serif")
    .style('font-size', 'smaller')

    const endTextDay = endlineText.append("tspan").attr("x", 11).attr('dy', 14)
    const endTextDate = endlineText.append("tspan").attr("x", 11).attr('dy', 14)
    const endTextTime = endlineText.append("tspan").attr("x", 11).attr('dy', 14)




    /**
     _____ _               _
    |_   _|_|_____ ___ ___|_|___
      | | | |     | -_| . | |   |
      |_| |_|_|_|_|___|  _|_|_|_|
                      |_|
    */
    var timepinDate = new Date()

    const timepin = clipperX.append("g")
    .style('cursor', 'ew-resize')

    timepin.append("line")
    .attr("stroke", "grey")
    .attr("stroke-dasharray", 2)
    .attr("y1", margin.top)
    .attr("y2", height-margin.bottom+18)

    timepin.append("circle")
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("cx", 0)
    .attr("cy", margin.top-5)
    .attr("r", 4)

    timepin.append("rect")
    .attr("width", 140)
    .attr("height", 16)
    .style("fill", "white")
    .attr("y", height-margin.top-6)
    .attr("x", -140/2)
    .attr("stroke", "black")

    timepin.append("text")
    .attr('text-anchor', 'middle')
    .attr("y", height-margin.top+7)
    .style('font-size', 'smaller')
    .attr("font-family", "sans-serif")

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
        timepin.select("text").text(() => moment(timepinDate).format("ddd DD.MM.YY,  HH:mm"))
        timepin.attr("transform", `translate(${xScale(timepinDate)}, 0)`)

        graphs.forEach(graph => {
            if(!graph.isHidden){
                turnArrow(graph.sensorId, graph.getGradient(timepinDate))
            }
            updateShader(graph.sensorId, graph.getValue(timepinDate))
        })
    }








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

        endline.attr("transform", `translate(${xScale(now)}, 0)`)

        endTextDay.text(() => "It's " + moment(now).format("dddd"));
        endTextDate.text(() => moment(now).format("DD MMMM YYYY"));
        endTextTime.text(() => moment(now).format("HH:mm:ss"));

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
            let graph = new SensorGraph(id, clipperXY, xScale, yScale, graphs)
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
     * @param {String} tool
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
        },
        centerToDate(date){
            zoom.translateTo(svg, xScaleRef(date))
            this.setTimepinTime(date)
        }
    }
})
export default Timeline
