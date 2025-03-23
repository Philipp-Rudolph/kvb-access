<template>
  <div>
    <div class="seach-bar">
      <div class="search-bar__input">
        <input
          type="text"
          v-model="search"
          @keyup.enter="seachStation"
          placeholder="Nach Haltstelle suchen"
        />
      </div>
      <div v-if="search.length > 0">
        <div class="search-bar__results">
          <div
            class="search-bar__result"
            v-for="station in filteredStations(search)"
            :key="station.item.stationInfo.Haltestellenname"
            @click="selectStation(station)"
          >
            {{ station.item.stationInfo.Haltestellenname }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    data: {
      type: Array,
      required: false,
    },
  },
  data() {
    return {
      search: '',
    }
  },
  methods: {
    filteredStations(searchValue) {
      const lowercaseSearch = searchValue.toLowerCase()

      // Assign a score to each station based on how closely it matches the search value
      return this.data
        .map((station) => {
          const stationName = station.item.stationInfo.Haltestellenname.toLowerCase()
          let score = 0

          if (stationName.startsWith(lowercaseSearch)) {
            // Higher score for exact prefix matches
            score = 3
          } else if (stationName.includes(lowercaseSearch)) {
            // Lower score for substring matches
            score = 2
          }

          return { station, score }
        })
        .filter((entry) => entry.score > 0) // Only include stations with a match
        .sort(
          (a, b) =>
            b.score - a.score ||
            a.station.item.stationInfo.Haltestellenname.localeCompare(
              b.station.item.stationInfo.Haltestellenname,
            ),
        ) // Sort by score, then alphabetically
        .map((entry) => entry.station) // Return only the station objects
    },

    selectStation(station) {
      this.$emit('selectStation', station)
      this.search = ''
    },
  },
}
</script>

<style scoped>
.seach-bar {
  display: flex;
  flex-direction: column;
  /* justify-content: center; */
  margin-top: 20px;

  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;

  width: 100%;
  max-width: 500px;
  min-width: 300px;
  padding: 0 20px;
}

.search-bar__input {
  width: 100%;
}

.search-bar__input > input {
  width: 100%;
  padding: 1rem;

  font-size: 1rem;

  border-radius: 5px;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  color: white;
  outline: none;
  border: none;
  text-align: center;

  &:focus::placeholder {
    color: transparent;
  }

  &::placeholder {
    color: #eee;
  }
}

.search-bar__results {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 0.25rem;
  max-height: 50vh;
  overflow: auto;
}

.search-bar__result {
  width: 100%;
  padding: 15px;
  margin-top: 10px;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(5px);
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease-out;
  text-align: center;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
