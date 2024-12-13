const mergeStationLocation = async (stations, stationsLocation) => {
  // Create a lookup map for stationLocation by 'Kurzname'
  const locationMap = new Map(
    stationsLocation.map((location) => [location.properties.Kurzname, location]),
  )

  // console.log(stations)

  // First, filter out stations that don't match the conditions
  const filteredStations = stations.filter((station) => {
    const stationLocation = locationMap.get(station.properties.kurzname)
    // Exclude if Betriebsbereich is not exactly 'STRAB' or if it is 'BUS STRAB'
    if (!stationLocation || station.properties.Betriebsbereich === 'BUS') {
      return false // Exclude this station from the result
    }
    return true // Include this station
  })

  // Now safely map over the filtered stations to merge with stationLocation
  return filteredStations.map((station) => {
    const stationLocation = locationMap.get(station.properties.kurzname)
    // create a new object with the station properties and the location properties
    return {
      ...station,
      ...(stationLocation || {}), // Merge only if stationLocation exists
    }
  })
}

export default mergeStationLocation
