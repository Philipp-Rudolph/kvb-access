<template>
  <div v-if="data" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content" :class="{ 'dark-mode': darkMode, 'light-mode': !darkMode }">
      <div class="modal-header">
        <h1 v-if="isStation && !showStats">Haltestelle {{ data.properties.Name }}</h1>
        <h1 v-else-if="isStairs">Rolltreppe defekt</h1>
        <h1 v-else-if="isElevator">Aufzug defekt</h1>
        <h1 v-else-if="showStats">Statistik Übersicht</h1>
        <button @click="$emit('close')" class="close-button">
          <span class="close-button--line"></span>
          <span class="close-button--line"></span>
        </button>
      </div>

      <div class="modal-body">
        <!-- Analytics chart section -->
        <div v-if="showStats" class="stats-section">
          <AnalyticsChart :numOfStairs="numOfStairs" :numOfStairsBroken="numOfStairsBroken"
            :numOfElevators="numOfElevators" :numOfElevatorsBroken="numOfElevatorsBroken" :numOfStations="numOfStations"
            :numOfStationsBroken="numOfStationsBroken" :isCollapsed="false" :darkMode="darkMode" />
        </div>

        <!-- Nur anzeigen, wenn keine Statistik angezeigt wird -->
        <template v-if="!showStats">
          <template v-if="!isStation">
            <p class="description call-out call-out--alert">
              {{ isStairs ? 'Diese Rolltreppe' : 'Dieser Aufzug' }}
              {{ data.properties.Bezeichnung }} ist defekt
            </p>
            <p>Zuletzt aktualisiert: {{ formatDate(data.properties.timestamp) }}</p>
          </template>

          <template v-else>
            <div class="call-outs">
              <p v-if="data.hasDisorder" class="description call-out call-out--alert">
                An dieser Haltestelle gibt es Störungen
                <template v-if="totalNumberOfEscalators > 0 && totalNumberOfElevators > 0">
                  an
                  {{ totalNumberOfEscalators > 1 ? totalNumberOfEscalators : 'einer' }} Rolltreppe{{
                    totalNumberOfEscalators > 1 ? 'n' : ''
                  }}
                  und
                  {{
                    totalNumberOfElevators > 1 ? totalNumberOfElevators + ' Aufzügen' : 'einem Aufzug'
                  }}.
                </template>
                <template v-else-if="totalNumberOfEscalators > 0">
                  an
                  {{ totalNumberOfEscalators > 1 ? totalNumberOfEscalators : 'einer' }} Rolltreppe{{
                    totalNumberOfEscalators > 1 ? 'n' : ''
                  }}.
                </template>
                <template v-else-if="totalNumberOfElevators > 0">
                  an
                  {{
                    totalNumberOfElevators > 1 ? totalNumberOfElevators + ' Aufzügen' : 'einem Aufzug'
                  }}.
                </template>
              </p>

              <p v-else class="description call-out call-out--info">
                An dieser Haltestelle gibt es keine Störungen an Rolltreppen oder Aufzügen.
              </p>

              <p class="description call-out call-out--info" v-if="data.stationInfo && data.stationInfo.Lageplan">
                Laden Sie <a :href="data.stationInfo.Lageplan" target="_blank" class="modal-link">hier</a> den Lageplan
                der Haltestelle herunter.
              </p>
            </div>
          </template>

          <div v-if="data.hasDisorder" class="disorder-list">
            <h2>{{ totalNumberOfDisorders }} Störung{{ totalNumberOfDisorders > 1 ? 'en' : '' }}</h2>
            <a :href="'#' + disorder.properties.Kennung" @click.prevent="selectMarker(disorder)"
              v-for="disorder in data.disorders" :key="disorder.id" class="disorder-item">
              <img :src="getIconSrc(disorder.type)" alt="" class="disorder-icon" />
              <div class="disorder-info">
                <h3>
                  {{ disorder.type.isStairs ? 'Rolltreppe' : 'Aufzug' }}
                  {{ disorder.properties.Bezeichnung }} defekt
                </h3>
                <p>Zuletzt aktualisiert: {{ formatDate(disorder.properties.timestamp) }}</p>
              </div>
            </a>
          </div>

          <template v-if="data.properties && data.properties.Linien">
            <div class="description lines-info">
              <p>
                {{
                  data.properties.Linien.length > 1
                    ? 'Hier fahren die Linien'
                    : 'Hier fährt die Linie'
                }}
              </p>
              <div>
                <span v-for="(linie, index) in data.properties.Linien.split(' ')" :key="index" class="lines"
                  :class="[`line-${linie}`]"
                  :style="{ backgroundColor: linienFarben[linie] || '#ccc', color: textColor(linie) }">
                  {{ linie }}
                </span>
              </div>
            </div>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import AnalyticsChart from '@/components/AnalyticsChart.vue'

