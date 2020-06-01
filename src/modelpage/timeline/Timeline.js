/**
 * @author Tom Wendland
 */
import * as d3 from 'd3'
import Graph from "./Graph.js";

const Timeline = (function(parentElement){

    const width = parentElement.clientWidth // is set on 100% width
    const height = parentElement.clientHeight
    const margin = ({top: 20, right: 30, bottom: 30, left: 40}) // margin used for labels

    const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height]);
    parentElement.appendChild(svg.node())

    const graphs = new Map()
    
    let x = d3.scaleUtc()
    .range([margin.left, width - margin.right])
    //.domain(d3.extent(data, d => d.date))
    //.domain([new Date("2020-01-01T00:00:00Z"), new Date("2020-01-01T16:45:00Z")])
    .domain([new Date("2020-01-01T07:55:00Z"), new Date("2020-01-01T16:45:00Z")])

    let y = d3.scaleLinear()
    .range([height - margin.bottom, margin.top])
    //.domain([0, d3.max(data, d => d.value)]).nice()
    .domain([0, 10]).nice()

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
    )

    svg.append("g").call(xAxis);
    svg.append("g").call(yAxis);



    


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


    placeTimepin(x.domain()[1]) // upper domain value




    timepin.call(d3.drag().on('drag', () => {
        let mouse_x = d3.mouse(svg.node())[0]
        let max_x = width-margin.right
        if(mouse_x > max_x) mouse_x = max_x
        let date = x.invert(mouse_x)
        placeTimepin(date)
    }));

    svg.on("mouseup", function() { 
        let mouse_x = d3.mouse(this)[0]
        let max_x = width-margin.right
        if(mouse_x > max_x) mouse_x = max_x
        let date = x.invert(mouse_x)
        placeTimepin(date)
    });
    
    function placeTimepin(date){    
        timepin.attr("transform", `translate(${x(date)}, 0)`)
    }



    
    /**
     _____       _     _ _          __                  _   _                 
    |  __ \     | |   | (_)        / _|                | | (_)                
    | |__) |   _| |__ | |_  ___   | |_ _   _ _ __   ___| |_ _  ___  _ __  ___ 
    |  ___/ | | | '_ \| | |/ __|  |  _| | | | '_ \ / __| __| |/ _ \| '_ \/ __|
    | |   | |_| | |_) | | | (__   | | | |_| | | | | (__| |_| | (_) | | | \__ \
    |_|    \__,_|_.__/|_|_|\___|  |_|  \__,_|_| |_|\___|\__|_|\___/|_| |_|___/      
    */

    function plotGraph(data, id){
        let graph = new Graph(svg,  x, y, data)
        let graphNode = graph.node()
        let idstr = "graphline"+id
        graphNode.attr("id", idstr);

        if(graphs.has(idstr)) throw new Error(`Graph with id ${id} already exists`)
        graphs.set(idstr, graph)
    }

    function removeGraph(id){
        let idstr = "graphline"+id
        if(!graphs.has(idstr)) throw new Error(`There is no graph with id ${id}`)
        
        d3.select("#"+idstr).remove();
        graphs.delete(idstr)        
    }

    function play(){ }

    function setTime(){ }

    return {
        setTime, play, plotGraph, removeGraph
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
        second: "numeric"
    });
}

export default Timeline