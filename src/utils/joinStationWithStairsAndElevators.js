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
  const findDisorders = (station) => {
    if (!station) return false

    // Find all stairs with disorder and add type
    const stairDisorders = stairsData
      .filter(
        (stair) => stair.properties.Haltestellenbereich === station.properties.Haltestellenbereich,
      )
      .map((stair) => ({ ...stair, type: { isStairs: true } })) // Attach type: { isStairs: true }

    // Find all elevators with disorder and add type
    const elevatorDisorders = elevatorData
      .filter(
        (elevator) =>
          elevator.properties.Haltestellenbereich === station.properties.Haltestellenbereich,
      )
      .map((elevator) => ({ ...elevator, type: { isElevator: true } })) // Attach type: { isElevator: true }

    // Combine both types of disorders
    return [...stairDisorders, ...elevatorDisorders]
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
    const station = findStationByKurzname(location.properties.Kurzname)

    // Get all disorders related to this station
    const disorders = station ? findDisorders(station) : []

    return {
      ...location,
      stationInfo: station ? station.properties : null,
      type: 'station',
      disorders, // Append all disorders with their types
      hasDisorder: disorders.length > 0, // Boolean flag if there are any disorders
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
