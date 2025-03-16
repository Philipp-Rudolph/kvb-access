const fetchData = async (url) => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    // Hole den Response direkt als Text (der Proxy kümmert sich um die Kodierung)
    const text = await response.text();

    // Parse JSON oder repariere falls notwendig
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('JSON Parsing Error:', e);
      console.log('Problematischer Text:', text.substring(0, 200)); // Zeige Anfang des Textes für Debugging
    }
    return data;
  } catch (error) {
    console.error('Fetch Error:', error);
  }
};

export default fetchData;
