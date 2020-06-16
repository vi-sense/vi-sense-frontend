/**
 * @author Tom Wendland
 */
import * as d3 from 'd3'

export default class Graph{

    constructor(svg, data, color) {
        this.data = data
        this.line = d3.line()
            .defined(d => !isNaN(d.value) && !isNaN(d.date))

        this.path = svg.append("path")
            .datum(this.data)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
    }
    area(x, y){
        this.line
            .x(d => x(d.date))
            .y(d => y(d.value))

        this.path
            .attr("d", this.line);  
    }
    node(){
        return this.path
    }

    gradient(xScale, yScale, date){
        let index
        if(!this.cachedGradientDates || date < this.cachedGradientDates.lower || date > this.cachedGradientDates.upper){
            index = d3.bisect(this.data.map(d=>d.date), date)
            this.cachedGradientDates = {lower: this.data[index-1].date, upper: this.data[index-1].date, indexUpper: index}
        }else{
            index = this.cachedGradientDates.indexUpper
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
        let m1 = -(yScale(this.data[b].value) - yScale(this.data[a].value))/(xScale(this.data[b].date) - xScale(this.data[a].date))
        let m2 = -(yScale(this.data[c].value) - yScale(this.data[b].value))/(xScale(this.data[c].date) - xScale(this.data[b].date))

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