function generate_stats_by_country(data, country_ids) {
    let cols = data.columns;
    // console.log(cols);
    let statsById = {}

    let counters = ["#", "Track", "Album", "Uri", "Country", "Country ID"]
    let dictionaries = ['Key', 'Album Type', 'Artist Type']
    let sets = ['Artist']

    country_ids.forEach(function (d) {
        cols.forEach(function (col) {
            statsById[d + col] = 0;

            if (dictionaries.includes(col)) {
                statsById[d + col] = {}
            }
            else if (sets.includes(col)) {
                statsById[d + col] = new Set()
            } else {
                statsById[d + col] = 0
            }
        });
    });

    // console.log(statsById['AREAcousticness']);

    data.forEach(function (d) {
        cols.forEach(function (col) {
            if (dictionaries.includes(col)) {
                if (d[col] in statsById[d['Country ID'] + col]) {
                    statsById[d['Country ID'] + col][d[col]] += 1;
                } else {
                    statsById[d['Country ID'] + col][d[col]] = 0;
                }
            }
            else if (sets.includes(col)) {
                // console.log(d['Country ID'])
                // console.log(col);
                // console.log(typeof statsById[d['Country ID'] + col]);
                statsById[d['Country ID'] + col].add(d[col]);
            } else if (counters.includes(col)) {
                statsById[d['Country ID'] + col] += 1;
            } else {
                statsById[d['Country ID'] + col] += Number(d[col]);
            }
        })
    });


    // console.log(statsById['AREAcousticness']);

    country_ids.forEach(function (d) {
        cols.forEach(function (col) {
            if (dictionaries.includes(col)) {

            }
            else if (sets.includes(col)) {

            } else if (counters.includes(col)) {

            } else {
                statsById[d + col] /= Math.max(statsById[d + '#'], 1);
            }
        })
    });

    // console.log(statsById['AREAcousticness']);

    return statsById;
}

function heatMap() {

    var svg = d3.selectAll('#node').attr('width', document.getElementById('nodeDiv').offsetWidth);
    //Using this selection to update the SVG everytime the function is called
    svg.selectAll("*").remove();

    removeElementsByClass('d3-tip n');


    var format = d3.format(",");

    // Set tooltips

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function (d) {
            return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>"
                + "<strong>Tracks: </strong><span class='details'>" + d["Track"] + "<br></span>"
                + "<strong>Artists: </strong><span class='details'>" + format(d.Artist.size) + "<br></span>"
                // + "<strong>Genres: </strong><span class='details'>" + format(d.Genre.size) + "<br></span>"
        })

    var margin = { top: 0, right: 0, bottom: 0, left: 10 }, s
    width = document.getElementById('nodeDiv').offsetWidth - margin.left - margin.right,
        height = document.getElementById('nodeDiv').offsetHeight - margin.top - margin.bottom;

    var color = d3.scaleThreshold()
        .domain([10000, 100000, 500000, 1000000, 5000000, 10000000, 50000000, 100000000, 500000000, 1500000000])
        .range(["rgb(247,255,251)", "rgb(222,247,235)", "rgb(198,239,219)", "rgb(158,225,202)", "rgb(107,214,174)", "rgb(66,198,146)", "rgb(33,181,113)", "rgb(8,156,81)", "rgb(8,107,48)", "rgb(3,43,19)"]);
   
    var path = d3.geoPath();

    zoomed = () => {
        const { x, y, k } = d3.event.transform
        let t = d3.zoomIdentity
        t = t.translate(x, y).scale(k).translate(50, 50)
        svg.attr("transform", t)
    }
    var zoom = d3.zoom()
        .scaleExtent([1, 30])
        .on("zoom", zoomed);

    var svg = d3.select("#node")
        .attr("width", width)
        .attr("height", height)
        .call(zoom)
        .append('g')
        .attr('class', 'map')
        .append("g").attr('transform', 'translate(50,50)');

    // function zoomFn() {
    //     d3.select('#divBox').select('svg').select('g').attr('transform', 'translate(' + d3.event.transform.x + ',' + d3.event.transform.y + ') scale(' + d3.event.transform.k + ')');
    // }

    var projection = d3.geoMercator()
        .scale(0.03939 * width + 0.104166 * height + 20)
        .translate([width / 2.3, height / 1.85]);

    var path = d3.geoPath().projection(projection);

    svg.call(tip);

    queue()
        .defer(d3.json, "../world_countries.json")
        .defer(d3.csv, "../data_final.csv")
        .await(ready);

    function ready(error, topology_data, data) {

        // console.log(topology_data.features);

        let topology = topojson.topology(topology_data.features);
        topology = topojson.presimplify(topology);

        let final_topology_data_simplified = []
        let country_ids = []

        for (i = 0; i < topology_data.features.length; i++) {
            final_topology_data_simplified.push(topojson.feature(topology, topology.objects[i]));
            country_ids.push(topology.objects[i].id);
        }

        let cols = data.columns;

        var statsById = generate_stats_by_country(data, country_ids);

        // console.log(statsById);

        final_topology_data_simplified.forEach(function (d) {
            cols.forEach(function (col) {
                // console.log(d.id + col);
                d[col] = statsById[d.id + col]
            })
        });

        svg.append("g")
            .attr("class", "countries")
            .selectAll("path")
            .data(final_topology_data_simplified)
            .enter().append("path")
            .attr("d", path)
            .style("fill", function (d) { return color(statsById[d.id + 'Artist'].size * 1976284.58498 /*127097.102186*/); })
            .style('stroke', 'white')
            .style('stroke-width', 0.5)
            .style("opacity", 1)
            // tooltips
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
                tip.show(d);

                d3.select(this)
                    .style("opacity", 0.4)
                    .style("stroke", "white")
                    .style("stroke-width", 3)
                    .transition()
                    .duration(200)
                    .style('opacity', 0.8);

                countrySpecificHist(d.properties.name);
                // lineGraph(d.properties.name);
                // latestCases(d.properties.name);
                // worldRace(d.properties.name);
                // worldPercent(d.properties.name);

                // d3.selectAll('.arrow').attr('visibility','visible')

                document.getElementById('resetButton').style.visibility = 'visible'
            })
            .on('mouseout', function (d) {
                tip.hide(d);

                d3.select(this)
                    .style("opacity", 1)
                    .style("stroke", "white")
                    .style("stroke-width", 0.3);
            });

        svg.append("path")
            .datum(topojson.mesh(final_topology_data_simplified, function (a, b) { return a.id !== b.id; }))
            // .datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
            .attr("class", "names")
            .attr("d", path);

        // var myimage = svg.append('image')
        //     .attr('xlink:href', './images/backArrow.png')
        //     .attr('class', 'arrow')
        //     .attr('width', 40)
        //     .attr('height', 200)
        //     .attr('x', 0)
        //     .attr('y', 0.9*height)
        //     .on('mouseover', function(d,i){
        //         d3.select(this).style('opacity', 0.6)
        //     })
        //     .on('mouseout', function(d,i){
        //         d3.select(this).style('opacity', 1)
        //     })
        //     .on('click', function(d,i){
        //         lineGraph('all')
        //         countrySpecificHist('all')
        //         d3.select(this).attr('visibility','hidden')
        //     })
        //     .attr('visibility','hidden')
    }
}