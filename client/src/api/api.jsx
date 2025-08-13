const BASE_URL = import.meta.env.VITE_API_BASEURL
// const BASE_URL = "http://192.168.209.47:8000/"

const apiRequest = async (endpoint, method = 'GET', body = {}, headers = { 'Content-Type': 'application/json' }) => {
    const url = `${BASE_URL}${endpoint}`;
    let options = {
        method,
        headers,
        body: Object.keys(body).length ? JSON.stringify(body) : undefined,
    };
    if (method === 'GET') {
        options = {
            method,
            headers,
        };  
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorDetails = await response.text();
            // console.log("Details", errorDetails);
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        // console.log("got api request");
        return await response.json();
    } catch (error) {
        // console.error('Error in API request:', error.message, error.stack);
        throw error;
    }
};

export default apiRequest;