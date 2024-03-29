var dataSources = [
    { 'name': 'Atlanta', 'src': 'clipped_0.json' },
    { 'name': 'New York', 'src': 'clipped_2.json' },
    { 'name': 'Miami', 'src': 'clipped_3.json' },
    { 'name': 'Dallas', 'src': 'clipped_4.json' },
    { 'name': 'Salt Lake City', 'src': 'clipped_5.json' },
    { 'name': 'Denver', 'src': 'clipped_6.json' },
    { 'name': 'Boston', 'src': 'clipped_7.json' },
    { 'name': 'Upper Valley NH-VT', 'src': 'clipped_8.json' },
    { 'name': 'Detroit', 'src': 'clipped_9.json' },
    { 'name': 'Chicago', 'src': 'clipped_10.json' },
    { 'name': 'Washington DC', 'src': 'clipped_11.json' },
    { 'name': 'Minneapolis', 'src': 'clipped_12.json' },
    { 'name': 'San Francisco-Oakland', 'src': 'clipped_14.json' },
    { 'name': 'Los Angeles', 'src': 'losangeles.json' }
    ];

var timer;
var pause = false;
var tick = 0;

if(embedded) {
    pause = true;
}

var hash = window.location.hash;

if(hash.length>0) {
    var singleView = true;
    pause = true;
    params = hash.substring(1);
    tick = +params.substring(2);
}

var mapOptions = {
    zoomControl: false,
    boxZoom: false,
    doubleClickZoom: false,
    dragging: false,
    zoomSnap: 0.5,
    keyboard: false,
    scrollWheelZoom: false,
    tap: false
};

var mainMap = L.map('main-map', mapOptions);
var locatorMap = L.map('locator-map', mapOptions);

// var basemapLayer = new L.StamenTileLayer("toner-lite").addTo(locatorMap);

var basemapLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    // tileSize: 512,
    // zoomOffset: -1,
    minZoom: 1,
    attribution: 'Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL.',
    crossOrigin: true
}).addTo(locatorMap);

var locatorRect = L.layerGroup().addTo(locatorMap);

// var satellite = L.tileLayer('https://{s}.aerial.maps.api.here.com/maptile/2.1/maptile/newest/satellite.day/{z}/{x}/{y}/256/png?app_id=HzFg4kloWFLT1TY60fRn&app_code=Vgl9rSG8jtpKwcHdXqIsKg',
// {
//     tileSize: 256,
//     subdomains: '1234',
//     attribution: 'HERE'
// }).addTo(mainMap)

var satellite = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}', {
    // tileSize: 512,
    // zoomOffset: -1,
    minZoom: 1,
    attribution: 'USGS',
    crossOrigin: true
}).addTo(mainMap);

var pixelDrawingLayer = L.layerGroup().addTo(mainMap);

var chartSvg = d3.select('#chart-svg');
var chartG = chartSvg.append('g');

var chartWidth = chartSvg.node().getBoundingClientRect().width;
var chartHeight = 48;

var chartX = d3.scaleBand()
    .range([0, chartWidth])
    .paddingInner(0.1)
    .paddingOuter(3);

var chartY = d3.scaleLinear()
    .range([0, chartHeight]);

var cityOptions = d3.select("#city-options");

cityOptions.append('ul').selectAll('li')
    .data(dataSources)
    .enter()
    .append('li')
    .text(function(d) { return d.name; })
    .on('click', function(d) { chooserClickHandle(d); });

var cityChosen = d3.select("#city-chosen")
    .on("click", toggleCityOptions);

var aboutBox = d3.select("#about-box");

d3.selectAll(".about-toggle")
    .on("click", function() { aboutBox.style('display') == 'none' ? aboutBox.style('display', 'block') : aboutBox.style('display', 'none'); });

var pauseToggle = d3.select('#pause-toggle')
    .on("click", function(){ if(pause) { pause=false; mapHandle(tick); pauseToggle.selectAll('i').attr('class','fas fa-pause-circle'); } else { pause=true; clearTimeout(timer); pauseToggle.selectAll('i').attr('class','fas fa-play-circle'); } });

