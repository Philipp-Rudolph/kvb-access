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
import joinStationWithStairsAndElevators from '@/utils/joinStationWithStairsAndElevators'
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

    const mergedData = joinStationWithStairsAndElevators(
      stationsData.features,
      stationLocations.features,
      stairsData.features,
      elevatorsData.features,
    )

    this.mapIcons = {
      stairs: setupMap.createIcon('/src/assets/icons/escalator.png'),
      elevators: setupMap.createIcon('/src/assets/icons/elevator.png'),
      stations: setupMap.createIcon('/src/assets/icons/train.png'),
    }

    this.map = setupMap.init(this.$refs.mapContainer)
    this.setupMarkers(
      mergedData.mergedStairsData,
      mergedData.mergedElevatorData,
      mergedData.mergedStationLocationData,
    )
    this.attachZoomListener()
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

    attachZoomListener() {
      const stairsMarkers = document.querySelectorAll('.stairs-marker')
      const elevatorsMarkers = document.querySelectorAll('.elevator-marker')

      // Function to update visibility based on zoom level
      const updateMarkersVisibility = () => {
        const zoomLevel = this.map.getZoom()
        if (zoomLevel <= 15) {
          // Hide markers if zoom level is <= 15
          stairsMarkers.forEach((marker) => {
            marker.style.visibility = 'hidden'
          })
          elevatorsMarkers.forEach((marker) => {
            marker.style.visibility = 'hidden'
          })
        } else {
          // Show markers if zoom level is > 15
          stairsMarkers.forEach((marker) => {
            marker.style.visibility = 'visible'
          })
          elevatorsMarkers.forEach((marker) => {
            marker.style.visibility = 'visible'
          })
        }
      }

      // Initial visibility check on map load
      updateMarkersVisibility()

      // Attach zoom event listener to handle zoom changes dynamically
      this.map.on('zoomend', () => {
        updateMarkersVisibility()
      })
    },

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
  opacity: 0.2;
}

.disorder {
  opacity: 1;
  border: 2px solid red;
  /* red aura shadow */
  box-shadow:
    0 0 40px rgba(255, 0, 0, 0.9),
    0 0 60px rgba(255, 255, 255, 0.6);
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
  box-shadow:
    0 0 150px rgba(255, 60, 60, 1),
    /* Brighter red */ 0 0 200px rgba(0, 255, 255, 1),
    /* Brighter cyan */ 0 0 400px rgba(255, 255, 255, 0.8); /* Brighter white glow */
  animation: box-shadow-aurora 2s infinite alternate-reverse ease-in-out;
}

@keyframes box-shadow-aurora {
  0% {
    box-shadow:
      0 0 120px rgba(255, 80, 80, 0.9),
      0 0 250px rgba(0, 200, 255, 0.8),
      0 0 350px rgba(255, 255, 255, 0.6);
  }
  50% {
    box-shadow:
      0 0 180px rgba(255, 50, 50, 1),
      0 0 350px rgba(0, 255, 255, 1),
      0 0 450px rgba(255, 255, 255, 0.9);
  }
  100% {
    box-shadow:
      0 0 150px rgba(255, 120, 120, 0.9),
      0 0 300px rgba(50, 220, 255, 0.8),
      0 0 400px rgba(255, 255, 255, 0.7);
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
