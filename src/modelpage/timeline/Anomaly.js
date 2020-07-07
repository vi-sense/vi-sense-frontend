/**
 * @author Tom Wendland
 */

import * as d3 from 'd3'
import { getSensorColor } from '../../storage/SensorColors';

const ABOVE = "Above Upper Limit"
const BELOW = "Below Lower Limit"
const UPGRADIENT = "High Upward Gradient"
const DOWNGRADIENT = "High Downward Gradient"
const MIN_WIDTH = 5 // minimal displayed width of a anomaly in pixel

export default class Anomaly {
    
    /**
     * 
     * @param {*} data 
     * @param {*} parentElement 
     * @param {*} xScale 
     * @param {*} yScale 
     */
    constructor(data, parentElement, xScale, yScale){
        this._xScale = xScale
        this._yScale = yScale
        this.data = data 

        this.rect = parentElement.append("rect")
        .attr("class", "anomaly")
        .attr("fill", getSensorColor(this.data.start_data.sensor_id))
        .attr("opacity", 0.2)
        
        this.redraw()
    }

    redraw(){
        let startdate = new Date(this.data.start_data.date)
        let left = this._xScale.domain()[0] 
        let right = this._xScale.domain()[1] 
        
        let s
        let w

        if(this.data.end_data){

            let enddate = new Date(this.data.end_data.date)
            if(enddate<left || startdate>right){
                this.hide()
                return
            } 
            this.show()

            s = this._xScale(startdate)
            w = this._xScale(enddate)-s

            if(w<MIN_WIDTH){
                s = s+w/2 - MIN_WIDTH/2
                w = MIN_WIDTH
            }
        } 
        else {
            if(startdate<left || startdate>right){ // TODO MIN_WIDTH mit beachten
                this.hide()
                return
            } 
            this.show()

            s = this._xScale(startdate) - MIN_WIDTH/2
            w = MIN_WIDTH         
        }

        this.rect
        .attr("x", s)
        .attr("width", w) 
        .attr("y", 0)              
        .attr("height", this._yScale(this._yScale.domain()[0])) 
    }
    show(){
        this.rect.attr("display", "unset");
    }
    hide(){
        this.rect.attr("display", "none");
    }
}

