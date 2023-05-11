function treemap(filter_type, filter) {
    var document_width = document.getElementById('treemapDiv').offsetWidth
    // set the dimensions and margins of the graph
    var margin = { top: 20, right: 10, bottom: 20, left: 10 },
        width = document.getElementById('treemapDiv').offsetWidth - margin.left - margin.right,
        height = document.getElementById('treemapDiv').offsetHeight - margin.top - margin.bottom;

    d3.selectAll('#treemap').selectAll('*').remove()

    // append the svg object to the body of the page
    // append a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#treemap").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function (d) {
            return "<strong>Key: </strong><span class='details'>" + d.data.name + "<br></span>"
                + "<strong>Tracks: </strong><span class='details'>" + d.data.value + "<br></span>"
        })

    svg.call(tip);

    let keyMap = {
        0: "C",
        1: "C#",
        2: "D",
        3: "D#",
        4: "E",
        5: "F",
        6: "F#",
        7: "G",
        8: "G#",
        9: "A",
        10: "A#",
        11: "B"
    }

    let reverseKeyMap = {
        "C": 0,
        "C#": 1,
        "D": 2,
        "D#": 3,
        "E": 4,
        "F": 5,
        "F#": 6,
        "G": 7,
        "G#": 8,
        "A": 9,
        "A#": 10,
        "B": 11
    }

    // get the data
    d3.csv(`data_final.csv`, function (error, data) {

        unique_keys = [...new Set(data.map(item => item['Key']))];

        key_track_count = {}

        unique_keys.forEach(function (key) {
            key_track_count[key] = 0;
        })

        data.map(function (d) {
            if (filter_type == 'None') {
                key_track_count[d['Key']] += 1
            } 
            else if (filter_type == 'Range') {
                filter_attribute = filter[0];
                filter_threshold = filter[1];
                if (d[filter_attribute] >= filter_threshold) {
                    key_track_count[d['Key']] += 1
                }
            } else {
                if (d[filter_type] == filter) {
                    key_track_count[d['Key']] += 1
                }
            }
        })

        key_track_count['default'] = 0

        let items = Object.keys(key_track_count).map(function (key) {
            return [key, key_track_count[key]];
        });

        items.sort(function (first, second) {
            return second[1] - first[1];
        });

        let show_items = items;

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

        let donut_data = Array()
        donut_data[0] = {
            'name': 'Origin',
            'parent': '',
            'value': ''
        }

        for (let i = 0; i < show_items.length; i++) {
            donut_data[i + 1] = {
                'name': keyMap[parseInt(show_items[i][0])],
                'parent': 'Origin',
                'value': String(show_items[i][1])
            }
        }

        // stratify the data: reformatting for d3.js
        var root = d3.stratify()
            .id(function (d) { return d.name; })   // Name of the entity (column name is name in csv)
            .parentId(function (d) { return d.parent; })   // Name of the parent (column name is parent in csv)
            (donut_data);
        root.sum(function (d) { return +d.value })   // Compute the numeric value for each entity

        // Then d3.treemap computes the position of each element of the hierarchy
        // The coordinates are added to the root object above
        d3.treemap()
            .size([width, height])
            .padding(4)
            (root)

        // use this information to add rectangles:
        svg
            .selectAll("rect")
            .data(root.leaves())
            .enter()
            .append("rect")
            .attr('x', function (d) { return d.x0; })
            .attr('y', function (d) { return d.y0; })
            .attr('width', function (d) { return d.x1 - d.x0; })
            .attr('height', function (d) { return d.y1 - d.y0; })
            .style("stroke", "black")
            .style("fill", "rgb(33,181,113)")
            // Tooltips
            // .style("stroke", "white")
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
                
                heatMap('Key', reverseKeyMap[d.data.name]);
                artistBarChart('Key', reverseKeyMap[d.data.name]);
                genreDonut('Key', reverseKeyMap[d.data.name]);
                // treemap('Key', reverseKeyMap[d.data.name]);
                parallel_coordinates_plot('Key', reverseKeyMap[d.data.name], 0);

                document.getElementById('resetButton').style.visibility = 'visible'
            })
            .on('mouseout', function (d) {
                tip.hide(d);
                d3.select(this)
                    .style("opacity", 1)
                    .style("stroke", "black")
                    .style("stroke-width", 0.3);
            });

        // and to add the text labels
        svg
            .selectAll("text")
            .data(root.leaves())
            .enter()
            .append("text")
            .attr("x", function (d) { return d.x0 + 3 })    // +10 to adjust position (more right)
            .attr("y", function (d) { return d.y0 + 15 })    // +20 to adjust position (lower)
            .text(function (d) { return d.data.name })
            .attr("font-size", "15px")
            .attr("fill", "white")
    });
}