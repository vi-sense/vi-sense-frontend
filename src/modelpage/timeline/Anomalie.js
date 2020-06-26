/**
 * @author Tom Wendland
 */

 // const API_URL = process.env.API_URL  

const API_URL = "https://visense.f4.htw-berlin.de:44344"


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
        .attr("stroke", "red")     
        .style("fill", "none")

        this.redraw()
    }

    redraw(){        
        let s = new Date(this.data.start_data.date)
        let e = new Date(this.data.end_data.date) 
        s = new Date(2020, 5, 23)
        e = new Date(2020, 5, 24) 

        let ss = this.xScale(s)
        this.rect
        .attr("x", ss)
        .attr("width",  this.xScale(e)-ss)
        .attr("y", 30)
        .attr("height", 50)
    }
}