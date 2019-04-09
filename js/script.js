
var mapOptions = {
	zoomControl: false,
	boxZoom: false,
	doubleClickZoom: false,
	dragging: false,
	center: [42.350306, -71.066404],
	zoom: 14,
	zoomSnap: 0
}

var mainMap = L.map('main-map', mapOptions);
var locatorMap = L.map('locator-map', mapOptions).fitBounds([[42.422664, -71.208508],[42.268141, -70.939286]]);

var basemapLayer = L.tileLayer('https://api.maptiler.com/maps/positron/{z}/{x}/{y}.png?key=Tth2viuZXT54gsj6plPV',{
        tileSize: 512, 
        zoomOffset: -1,
        minZoom: 1,
        attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>',
        crossOrigin: true
      }).addTo(locatorMap);



var drawingLayer = L.layerGroup().addTo(mainMap);
var locatorSquare = L.layerGroup().addTo(locatorMap);

var satellite = L.tileLayer('https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=Tth2viuZXT54gsj6plPV',{
        tileSize: 512, 
        zoomOffset: -1,
        minZoom: 1,
        attribution: 'OpenMapTiles',
        crossOrigin: true
      }).addTo(mainMap);

// var satellite = L.tileLayer.wms('http://tiles.arcgis.com/tiles/hGdibHYSPO59RG1h/arcgis/rest/', 
// 	{layers: 'USGS_Orthos_2013_2014'}).addTo(mainMap);

$.getJSON('./json/boston-nasa.json', parsePixels)

function parsePixels(p) {

	var pixels = p.pixels;
	var t = pixels.length;

	var i = 0;

	iterateMap();
	$("#info-box").show();
	var loop = setInterval(iterateMap,7000);

	function iterateMap() {

			drawingLayer.clearLayers();
			locatorSquare.clearLayers();

			var ul = pixels[i].ul.slice().reverse();
			var lr = pixels[i].lr.slice().reverse();

			mainMap.fitBounds([ul,lr], { padding: [15,15] });
			L.rectangle([[ul,lr]],{ color: "#fff", weight: 8, opacity: 0.7, fill: false }).addTo(drawingLayer);
			L.rectangle([[ul,lr]],{ stroke: false, fill: true, fillColor: '#ff5e27', fillOpacity: 0.8 }).addTo(locatorSquare);

			$("#pop-count").text(pixels[i]["pop"].toLocaleString());
			$("#pop-rank").text(i+1);

			if(i==t-1) { i=0; } else { i++; }
		}

}