export default {
  components: {
    AnalyticsChart
  },
  props: {
    data: Object,
    markers: Object,
    map: Object,
    numOfStairs: { type: Number, default: 0 },
    numOfStairsBroken: { type: Number, default: 0 },
    numOfElevators: { type: Number, default: 0 },
    numOfElevatorsBroken: { type: Number, default: 0 },
    numOfStations: { type: Number, default: 0 },
    numOfStationsBroken: { type: Number, default: 0 },
    showStats: { type: Boolean, default: false },
    darkMode: { type: Boolean, default: true },
  },
  data() {
    return {
      linienFarben: {
        1: '#e30613',
        3: '#a20067',
        4: '#009ee0',
        5: '#ffed00',
        7: '#ea7600',
        9: '#be3075',
        12: '#007a33',
        13: '#008c95',
        15: '#60be68',
        16: '#005f2f',
        17: '#153f74',
        18: '#231f20',
      },
    }
  },
  computed: {
    isStation() {
      return this.data?.type?.isStation
    },
    isStairs() {
      return this.data?.type?.isStairs
    },
    isElevator() {
      return this.data?.type?.isElevator
    },
    totalNumberOfDisorders() {
      return this.data?.disorders?.length || 0
    },
    totalNumberOfEscalators() {
      return this.data?.disorders?.filter((disorder) => disorder.type.isStairs).length || 0
    },
    totalNumberOfElevators() {
      return this.data?.disorders?.filter((disorder) => disorder.type.isElevator).length || 0
    },
  },
  methods: {
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleString('de-DE')
    },
    formatLines(lines) {
      return lines ? lines.replaceAll(' ', ', ') : ''
    },
    getIconSrc(type) {
      return type?.isStairs ? '/assets/icons/escalator.png' : '/assets/icons/elevator.png'
    },
    textColor(linie) {
      // Für helle Hintergründe (wie Linie 5 mit gelb) schwarzen Text verwenden
      return linie === '5' ? '#000' : '#fff'
    },
    selectMarker(disorder) {
      console.log('selectMarker wurde aufgerufen!', disorder)

      if (!disorder?.properties?.Kennung) {
        console.log('Kein Marker gefunden oder keine Kennung vorhanden')
        return
      }

      let marker = null

      // Durchlaufe alle Kategorien und suche nach dem Marker
      for (const category in this.markers) {
        // Überprüfe, ob es Marker in dieser Kategorie gibt
        if (this.markers[category] && Array.isArray(this.markers[category])) {
          // Durchlaufe jedes Marker-Element innerhalb der Kategorie
          for (const item of this.markers[category]) {
            // Prüfe, ob die Kennung übereinstimmt
            if (
              (item && item.properties && item.properties.Kennung === disorder.properties.Kennung) ||
              (item && item._icon && item._icon.id === disorder.properties.Kennung)
            ) {
              marker = item // Marker gefunden
              break // Beende die Schleife, wenn der Marker gefunden wurde
            }
          }
        }

        // Falls der Marker gefunden wurde, keine Notwendigkeit, weiter zu iterieren
        if (marker) break
      }

      // Überprüfe, ob der Marker gefunden wurde
      if (!marker) {
        console.log('Marker nicht gefunden!')
        return
      }

      // Wenn die Karte existiert, zentriere sie auf den Marker
      if (this.map) {
        console.log('Karte existiert, zentriere auf Marker:', marker)

        this.$emit('close') // Optional: Modal schließen

        marker.openPopup() // Öffnet das Popup des Markers
        this.map.flyTo(marker.getLatLng(), 16, {
          animate: true,
          duration: 1.5,
          easeLinearity: 0.2,
        })
      }
    },
  },
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  width: 100vw;
  height: 100dvh;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
  overflow: hidden;
}

