/**
 * @author Tom Wendland
 */

// import * as d3 from 'd3'
// import { SENSOR_COLORS } from '../../storage/Settings';
// const API_URL = process.env.API_URL  

const API_URL = "https://visense.f4.htw-berlin.de:44344"
const SENSOR_COLORS = d3.schemeCategory10 

const ABOVE = "Above Upper Limit"
const BELOW = "Below Upper Limit"
const UPGRADIENT = "High Upward Gradient"
const DOWNGRADIENT = "High Downward Gradient"

export default class Anomalie {
    
    /**
     * 
     * @param {Number} data 
     * @param {*} parentElement 
     * @param {*} xScale 
     * @param {*} yScale 
     */
    constructor(data, parentElement, xScale, yScale){
        this.xScale = xScale
        this.yScale = yScale
        this.data = data 

        this.rect = parentElement.append("rect")
        .style("fill", SENSOR_COLORS[this.data.start_data.sensor_id])
        .style("opacity", 0.3)
        console.log(this.data);

        this.redraw()
    }

    redraw(){    
        let data = this.data

        if(data.type==ABOVE || data.type==BELOW){
            if(data.end_data){
                let s = new Date(data.start_data.date)
                let e = new Date(data.end_data.date) 
                let ss = this.xScale(s)
    
                this.rect
                .attr("x", ss)
                .attr("width",  this.xScale(e)-ss)
                
                if(data.type==ABOVE){
                    this.rect.attr("y", this.yScale(data.peak_data.value))              
                    this.rect.attr("height", this.yScale(Math.min(data.start_data.value, data.end_data.value)) - this.yScale(data.peak_data.value)) 
                }
                else if(data.type==BELOW) {
                    this.rect.attr("y", this.yScale(Math.max(data.start_data.value, data.end_data.value)))   
                    this.rect.attr("height", this.yScale(data.peak_data.value))            
                }
            }
            else {
                // TODO 1 datapoint anomalie 
            }
        }   
        else if(data.type == UPGRADIENT){}
        else if(data.type == DOWNGRADIENT){}
        else console.log("anomaly type not valid")
    }
}