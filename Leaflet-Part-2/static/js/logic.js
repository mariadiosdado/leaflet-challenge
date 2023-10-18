// Create the tile layer that will be the background of our map.
let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Initialize all the LayerGroups that we'll use.
let layers = {
    TECTONIC_PLATES: new L.LayerGroup(),
    EARTHQUAKES: new L.LayerGroup()
};
  
// Create the map with our layers.
let map = L.map("map", {
center: [40.73, -94.0059],
zoom: 3,
layers: [
  layers.TECTONIC_PLATES,
  layers.EARTHQUAKES
]
});

// Add our "streetmap" tile layer to the map.
streetmap.addTo(map);

// let baseMaps = {
//     "Earthquakes": streetmap
// };

// Create an overlays object to add to the layer control.
let overlays = {
  "tectonicplates": layers.TECTONIC_PLATES,
  "Earthquakes": layers.EARTHQUAKES
};

// Create a control for our layers, and add our overlays to it.
L.control.layers(streetmap, overlays).addTo(map);

// use response to get GeoJson data
let response = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// get GeoJson data
d3.json(response).then(function(data){

    //function styleInfo
    function styleInfo(feature){
        return{
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }

    // create function to get color according to depth
    function getColor(depth){
        if (depth > 90) return '#EA2C2C';
        else if (depth > 70) return '#EA822C';
        else if (depth > 50) return '#EE9C00';
        else if (depth > 30) return '#EECC00';
        else if (depth > 10) return '#D4EE00';
        else return '#98EE00';
    }
    // create radius function 
    function getRadius(magnitude){
        if (magnitude === 0){
            return 1;
        }
        return (magnitude)*4;
    }

    L.geoJson(data, {
        pointToLayer: function(feature, lat_lng){
            return L.circleMarker(lat_lng)
        },
        style: styleInfo,
        onEachFeature: function(feature, layer){
            layer.bindPopup('<h3>Location: ${feature.properties.place}</h3><h4>Magnitude: ${feature.properties.mag}<br>Depth: ${feature.geometry.coordinates[2]}</h4><br>Time: ${new Date(feature.properties.time)}');
        }
    }).addTo(map);

// Create a legend to display information about our map.
let info = L.control({
  position: "bottomright"
});

// When the layer control is added, insert a div with the class of "legend".
info.onAdd = function(map) {
  let div = L.DomUtil.create("div", "legend");
    let grades = [-10, 10, 30, 50, 70, 90];

    for (var i = 0; i < grades.length; i++){
        div.innerHTML += "<i style='background:" + getColor(grades[i] = 1) + "'></i>" +
        grades[i] + (grades[i + 1]?"&ndash;" + grades[i +1] + "<br>": "+");
    }

    return div;
};

// Add the info legend to the map.
info.addTo(map);

// add Tectonic plate GeoJson 

d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(tectData){

// add GeoJson layer
L.geoJson(tectData, {
  color: "orange", 
  weight : 2
}).addTo(tectonicplates);

tectonicplates.addTo(map);


});

});