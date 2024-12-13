const joinStationMarker = (stations, marker, type) => {
  const markerStation = marker.properties.Haltestellenbereich
  const station = stations.find(
    (station) => station.properties.Haltestellenbereich === markerStation,
  )
  return {
    ...marker,
    station: station,
    type,
  }
}

export default joinStationMarker
