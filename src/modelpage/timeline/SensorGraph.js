/**
 * @author Tom Wendland
 */

import SensorGraphDataFetcher from "./SensorGraphDataFetcher.js"
import Anomaly from "./Anomaly.js"

import * as d3 from 'd3'
import moment from 'moment';
import { getSensorColor } from "../../storage/SensorColors";
const API_URL = process.env.API_URL  

export default class SensorGraph{

    /**
     * 
     * @param {Number} sensorId 
     * @param {*} parentElement 
     * @param {*} xScale 
     * @param {*} yScale 
     */
    constructor(sensorId, parentElement, xScale, yScale) {
        this.xScale = xScale
        this.yScale = yScale
        this.sensorId = sensorId
        this.color = getSensorColor(sensorId)
        this.data = []
        this.dataFetcher = new SensorGraphDataFetcher(sensorId)
        
        this.line = d3.line()
            .defined(d => !isNaN(d.value) && !isNaN(d.date))

        this.path = parentElement.append("path")
            .datum(this.data)
            .attr("fill", "none")
            .attr("stroke", this.color)
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")

        this.anomalies = []
        fetch(`${API_URL}/sensors/${sensorId}/anomalies?end_date=${moment.utc(new Date()).format("YYYY-MM-DD HH:mm:ss")}`).then(d => d.json().then(data => {
            for(let d of data){
                let a = new Anomaly(d, parentElement, this.xScale, this.yScale)
                this.anomalies.push(a)
            }
        }))  

        this.redraw()
    }

    redraw(){     
        this.anomalies.forEach(a=>a.redraw())
   
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
        this.path.attr("display", "unset")
        this.anomalies.forEach(a=>a.show())
    }
    hide(){
        this.isHidden = true
        this.path.attr("display", "none");
        this.anomalies.forEach(a=>a.hide())
    }
    getGradient(date){
        let index
        if(!this.cachedGradientDates || date < this.cachedGradientDates.lower || date > this.cachedGradientDates.upper){
            index = d3.bisect(this.data.map(d=>d.date), date)
            if(index <= 1) return undefined
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