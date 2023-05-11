function artistBarChart(filter_type, filter) {

    let margin = {
        top: 20,
        right: 50,
        bottom: 0,
        left: 80
    },
        width = document.getElementById('histogramDiv').offsetWidth - margin.left - margin.right,
        height = document.getElementById('histogramDiv').offsetHeight * 0.9 - margin.top - margin.bottom;

    d3.selectAll('#histogramNode').selectAll('*').remove()

    var svg = d3.select('#histogramNode')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.left + margin.right)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

    let parseDate = d3.timeParse("%Y-%m-%d");

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function (d) {
            return "<strong>Artist: </strong><span class='details'>" + d[0] + "<br></span>"
                + "<strong>Tracks: </strong><span class='details'>" + d[1] + "<br></span>"
        })

    svg.call(tip);

    d3.csv(`data_final.csv`, function (error, data) {

        unique_artists = [...new Set(data.map(item => item['Artist']))];

        // console.log(unique_artists);

        artist_track_count = {}

        unique_artists.forEach(function (artist) {
            artist_track_count[artist] = 0;
        })

        let SHOW_COUNT = 30

        data.map(function (d) {
            if (filter_type == 'None') {
                artist_track_count[d['Artist']] += 1
            }
            else if (filter_type == 'Range') {
                filter_attribute = filter[0];
                filter_threshold = filter[1];
                if (d[filter_attribute] >= filter_threshold) {
                    artist_track_count[d['Artist']] += 1
                }
            } else {
                if (d[filter_type] == filter) {
                    artist_track_count[d['Artist']] += 1
                }
            }
        });

        let items = Object.keys(artist_track_count).map(function (key) {
            return [key, artist_track_count[key]];
        });

        items.sort(function (first, second) {
            return second[1] - first[1];
        });

        let show_items = items.slice(0, SHOW_COUNT);

        // console.log(show_items);
        let flag = 0

        for (let i = 0; i < show_items.length; i++) {
            // console.log(show_items[i][1]);
            if (show_items[i][1] == 0) {
                show_items = show_items.slice(0, i);
                break;
            }
        }

        // console.log(show_items);

        // let merge_items = items.slice(SHOW_COUNT, items.length);

        // merge_sum = 0;

        // for (let i = 0; i < merge_items.length; i++) {
        //     merge_sum += merge_items[i][1];
        // }

        // show_items.push(["Others", merge_sum])



        // the scale
        let x = d3.scaleBand().range([0, width])
        let y = d3.scaleLinear().range([height, 0])

        let maxFrequency = d3.max(show_items, function (d) { return d[1]; });

        let xScale = x.domain(show_items.map(function (d) { return d[0]; }))
        let yScale = y.domain([0, maxFrequency])

        // for the width of rect
        // let xBand = d3.scaleBand().domain(d3.range(-1, ordinals.length)).range([0, width])

        // let xAxis = svg.append("g") //Another group element to have our x-axis grouped under one group element
        //     .attr("transform", "translate(0," + height + ")") // We then use the transform attribute to shift our x-axis towards the bottom of the SVG.
        //     .call(d3.axisBottom(xScale)) //We then insert x-axis on this group element using .call(d3.axisBottom(x)).
        //     .selectAll('text').style('fill', 'white').attr('transform', `translate(0, 10) rotate(-45)`)

        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height + 25)
            .attr('text-anchor', 'middle')
            .style("color", "green")
            .style("fill", "white")
            // .attr("font-weight", "bolder")
            .text("Top " + show_items.length + " Artists")

        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height/2)
            .attr('y', -40)
            .attr('text-anchor', 'middle')
            .style("color", "green")
            .style("fill", "white")
            // .attr("font-weight", "bolder")
            .text("Track Count")

        // y axis
        let yAxis = svg.append('g')
            .attr('class', 'y axis')
            .call(d3.axisLeft(yScale))
            // .style('fill', 'white')
            .selectAll('text').style('fill', 'white')



        svg.selectAll(".bar") //created dynamic bars with our data using the SVG rectangle element.
            .data(Object.values(show_items))
            .enter().append("rect")
            .attr("fill", "rgb(33,181,113)")
            .attr("x", function (d) { return xScale(d[0]) + xScale.bandwidth() / 4; })  //x scale created earlier and pass the year value from our data.
            .attr("y", function (d) { return yScale(d[1]); }) // pass the data value to our y scale and receive the corresponding y value from the y range.
            .attr("width", xScale.bandwidth() / 2) //width of our bars would be determined by the scaleBand() function.
            .attr("height", function (d) { return height - yScale(d[1]); })
            // Tooltips
            .style("stroke", "white")
            .style('stroke-width', 0.3)
            .on('mouseover', function (d) {
                tip.show(d);

                d3.select(this)
                    .style("opacity", 0.4)
                    .style("stroke", "white")
                    .style("stroke-width", 3);

                d3.select(this).style('cursor', 'pointer')
            })
            .on('click', function (d) {
                tip.hide(d);
                d3.select(this)
                    .style("opacity", 0.4)
                    .style("stroke", "white")
                    .style("stroke-width", 3)
                    .transition()
                    .duration(200)
                    .style('opacity', 0.8);
                console.log(d);

                heatMap('Artist', d[0]);
                // artistBarChart('Artist', d[0]);
                genreDonut('Artist', d[0]);
                treemap('Artist', d[0]);
                parallel_coordinates_plot('Artist', d[0], 0);

                document.getElementById('resetButton').style.visibility = 'visible'
            })
            .on('mouseout', function (d) {
                tip.hide(d);
                d3.select(this)
                    .style("opacity", 1)
                    .style("stroke", "white")
                    .style("stroke-width", 0.3);
            });

    });

}
