<template>
  <div ref="mapContainer" id="map"></div>

  <SearchBar v-if="!isLoading" :data="searchBarData" @selectStation="handleStationSelect" />

  <!-- Show Description Bar if a marker is selected -->
  <FloatingActionBar
    v-if="isMarkerSelected"
    :data="selectedMarkerData"
    @close="closeMarkerSelection"
  />

  <!-- Show Welcome Bar if no marker is selected -->
  <FloatingActionBar
    v-else
    welcomeText="Deiner Plattform für barrierefreies Reisen in Köln! Hier findest du aktuelle Störungen von Rolltreppen und Aufzügen an KVB-Haltestellen, um deine Route optimal zu planen. Klicke auf eine Haltestelle oder nutze die Suchfunktion, um herauszufinden, welche Stationen uneingeschränkt zugänglich sind."
    :subText="subText"
    @close="closeMarkerSelection"
  />

  <LoadingView v-if="isLoading" />
</template>

<script>
import L from 'leaflet'
import 'leaflet.markercluster'
import setupMap from '/src/utils/setupMap'
import fetchData from '/src/utils/fetchData'
import joinStationWithStairsAndElevators from '@/utils/joinStationWithStairsAndElevators'
import FloatingActionBar from './FloatingActionBar.vue'
import LoadingView from './LoadingView.vue'
import SearchBar from './SearchBar.vue'
import { MarkerTypes } from '/src/types/MarkerTypes'

const API_URL = import.meta.env.VITE_API_BASE_URL

const DATA_URLS = {
  STAIRS: `${API_URL}/fahrtreppenstoerung/json`,
  ELEVATORS: `${API_URL}/aufzugsstoerung/json`,
  STATIONS: `${API_URL}/haltestellenbereiche/json`,
  STATION_LOCATIONS: `${API_URL}/haltestellen/json`,
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
      markerCluster: null,
      isLoading: true,
      searchBarData: [],
      subText: '',
    }
  },
  components: {
    FloatingActionBar,
    LoadingView,
    SearchBar,
  },
  async mounted() {
    const [stairsData, elevatorsData, stationsData, stationLocations] = await Promise.all(
      Object.values(DATA_URLS).map(fetchData),
    ).finally(() => {
      this.isLoading = false
    })

    const mergedData = joinStationWithStairsAndElevators(
      stationsData.features,
      stationLocations.features,
      stairsData.features,
      elevatorsData.features,
    )

    // Prepare data for SearchBar
    this.searchBarData = [
      ...mergedData.mergedStationLocationData.map((item) => ({
        item: item,
      })),
    ]

    this.mapIcons = {
      stairs: setupMap.createIcon('/assets/icons/escalator.png'),
      elevators: setupMap.createIcon('/assets/icons/elevator.png'),
      stations: setupMap.createIcon('/assets/icons/train.png'),
    }

    this.markerCluster = L.markerClusterGroup({
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: (zoom) => (zoom < 10 ? 80 : zoom < 15 ? 50 : 25),
      iconCreateFunction: function (cluster) {
        const count = cluster.getChildCount()
        return L.divIcon({
          html: `<div class="cluster-marker">${count}</div>`,
          className: 'cluster-marker disorder',
          iconSize: [40, 40],
        })
      },
      disableClusteringAtZoom: 10,
    })

    this.map = setupMap.init(this.$refs.mapContainer, this.markerCluster)

    if (!this.isLoading) {
      this.setupMarkers(
        mergedData.mergedStairsData,
        mergedData.mergedElevatorData,
        mergedData.mergedStationLocationData,
      )
    }
    this.attachZoomListener()

    const subText = `Es gibt aktuell ${
      mergedData.mergedStairsData.length
    } Störungen an Fahrtreppen und ${mergedData.mergedElevatorData.length} Störungen an Aufzügen.`
    this.subText = subText
  },
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
        if (zoomLevel < 16) {
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

    // Handle marker select from search bar
    async handleStationSelect(station) {
      const resolvedMarkers = await this.markers.stations

      const marker = await resolvedMarkers.find((m) => {
        return station.item.stationInfo.Haltestellenbereich === m._icon.id
      })

      if (marker) {
        this.map.setView(marker.getLatLng(), 16)
        this.handleMarkerClick(station.item, { type: { isStation: true } })
        marker.openPopup()
        marker._icon.style.opacity = 1
      }
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
  padding: 0.25rem !important;
  opacity: 0.2;

  height: 40px !important;
  width: 40px !important;
}

.disorder {
  opacity: 1;
  border: 2px solid red;
  /* red aura shadow */
  box-shadow:
    0 0 40px rgba(255, 0, 0, 0.9),
    0 0 60px rgba(255, 255, 255, 0.6);
}

.no-disorder {
  height: 25px !important;
  width: 25px !important;
  opacity: 0.1;
}

/* Hover state */
.icon:hover,
.leaflet-marker-icon:hover {
  filter: invert(0);
  background-color: #fff;
  box-shadow:
    0 0 100px rgba(255, 0, 0, 0.9),
    0 0 60px rgba(255, 255, 255, 0.6);
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

.cluster-marker {
  border-radius: 10%;
  text-align: center;
  font-size: 14px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  opacity: 0.8 !important;
}

.cluster-small {
  width: 30px;
  height: 30px;
}

.cluster-medium {
  width: 40px;
  height: 40px;
}

.cluster-large {
  width: 50px;
  height: 50px;
}

.leaflet-marker-icon.leaflet-cluster-anim {
  transition: transform 0.3s ease-in-out;
}

.leaflet-marker-line {
  stroke: rgba(0, 0, 0, 0.5);
  stroke-width: 2px;
}
</style>