.modal-content {
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  position: relative;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

/* Dark Mode Styles */
/* Dark Mode Styles - erhöhte Spezifität */
.modal-content.dark-mode {
  background-color: #222;
  color: white;
}

.modal-content.dark-mode .modal-header {
  background: rgba(0, 0, 0, 0.25);
}

.modal-content.dark-mode .close-button--line {
  background-color: rgb(255, 255, 255);
}

.modal-content.dark-mode .call-out--alert {
  background: rgba(255, 0, 0, 0.1);
}

.modal-content.dark-mode .call-out--info {
  background: rgba(0, 0, 255, 0.1);
}

.modal-content.dark-mode .disorder-item {
  background: rgba(255, 255, 255, 0.1);
}

.modal-content.dark-mode .disorder-icon {
  filter: invert(1);
}

.modal-content.dark-mode .disorder-info p {
  color: rgba(255, 255, 255, 0.5);
}

/* Light Mode Styles */
.light-mode {
  background-color: #f5f5f5;
  color: #222;
}

.light-mode .modal-header {
  background: rgba(0, 0, 0, 0.05);
}

.light-mode .close-button--line {
  background-color: #333;
}

.light-mode .call-out--alert {
  background: rgba(255, 0, 0, 0.05);
  border: 1px solid rgba(255, 0, 0, 0.1);
}

.light-mode .call-out--info {
  background: rgba(0, 0, 255, 0.05);
  border: 1px solid rgba(0, 0, 255, 0.1);
}

.light-mode .disorder-item {
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.light-mode .disorder-icon {
  filter: none;
}

.light-mode .disorder-info p {
  color: rgba(0, 0, 0, 0.5);
}

/* Common Styles */
.modal-header {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1.5rem;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h1 {
  font-size: 1.5rem;
  margin: 0;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  max-height: calc(80vh - 60px);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Optional: Scrollbar ausblenden */
.modal-body::-webkit-scrollbar {
  display: none;
}

.close-button {
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button--line {
  position: absolute;
  width: 24px;
  height: 3px;
  border-radius: 2px;
  transition: background-color 0.2s;
}

.close-button--line:first-child {
  transform: rotate(45deg);
}

.close-button--line:last-child {
  transform: rotate(-45deg);
}

.close-button:hover .close-button--line {
  background-color: #00bd7e;
}

.stats-section {
  width: 100%;
  margin-bottom: 0.5rem;
}

.call-outs {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.call-out {
  padding: 1rem;
  border-radius: 0.5rem;
}

.disorder-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.disorder-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 0.5rem;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease;
  cursor: pointer;
  text-decoration: none;
}

.disorder-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.disorder-icon {
  width: 40px;
  height: 40px;
  margin-right: 1rem;
}

.disorder-info {
  overflow-wrap: anywhere;
  font-size: 0.75rem;
}

.disorder-info h3 {
  margin-top: 0;
  margin-bottom: 0.25rem;
  font-size: 1rem;
  color: inherit;
}

.disorder-info p {
  margin: 0;
}

.lines-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lines-info div {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.lines {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  transition: transform 0.2s ease-in-out;
  cursor: pointer;
  font-weight: bold;
}

.lines:hover {
  transform: scale(1.2);
}

@media screen and (min-width: 768px) {
  .lines-info {
    flex-direction: row;
  }

  .modal-content {
    max-width: 600px;
  }
}

@media screen and (max-width: 480px) {
  .modal-body {
    padding: 1rem;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-header h1 {
    font-size: 1.2rem;
  }
}
</style>
