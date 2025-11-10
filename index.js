const mapRootElementId = "mapRoot";
const bottomYearSelectId = "bottomYearSelect";
const topYearSelectId = "topYearSelect";
const topOpacityRangeId = "topOpacityRange";
const displayModeSelectId = "displayModeSelect";
const waterBoostCheckboxId = "waterBoostCheckbox";

const defaultCenterLatitude = 44.6;
const defaultCenterLongitude = 59.0;
const defaultZoomLevel = 9;

const imageryYears = [
  { label: "2023", layerId: "s2cloudless-2023_3857" },
  { label: "2021", layerId: "s2cloudless-2021_3857" },
  { label: "2020", layerId: "s2cloudless-2020_3857" },
  { label: "2019", layerId: "s2cloudless-2019_3857" },
  { label: "2018", layerId: "s2cloudless-2018_3857" },
  { label: "2016", layerId: "s2cloudless-2016_3857" },
];

function buildTileUrl(layerId) {
  return "https://{s}.tiles.maps.eox.at/wmts/1.0.0/" +
         layerId +
         "/default/g/{z}/{y}/{x}.jpg";
}

function nativeZoomFor(layerId) {
  if (layerId === "s2cloudless-2016_3857") {
    return 8;
  }
  return 12;
}

const mapInstance = L.map(mapRootElementId, {
  zoomControl: false,
  attributionControl: false
}).setView(
  [defaultCenterLatitude, defaultCenterLongitude],
  defaultZoomLevel
);

mapInstance.createPane("bottomImageryPane");
mapInstance.createPane("topImageryPane");

const bottomPaneEl = mapInstance.getPane("bottomImageryPane");
const topPaneEl = mapInstance.getPane("topImageryPane");

bottomPaneEl.classList.add("pane-bottom");
topPaneEl.classList.add("pane-top");

/* ensure panes are above the map canvas */
bottomPaneEl.style.zIndex = "200";
topPaneEl.style.zIndex = "210";

let bottomYearLayer = null;
let topYearLayer = null;

const bottomYearSelect = document.getElementById(bottomYearSelectId);
const topYearSelect = document.getElementById(topYearSelectId);
const topOpacityRange = document.getElementById(topOpacityRangeId);
const displayModeSelect = document.getElementById(displayModeSelectId);
const waterBoostCheckbox = document.getElementById(waterBoostCheckboxId);

function populateYearSelects() {
  for (const yearOption of imageryYears) {
    const optBottom = document.createElement("option");
    optBottom.value = yearOption.layerId;
    optBottom.textContent = yearOption.label;
    bottomYearSelect.appendChild(optBottom);

    const optTop = document.createElement("option");
    optTop.value = yearOption.layerId;
    optTop.textContent = yearOption.label;
    topYearSelect.appendChild(optTop);
  }

  bottomYearSelect.value = "s2cloudless-2018_3857";
  topYearSelect.value = "s2cloudless-2023_3857";
}

function setPaneClasses(mode, waterOn) {
  bottomPaneEl.className = "leaflet-pane pane-bottom " + mode + (waterOn ? " water-boost-on" : "");
  topPaneEl.className    = "leaflet-pane pane-top "    + mode + (waterOn ? " water-boost-on" : "");
  bottomPaneEl.style.zIndex = "200";
  topPaneEl.style.zIndex = "210";
}

function createImageryLayer(layerId, targetPane) {
  return L.tileLayer(buildTileUrl(layerId), {
    pane: targetPane,
    subdomains: ["a", "b", "c"],
    maxZoom: 19,
    maxNativeZoom: nativeZoomFor(layerId),
    crossOrigin: true
  });
}

function refreshImageryLayers() {
  const bottomLayerId = bottomYearSelect.value;
  const topLayerId = topYearSelect.value;
  const mode = displayModeSelect.value;
  const waterOn = waterBoostCheckbox.checked;

  setPaneClasses(mode, waterOn);

  if (bottomYearLayer) {
    mapInstance.removeLayer(bottomYearLayer);
  }
  if (topYearLayer) {
    mapInstance.removeLayer(topYearLayer);
  }

  bottomYearLayer = createImageryLayer(bottomLayerId, "bottomImageryPane");
  topYearLayer = createImageryLayer(topLayerId, "topImageryPane");

  bottomYearLayer.addTo(mapInstance);
  topYearLayer.addTo(mapInstance);

  applyTopOpacityFromSlider();
}

function applyTopOpacityFromSlider() {
  const paneOpacity = parseFloat(topOpacityRange.value);
  topPaneEl.style.opacity = String(paneOpacity);
}

function attachEventListeners() {
  topOpacityRange.addEventListener("input", applyTopOpacityFromSlider);
  topOpacityRange.addEventListener("change", applyTopOpacityFromSlider);
  bottomYearSelect.addEventListener("change", refreshImageryLayers);
  topYearSelect.addEventListener("change", refreshImageryLayers);
  displayModeSelect.addEventListener("change", refreshImageryLayers);
  waterBoostCheckbox.addEventListener("change", refreshImageryLayers);
}

function initialize() {
  populateYearSelects();
  attachEventListeners();
  refreshImageryLayers();
}

initialize();
