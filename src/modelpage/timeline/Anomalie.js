/**
 * @author Tom Wendland
 */

import * as d3 from 'd3'
import { getSensorColor } from '../../storage/SensorColors';

//const SENSOR_COLORS = d3.schemeCategory10 

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
        .style("fill", getSensorColor(this.data.start_data.sensor_id))
        .style("opacity", 0.3)

        //if(data.type==UPGRADIENT || data.type == DOWNGRADIENT)console.log(data);
        
        this.redraw()
    }

    redraw(){    
        let data = this.data

        // TODO nicht über Date.now()
        
        if(data.type==ABOVE || data.type==BELOW){
            if(data.end_data){
                let s = new Date(data.start_data.date)
                let e = new Date(data.end_data.date) 
                let ss = this.xScale(s)
    
                this.rect
                .attr("x", ss)
                .attr("width", this.xScale(e)-ss)
                
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
                // TODO visualize 1 datapoint anomalie 
            }
        }   
        else if(data.type==UPGRADIENT || data.type==DOWNGRADIENT){    
                 
            if(data.end_data){
                // TODO
            }   
            else {
                this.rect
                .attr("x", this.xScale(new Date(data.start_data.date))-10)
                .attr("width",  20)
                .attr("y", this.yScale(data.start_data.value)-50)              
                .attr("height", 100) 
            }           
        }
    }
}