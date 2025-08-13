
// src/context/ApiContext.js
import { createContext } from 'react';

const ApiContext = createContext();

// In your API context (ApiContext.js)
const fetchData = async (endpoint, method = 'GET', body = null, headers = {}, isFormData = false) => {
  try {
    const options = {
      method,
      headers: {
        'auth-token': userToken,
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...headers
      }
    };

    if (body) {
      options.body = isFormData ? body : JSON.stringify(body);
    }

    const response = await fetch(`${apiBaseUrl}/${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    // console.error('API Error:', error);
    throw error;
  }
};
export default ApiContext;