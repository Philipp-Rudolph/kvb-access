const fetchData = async (url, timeout = 15000) => {
  const controller = new AbortController()
  const signal = controller.signal

  // Start timeout countdown *AFTER* fetch starts
  const timeoutId = setTimeout(() => {
    console.warn(`Request to ${url} timed out after ${timeout / 1000} seconds`)
    controller.abort()
  }, timeout)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal, // Attach the abort signal
    })

    clearTimeout(timeoutId) // Prevent timeout after successful response

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const buffer = await response.arrayBuffer()
    const text = new TextDecoder('iso-8859-2').decode(buffer)

    let data = null
    try {
      data = JSON.parse(text)
    } catch (e) {
      console.error('JSON Parsing Error:', e)
      throw new Error('Failed to parse JSON')
    }

    return data
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`Fetch request to ${url} was aborted due to timeout.`)
    } else {
      console.error(`Fetch Error: ${error.message}`)
    }
    return null // Return null instead of crashing
  } finally {
    clearTimeout(timeoutId) // Ensure timeout is cleared in all cases
  }
}

export default fetchData
