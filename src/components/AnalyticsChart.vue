<template>
  <div class="flex-wrapper">
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
          <p>
            {{ chart.number }} / {{ chart.total }} ({{ chart.percentage }}%) <br />
            {{ chart.label }}
          </p>
        </div>
      </div>

      <!-- Tabelle für die Daten
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
      </table> -->
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'AnalyticsChart',
  props: {
    numOfStairs: { type: Number, required: true },
    numOfStairsBroken: { type: Number, required: true },
    numOfElevators: { type: Number, required: true },
    numOfElevatorsBroken: { type: Number, required: true },
    numOfStations: { type: Number, required: true },
    numOfStationsBroken: { type: Number, required: true },
  },
  computed: {
    percentageStairsBroken() {
      return Math.ceil((this.numOfStairsBroken / this.numOfStairs) * 100)
    },
    percentageElevatorsBroken() {
      return Math.ceil((this.numOfElevatorsBroken / this.numOfElevators) * 100)
    },
    percentageStationsBroken() {
      return Math.ceil((this.numOfStationsBroken / this.numOfStations) * 100)
    },
    charts() {
      return [
        {
          label: 'Rolltreppen defekt',
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
          label: 'Aufzüge defekt',
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
    getStrokeColor(percentage) {
      return percentage > 66 ? 'red' : percentage > 33 ? 'orange' : 'green'
    },
  },
}
</script>

<style scoped>
.flex-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(1.5px);
  border-radius: 1rem 1rem 0 0;
  color: white;
  text-align: center;
  max-width: 500px;
  margin: auto;

  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;

  z-index: 1000;

  transition: all 0.3s;

  &:hover {
    transform: scale(1.05);
    backdrop-filter: blur(5px);
  }
}

.chart-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.charts {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 1rem;
}

.single-chart {
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
  stroke: #cdcdcd;
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
