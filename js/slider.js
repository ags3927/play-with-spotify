function sliderBox() {
    var svg = d3.selectAll('#slider').attr('width', document.getElementById('sliderDiv').offsetWidth);
    //Using this selection to update the SVG everytime the function is called
    svg.selectAll("*").remove();
}