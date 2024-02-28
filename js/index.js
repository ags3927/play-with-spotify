function selectorOnClick() {
    let selectedAttribute = document.getElementById("attributeSelect").value;
    
    d3.csv(`data_final.csv`, function (error, data) {
        let minValue = d3.min(data, function (d) { return Number(d[selectedAttribute]); });;
        let maxValue = d3.max(data, function (d) { return Number(d[selectedAttribute]); });
        // if (selectedAttribute == "Loudness") {
        //     minValue = d3.min(data, function (d) { return -d[selectedAttribute]; });
        //     maxValue = d3.max(data, function (d) { return -d[selectedAttribute]; });    
        // } else {
        //     minValue = d3.min(data, function (d) { return d[selectedAttribute]; });
        //     maxValue = d3.max(data, function (d) { return d[selectedAttribute]; });
        // }
        // console.log('min = ' + minValue);
        // console.log('max = ' + maxValue);
        let rangeSlider = document.getElementById("attributeRange");
        rangeSlider.setAttribute("min", minValue);
        rangeSlider.setAttribute("max", maxValue);
        rangeSlider.setAttribute("step", (maxValue-minValue)/1000);
        rangeSlider.value = minValue;
        document.getElementById('sliderValueDisplay').innerHTML = minValue;
    }); 
}

function sliderOnChange() {
    let sliderValue = document.getElementById("attributeRange").value;
    document.getElementById('sliderValueDisplay').innerHTML = Number(sliderValue).toFixed(2);
}

function onUpdateClick() {
    let selectedAttribute = document.getElementById("attributeSelect").value;
    let sliderValue = document.getElementById("attributeRange").value;
    // console.log(selectedAttribute);
    // console.log(sliderValue);
    heatMap('Range', [selectedAttribute, sliderValue]);
    artistBarChart('Range', [selectedAttribute, sliderValue]);
    treemap('Range', [selectedAttribute, sliderValue]);
    genreDonut('Range', [selectedAttribute, sliderValue]);
    parallel_coordinates_plot('Range', [selectedAttribute, sliderValue]);

    document.getElementById('resetButton').style.visibility = 'visible';
}