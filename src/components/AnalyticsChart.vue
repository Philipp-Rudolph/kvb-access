<template>
  <div class="flex-wrapper collapsible">
    <div class="header">
      <span class="spacer"></span>
      <p>Statistik</p>
      <!-- Chevron für das Ein- & Ausklappen -->
      <div class="chevron" :class="{ collapse: localIsCollapsed }" @click="toggleCollapse">
        <div class="chevron--line"></div>
        <div class="chevron--line"></div>
      </div>
    </div>

    <!-- Der einklappbare Bereich -->
    <div class="collapsible">
      <div class="chart-container">
        <div class="charts">
          <div class="single-chart" v-for="(chart, index) in charts" :key="index">
            <svg viewBox="0 0 36 36" class="circular-chart">
              <path
                class="circle-bg"
                d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                class="circle"
                :stroke-dasharray="`${chart.percentage}, 100`"
                :stroke="chart.strokeColor"
                d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <img :src="chart.icon" alt="icon" class="icon" />
          </div>
        </div>
      </div>

      <!-- Tabelle -->
      <table class="data-table">
        <thead>
          <tr>
            <th>Kategorie</th>
            <th>Defekt</th>
            <th>Gesamt</th>
            <th>Prozent</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(chart, index) in charts" :key="index">
            <td>{{ chart.label }}</td>
            <td>{{ chart.number }}</td>
            <td>{{ chart.total }}</td>
            <td :style="{ color: chart.strokeColor }">{{ chart.percentage }}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnalyticsChart',
  props: {
    numOfStairs: { type: Number, required: true },
    numOfStairsBroken: { type: Number, required: true },
    numOfElevators: { type: Number, required: true },
    numOfElevatorsBroken: { type: Number, required: true },
    numOfStations: { type: Number, required: true },
    numOfStationsBroken: { type: Number, required: true },
    isCollapsed: { type: Boolean, default: true },
  },
  data() {
    return {
      localIsCollapsed: this.isCollapsed,
    }
  },
  watch: {
    isCollapsed(newVal) {
      this.localIsCollapsed = newVal
    },
  },
  computed: {
    percentageStairsBroken() {
      return Math.abs(Math.ceil((this.numOfStairsBroken / this.numOfStairs) * 100) - 100)
    },
    percentageElevatorsBroken() {
      return Math.abs(Math.ceil((this.numOfElevatorsBroken / this.numOfElevators) * 100) - 100)
    },
    percentageStationsBroken() {
      return Math.abs(Math.ceil((this.numOfStationsBroken / this.numOfStations) * 100) - 100)
    },
    charts() {
      return [
        {
          label: 'Rolltreppen in Betrieb',
          percentage: this.percentageStairsBroken,
          number: this.numOfStairsBroken,
          total: this.numOfStairs,
          strokeColor: this.getStrokeColor(this.percentageStairsBroken),
          icon: '/assets/icons/escalator.png',
        },
        // {
        //   label: 'Haltestellen betroffen',
        //   percentage: this.percentageStationsBroken,
        //   number: this.numOfStationsBroken,
        //   total: this.numOfStations,
        //   strokeColor: this.getStrokeColor(this.percentageStationsBroken),
        //   icon: '/assets/icons/train.png',
        // },
        {
          label: 'Aufzüge in Betrieb',
          percentage: this.percentageElevatorsBroken,
          number: this.numOfElevatorsBroken,
          total: this.numOfElevators,
          strokeColor: this.getStrokeColor(this.percentageElevatorsBroken),
          icon: '/assets/icons/elevator.png',
        },
      ]
    },
  },
  methods: {
    toggleCollapse() {
      this.localIsCollapsed = !this.localIsCollapsed
      this.$emit('isCollapsed', this.localIsCollapsed) // ✅ Event an Parent senden
    },
    getStrokeColor(percentage) {
      if (percentage > 80) return '#00bd7e'
      if (percentage > 60) return '#ffcc00'
      return '#ff0000'
    },
  },
}
</script>

<style scoped>
.flex-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 20px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(1.5px);
  border-radius: 5px 5px 0 0;
  color: white;
  text-align: center;
  max-width: 500px;
  width: 100%;
  height: auto;
  margin: auto;

  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;

  z-index: 1000;

  transition: all 0.3s;

  &:hover {
    backdrop-filter: blur(5px);
  }
}

.header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;

  .spacer {
    width: 32px;
  }
}

/* Chevron Button */
.chevron {
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;

  transform: rotate(180deg);

  &:hover {
    .chevron--line {
      background-color: #00bd7e;
    }
  }
}

.chevron.collapse {
  transform: rotate(0deg);
}

.chevron--line {
  position: absolute;
  width: 14px;
  height: 3px;
  background-color: white;
  border-radius: 2px;
  transition: background-color 0.2s;

  &:nth-child(1) {
    transform: rotate(45deg) translate(3px, 0px);
  }

  &:nth-child(2) {
    transform: rotate(-45deg) translate(-6px, -3px);
  }
}

/* Einklappbare Sektion */
.collapsible {
  overflow: hidden;
  max-height: 500px; /* Anpassbar */
  transition: max-height 0.4s ease-in-out;
}

.collapsible.collapsed {
  max-height: 0;
}
.chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  /* gap: 1rem; */
  padding: 1rem;
}

.charts {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 1rem;
}

.single-chart {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.circular-chart {
  max-width: 80px;
}

.circle-bg {
  fill: none;
  stroke-width: 3.8;
  transition: stroke 0.3s;
}

.circle {
  fill: none;
  stroke-width: 2.8;
  stroke-linecap: round;
  animation: progress 1s ease-out forwards;
}

@keyframes progress {
  0% {
    stroke-dasharray: 0 100;
  }
}

.percentage {
  fill: #fff;
  font-size: 0.5em;
  text-anchor: middle;
  z-index: 10000;
}

.icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  transform: translate(0px, 22px);
  opacity: 1;
}

/* Tabelle Styling */
.data-table {
  width: 100%;
  margin-top: 1rem;
  border-collapse: collapse;
  border-spacing: 0;
  border-radius: 1rem;
  overflow: hidden;
  /* remove outline */
  outline: none;
  border: 1px solid white;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(1.5px);
}

.data-table th,
.data-table td {
  border: 1px solid white;
  padding: 8px;
  text-align: center;
}

.data-table th {
  background: rgba(255, 255, 255, 0.2);
}

.data-table tr:nth-child(even) {
  background: rgba(255, 255, 255, 0.1);
}
</style>
