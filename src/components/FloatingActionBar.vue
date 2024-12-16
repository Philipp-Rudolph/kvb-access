<template>
  <div>
    <!-- Action Bar -->
    <div class="bar floating-action-bar">
      <!-- Show Description if data is provided -->
      <template v-if="data">
        <button @click="$emit('close')" class="close-button">close</button>
        <div class="bar--content">
          <!-- Header Section -->
          <h1 v-if="isStation">Haltestelle {{ data.properties.Name }}</h1>
          <h1 v-else-if="isStairs">Rolltreppe defekt</h1>
          <h1 v-else-if="isElevator">Aufzug defekt</h1>

          <!-- Details Section -->
          <template v-if="!isStation">
            <h3>{{ replaceAllSpecialChars(data.properties.Bezeichnung) }}</h3>
            <p>zuletzt aktualisiert: {{ formatDate(data.properties.timestamp) }}</p>
          </template>

          <!-- Description Section -->
          <template v-else>
            <h3>{{ data.properties.Name }}</h3>
            <p v-if="data.hasDisorder" class="description call-out">
              An dieser Haltestelle gibt es Störungen an {{ totalNumberOfDisorders }} Rolltreppen
              und / oder Aufzügen. Klicken Sie <a href="#disorders">hier</a> für mehr Informationen.
            </p>
            <p>Hier fahren die Linien: {{ data.properties.Linien.replaceAll(' ', ', ') }}</p>
          </template>

          <div class="chevron-down">
            <a href="#disorders" class="chevron-svg"
              ><img src="@/assets/icons/down-chevron.svg" alt=""
            /></a>
          </div>
        </div>
        <!-- Disorder Box -->
        <div class="disorder-box--wrapper" id="disorders">
          <div v-for="disorder in data.disorders" :key="disorder.id" class="disorder-box">
            <img :src="getIconSrc(disorder.type)" alt="" class="disorder-box--icon" />
            <div class="disorder-box--content">
              <h3 v-if="disorder.type.isStairs" class="disorder-box--title">Rolltreppe defekt</h3>
              <h3 v-else-if="disorder.type.isElevator" class="disorder-box--title">
                Aufzug defekt
              </h3>
              <p class="disorder-box--text">{{ disorder.properties.Bezeichnung }}</p>
              <p class="disorder-box--text">
                zuletzt aktualisiert: {{ formatDate(disorder.properties.timestamp) }}
              </p>
            </div>
          </div>
        </div>
      </template>

      <!-- Show Welcome Text if no data is provided -->
      <template v-else>
        <p>{{ welcomeText }}</p>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: false,
    },
    welcomeText: {
      type: String,
      required: false,
    },
    numberOfDisorders: {
      type: Number,
      required: false,
      default: 0,
    },
    disorder: {
      type: Object,
      required: false,
    },
  },
  data() {
    return {
      iconPath: '',
    }
  },

  mounted() {
    // console.log(this.fixEncoding('Haltestelle Ã¶ffnet Ã¼bermorgen'))
    // Expected output: "Haltestelle öffnet übermorgen"
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
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleString('de-DE')
    },
    replaceAllSpecialChars(str) {
      if (!str) return ''
      return str
        .replaceAll('Ã¼', 'ü')
        .replaceAll('Ã¶', 'ö')
        .replaceAll('Ã¤', 'ä')
        .replaceAll('ÃŸ', 'ß')
    },
    getIconSrc(type) {
      console.log(type)
      if (type.isStairs) {
        this.iconPath = 'src/assets/icons/escalator.png'
      }
      if (type.isElevator) {
        this.iconPath = 'src/assets/icons/elevator.png'
      }
      return this.iconPath
    },
  },
}
</script>

<style scoped>
.bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  margin: 0 auto;
  width: 100vw;
  max-height: 35vh;
  border-top: 1px solid #444;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(15px);
  opacity: 0.95;
  transition: all 0.3s ease-out;
  color: white;
  overflow-y: auto;
  box-shadow: 0 -5px 10px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.bar--content {
  min-height: 35vh;
}

.floating-action-bar {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  text-align: center;
  padding: 1.5rem;
}

.bar:hover {
  opacity: 1;
}

.call-out {
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 0.75rem;
}

.disorder-box {
  display: flex;
  justify-content: flex-start;
  gap: 1.5rem;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 1rem 2rem;
  margin: 1rem 0;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  min-width: 30vw;
  max-width: 30vw;
}

.disorder-box--wrapper {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.disorder-box:hover {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5);
}

.disorder-box--icon {
  filter: invert(1);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
}

.disorder-box--icon img {
  width: 80%;
  height: 80%;
  object-fit: contain;
}

.disorder-box--content {
  flex: 1;
  text-align: left;
  font-size: 1rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.9);
}

.disorder-box--title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #34dbc8;
}

.disorder-box--text {
  font-size: 0.95rem;
  opacity: 0.8;
}

.chevron-svg {
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    background: none;
  }
}

.close-button {
  position: absolute;
  top: 0;
  right: 0;
  padding: 1rem;
  font-size: 1.5rem;
  background: none;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: #34dbc8;
  }
}
</style>
