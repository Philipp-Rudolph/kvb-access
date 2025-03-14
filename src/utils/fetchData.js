const fetchData = async (url) => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json', // Request JSON format
      },
    })

    // Fetch raw binary data
    const buffer = await response.arrayBuffer()

    const text = new TextDecoder('iso-8859-2').decode(buffer)

    // Parse JSON or repair if necessary
    let data
    try {
      data = JSON.parse(text)
    } catch (e) {
      console.error('JSON Parsing Error:', e)
    }

    return data
  } catch (error) {
    console.error('Fetch Error:', error)
  }
}

export default fetchData
