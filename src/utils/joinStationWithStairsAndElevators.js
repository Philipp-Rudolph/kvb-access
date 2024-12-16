/**
 *
 * @param {*} stationData
 * @param {*} stationLocationData
 * @param {*} stairsData
 * @param {*} elevatorData
 * @returns
 */
function joinStationWithStairsAndElevators(
  stationData,
  stationLocationData,
  stairsData,
  elevatorData,
) {
  // Helper function to find the station by Kurzname
  const findStationByKurzname = (Kurzname) => {
    return stationData.find((station) => station.properties.kurzname === Kurzname)
  }

  const findStationWithDisorder = (station) => {
    if (
      stairsData.find(
        (stair) => stair.properties.Haltestellenbereich === station.properties.Haltestellenbereich,
      )
    ) {
      return true
    }
    if (
      elevatorData.find(
        (elevator) =>
          elevator.properties.Haltestellenbereich === station.properties.Haltestellenbereich,
      )
    ) {
      return true
    }
    return false
  }

  const filterOutBusStations = (stations) => {
    return stations.filter((station) => {
      return station.properties.Betriebsbereich === 'STRAB'
    })
  }

  const removeDuplicates = (stations) => {
    const seen = new Set()
    return stations.filter((station) => {
      const duplicate = seen.has(station.properties.Kurzname)
      seen.add(station.properties.Kurzname)
      return !duplicate
    })
  }

  // Merge Station with Stairs Data
  const mergedStairsData = stairsData.map((stair) => {
    const station = findStationByKurzname(stair.properties.Kurzname)
    return {
      ...stair,
      stationInfo: station ? station.properties : null,
      type: 'stair',
    }
  })

  // Merge Station with Elevator Data
  const mergedElevatorData = elevatorData.map((elevator) => {
    const station = findStationByKurzname(elevator.properties.Kurzname)
    return {
      ...elevator,
      stationInfo: station ? station.properties : null,
      type: 'elevator',
    }
  })

  // Merge Station Location Data with corresponding Station Data
  let mergedStationLocationData = stationLocationData.map((location) => {
    let station = findStationByKurzname(location.properties.Kurzname)

    return {
      ...location,
      stationInfo: station ? station.properties : null,
      type: 'station',
      hasDisorder: findStationWithDisorder(station),
    }
  })

  mergedStationLocationData = filterOutBusStations(mergedStationLocationData)
  mergedStationLocationData = removeDuplicates(mergedStationLocationData)

  return {
    mergedStairsData,
    mergedElevatorData,
    mergedStationLocationData,
  }
}

export default joinStationWithStairsAndElevators
