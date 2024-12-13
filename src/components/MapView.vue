<template>
  <div ref="mapContainer" id="map"></div>
  <FloatingActionBar
    v-if="isMarkerSelected"
    :isFilterBar="false"
    :data="selectedMarkerData"
    @close="closeMarkerSelection"
  />
</template>

<script>
import 'leaflet.markercluster'
import setupMap from '/src/utils/setupMap'
import fetchData from '/src/utils/fetchData'
// import joinStationMarker from '/src/utils/joinStationMarker'
import mergeStationLocation from '@/utils/mergeStationLocation'
import FloatingActionBar from './FloatingActionBar.vue'
import { MarkerTypes } from '/src/types/MarkerTypes'

const DATA_URLS = {
  STAIRS: '/api/stairs.json',
  ELEVATORS: '/api/elevators.json',
  STATIONS: '/api/stations.json',
  STATION_LOCATIONS: '/api/stations-location.json',
}

export default {
  name: 'MapView',
  data() {
    return {
      isMarkerSelected: false,
      selectedMarkerData: null,
      mapIcons: {},
      markers: {
        stairs: null,
        elevators: null,
        stations: null,
      },
      map: null,
    }
  },
  components: {
    FloatingActionBar,
  },
  async mounted() {
    const [stairsData, elevatorsData, stationsData, stationLocations] = await Promise.all(
      Object.values(DATA_URLS).map(fetchData),
    )

    const mergedStations = await mergeStationLocation(
      stationsData.features,
      stationLocations.features,
    )

    this.mapIcons = {
      stairs: setupMap.createIcon('/src/assets/icons/escalator.png'),
      elevators: setupMap.createIcon('/src/assets/icons/elevator.png'),
      stations: setupMap.createIcon('/src/assets/icons/train.png'),
    }

    this.map = setupMap.init(this.$refs.mapContainer)
    this.setupMarkers(stairsData.features, elevatorsData.features, mergedStations)
    // this.attachZoomListener()
  },
  computed() {},
  methods: {
    setupMarkers(stairs, elevators, stations) {
      this.markers.stairs = setupMap.addMarkers(
        stairs,
        this.mapIcons.stairs,
        MarkerTypes.STAIRS,
        (markerData) => {
          this.handleMarkerClick(markerData, { type: { isStairs: true } })
        },
      )
      this.markers.elevators = setupMap.addMarkers(
        elevators,
        this.mapIcons.elevators,
        MarkerTypes.ELEVATORS,
        (markerData) => {
          this.handleMarkerClick(markerData, { type: { isElevator: true } })
        },
      )
      this.markers.stations = setupMap.addMarkers(
        stations,
        this.mapIcons.stations,
        MarkerTypes.STATIONS,
        (markerData) => {
          this.handleMarkerClick(markerData, { type: { isStation: true } })
        },
      )
    },

    // attachZoomListener() {
    //   const stationMarkers = document.querySelectorAll('.station-marker')
    //   const stairsMarkers = document.querySelectorAll('.stairs-marker')
    //   const elevatorsMarkers = document.querySelectorAll('.elevator-marker')
    //   this.map.on('zoomend', () => {
    //     const zoomLevel = this.map.getZoom()
    //     if (zoomLevel <= 10) {
    //       stationMarkers.forEach((marker) => {
    //         marker.style.display = 'block'
    //       })
    //       stairsMarkers.forEach((marker) => {
    //         marker.style.display = 'none'
    //       })
    //       elevatorsMarkers.forEach((marker) => {
    //         marker.style.display = 'none'
    //       })
    //     } else {
    //       stationMarkers.forEach((marker) => {
    //         marker.style.display = 'none'
    //       })
    //       stairsMarkers.forEach((marker) => {
    //         marker.style.display = 'block'
    //       })
    //       elevatorsMarkers.forEach((marker) => {
    //         marker.style.display = 'block'
    //       })
    //     }
    //   })
    // },

    handleMarkerClick(markerData, typeData) {
      this.isMarkerSelected = true
      this.selectedMarkerData = { ...markerData, ...typeData }
    },
    closeMarkerSelection() {
      this.isMarkerSelected = false
    },
  },
}
</script>

<style>
/* Optional: style for the map container */
#map {
  height: 100vh;
  width: 100%;
}
.icon,
.leaflet-marker-icon {
  /* Visual appearance */
  /* filter: invert(1); */
  object-fit: contain;
  border-radius: 50%;
  background-color: #fff;
  transition:
    transform 0.3s ease-out,
    filter 0.3s ease-out,
    box-shadow 0.3s ease-out,
    width 0.3s ease-out,
    height 0.3s ease-out;

  /* Centering content (optional, if the icon contains text or image) */
  display: flex;
  justify-content: center;
  align-items: center;

  /* Add cursor for better UX */
  cursor: pointer;
  padding: 0.5rem !important;
}

/* Hover state */
.icon:hover,
.leaflet-marker-icon:hover {
  filter: invert(0);
  background-color: #fff;
  box-shadow:
    0 50px 100px rgba(213, 9, 9, 1),
    0 50px 150px rgb(0, 149, 255); /* Dynamic glow */
}

.station-marker {
  height: 30px !important;
  width: 30px !important;
}

/* Aurora Hover Effect */
.icon:hover {
  /* background: linear-gradient(45deg, #f3ec78, #af4261, #577399, #2b4f81, #0b2e59); */
  box-shadow:
    0 50px 100px rgba(213, 9, 9, 1),
    0 50px 150px rgb(0, 149, 255); /* Dynamic glow */
  background-size: 400% 400%;
  animation: box-shadow-aurora 2.5s ease-in-out infinite;
}

@keyframes box-shadow-aurora {
  0% {
    box-shadow:
      0 0 50px rgba(213, 9, 9, 1),
      0 0 75px rgb(0, 149, 255); /* Dynamic glow */
  }
  50% {
    box-shadow:
      0 0 250px rgba(213, 9, 9, 1),
      0 0 250px rgb(0, 149, 255); /* Dynamic glow */
  }
  100% {
    box-shadow:
      0 0 50px rgba(213, 9, 9, 1),
      0 0 75px rgb(0, 149, 255); /* Dynamic glow */
  }
}
/* Active state (optional) */
.icon:active {
  transform: scale(1.1); /* Slight shrink for a "pressed" effect */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4); /* Reduce glow */
}

.leaflet-popup-content-wrapper,
.leaflet-popup-tip {
  background-color: #0000004f !important;
  backdrop-filter: blur(10px);
  color: #fff !important;
  border-radius: 0.5rem;
}
</style>
