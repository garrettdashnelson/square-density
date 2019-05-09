var dataSources = [
	{'name': 'Boston', 'src': 'ma.json'}
	];

var mapOptions = {
    zoomControl: false,
    boxZoom: false,
    doubleClickZoom: false,
    dragging: false,
    zoomSnap: 0
};

var mainMap = L.map('main-map', mapOptions);
var locatorMap = L.map('locator-map', mapOptions);

var basemapLayer = L.tileLayer('https://api.maptiler.com/maps/positron/{z}/{x}/{y}.png?key=Tth2viuZXT54gsj6plPV', {
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 1,
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>',
    crossOrigin: true
}).addTo(locatorMap);

var locatorRect = L.layerGroup().addTo(locatorMap);

var satellite = L.tileLayer('https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=Tth2viuZXT54gsj6plPV', {
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 1,
    attribution: 'OpenMapTiles',
    crossOrigin: true
}).addTo(mainMap);

var pixelDrawingLayer = L.layerGroup().addTo(mainMap);

var chartSvg = d3.select('#chart-svg');
var chartG = chartSvg.append('g');
var bars = chartG.selectAll('rect');

var chartWidth = chartSvg.node().getBoundingClientRect().width;

var chartX = d3.scaleBand()
	.range([0,chartWidth])
	.paddingInner(0.1)
    .paddingOuter(3);

var chartY = d3.scaleLinear()
	.range([0,48]);

var iteratorTick = 0;

loadData(dataSources[0]);

function loadData(city) {

	var dataSrc = './data/' + city['src'];
	d3.json(dataSrc).then(renderData);

}

function renderData(data) {
	
	locatorMap.fitBounds(flipCoords(data['bbox']),{'padding': [20,20]});

    chartY
        .domain([0,d3.max(data['pixels'], function(d){ return +d['pop']; })]);

    chartX
        .domain(data['pixels'].map(function(d,i){ return i; }));

	bars
	 .data(data['pixels'])
	 .enter()
	 .append('rect')
	 .attr('class','bar')
	 .attr('x', function(d,i){ return chartX(i); })
	 .attr('y', function(d){ return (48-chartY(d['pop']))/2; })
	 .attr('width', chartX.bandwidth())
	 .attr('height', function(d){ return chartY(d['pop']); })
     .on('click',function(d,i,n){ iteratorTick = i; mapHandle(d,i,this); });

    iterator();
    setInterval(iterator,7000);

}

function mapHandle(d,i,t) { 

    pixelDrawingLayer.clearLayers();
    locatorRect.clearLayers();

        var ul = d.ul.slice().reverse();
        var lr = d.lr.slice().reverse();

        mainMap.fitBounds([ul, lr], { padding: [15, 15] });
        L.rectangle([
            [ul, lr]
        ], { color: "#fff", weight: 8, opacity: 0.7, fill: false }).addTo(pixelDrawingLayer);
        L.rectangle([
            [ul, lr]
        ], { stroke: false, fill: true, fillColor: '#ff5e27', fillOpacity: 0.8 }).addTo(locatorRect);

        d3.select("#pop-count").text(d["pop"].toLocaleString());
        d3.select("#pop-rank").text(i + 1);
        d3.selectAll('.bar').classed('bar-selected',false);
        d3.select(t).classed('bar-selected',true);
}

function iterator() {
    console.log('fired' + iteratorTick);
    var s = d3.select(d3.selectAll('.bar').nodes()[iteratorTick]);
    mapHandle(s.data()[0],iteratorTick,s.nodes()[0]);
    (iteratorTick > 199) ? iteratorTick = 0 : iteratorTick++;
}


function flipCoords(c) {
	return [c[0].reverse(),c[1].reverse()];
}




// var satellite = L.tileLayer.wms('http://tiles.arcgis.com/tiles/hGdibHYSPO59RG1h/arcgis/rest/', 
// 	{layers: 'USGS_Orthos_2013_2014'}).addTo(mainMap);
/***


$.getJSON('./data/nh.json', parsePixels)

function parsePixels(p) {

    locatorMap.fitBounds([p['bbox'][0].slice().reverse(), p['bbox'][1].slice().reverse()]);

    var pixels = p.pixels;
    var t = pixels.length;

    var i = 0;

    iterateMap();
    $("#info-box").show();
    var loop = setInterval(iterateMap, 7000);

    function iterateMap() {

        pixelDrawingLayer.clearLayers();
        locatorRect.clearLayers();

        var ul = pixels[i].ul.slice().reverse();
        var lr = pixels[i].lr.slice().reverse();

        mainMap.fitBounds([ul, lr], { padding: [15, 15] });
        L.rectangle([
            [ul, lr]
        ], { color: "#fff", weight: 8, opacity: 0.7, fill: false }).addTo(pixelDrawingLayer);
        L.rectangle([
            [ul, lr]
        ], { stroke: false, fill: true, fillColor: '#ff5e27', fillOpacity: 0.8 }).addTo(locatorRect);

        $("#pop-count").text(pixels[i]["pop"].toLocaleString());
        $("#pop-rank").text(i + 1);

        if (i == t - 1) { i = 0; } else { i++; }
    }

}

**/