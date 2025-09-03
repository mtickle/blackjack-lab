// --- Database Utility Functions ---
export async function saveThingsToDatabase(endpoint, data) {
    let apiUrl = 'https://game-api-zjod.onrender.com/api/' + endpoint;
    //let apiUrl = 'http://localhost:3001/api/' + endpoint;
    try {
        console.log(`Sending batch of ${data.length} games to ${endpoint}...`);
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data), // Send the array directly
        });
        if (!response.ok) throw new Error('Failed to save game batch');
        const result = await response.json();
        console.log("API Response:", result);
        return result;
    } catch (err) {
        console.error('Error saving game batch:', err.message || err);
    }
}

export async function loadThingsFromDatabase(endpoint, ...params) {
    try {
        const apiUrl = `https://game-api-zjod.onrender.com/api/${endpoint}/${params.join('/')}`;
        //const apiUrl = `http://localhost:3001/api/${endpoint}/${params.join('/')}`;
        const response = await fetch(apiUrl, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error loading data from database:', error);
        return null;
    }
}