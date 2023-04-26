

function countrySpecificHist(country) {

    let parseDate = d3.timeParse("%Y-%m-%d");

    d3.csv(`data_final.csv`, function (error, data) {
        
        unique_artists = [...new Set(data.map(item => item['Artist']))];

        // console.log(unique_artists);

        artist_track_count = {}

        unique_artists.forEach(function (artist) {
            artist_track_count[artist] = 0;
        })

        let SHOW_COUNT = 10

        data.map(function (d) {
            if (country == 'all') {
                artist_track_count[d['Artist']] += 1
            } else {
                if (d['Country'] == country) {
                    artist_track_count[d['Artist']] += 1
                }
            }
        })

        // console.log(artist_track_count);

        let items = Object.keys(artist_track_count).map(function (key) {
            return [key, artist_track_count[key]];
        });

        items.sort(function (first, second) {
            return second[1] - first[1];
        });

        let show_items = items.slice(0, SHOW_COUNT);

        // console.log(show_items);
        let flag = 0

        for (let i=0; i < show_items.length; i++) {
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

        let margin = {
            top: 20,
            right: 50,
            bottom: 0,
            left: 80
        },
            width = document.getElementById('histogramDiv').offsetWidth - margin.left - margin.right,
            height = document.getElementById('histogramDiv').offsetHeight * 0.9 - margin.top - margin.bottom,
            radius = (Math.min(width, height) / 2) - 10,
            node

        d3.selectAll('#histogramNode').selectAll('*').remove()

        var svg = d3.select('#histogramNode')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.left + margin.right)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`)
        // .call(
        //     d3.zoom()
        //     .translateExtent([[0,0], [width, height]])
        //     .extent([[0, 0], [width, height]])
        //     .on('zoom', zoom)
        // )


        // the scale
        let x = d3.scaleBand().range([0, width])
        let y = d3.scaleLinear().range([height, 0])

        let maxFrequency = d3.max(show_items, function (d) { return d[1]; });

        let xScale = x.domain(show_items.map(function (d) { return d[0]; }))
        let yScale = y.domain([0, maxFrequency])

        // for the width of rect
        // let xBand = d3.scaleBand().domain(d3.range(-1, ordinals.length)).range([0, width])

        let xAxis = svg.append("g") //Another group element to have our x-axis grouped under one group element
            .attr("transform", "translate(0," + height + ")") // We then use the transform attribute to shift our x-axis towards the bottom of the SVG.
            .call(d3.axisBottom(xScale)) //We then insert x-axis on this group element using .call(d3.axisBottom(x)).
            .selectAll('text').style('fill', 'white').attr('transform', `translate(0, 10) rotate(-45)`)

        // y axis
        let yAxis = svg.append('g')
            .attr('class', 'y axis')
            .call(d3.axisLeft(yScale))
            .selectAll('text').style('fill', 'white')

        svg.selectAll(".bar") //created dynamic bars with our data using the SVG rectangle element.
            .data(Object.values(show_items))
            .enter().append("rect")
            .attr("fill", "rgb(33,181,113)")
            .attr("x", function (d) { return xScale(d[0]) + xScale.bandwidth()/4; })  //x scale created earlier and pass the year value from our data.
            .attr("y", function (d) { return yScale(d[1]); }) // pass the data value to our y scale and receive the corresponding y value from the y range.
            .attr("width", xScale.bandwidth()/2) //width of our bars would be determined by the scaleBand() function.
            .attr("height", function (d) { return height - yScale(d[1]); });

    });

    function type(d) {
        d.date = parseDate(d.date);
        d.confirmed = + parseInt(d.confirmed);
        d.recovered = + parseInt(d.recovered);
        d.active = + parseInt(d.active);
        d.deaths = + parseInt(d.deaths);
        return d;
    }

}
