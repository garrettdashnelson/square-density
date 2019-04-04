
var mapOptions = {
	zoomControl: false,
	boxZoom: false,
	doubleClickZoom: false,
	dragging: false,
	center: [42.350306, -71.066404],
	zoom: 14,
	zoomSnap: 0
}

var map = L.map('map', mapOptions);
var drawingLayer = L.layerGroup().addTo(map);

var satellite = L.tileLayer('https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=Tth2viuZXT54gsj6plPV',{
        tileSize: 512, 
        zoomOffset: -1,
        minZoom: 1,
        attribution: 'OpenMapTiles',
        crossOrigin: true
      }).addTo(map);

$.getJSON('./json/suffolk-pixels.json', parsePixels)

function parsePixels(p) {

	var pixels = p.pixels;
	var t = pixels.length;

	var i = 0;

	iterateMap();
	$("#info-box").show();
	var loop = setInterval(iterateMap,3000);

	function iterateMap() {

			drawingLayer.clearLayers();

			var ul = pixels[i].ul.reverse();
			var lr = pixels[i].lr.reverse();

			map.fitBounds([ul,lr], { padding: [15,15] });
			L.rectangle([[ul,lr]],{ color: "#fff", weight: 8, opacity: 0.7, fill: false }).addTo(drawingLayer);

			$("#pop-count").text(pixels[i]["pop"].toLocaleString());

			if(i>t) { i=0; } else { i++; }
		}

}

