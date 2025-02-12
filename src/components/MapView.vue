<template>
  <div ref="mapContainer" id="map"></div>

  <!-- Show loading screen while fetching data -->
  <LoadingView v-if="isLoading" />

  <!-- Show "No Data Available" message if loading is complete but no data exists -->
  <LoadingView v-else-if="!hasData" message="Sorry, no data available. Please try again later." />

  <template v-else>
    <SearchBar :data="searchBarData" @selectStation="handleStationSelect" />

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
  </template>
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

const DATA_URLS = {
  STAIRS: `/api/fahrtreppenstoerung/json`,
  ELEVATORS: `/api/aufzugsstoerung/json`,
  STATIONS: `/api/haltestellenbereiche/json`,
  STATION_LOCATIONS: `/api/haltestellen/json`,
}

export default {
  name: 'MapView',
  data() {
    return {
      isMarkerSelected: false,
      selectedMarkerData: null,
      mapIcons: {},
      markers: {
        stairs: [],
        elevators: [],
        stations: [],
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
  computed: {
    hasData() {
      return (
        this.markers.stairs.length > 0 ||
        this.markers.elevators.length > 0 ||
        this.markers.stations.length > 0
      )
    },
  },
  async mounted() {
    try {
      const [stairsData, elevatorsData, stationsData, stationLocations] = await Promise.all(
        Object.values(DATA_URLS).map(fetchData),
      )

      if (!stairsData || !elevatorsData || !stationsData || !stationLocations) {
        throw new Error('Invalid or missing data')
      }

      const mergedData = joinStationWithStairsAndElevators(
        stationsData.features || [],
        stationLocations.features || [],
        stairsData.features || [],
        elevatorsData.features || [],
      )

      this.markers.stairs = mergedData.mergedStairsData || []
      this.markers.elevators = mergedData.mergedElevatorData || []
      this.markers.stations = mergedData.mergedStationLocationData || []

      this.searchBarData = this.markers.stations.map((item) => ({ item }))

      this.mapIcons = {
        stairs: setupMap.createIcon('/src/assets/icons/escalator.png'),
        elevators: setupMap.createIcon('/src/assets/icons/elevator.png'),
        stations: setupMap.createIcon('/src/assets/icons/train.png'),
      }

      this.markerCluster = L.markerClusterGroup({
        spiderfyOnMaxZoom: false,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        maxClusterRadius: (zoom) => (zoom < 10 ? 80 : zoom < 15 ? 50 : 25),
        iconCreateFunction: (cluster) => {
          return L.divIcon({
            html: `<div class="cluster-marker">${cluster.getChildCount()}</div>`,
            className: 'cluster-marker disorder',
            iconSize: [40, 40],
          })
        },
        disableClusteringAtZoom: 10,
      })

      this.map = setupMap.init(this.$refs.mapContainer, this.markerCluster)

      this.setupMarkers()

      this.attachZoomListener()

      this.subText = `Es gibt aktuell ${this.markers.stairs.length} Störungen an Fahrtreppen und ${this.markers.elevators.length} Störungen an Aufzügen.`
    } catch (error) {
      console.error('Error fetching marker data:', error)
      this.subText =
        'Leider konnten die Störungsdaten nicht geladen werden. Bitte versuche es später erneut.'
    } finally {
      this.isLoading = false
    }
  },
  methods: {
    setupMarkers() {
      this.markers.stairs = setupMap.addMarkers(
        this.markers.stairs,
        this.mapIcons.stairs,
        MarkerTypes.STAIRS,
        (markerData) => {
          this.handleMarkerClick(markerData, { type: { isStairs: true } })
        },
      )
      this.markers.elevators = setupMap.addMarkers(
        this.markers.elevators,
        this.mapIcons.elevators,
        MarkerTypes.ELEVATORS,
        (markerData) => {
          this.handleMarkerClick(markerData, { type: { isElevator: true } })
        },
      )
      this.markers.stations = setupMap.addMarkers(
        this.markers.stations,
        this.mapIcons.stations,
        MarkerTypes.STATIONS,
        (markerData) => {
          this.handleMarkerClick(markerData, { type: { isStation: true } })
        },
      )
    },

    attachZoomListener() {
      this.map.on('zoomend', () => {
        const zoomLevel = this.map.getZoom()
        document.querySelectorAll('.stairs-marker, .elevator-marker').forEach((marker) => {
          marker.style.visibility = zoomLevel < 16 ? 'hidden' : 'visible'
        })
      })
    },

    async handleStationSelect(station) {
      const marker = this.markers.stations.find(
        (m) => station.item.stationInfo.Haltestellenbereich === m._icon.id,
      )

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
