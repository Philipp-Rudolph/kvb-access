<template>
  <div ref="mapContainer" id="map" class="map-container"></div>

  <SearchBar v-if="!isLoading && !isMarkerSelected && dataLoaded" :data="searchBarData" :darkMode="darkMode"
    @selectStation="handleStationSelect" />

  <transition name="zoom" @before-leave="beforeLeave" mode="out-in">
    <InfoModal v-if="isMarkerSelected" :data="selectedMarkerData" @close="closeMarkerSelection" :markers="markers"
      :map="map" :numOfStairs="lenData.allStairs" :numOfStairsBroken="lenData.stairs"
      :numOfElevators="lenData.allElevators" :numOfElevatorsBroken="lenData.elevators" :numOfStations="lenData.stations"
      :numOfStationsBroken="markers.disorder" :showStats="showStatsModal" :darkMode="darkMode" />
  </transition>
  <!-- Dark Mode Toggle -->
  <button v-if="!isLoading && !isMarkerSelected && dataLoaded" @click="toggleDarkMode" class="theme-toggle-button"
    :class="{ 'light-mode': !darkMode }">
    <img v-if="darkMode" src="/icons/sun.png" alt="Light Mode" class="theme-icon" />
    <img v-else src="/icons/moon.png" alt="Dark Mode" class="theme-icon" />
  </button>

  <!-- Stats Button in bottom right -->
  <button v-if="!isLoading && !isMarkerSelected && dataLoaded" @click="openStatsModal" class="stats-floating-button">
    <img src="/icons/train.png" alt="Statistics" class="stats-button-icon" id="stats-icon" />
    <span>Statistik</span>
  </button>

  <LoadingView v-if="isLoading" />

  <!-- Einfache Fehleranzeige -->
  <div v-if="!isLoading && fetchDataError" class="error-message">
    <LoadingView msg="Ein Fehler ist aufgetreten ... " :error="fetchDataError" @retry="loadData"
      v-if="fetchDataError" />
  </div>
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
  components: { InfoModal, LoadingView, SearchBar },
  data() {
    return {
      isMarkerSelected: false,
      selectedMarkerData: null,
      showStatsModal: false,
      darkMode: true,
      mapIcons: {},
      markers: { stairs: null, elevators: null, stations: null, disorder: null },
      map: null,
      markerCluster: null,
      isLoading: true,
      dataLoaded: false,
      fetchDataError: false,
      searchBarData: [],
      subText: '',
      lenData: {
        stairs: 0,
        elevators: 0,
        stations: 0,
        allStairs: 0,
        allElevators: 0,
      },
    }
  },

  created() {
    // First check if user has a stored preference
    const savedDarkMode = localStorage.getItem('darkMode');

    if (savedDarkMode !== null) {
      // Use the saved preference if available
      this.darkMode = savedDarkMode === 'true';
    } else {
      // Otherwise, detect system preference
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.darkMode = prefersDarkMode;
      // Save the initial state based on system preference
      localStorage.setItem('darkMode', prefersDarkMode);
    }

    // Apply the theme to document
    this.applyTheme();

    // Add listener for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', this.handleSystemThemeChange);
  },


  mounted() {
    console.log("MapView geladen");
    // Verzögerung für bessere DOM-Initialisierung
    setTimeout(() => {
      this.loadData();
    }, 200);
  },

  beforeUnmount() {
    // Clean up
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    // Remove event listener
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', this.handleSystemThemeChange);
  },

  // Methods
  methods: {
    async loadData() {
      console.log("Lade Daten...");
      this.isLoading = true;
      this.fetchDataError = false;

      try {
        const responses = await Promise.allSettled(Object.values(DATA_URLS).map(fetchData));

        const validResponses = responses.map((res, index) => {
          if (res.status !== 'fulfilled' || !res.value || !res.value.features) {
            console.error(
              `Fehler bei ${Object.keys(DATA_URLS)[index]}:`,
              res.reason || 'Leere Antwort',
            );
            return null; // Markiere als ungültig
          }
          return res.value;
        });

        if (validResponses.includes(null)) {
          this.fetchDataError = true;
          this.isLoading = false;
          return;
        }

        const [
          stairsData,
          allStairsData,
          elevatorsData,
          allElevatorsData,
          stationsData,
          stationLocations,
        ] = validResponses;

        const [lenStairs, lenElevators, lenStations, lenAllStairs, lenAllElevators] = [
          stairsData.features.length,
          elevatorsData.features.length,
          stationsData.features.length,
          allStairsData.features.length,
          allElevatorsData.features.length,
        ];

        this.lenData = {
          stairs: lenStairs,
          elevators: lenElevators,
          stations: lenStations,
          allStairs: lenAllStairs,
          allElevators: lenAllElevators,
        };

        // Verbinde Stationen mit Aufzügen und Rolltreppen
        const mergedData = joinStationWithStairsAndElevators(
          stationsData.features,
          stationLocations.features,
          stairsData.features,
          elevatorsData.features,
        );

        this.searchBarData = mergedData.mergedStationLocationData.map((item) => ({ item }));

        // Erstelle die Icons
        this.mapIcons = {
          stairs: setupMap.createIcon('/assets/icons/escalator.png'),
          elevators: setupMap.createIcon('/assets/icons/elevator.png'),
          stations: setupMap.createIcon('/icons/train.png'),
        };

        // Marker Cluster initialisieren
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
        });

        // Karte initialisieren
        this.map = setupMap.init(this.$refs.mapContainer, this.markerCluster, [50.9413, 6.9583], 13);

        if (!this.map) {
          console.error("Karte konnte nicht initialisiert werden");
          this.fetchDataError = true;
          this.isLoading = false;
          return;
        }

        console.log("Karte initialisiert, füge Marker hinzu...");

        // Prüfe und logge die Daten vor dem Hinzufügen von Markern
        console.log("Stationen:", mergedData.mergedStationLocationData.length);
        console.log("Rolltreppen:", mergedData.mergedStairsData.length);
        console.log("Aufzüge:", mergedData.mergedElevatorData.length);

        // Marker hinzufügen
        this.markers.stations = await setupMap.addMarkers(
          mergedData.mergedStationLocationData,
          this.mapIcons.stations,
          MarkerTypes.STATIONS,
          (data) => this.handleMarkerClick(data, { type: { isStation: true } }),
        );

        console.log(`${this.markers.stations.length} Stationen hinzugefügt`);

        this.markers.stairs = await setupMap.addMarkers(
          mergedData.mergedStairsData,
          this.mapIcons.stairs,
          MarkerTypes.STAIRS,
          (data) => this.handleMarkerClick(data, { type: { isStairs: true } }),
        );

        console.log(`${this.markers.stairs.length} Rolltreppen hinzugefügt`);

        this.markers.elevators = await setupMap.addMarkers(
          mergedData.mergedElevatorData,
          this.mapIcons.elevators,
          MarkerTypes.ELEVATORS,
          (data) => this.handleMarkerClick(data, { type: { isElevator: true } }),
        );

        console.log(`${this.markers.elevators.length} Aufzüge hinzugefügt`);

        this.attachZoomListener();

        // Berechne die Anzahl der Störungen
        this.markers.disorder = await this.getDisorderMarkers();
        console.log(`${this.markers.disorder} Störungen gefunden`);

        // Daten erfolgreich geladen
        this.dataLoaded = true;
        this.isLoading = false;

        // Nach kurzer Verzögerung Map-Größe aktualisieren
        setTimeout(() => {
          if (this.map) {
            this.map.invalidateSize();
          }
        }, 200);

      } catch (error) {
        console.error("Fehler beim Laden der Daten:", error);
        this.fetchDataError = true;
        this.isLoading = false;
      }
    },

    openStatsModal() {
      // Create dummy station data to show only stats in modal
      this.selectedMarkerData = {
        type: { isStation: true },
        properties: { Name: 'Gesamtübersicht' },
        hasDisorder: false,
        disorders: [],
        stationInfo: {}
      };
      this.showStatsModal = true; // Aktiviere Statistik-Ansicht
      this.isMarkerSelected = true;
    },

    beforeLeave(el) {
      el.style.transition = 'opacity 0.3s ease';
      el.style.opacity = 1;
      setTimeout(() => {
        el.style.opacity = 0;
      }, 100); // Verzögerung, damit Vue es nicht sofort entfernt
    },

    attachZoomListener() {
      if (!this.map) return;

      const updateMarkersVisibility = () => {
        const zoomLevel = this.map.getZoom();
        document.querySelectorAll('.stairs-marker, .elevator-marker').forEach((marker) => {
          marker.style.visibility = zoomLevel < 16 ? 'hidden' : 'visible';
        });
      };

      updateMarkersVisibility();
      this.map.on('zoomend', updateMarkersVisibility);
    },

    async handleStationSelect(station) {
      if (!this.markers.stations) return;

      const marker = this.markers.stations.find(
        (m) => m._icon && station.item.stationInfo.Haltestellenbereich === m._icon.id
      );

      if (marker) {
        // Nutze die smoothZoomTo-Methode für sanfteren Zoom
        setupMap.smoothZoomTo(marker.getLatLng(), 16, {
          duration: 2, // Etwas länger für sanftere Animation
          easeLinearity: 0.25,
        });

        this.handleMarkerClick(station.item, { type: { isStation: true } });
      }
    },

    handleMarkerClick(markerData, typeData) {
      this.showStatsModal = false; // Bei normaler Marker-Auswahl keine Statistik anzeigen
      this.isMarkerSelected = true;
      this.selectedMarkerData = { ...markerData, ...typeData };
    },

    closeMarkerSelection() {
      this.isMarkerSelected = false;
      this.showStatsModal = false; // Zurücksetzen des Statistik-Flags beim Schließen
    },

    async getDisorderMarkers() {
      if (!this.markers.stations || !Array.isArray(this.markers.stations)) return 0;

      const disorderMarkers = this.markers.stations.filter((marker) =>
        marker._icon && marker._icon.classList.contains('disorder')
      );

      return disorderMarkers.length;
    },

    async getStationMarkers() {
      if (!this.markers.stations || !Array.isArray(this.markers.stations)) return 0;

      const stationMarkers = this.markers.stations.filter((marker) =>
        marker._icon && marker._icon.classList.contains('station-marker')
      );

      return stationMarkers.length;
    },

    applyTheme() {
      // Apply theme classes to document
      document.documentElement.classList.toggle('light-mode', !this.darkMode);
      document.documentElement.classList.toggle('dark-mode', this.darkMode);

      // Make sure setupMap has the same theme if needed
      if (setupMap && setupMap.darkMode !== this.darkMode) {
        setupMap.darkMode = this.darkMode;
      }
    },

    handleSystemThemeChange(e) {
      // Only update if user hasn't set a manual preference
      if (!localStorage.getItem('darkMode')) {
        this.darkMode = e.matches;
        this.applyTheme();
      }
    },

    toggleDarkMode() {
      // Toggle the mode
      this.darkMode = !this.darkMode;

      // Save user preference to localStorage
      localStorage.setItem('darkMode', this.darkMode);

      // Apply the theme
      this.applyTheme();
    },
  },


}
</script>

