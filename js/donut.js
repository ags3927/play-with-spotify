function genreDonut(filter_type, filter) {
    var document_width = document.getElementById('genreDiv').offsetWidth
    // set the dimensions and margins of the graph
    var margin = { top: 210, right: 100, bottom: 70, left: 0.5 * document_width },
        width = document.getElementById('genreDiv').offsetWidth - margin.left - margin.right,
        height = document.getElementById('genreDiv').offsetHeight - 50 - margin.bottom,
        radius = Math.min(width, height) / 1.75;

    d3.selectAll("#genreNode").selectAll('*').remove()

    // append the svg object to the body of the page
    // append a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#genreNode").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function (d) {
            return "<strong>Genre: </strong><span class='details'>" + d.data.key + "<br></span>"
                + "<strong>Tracks: </strong><span class='details'>" + d.data.value + "<br></span>"
            // + "<strong>Genres: </strong><span class='details'>" + format(d.Genre.size) + "<br></span>"
        })

    svg.call(tip);

    // get the data
    d3.csv(`data_final.csv`, function (error, data) {
        unique_genres = [...new Set(data.map(item => item['Genre']))];

        // console.log(unique_artists);

        genre_track_count = {}

        unique_genres.forEach(function (genre) {
            genre_track_count[genre] = 0;
        })

        let SHOW_COUNT = 10

        data.map(function (d) {
            if (filter_type == 'None') {
                genre_track_count[d['Genre']] += 1
            } 
            else if (filter_type == 'Range') {
                filter_attribute = filter[0];
                filter_threshold = filter[1];
                if (d[filter_attribute] >= filter_threshold) {
                    genre_track_count[d['Genre']] += 1
                }
            } else {
                if (d[filter_type] == filter) {
                    genre_track_count[d['Genre']] += 1
                }
            }
        })

        genre_track_count['default'] = 0

        let items = Object.keys(genre_track_count).map(function (key) {
            return [key, genre_track_count[key]];
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

        let total_tracks = 0
        for (let i = 0; i < show_items.length; i++) {
            total_tracks += show_items[i][1]
        }

        let donut_data = {}
        for (let i = 0; i < show_items.length; i++) {
            donut_data[show_items[i][0]] = show_items[i][1]
        }

        var color = d3.scaleOrdinal()
            .domain(Object.keys(donut_data))
            .range(d3.schemeCategory10);

        // Compute the position of each group on the pie:
        var pie = d3.pie()
            .sort(null) // Do not sort group by size
            .value(function (d) { return d.value; })
        var data_ready = pie(d3.entries(donut_data))

        // The arc generator
        var arc = d3.arc()
            .innerRadius(radius * 0.5)         // This is the size of the donut hole
            .outerRadius(radius * 0.8)

        // console.log(radius);
        // console.log(arc.centroid(data_ready[0]));

        // Another arc that won't be drawn. Just for labels positioning
        var outerArc = d3.arc()
            .innerRadius(radius * 0.9)
            .outerRadius(radius * 0.9)

        // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
        svg
            .selectAll('allSlices')
            .data(data_ready)
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', function (d) { return (color(d.data.key)) })
            .attr("stroke", "white")
            .style("stroke-width", "2px")
            .style("opacity", 0.7)
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

                heatMap('Genre', d.data.key);
                artistBarChart('Genre', d.data.key);
                treemap('Genre', d.data.key);
                // genreDonut('Genre', d.data.key);
                parallel_coordinates_plot('Genre', d.data.key, 0);

                document.getElementById('resetButton').style.visibility = 'visible'
            })
            .on('mouseout', function (d) {
                tip.hide(d);
                d3.select(this)
                    .style("opacity", 1)
                    .style("stroke", "white")
                    .style("stroke-width", 0.3);
            });

        // Add the polylines between chart and labels:
        svg
            .selectAll('allPolylines')
            .data(data_ready)
            .enter()
            .append('polyline')
            .attr("stroke", "white")
            .style("fill", "none")
            .attr("stroke-width", 1)
            .attr('points', function (d) {
                var posA = arc.centroid(d) // line insertion in the slice
                var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
                var posC = outerArc.centroid(d); // Label position = almost the same as posB
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
                posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
                return [posA, posB, posC]
            })

        // Add the polylines between chart and labels:
        svg
            .selectAll('allLabels')
            .data(data_ready)
            .enter()
            .append('text')
            .text(function (d) { return d.data.key }) //+ ' ' + parseFloat(d.data.value).toFixed(2) + '%' })
            .style('fill', 'white')
            .attr('transform', function (d) {
                var pos = outerArc.centroid(d);
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
                return 'translate(' + pos + ')';
            })
            .style('text-anchor', function (d) {
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                return (midangle < Math.PI ? 'start' : 'end')
            })
    });
}