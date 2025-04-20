<template>
  <div class="chart-container" :class="{ 'dark-mode': darkMode, 'light-mode': !darkMode }">
    <!-- Card-Layout für Statistiken -->
    <div class="data-cards">
      <div class="data-card" v-for="(chart, index) in charts" :key="index">
        <div class="chart-wrapper">
          <svg viewBox="0 0 36 36" class="circular-chart">
            <path class="circle-bg" d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path class="circle" :stroke-dasharray="`${chart.percentage}, 100`" :stroke="chart.strokeColor"
              d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" />
          </svg>
          <div class="icon-wrapper">
            <img :src="chart.icon" alt="icon" class="icon" />
          </div>
        </div>

        <div class="card-info">
          <h3 class="card-title">{{ chart.label }}</h3>
          <div class="card-stats">
            <div class="stat-item">
              <span class="stat-label">Defekt:</span>
              <span class="stat-value">{{ chart.number }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Gesamt:</span>
              <span class="stat-value">{{ chart.total }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">In Betrieb:</span>
              <span class="stat-value" :style="{ color: chart.strokeColor }">{{ chart.percentage }}%</span>
            </div>
          </div>
        </div>
      </div>
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
    isCollapsed: { type: Boolean, default: false },
    darkMode: { type: Boolean, default: true },
  },
  computed: {
    charts() {
      return [
        {
          label: 'Haltestellen',
          percentage: this.percentageBroken(this.numOfStationsBroken, this.numOfStations),
          number: this.numOfStationsBroken,
          total: this.numOfStations,
          strokeColor: this.getStrokeColor(
            this.percentageBroken(this.numOfStationsBroken, this.numOfStations),
          ),
          icon: '/icons/train.png',
        },
        {
          label: 'Rolltreppen',
          percentage: this.percentageBroken(this.numOfStairsBroken, this.numOfStairs),
          number: this.numOfStairsBroken,
          total: this.numOfStairs,
          strokeColor: this.getStrokeColor(
            this.percentageBroken(this.numOfStairsBroken, this.numOfStairs),
          ),
          icon: '/assets/icons/escalator.png',
        },
        {
          label: 'Aufzüge',
          percentage: this.percentageBroken(this.numOfElevatorsBroken, this.numOfElevators),
          number: this.numOfElevatorsBroken,
          total: this.numOfElevators,
          strokeColor: this.getStrokeColor(
            this.percentageBroken(this.numOfElevatorsBroken, this.numOfElevators),
          ),
          icon: '/assets/icons/elevator.png',
        },
      ]
    },
  },
  methods: {
    percentageBroken(brokenItems, totalItems) {
      return Math.abs(Math.ceil((brokenItems / totalItems) * 100) - 100)
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
.chart-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

/* Dark Mode Styles */
.chart-container {
  color: var(--text-color);
}

.data-card {
  background: var(--background-color-darker);
}

.data-card:hover {
  background: var(--hover-background);
}

.circle-bg {
  stroke: var(--hover-background);
}

.icon {
  filter: var(--filter-invert);
}

.stat-label {
  color: var(--gray-color);
}

/* Common Styles */
.data-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.data-card {
  display: flex;
  align-items: center;
  border-radius: 0.5rem;
  padding: 1rem;
  transition: background-color 0.2s;
}

.chart-wrapper {
  position: relative;
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 1rem;
  flex-shrink: 0;
}

.circular-chart {
  max-width: 60px;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.circle-bg {
  fill: none;
  stroke-width: 3.8;
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

.icon-wrapper {
  position: absolute;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}

.icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  opacity: 1;
  padding: 3px;
  background-color: transparent;
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.card-stats {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-value {
  font-weight: 500;
  font-size: 0.9rem;
}

@media (max-width: 480px) {
  .card-stats {
    flex-direction: column;
    gap: 0.3rem;
  }
}
</style>