<style>
#map {
  height: 100%;
  width: 100%;
  background-color: var(--background-color);
  transition: background-color 0.3s ease;
}

body {
  color: var(--text-color);
  background-color: var(--background-color);
  transition: color 0.3s, background-color 0.3s;
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
  position: absolute;
  /* Wichtig, damit die Verschiebung funktioniert */
}

.leaflet-tile-pane {
  filter: var(--filter-invert-reverse);
}

.disorder:hover {
  height: 40px !important;
  width: 40px !important;
  top: -2.5px;
  /* Verschiebung um die Hälfte der Größenänderung */
  left: -2.5px;
  /* Verschiebung um die Hälfte der Größenänderung */
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
  background-color: #fff;
  box-shadow:
    0 0 100px rgba(255, 0, 0, 0.3),
    0 0 60px rgba(255, 255, 255, 0.3);
}

.disorder:hover {
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

/* Style for the theme toggle button */
.theme-toggle-button {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--button-background);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  z-index: 999;
  transition: transform 0.2s, background-color 0.3s;
}

.theme-toggle-button:hover {
  transform: scale(1.1);
}

.theme-icon {
  width: 24px;
  height: 24px;
}

@media screen and (max-width: 768px) {
  .theme-toggle-button {
    width: 40px;
    height: 40px;

    position: fixed;
    bottom: 20px;
    left: 20px;
    /* Geändert von right zu left */
    top: auto;
    /* Entfernt die top-Position */
    right: auto;
  }

  .theme-icon {
    width: 20px;
    height: 20px;
  }

}

.theme-icon {
  filter: var(--filter-invert);
}

/* Style for the stats floating button */
.stats-floating-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: var(--button-background);
  color: var(--text-color);
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  z-index: 999;
  transition: transform 0.2s, background-color 0.3s;
}

.stats-floating-button:hover {
  transform: translateY(-3px);
}

.stats-button-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  filter: var(--filter-invert);
}

.light-mode .stats-button-icon {
  filter: var(--filter-invert);
}
</style>
