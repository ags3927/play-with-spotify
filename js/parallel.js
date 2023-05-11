function brushstart() {
    d3.event.sourceEvent.stopPropagation();
};

function brush(svg) {
var actives = [];
svg.selectAll(".brush")
    .filter(function (d) {
        return d3.brushSelection(this);
    })
    .each(function (key) {
        actives.push({
            dimension: key,
            extent: d3.brushSelection(this)
        });
    });
if (actives.length === 0) {
    foreground_lines.style("display", null);
} else {
    foreground_lines.style("display", function (d) {
        return actives.every(function (brushObj) {
            return brushObj.extent[0] <= brushObj.dimension.scale(d[brushObj.dimension.name]) && brushObj.dimension.scale(d[brushObj.dimension.name]) <= brushObj.extent[1];
        }) ? null : "none";
    });
}
}

function parallel_coordinates_plot(filter_type, filter, labels) {

    var svg = d3.selectAll("#pcNode"),
        margin = { top: 30, right: 50, bottom: 30, left: 50 },
        width = document.getElementById('pcDiv').offsetWidth - margin.left - margin.right,
        height = document.getElementById('pcDiv').offsetHeight - margin.top - margin.bottom;

    svg.selectAll('*').remove()

    d3.csv(`data_final.csv`, function (error, data) {
        let features = [
            'Tempo',
            'Energy',
            'Danceability',
            'Loudness',
            'Liveness',
            'Valence',
            'Acousticness',
            'Speechiness'
        ]

        let g = svg.append("g").attr("transform", "translate(" + 40 + "," + 40 + ")");
        
        let filtered_data = []

        if (filter_type == 'None') {
            filtered_data = data;
        }
        else if (filter_type == 'Range') {
            filter_attribute = filter[0];
            filter_threshold = filter[1];
            for (let i = 0; i < data.length; i++) {
                if (Number(data[i][filter_attribute]) >= Number(filter_threshold)) {
                    filtered_data.push(data[i])
                }
            }
        } 
        else {
            // console.log(filter);
            for (let i = 0; i < data.length; i++) {
                if (data[i][filter_type] == filter) {
                    // console.log('yess');
                    filtered_data.push(data[i])
                }
            }
        }

        // For each dimension, I build a linear scale. I store all in a y object
        var y = {}
        for (i in features) {
            let name = features[i]

            let maxValue = d3.max(data, function (d) { return Number(d[name]); });
            let minValue = d3.min(data, function (d) { return Number(d[name]); });

            let eps = (maxValue - minValue)/8;

            y[name] = d3.scaleLinear()
                .domain([minValue - eps, maxValue + eps]) // --> Same axis range for each group
                // --> different axis range for each group --> .domain( [d3.extent(data, function(d) { return +d[name]; })] )
                .range([height, 0])
        }
        
        // console.log(filtered_data.length);
        
        data = filtered_data

        // Only keep the features we want
        data = data.map(function (d) {
            obj = {}
            for (let i = 0; i < features.length; i++) {
                obj[features[i]] = d[features[i]]
            }
            return obj;
        })

        
        var color = d3.scaleOrdinal()
            .domain(["a", "b", "c"])
            .range(["rgb(96,208,164)", "rgb(255,116,16)", "rgb(29,108,171)"])
            // .range(["rgb(0,0,255)", "rgb(0,255,0)", "rgb(255,0,0)"])


        

        // Build the X scale -> it find the best position for each Y axis
        x = d3.scalePoint()
            .range([0, width])
            .domain(features);

        // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
        function path(d) {
            return d3.line()(features.map(function (p) { return [x(p), y[p](d[p])]; }));
        }

        // Draw the lines
        g
            .selectAll("myPath")
            .data(data)
            .enter()
            .append("path")
            .attr("class", function (d, i) { return "line " + "c" + Math.floor(Math.random() * 3) }) // 2 class for each line: 'line' and the group name
            .attr("d", path)
            .style("fill", "none")
            .style("stroke", function (d, i) { return (color(Math.floor(Math.random() * 3))) })
        
        // Draw the axis:
        g.selectAll("myAxis")
            // For each dimension of the dataset I add a 'g' element:
            .data(features).enter()
            .append("g")
            .attr("class", "axis")
            // I translate this element to its right position on the x axis
            .attr("transform", function (d) { return "translate(" + x(d) + ")"; })
            // And I build the axis with the call function
            .each(function (d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d])); })
            // Add axis title
            .append("text")
            .style("text-anchor", "middle")
            .style("font-size", 15)
            .attr("y", "-10px")
            .text(function (d) { return d; })
            .style("fill", "white")
    });
    
}