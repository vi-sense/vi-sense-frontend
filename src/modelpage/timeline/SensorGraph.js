/**
 * @author Tom Wendland
 */
import * as d3 from 'd3'
import moment from 'moment';
import { SENSOR_COLORS } from '../../storage/Settings';
const API_URL = process.env.API_URL  

//const SENSOR_COLORS = d3.schemeCategory10 // position mapped to sensorId
//const API_URL = "https://visense.f4.htw-berlin.de:44344"


export default class SensorGraph{

    constructor(sensorId, svgParent, xScale, yScale) {

        this._fetching = false

        this.oldestDataDate = new Date(8640000000000000) // max/min date for initial comparison
        this.latestDataDate = new Date(-8640000000000000)

        this.xScale = xScale
        this.yScale = yScale
        this.sensorId = sensorId
        this.color = SENSOR_COLORS[sensorId]
        this.data = []

        this.line = d3.line()
            .defined(d => !isNaN(d.value) && !isNaN(d.date))

        this.path = svgParent.append("path")
            .datum(this.data)
            .attr("fill", "none")
            .attr("stroke", this.color)
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")

        this._fetchBackwards(new Date())
    }

    /**
     * Fetching new data with given date as end_date
     * Werden nacheinander gefetcht und den bereits erhaltenen daten hinzugefügt
     * @param {Date} endDate 
     */
    _fetchBackwards(endDate = this.oldestDataDate) {
        if(this._fetching)  return       
        this._fetching = true
        
        fetchSensorData(this.sensorId, endDate).then(data => {   
            this._fetching = false

            let lower = data[0].date
            let upper = data[data.length-1].date
            if(lower <= this.oldestDataDate) this.oldestDataDate = lower
            if(upper >= this.latestDataDate) this.latestDataDate = upper

            this.data = [...data, ...this.data] 
            this.path.datum(this.data)

            this._fetching = false
            this.redraw()
        })
    }
    
    redraw(){        
        if(this.xScale(this.oldestDataDate) > 0) { 
            this._fetchBackwards()
        }

        this.line
            .x(d => this.xScale(d.date))
            .y(d => this.yScale(d.value))

        this.path
            .attr("d", this.line);  
    }
    show(){
        this.path.attr("display", "unset");
    }
    hide(){
        this.path.attr("display", "none");
    }
    getGradient(date){
        // TODO use bisect for better performance?
        let index = this.data.findIndex(entry => entry.date > date)
        if(index === -1){
            return 0
        }
        let m = -(this.yScale(this.data[index].value) - this.yScale(this.data[index -1].value))/(this.xScale(this.data[index].date) - this.xScale(this.data[index -1].date))
        return m
    }

}


async function fetchSensorData(id, endDate){
    // our backend requires utc time for a request so if I want the data for 12:00 local time, i have to request for 10:00 because german time is utc+02
    let utcdate = moment.utc(endDate).format("YYYY-MM-DD HH:mm:ss");
    let limit = 100
    
    return await fetch(API_URL + `/sensors/${id}/data?limit=${limit}&end_date=${utcdate}`)
    .catch(error => { console.log(error) })
    .then(res => { return res.json() })
    .then(json => { return json.map(d => { return {date: new Date(d.date), value: d.value}}) })
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