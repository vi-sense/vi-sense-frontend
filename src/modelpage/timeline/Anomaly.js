/**
 * @author Tom Wendland
 */

import * as d3 from 'd3'
import { getSensorColor } from '../../storage/SensorColors';

const ABOVE = "Above Upper Limit"
const BELOW = "Below Upper Limit"
const UPGRADIENT = "High Upward Gradient"
const DOWNGRADIENT = "High Downward Gradient"

export default class Anomaly {
    
    /**
     * 
     * @param {*} data 
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

        console.log(data);
        
        this.redraw()
    }

    redraw(){    
        let data = this.data
        let xScale = this.xScale
        let yScale = this.yScale

        if(data.type==ABOVE || data.type==BELOW){
            if(data.end_data){
                let ss = xScale(new Date(data.start_data.date))
    
                this.rect
                .attr("x", ss)
                .attr("width", xScale(new Date(data.end_data.date))-ss)
                
                if(data.type==ABOVE){
                    this.rect.attr("y", yScale(data.peak_data.value))              
                    this.rect.attr("height", yScale(Math.min(data.start_data.value, data.end_data.value)) - yScale(data.peak_data.value)) 
                }
                else if(data.type==BELOW) {
                    this.rect.attr("y", yScale(Math.max(data.start_data.value, data.end_data.value)))   
                    this.rect.attr("height", yScale(data.peak_data.value))            
                }
            }
            else {
                this.rect
                .attr("x", xScale(new Date(data.start_data.date))-10)
                .attr("width", 20)
                .attr("y", yScale(data.start_data.value)-10)              
                .attr("height", 20)           
            }
        }   

        else if(data.type==UPGRADIENT || data.type==DOWNGRADIENT){    
            if(data.end_data){
                this.rect
                .attr("x", xScale(new Date(data.start_data.date))-10)
                .attr("width", 20)
                .attr("y", y)   
                .attr("height", yScale(data.peak_data.value))           
            }   
            else {                
                this.rect
                .attr("x", xScale(new Date(data.start_data.date))-10)
                .attr("width",  20)
                .attr("y", yScale(data.start_data.value)-50)              
                .attr("height", 100)               
            }           
        }
        else console.log("Unknown anomaly type");
        
    }
    show(){
        this.rect.attr("display", "unset");
    }
    hide(){
        this.rect.attr("display", "none");
    }
}