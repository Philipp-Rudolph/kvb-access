<template>
  <div ref="mapContainer" id="map"></div>

  <SearchBar
    v-if="!isLoading && !isMarkerSelected"
    :data="searchBarData"
    @selectStation="handleStationSelect"
  />

  <transition name="zoom" @before-leave="beforeLeave" mode="out-in">
    <InfoModal
      v-if="isMarkerSelected"
      :data="selectedMarkerData"
      @close="closeMarkerSelection"
      :markers="markers"
    />
  </transition>

  <transition name="zoom" @before-leave="beforeLeave" mode="out-in">
    <AnalyticsChart
      v-if="!isLoading && !isMarkerSelected"
      :numOfStairs="lenData.allStairs"
      :numOfStairsBroken="lenData.stairs"
      :numOfElevators="lenData.allElevators"
      :numOfElevatorsBroken="lenData.elevators"
      :numOfStations="lenData.stations"
      :numOfStationsBroken="markers.disorder"
      @isCollapsed="isCollapsed = !isCollapsed"
      :class="{ collapsed: isCollapsed }"
    />
  </transition>

  <LoadingView v-if="isLoading" />

  <LoadingView
    v-if="!isLoading && !dataLoaded"
    msg="Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
    :error="fetchDataError"
  />
</template>

<script>
// imoprt Libraries
import L from 'leaflet'
import 'leaflet.markercluster'

// import composables
import setupMap from '@/composables/setupMap'
import fetchData from '@/composables/fetchData'
import joinStationWithStairsAndElevators from '@/composables/joinStationWithStairsAndElevators'

// import components
import InfoModal from '@/components/InfoModal.vue'
import LoadingView from '@/views/LoadingView.vue'
import SearchBar from '@/components/SearchBar.vue'
import AnalyticsChart from '@/components/AnalyticsChart.vue'

// import types
import { MarkerTypes } from '@/types/MarkerTypes'

const API_URL = import.meta.env.VITE_API_BASE_URL

const DATA_URLS = {
  STAIRS: `${API_URL}/fahrtreppenstoerung/json`,
  ALLSTAIRS: `${API_URL}/fahrtreppen/json`,
  ELEVATORS: `${API_URL}/aufzugsstoerung/json`,
  ALLELEVATORS: `${API_URL}/aufzuege/json`,
  STATIONS: `${API_URL}/haltestellenbereiche/json`,
  STATION_LOCATIONS: `${API_URL}/haltestellen/json`,
}

