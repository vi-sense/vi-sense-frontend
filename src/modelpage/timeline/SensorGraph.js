/**
 * @author Tom Wendland
 */

import DataFetcher from "./DataFetcher.js"

import * as d3 from 'd3'
import { SENSOR_COLORS } from '../../storage/Settings';

//const SENSOR_COLORS = d3.schemeCategory10 // position mapped to sensorId


export default class SensorGraph{

    /**
     * 
     * @param {Number} sensorId 
     * @param {*} svgParent 
     * @param {*} xScale 
     * @param {*} yScale 
     */
    constructor(sensorId, svgParent, xScale, yScale) {
        this.xScale = xScale
        this.yScale = yScale
        this.sensorId = sensorId
        this.color = SENSOR_COLORS[sensorId]
        this.data = []
        this.dataFetcher = new DataFetcher(sensorId)

        this.line = d3.line()
            .defined(d => !isNaN(d.value) && !isNaN(d.date))

        this.path = svgParent.append("path")
            .datum(this.data)
            .attr("fill", "none")
            .attr("stroke", this.color)
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")

        this.redraw()
    }

    
    redraw(){        

        this.dataFetcher.get(this.xScale.domain()).then(data => {
            if(data) {
                this.data = data
                this.path.datum(this.data)
                this.redraw()
            }
        })

        this.line
            .x(d => this.xScale(d.date))
            .y(d => this.yScale(d.value))

        this.path
            .attr("d", this.line);  
    }
    show(){
        this.isHidden = false
        this.path.attr("display", "unset");
    }
    hide(){
        this.isHidden = true
        this.path.attr("display", "none");
    }
    getGradient(date){
        let index
        if(!this.cachedGradientDates || date < this.cachedGradientDates.lower || date > this.cachedGradientDates.upper){
            index = d3.bisect(this.data.map(d=>d.date), date)
            this.cachedGradientDates = {lower: this.data[index-1].date, upper: this.data[index-1].date, indexUpper: index}
        }else{
            index = this.cachedGradientDates.indexUpper
        }
        if(index <= 1 || index >= this.data.length -1){
            return undefined
        }
        let interpolationPosition = 1 - (this.data[index].date - date) / (this.data[index].date-this.data[index-1].date)
        let a, b, c, m
        if(interpolationPosition < 0.5){
            a = index -2
            b = index -1
            c = index
        }else{
            a = index -1
            b = index
            c = index +1
        }
        let m1 = -(this.yScale(this.data[b].value) - this.yScale(this.data[a].value))/(this.xScale(this.data[b].date) - this.xScale(this.data[a].date))
        let m2 = -(this.yScale(this.data[c].value) - this.yScale(this.data[b].value))/(this.xScale(this.data[c].date) - this.xScale(this.data[b].date))

        if(interpolationPosition < 0.5){
            m = (0.5-interpolationPosition)*m1 + (0.5+interpolationPosition)*m2
        }else{
            m = (1.5-interpolationPosition)*m1 + (interpolationPosition -0.5)*m2
        }
        return m
    }
}






// Timepin einrasten ergibt kein sinn weil daten immer zu unterschiedlichen zeiten generiert wurden, also eh immer interpoliert werden müsste für die andern grapehn
/*
timepin.call(d3.drag().on('drag', () => {
    let mouse_x = d3.mouse(svg.node())[0]
    let {date, value} = bisect(mouse_x);
    placeTimepin(date, value)
    //marker.attr("transform", `translate(0, ${y(value)})`)
}));
var bisect = function() {
    const bisect = d3.bisector(d => d.date).left;
    return mouse_x => {
        const date = x.invert(mouse_x);
        const index = bisect(data, date, 1);
        const a = data[index-1];
        const b = data[index];
        return b != undefined && date-a.date > b.date-date ? b : a;
        };
}()
const marker = timepin.append("circle")
.attr("fill", "none")
.attr("stroke", "blue")
.attr("cx", 0)
.attr("cy", 0)
.attr("r", 2)
*/