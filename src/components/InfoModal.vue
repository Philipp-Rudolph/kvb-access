<template>
  <div v-if="data" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h1 v-if="isStation">Haltestelle {{ data.properties.Name }}</h1>
        <h1 v-else-if="isStairs">Rolltreppe defekt</h1>
        <h1 v-else-if="isElevator">Aufzug defekt</h1>
        <button @click="$emit('close')" class="close-button">
          <span class="close-button--line"></span>
          <span class="close-button--line"></span>
        </button>
      </div>

      <div class="modal-body">
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
                  totalNumberOfElevators > 1 ? totalNumberOfElevators + 'Aufzügen' : 'einem Aufzug'
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
                  totalNumberOfElevators > 1 ? totalNumberOfElevators + 'Aufzügen' : 'einem Aufzug'
                }}.
              </template>
            </p>

            <p v-else class="description call-out call-out--info">
              An dieser Haltestelle gibt es keine Störungen an Rolltreppen oder Aufzügen.
            </p>

            <p class="description call-out call-out--info" v-if="data.stationInfo.Lageplan">
              Laden Sie <a :href="data.stationInfo.Lageplan" target="_blank">hier</a> den Lageplan
              der Haltestelle herunter.
            </p>
          </div>
        </template>

        <div v-if="data.hasDisorder" class="disorder-list">
          <h2>{{ totalNumberOfDisorders }} Störung{{ totalNumberOfDisorders > 1 ? 'en' : '' }}</h2>
          <a
            :href="'#' + disorder.properties.Kennung"
            @click.prevent="selectMarker(disorder)"
            v-for="disorder in data.disorders"
            :key="disorder.id"
            class="disorder-item"
          >
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

        <template v-if="data.properties.Linien">
          <div class="description lines-info">
            <p>
              {{
                data.properties.Linien.length > 1
                  ? 'Hier fahren die Linien'
                  : 'Hier fährt die Linie'
              }}
            </p>
            <div>
              <span
                v-for="(linie, index) in data.properties.Linien.split(' ')"
                :key="index"
                class="lines"
                :class="[`line-${linie}`]"
                :style="{ backgroundColor: linienFarben[linie] || '#ccc', color: '#fff' }"
              >
                {{ linie }}
              </span>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: Object,
    markers: Object,
    map: Object,
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
    isPromise(value) {
      return value && typeof value.then === 'function'
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
        console.log('Kategorie:', category)

        console.log(this.markers[category])

        // Durchlaufe jedes Marker-Element innerhalb der Kategorie
        for (const item in this.markers[category]) {
          console.log('Marker:', item)

          // Prüfe, ob die Kennung übereinstimmt
          if (
            item?.properties?.Kennung === disorder.properties.Kennung ||
            item._icon?.id === disorder.properties.Kennung
          ) {
            marker = item // Marker gefunden
            break // Beende die Schleife, wenn der Marker gefunden wurde
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
  width: fit-content;
  height: 100dvh;
  width: 100vw;
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
  background: #222;
  padding: 0; /* Padding wird von Header und Body übernommen */
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  color: white;
  position: relative;
  display: flex;
  flex-direction: column;
}

.modal-header {
  position: sticky; /* Fixiert den Header im Modal */
  top: 0;
  left: 0;
  width: 100%;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.25);
  z-index: 10; /* Damit er über dem Body bleibt */
  display: flex;
  justify-content: space-between;
  align-items: center;

  h1 {
    font-size: 1.5rem;
  }
}

.modal-body {
  flex: 1; /* Füllt den restlichen Platz aus */
  overflow-y: auto; /* Nur der Body ist scrollbar */
  padding: 1.5rem;
  max-height: calc(80vh - 60px); /* Max Höhe berechnen */
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
  background-color: rgb(255, 255, 255);
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

.call-outs {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.call-out {
  padding: 1rem;
  border-radius: 0.5rem;
}

.call-out--alert {
  background: rgba(255, 0, 0, 0.1);
}

.call-out--info {
  background: rgba(0, 0, 255, 0.1);
}

.disorder-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.disorder-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 0.5rem;
  transition: transform 0.2s ease-in-out;
  cursor: pointer;

  & h3 {
    color: white;
  }

  &:hover {
    transform: scale(1.025);
  }
}

.disorder-icon {
  width: 40px;
  height: 40px;
  margin-right: 1rem;
  filter: invert(1);
}

.disorder-info {
  overflow-wrap: anywhere;
  font-size: 0.75rem;

  p {
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
  }
}

.lines-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  div {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }
}

.lines:first-child {
  margin-left: 0;
}

@media screen and (min-width: 768px) {
  .lines-info {
    flex-direction: row;
  }
}

.lines {
  display: inline-block; /* Wichtig für transform */
  padding: 0 0.75rem;
  border-radius: 0.5rem;
  transition: transform 0.2s ease-in-out; /* Sanfte Animation */
  cursor: pointer;
}
.lines:hover {
  transform: scale(1.2);
}

.line-5 {
  color: #000 !important;
}
</style>
