import * as d3 from "d3";
import BaseChart from './BaseChart';

export default class LineChart extends BaseChart {
    getScaleX() {
        return d3.scaleTime().range([0, this.props.width]);
    }

    getScaleY() {
        return d3.scaleLinear().range([this.props.height, 0]);
    }

    createAxisX(x) {
        return d3.axisBottom(x);
    }

    createAxisY(y) {
        return d3.axisLeft(y);
    }

    parsingTime(){
        return d3.timeParse("%d-%b-%y");
    }

    onMouseOver(d) {
        return this.tooltip
            .style("visibility", "visible")
            .text(`Time: ${d.x} Value: (${d.y})`);
    }

    create(data) {
        const x = this.getScaleX();
        const y = this.getScaleY();
        
        this.xAxis = this.createAxisX(x);
        this.yAxis = this.createAxisY(y);
        
        const valueline = d3.line()
            .x(function(d) { return x(d.x); })
            .y(function(d) { return y(d.y); });
        
        this.width = this.props.width;
        this.height = this.props.height;
        const parseTime = this.parsingTime();

        this.svg = d3.select(this.el).append("svg")
            .attr("width", this.width + this.props.margin.left + this.props.margin.right)
            .attr("height", this.height + this.props.margin.top + this.props.margin.bottom)
            .append("g")
                .attr("transform", `translate(${this.props.margin.left}, ${this.props.margin.top})`);

        data.forEach(function(d) {
            d.x = parseTime(d.x);
            d.y = +d.y;
        });

        x.domain(d3.extent(data, function(d) { return d.x; }));
        y.domain([0, d3.max(data, function(d) { return d.y; })]);
        
        this.svg.append("path")
            .attr("class", "line")
            .attr("d", valueline(data))
            .style("fill","none")
            .style("stroke","steelblue")
            .style("stoke-width","3px");

        this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(d3.axisBottom(x));

        this.svg.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(y));

        this.svg.selectAll(".dot")
            .data(data)
        .enter().append("circle")
            .attr("class", "dot")
            .attr("r", 3.5)
            .attr("cx", function(d) { return x(d.x); })
            .attr("cy", function(d) { return y(d.y); })
            .style("fill", "white")
            .style("stroke", "black")
            .on("mouseover", this.onMouseOver.bind(this))
            .on("mousemove", this.onMouseMove.bind(this))
            .on("mouseout", this.onMouseOut.bind(this));

    
        if (this.showTooltips) {
            this.addTooltips();
        }
    }

    update(data) {
        const x = this.getScaleX();
        const y = this.getScaleY();
        
        this.xAxis = this.createAxisX(x);
        this.yAxis = this.createAxisY(y);

        const valueline = d3.line()
            .x(function(d) { return x(d.x); })
            .y(function(d) { return y(d.y); });

        const parseTime = this.parsingTime();
        data.forEach(function(d) {
            d.x = parseTime(d.x);
            d.y = +d.y;
        });
        
        x.domain(d3.extent(data, function(d) { return d.x; }));
        y.domain([0, d3.max(data, function(d) { return d.y; })]);

        this.svg.selectAll(".line")
                .transition().duration(500)
                .attr("d",  valueline(data));

        this.svg.selectAll(".dot")
            .data(data)
            .transition().duration(500)
                .attr("r", 3.5)
                .attr("cx", function(d) { return x(d.x); })
                .attr("cy", function(d) { return y(d.y); })
                .style("fill", "white")
                .style("stroke", "black");
        
        this.svg.selectAll(".dot")
            .data(data)
        .exit()
        .remove()

        this.svg.selectAll("g.x.axis")
        .transition().duration(500).call(this.xAxis);
        this.svg.selectAll("g.y.axis")
        .transition().duration(500).call(this.yAxis);
    }
}