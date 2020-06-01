/**
 * @author Tom Wendland
 */
import * as d3 from 'd3'

export default class Graph{

    constructor(svg, x, y, data) {
        this.data = data

        let line = d3.line()
            .defined(d => !isNaN(d.value) && !isNaN(d.date))
            .x(d => x(d.date))
            .y(d => y(d.value))

        this.path = svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", line);            
    }

    node(){
        return this.path
    }
}

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