export default {
  name: 'MapView',
  components: { InfoModal, LoadingView, SearchBar, AnalyticsChart },
  data() {
    return {
      isMarkerSelected: false,
      selectedMarkerData: null,
      mapIcons: {},
      markers: { stairs: null, elevators: null, stations: null, disorder: null },
      map: null,
      markerCluster: null,
      isLoading: true,
      dataLoaded: false,
      fetchDataError: false,
      searchBarData: [],
      subText: '',
      isCollapsed: false,
      lenData: {
        stairs: 0,
        elevators: 0,
        stations: 0,
        allStairs: 0,
        allElevators: 0,
      },
    }
  },

  // Lifecycle
  // Mounted
  async mounted() {
    try {
      const responses = await Promise.allSettled(Object.values(DATA_URLS).map(fetchData))

      this.isLoading = false // Ladeanzeige beenden

      const validResponses = responses.map((res, index) => {
        if (res.status !== 'fulfilled' || !res.value || !res.value.features) {
          console.error(
            `Fehler bei ${Object.keys(DATA_URLS)[index]}:`,
            res.reason || 'Leere Antwort',
          )
          return null // Markiere als ungültig
        }
        return res.value
      })

      if (validResponses.includes(null)) {
        this.dataLoaded = false
        this.fetchDataError = true
      }

      const [
        stairsData,
        allStairsData,
        elevatorsData,
        allElevatorsData,
        stationsData,
        stationLocations,
      ] = validResponses

      const [lenStairs, lenElevators, lenStations, lenAllStairs, lenAllElevators] = [
        stairsData.features.length,
        elevatorsData.features.length,
        stationsData.features.length,
        allStairsData.features.length,
        allElevatorsData.features.length,
      ]

      this.lenData = {
        stairs: lenStairs,
        elevators: lenElevators,
        stations: lenStations,
        allStairs: lenAllStairs,
        allElevators: lenAllElevators,
      }

      const mergedData = joinStationWithStairsAndElevators(
        stationsData.features,
        stationLocations.features,
        stairsData.features,
        elevatorsData.features,
      )

      this.searchBarData = mergedData.mergedStationLocationData.map((item) => ({ item }))

      this.mapIcons = {
        stairs: setupMap.createIcon('/assets/icons/escalator.png'),
        elevators: setupMap.createIcon('/assets/icons/elevator.png'),
        stations: setupMap.createIcon('/icons/train.png'),
      }

      this.markerCluster = L.markerClusterGroup({
        spiderfyOnMaxZoom: false,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        maxClusterRadius: (zoom) => (zoom < 10 ? 80 : zoom < 15 ? 50 : 25),
        iconCreateFunction: (cluster) =>
          L.divIcon({
            html: `<div class="cluster-marker">${cluster.getChildCount()}</div>`,
            className: 'cluster-marker disorder',
            iconSize: [40, 40],
          }),
        disableClusteringAtZoom: 10,
      })

      this.map = setupMap.init(this.$refs.mapContainer, this.markerCluster)
      this.setupMarkers(
        mergedData.mergedStairsData,
        mergedData.mergedElevatorData,
        mergedData.mergedStationLocationData,
      )
      this.attachZoomListener()

      this.markers.disorder = await this.getDisorderMarkers()
      this.lenData.stations = await this.getStationMarkers()
      this.dataLoaded = true
    } catch {
      this.isLoading = false
      this.dataLoaded = false
    } finally {
      this.isLoading = false
    }
  },

  // Methods
  methods: {
    beforeLeave(el) {
      el.style.transition = 'opacity 0.3s ease'
      el.style.opacity = 1
      setTimeout(() => {
        el.style.opacity = 0
      }, 100) // Verzögerung, damit Vue es nicht sofort entfernt
    },

    setupMarkers(stairs, elevators, stations) {
      this.markers.stairs = setupMap.addMarkers(
        stairs,
        this.mapIcons.stairs,
        MarkerTypes.STAIRS,
        (data) => this.handleMarkerClick(data, { type: { isStairs: true } }),
      )
      this.markers.elevators = setupMap.addMarkers(
        elevators,
        this.mapIcons.elevators,
        MarkerTypes.ELEVATORS,
        (data) => this.handleMarkerClick(data, { type: { isElevator: true } }),
      )
      this.markers.stations = setupMap.addMarkers(
        stations,
        this.mapIcons.stations,
        MarkerTypes.STATIONS,
        (data) => this.handleMarkerClick(data, { type: { isStation: true } }),
      )
    },
    attachZoomListener() {
      const updateMarkersVisibility = () => {
        const zoomLevel = this.map.getZoom()
        document.querySelectorAll('.stairs-marker, .elevator-marker').forEach((marker) => {
          marker.style.visibility = zoomLevel < 16 ? 'hidden' : 'visible'
        })
      }
      updateMarkersVisibility()
      this.map.on('zoomend', updateMarkersVisibility)
    },
    async handleStationSelect(station) {
      const marker = (await this.markers.stations)?.find(
        (m) => station.item.stationInfo.Haltestellenbereich === m._icon.id,
      )
      if (marker) {
        this.map.flyTo(marker.getLatLng(), 16, {
          animate: true,
          duration: 1.5,
          easeLinearity: 0.2,
        })
        this.handleMarkerClick(station.item, { type: { isStation: true } })
      }
    },
    handleMarkerClick(markerData, typeData) {
      this.isMarkerSelected = true
      this.selectedMarkerData = { ...markerData, ...typeData }
      console.log(this.markers.stations)
    },
    closeMarkerSelection() {
      this.isMarkerSelected = false
    },

    async getDisorderMarkers() {
      const stations = await this.markers.stations // Warte, bis das Promise aufgelöst ist
      if (!stations || !Array.isArray(stations)) return 0

      const disorderMarkers = stations.filter((marker) =>
        marker._icon.classList.contains('disorder'),
      )
      return disorderMarkers.length
    },

    async getStationMarkers() {
      const stations = await this.markers.stations
      if (!stations || !Array.isArray(stations)) return 0

      const stationMarkers = stations.filter((marker) =>
        marker._icon.classList.contains('station-marker'),
      )
      return stationMarkers.length
    },
  },
}
</script>

<style>
#map {
  height: 100dvh;
  width: 100%;
}

.leaflet-container {
  background-color: #222 !important;
}

.icon,
.leaflet-marker-icon {
  object-fit: contain;
  border-radius: 0.75rem;
  background-color: #fff;
  transition:
    height 0.3s,
    width 0.3s,
    top 0.3s,
    left 0.3s,
    filter 0.3s ease-out,
    box-shadow 0.3s ease-out;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  padding: 0.25rem !important;
  opacity: 0.2;
  height: 35px !important;
  width: 35px !important;
  position: absolute; /* Wichtig, damit die Verschiebung funktioniert */
}

.disorder:hover {
  height: 40px !important;
  width: 40px !important;
  top: -2.5px; /* Verschiebung um die Hälfte der Größenänderung */
  left: -2.5px; /* Verschiebung um die Hälfte der Größenänderung */
}

.station-marker {
  z-index: 10000 !important;
}

.disorder {
  opacity: 1;
  border: 1.5px solid red;
}

.no-disorder {
  height: 25px !important;
  width: 25px !important;
  opacity: 0.25;
  transition: opacity 0.3s ease;
}

.no-disorder:hover {
  opacity: 0.75;
}

.disorder {
  filter: invert(0);
  background-color: #fff;
  box-shadow:
    0 0 100px rgba(255, 0, 0, 0.3),
    0 0 60px rgba(255, 255, 255, 0.3);
}
.disorder:hover {
  filter: invert(0);
  background-color: #fff;
  box-shadow:
    0 0 100px rgba(255, 0, 0, 0.9),
    0 0 60px rgba(255, 255, 255, 0.6);
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

.icon:active {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.leaflet-popup-content-wrapper,
.leaflet-popup-tip {
  background-color: #0000004f !important;
  backdrop-filter: blur(5px);
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

.leaflet-marker-icon.leaflet-cluster-anim {
  transition: transform 0.3s ease-in-out;
}

.leaflet-tile {
  filter: brightness(2.5) contrast(1.1) !important;
}

.zoom-enter-active,
.zoom-leave-active {
  transition: opacity 0.3s ease;
}

.zoom-enter-from,
.zoom-leave-to {
  opacity: 0;
}

.zoom-enter-to,
.zoom-leave-from {
  opacity: 1;
}
</style>
