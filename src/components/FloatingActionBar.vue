<template>
  <div>
    <!-- Action Bar -->
    <div class="bar floating-action-bar">
      <!-- Show Description if data is provided -->
      <template v-if="data">
        <button @click="$emit('close')" class="close-button">
          <img src="@/assets/icons/close.png" alt="" />
        </button>
        <div class="bar--content">
          <!-- Header Section -->
          <h1 v-if="isStation">Haltestelle {{ data.properties.Name }}</h1>

          <h1 v-else-if="isStairs">Rolltreppe defekt</h1>
          <h1 v-else-if="isElevator">Aufzug defekt</h1>

          <!-- Details Section -->
          <template v-if="!isStation">
            <p class="description call-out call-out--alert">
              {{ isStairs ? 'Diese Rolltreppe' : 'Dieser Aufzug' }}
              {{ data.properties.Bezeichnung }} ist defekt
            </p>
            <p>zuletzt aktualisiert: {{ formatDate(data.properties.timestamp) }}</p>
          </template>

          <!-- Description Section -->
          <template v-else>
            <p v-if="data.hasDisorder" class="description call-out call-out--alert">
              An dieser Haltestelle gibt es Störungen an {{ totalNumberOfDisorders }} Rolltreppen
              und / oder Aufzügen. Klicken Sie <a href="#disorders">hier</a> für mehr Informationen.
              <br />
              <br />
              <span>
                Laden Sie<a :href="data.stationInfo.Lageplan">hier</a> den Lageplan der Haltestelle
                runter, um eine alternative Route zu finden
              </span>
            </p>
            <!-- <p class="description call-out call-out--info">
              Laden Sie
              <a :href="data.stationInfo.Lageplan">hier</a> den Lageplan der Haltestelle runter, um
              eine alternative Route zu finden
            </p> -->
            <p>Hier fahren die Linien: {{ data.properties.Linien.replaceAll(' ', ', ') }}</p>
          </template>

          <div v-if="data.hasDisorder" class="chevron-down">
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
              <h3 v-if="disorder.type.isStairs" class="disorder-box--title">
                Rolltreppe
                {{ disorder.properties.Bezeichnung }} defekt
              </h3>
              <h3 v-else-if="disorder.type.isElevator" class="disorder-box--title">
                Aufzug {{ disorder.properties.Bezeichnung }} defekt
              </h3>
              <!-- <p class="disorder-box--text">{{ disorder.properties.Bezeichnung }}</p> -->
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
        <p class="description call-out call-out--alert">{{ subText }}</p>
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
    subText: {
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
/* import /assets/css/animation.css */
@import url('@/assets/css/animation.css');

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

  /* remove scroll bar */
  scrollbar-width: none;
  -ms-overflow-style: none;

  /* remove scroll bar for Chrome */
  &::-webkit-scrollbar {
    display: none;
  }
}

.bar--content {
  margin-bottom: 1rem;
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
  padding: 1rem;
  border-radius: 0.75rem;
  width: fit-content;
  margin: 1rem auto;

  & > span {
    color: rgb(201, 199, 199);
  }
}

.call-out--info {
  background: rgba(184, 184, 184, 0.1);
  color: #34dbc8;
}

.call-out--alert {
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
}

.disorder-box {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0.5rem 0.25rem;
  margin: 0.5rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  width: 100%;
  /* overflow: hidden; */
  white-space: normal;
  transition: all 0.3s ease;
}

.disorder-box--wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 80%;
  margin: 1rem auto;
}

.disorder-box:hover {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5);
}

.disorder-box--icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgb(255, 255, 255);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  position: absolute;
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
  transition: all 0.3s ease;

  &:hover {
    /* aurora shadow effect */
    box-shadow:
      0 0 40px rgba(255, 0, 0, 0.9),
      0 0 60px rgba(255, 255, 255, 0.6);
  }
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
  padding: 0.5rem;
}

.disorder-box--title {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #34dbc8;
  text-align: center;
  margin-top: 1.5rem;
}

.disorder-box--text {
  font-size: 0.75rem;
  margin: 0;
  opacity: 0.8;
  transition: all 0.3s ease;
  text-align: center;
  &:hover {
    opacity: 1;
  }
}

.chevron-svg {
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(2);
    background: none;
  }
}

.close-button {
  position: absolute;
  top: -5px;
  right: 0;
  padding: 1rem;
  font-size: 1.5rem;
  background: none;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;

  & > img {
    height: 15px;
    width: 15px;
    filter: invert(1);
    object-fit: cover;
  }

  &:hover {
    color: #34dbc8;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
  }
}
</style>
