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
          <p v-if="data.hasDisorder" class="description call-out call-out--alert">
            An dieser Haltestelle gibt es Störungen an {{ totalNumberOfDisorders > 1 ? totalNumberOfDisorders + ' Rolltreppen und/oder Aufzügen' : 'einer Rolltreppe oder einem Aufzug' }}.
          </p>

          <p class="description call-out call-out--info">
            Laden Sie <a :href="data.stationInfo.Lageplan" target="_blank">hier</a> den Lageplan der Haltestelle herunter.
          </p>

          <div class="description lines-info">
            <p>Hier fahren die Linien:</p>
            <div>
              <span
                v-for="(linie, index) in data.properties.Linien.split(' ')"
                :key="index"
                class="lines"
                :style="{ backgroundColor: linienFarben[linie] || '#ccc', color: '#fff' }">
                {{ linie }}
              </span>
            </div>
          </div>
        </template>

      </div>

      <div v-if="data.hasDisorder" class="disorder-list" id="disorders">
        <div v-for="disorder in data.disorders" :key="disorder.id" class="disorder-item">
          <img :src="getIconSrc(disorder.type)" alt="" class="disorder-icon" />
          <div class="disorder-info">
            <h3>{{ disorder.type.isStairs ? 'Rolltreppe' : 'Aufzug' }} {{ disorder.properties.Bezeichnung }} defekt</h3>
            <p>Zuletzt aktualisiert: {{ formatDate(disorder.properties.timestamp) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: Object,
  },
  data() {
    return {
      linienFarben: {
        "1": "#e30613",
        "3": "#a20067",
        "4": "#009ee0",
        "5": "#ffed00",
        "7": "#ea7600",
        "9": "#be3075",
        "12": "#007a33",
        "13": "#008c95",
        "15": "#60be68",
        "16": "#005f2f",
        "17": "#153f74",
        "18": "#231f20",
      }
    };
  },
  computed: {
    isStation() { return this.data?.type?.isStation; },
    isStairs() { return this.data?.type?.isStairs; },
    isElevator() { return this.data?.type?.isElevator; },
    totalNumberOfDisorders() { return this.data?.disorders?.length || 0; },
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleString('de-DE');
    },
    formatLines(lines) {
      return lines.replaceAll(' ', ', ');
    },
    getIconSrc(type) {
      return type.isStairs ? '/assets/icons/escalator.png' : '/assets/icons/elevator.png';
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  width: fit-content;
  height: 100dvh;
  width: 100vw;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
  overflow: hidden;
}

.modal-content {
  background: #222;
  padding: 2rem;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
  max-height: 80%;
  color: white;
  position: relative;
  overflow: scroll;
  /* hide scrollbar */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h1 {
    margin: 0;
    font-size: 1.5rem;
  }
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
  background-color: rgb(255, 0, 0, 0.5);
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
  margin-top: 1rem;
}

.disorder-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  transition: transform 0.2s ease-in-out;
  cursor: pointer;

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

  h3 {
    margin: 0;
  }

  p {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.8rem;
    margin: 0;
  }
}

.lines-info {
  display: flex;
  flex-direction: column;
}

.lines {
  display: inline-block; /* Wichtig für transform */
  padding: 0 0.75rem;
  border-radius: 0.5rem;
  margin: 0 0.5rem;
  transition: transform 0.2s ease-in-out; /* Sanfte Animation */
  cursor: pointer;
}
.lines:hover {
  transform: scale(1.2);
}

</style>
