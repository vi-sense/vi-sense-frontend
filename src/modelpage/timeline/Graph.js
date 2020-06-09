/**
 * @author Tom Wendland
 */
import * as d3 from 'd3'

export default class Graph{

    constructor(svg, data) {
        this.data = data
        this.line = d3.line()
            .defined(d => !isNaN(d.value) && !isNaN(d.date))

        this.path = svg.append("path")
            .datum(this.data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
    }

    node(){
        return this.path
    }

    area(x, y){
        this.line
            .x(d => x(d.date))
            .y(d => y(d.value))

        this.path
            .attr("d", this.line);  
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