const fetchData = async (url) => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Charset': 'utf-8', // Ensure UTF-8 encoding
      },
    })

    // Handle the response as text and decode with UTF-8
    const text = await response.text()
    const decodedText = new TextDecoder('utf-8').decode(new TextEncoder().encode(text))
    const data = JSON.parse(decodedText)

    return data
  } catch (error) {
    console.error('Fetch Error: ', error)
  }
}

export default fetchData