d3.select("#popout-box").on("click",function(){ window.open(window.location); });

initialize();

function initialize() {
    if(singleView) { var initialCity = dataSources[+params.substr(0,2)]; } else { var initialCity = dataSources[6]; }
    cityChosen.text(initialCity.name);
    loadData(initialCity);
}

function toggleCityOptions() {
    if (cityOptions.style('display') == 'block') {
        cityOptions.style('display', 'none');
        cityChosen.classed('city-chosen-filled', false);
    } else {
        cityOptions.style('display', 'block');
        cityChosen.classed('city-chosen-filled', true);
    }
}

function chooserClickHandle(d) {
    cityChosen.text(d.name);
    tick = 0;
    toggleCityOptions();
    loadData(d);
}

function loadData(city) {

    var dataSrc = './data/' + city['src'];
    d3.json(dataSrc).then(renderData);

}


function renderData(data) {

    // locatorMap.fitBounds(flipCoords(data['bbox']), { 'padding': [20, 20] });

    chartY
        .domain([0, d3.max(data['pixels'], function(d) { return +d['pop']; })]);

    chartX
        .domain(data['pixels'].map(function(d, i) { return i; }));

    var bars = chartG.selectAll('.bar')
        .data(data['pixels']);

    bars.enter().append('rect')
        .attr('class', 'bar')
        .attr('x', function(d, i) { return chartX(i); })
        .attr('y', function(d) { return (chartHeight - chartY(d['pop'])) / 2; })
        .attr('width', chartX.bandwidth())
        .attr('height', function(d) { return chartY(d['pop']); })
        .on('click', function(d, i) { mapHandle(i); });

    bars
        .transition()
        .duration(200)
        .attr('y', function(d) { return (chartHeight - chartY(d['pop'])) / 2; })
        .attr('height', function(d) { return chartY(d['pop']); });

    mapHandle(tick);

}

function mapHandle(i) {

    var bars = d3.selectAll('.bar');

    var selectedBar = d3.select(bars.nodes()[i]);

    // console.log(selectedBar);

    var d = selectedBar.data()[0];

    pixelDrawingLayer.clearLayers();
    locatorRect.clearLayers();

    var bounds = [
        [d.c[1], d.c[0]],
        [d.c[1] + 0.00833333, d.c[0] + 0.00833333]
    ];
    var outerBounds = [
        [d.c[1] - 0.05, d.c[0] - 0.05],
        [d.c[1] + 0.05833333, d.c[0] + 0.05833333]
    ];

    mainMap.fitBounds(bounds, { padding: [15, 15] });
    locatorMap.fitBounds(outerBounds);
    L.rectangle([
        bounds
    ], { color: "#cb7639", weight: 8, opacity: 0.9, fill: false }).addTo(pixelDrawingLayer);
    L.rectangle([
        bounds
    ], { stroke: false, fill: true, fillColor: '#cb7639', fillOpacity: 0.8 }).addTo(locatorRect);

    d3.select("#pop-count").text(d["pop"].toLocaleString());
    d3.select("#pop-rank").text(i + 1);
    bars.classed('bar-selected', false);
    selectedBar.classed('bar-selected', true);
    d3.select("#map-link").attr('href', 'https://tools.wmflabs.org/geohack/geohack.php?params=' + (d.c[1] + 0.004166665) + ';' + (d.c[0] + 0.004166665) + '_dim:1000')

    clearTimeout(timer);

    i == 199 ? i = 0 : i++;
    tick = i;
    if(!pause){ timer = setTimeout(function() { mapHandle(i) }, 7000); }

}


function iterator() {
    var s = d3.select(d3.selectAll('.bar').nodes()[iteratorTick]);
    mapHandle(s.data()[0], iteratorTick, s.nodes()[0]);
    (iteratorTick > 198) ? iteratorTick = 0: iteratorTick++;
}


function flipCoords(c) {
    return [c[0].reverse(), c[1].reverse()];
}