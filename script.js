var map = L.map("map", { attributionControl: false }).setView(
  [0.365693, 32.596951],
  13
);

//My icons style
var myIcon = L.icon({
  iconUrl: "download.png",
  iconSize: [40, 40],
  iconAnchor: [0, 40],
  popupAnchor: [-3, -7],
});

// Add a basemap layer
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap",
}).addTo(map);

// var marker = L.marker([0.365693, 32.596951], { icon: myIcon }).addTo(map);

function onMapClick(e) {
  console.log("You clicked the map at " + e.latlng);
  //   L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
}

// map.on("click", onMapClick);

// // How to pull data from rest
// const userAction = async () => {
//   const response = await fetch(
//     "https://services8.arcgis.com/6ffPcAaucGHw7mYO/arcgis/rest/services/TraininigPoints_view/FeatureServer"
//   );
//   const myJson = await response.json(); //extract JSON from the http response
//   // do something with myJson
//   console.log(myJson);
// };
// userAction();

// a Leaflet marker is used by default to symbolize point features.
const ourpoint = L.esri
  .featureLayer({
    url: "https://services8.arcgis.com/6ffPcAaucGHw7mYO/arcgis/rest/services/TraininigPoints_view/FeatureServer/0",
    pointToLayer: function (geojson, latlng) {
      return L.marker(latlng, {
        icon: myIcon,
      });
    },
  })
  .addTo(map);

ourpoint.bindPopup(function (layer) {
  // console.log(layer.feature.properties);
  return L.Util.template(
    "<p>Points <strong>{esrignss_receiver}</strong> </p>",
    layer.feature.properties
  );
});

// STEP 2: DEFINE A CHART
// this is a static scatterplot chart definition for now, but it will
// soon become dynamic by responding to map and feature layer events
var initialChartData = {
  datasets: [
    {
      label: "Survey Points Distributions",
      // the data values are empty at this moment
      // and will be updated dynamically below
      data: [],
      backgroundColor: "green",
    },
  ],
};

var chartOptions = {
  scales: {
    x: {
      title: {
        display: true,
        text: "longitude",
      },
    },
    y: {
      title: {
        display: true,
        text: "latitude",
      },
    },
  },
  maintainAspectRatio: false,
  // turn off animations during chart data updates
  animation: false,
  // see STEP 4 below
  onHover: handleChartHover,
};

var chart = new Chart("myChart", {
  type: "scatter",
  data: initialChartData,
  options: chartOptions,
});

// STEP 3: MAKE THE CHART DYNAMIC BY ESTABLISHING MAP-TO-CHART COMMUNICATION
// show in the scatterplot only the features in the map's current extent
// by handling several events from both the map and feature layer
map.on("zoom move", updateChart);
ourpoint.on("load", updateChart);

function updateChart() {
  // reformat the features' attributes of interest into
  // the data array format required by the Chart.js scatterplot
  var scatterPlotDataArray = [];
  var piePlotData = [];
  var piePlotLebel = [];
  var pichartcolors = [];

  ourpoint.eachActiveFeature(function (e) {
    // loop over each active feature in the map extent and
    // push an object into the scatterPlotDataArray in this format:

    // {
    //   x: diameter attribute value,
    //   y: height attribute value,
    //   featureId: unique ID for chart-to-map communication in STEP 4
    // }

    scatterPlotDataArray.push({
      x: e.feature.geometry.coordinates[0],
      y: e.feature.geometry.coordinates[1],
      featureId: e.feature.id,
    });
    piePlotData.push(e.feature.properties.esrignss_speed);
    piePlotLebel.push(e.feature.id);
    pichartcolors.push(getRandomColor());
  });

  // assign the new scatterPlotDataArray to the chart's data property
  chart.data.datasets[0].data = scatterPlotDataArray;
  // assign the new scatterPlotDataArray to the chart's data property
  chartPie.data.datasets[0].data = piePlotData;
  chartPie.data.datasets[0].label = piePlotLebel;
  chartPie.data.labels = piePlotLebel;
  chartPie.data.datasets[0].backgroundColor = pichartcolors;

  // finally, instruct the chart to re-draw itself with the new data
  chartPie.update();

  // finally, instruct the chart to re-draw itself with the new data
  chart.update();
}

// STEP 4 (OPTIONAL): ESTABLISH CHART-TO-MAP COMMUNICATION
// up until now the map and feature layer inform the chart what to render,
// but interactions with the chart can also influence the map contents
function handleChartHover(event, elements, chartPie) {
  if (!elements.length) {
    // if there were no data elements found when hovering over the chart,
    // reset any previous styling overrides and return
    ourpoint.eachFeature(function (e) {
      e.setOpacity(1);
      e.setZIndexOffset(0);
    });

    return;
  }

  // otherwise, bring attention to the features on the map
  // that are currently being hovered over in the chart
  var hoverFeatureIds = elements.map(function (datum) {
    return chart.data.datasets[datum.datasetIndex].data[datum.index].featureId;
  });

  ourpoint.eachFeature(function (e, idx) {
    if (hoverFeatureIds.indexOf(e.feature.id) > -1) {
      e.setOpacity(1);
      e.setZIndexOffset(10000);
    } else {
      e.setOpacity(0.1);
    }
  });
}
// New piechart
var initialChartDataPc = {
  labels: [],
  datasets: [
    {
      label: [],
      data: [],
      backgroundColor: [],
    },
  ],
};

var chartPie = new Chart("myChartPie", {
  type: "doughnut",
  data: initialChartDataPc,
  options: {
    onHover: handleChartHover,
    responsive: true,
    aspectRatio: 2 | 1,
  },
});

function getRandomColor() {
  var letters = "0123456789ABCDEF".split("");
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
/// Chart for group data based on one of its attribute
// var ouData = {
//   labels: [],
//   datasets: [{ label: [], data: [], backgroundColor: [] }],
// };

// var groupChart = new Chart("groupChart", {
//   type: "doughnut",
//   data: ouData,
// });
