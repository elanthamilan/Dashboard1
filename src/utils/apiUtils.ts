// src/utils/apiUtils.ts

export const API_BASE_URL = '/api'; // Adjust if your API is hosted elsewhere

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/**
 * Fetches data from the specified API endpoint.
 * @param endpoint The API endpoint to fetch data from (e.g., '/principal-view/admissions').
 * @returns A promise that resolves to the JSON response.
 * @throws An error if the network response is not ok.
 */
export async function fetchData<T>(endpoint: string): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorBody || response.statusText}`);
    }
    return await response.json() as T;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    throw error; // Re-throw the error to be caught by the calling component
  }
}

// Example usage (for components, typically within a custom hook or useEffect):
/*
import { useEffect, useState } from 'react';
import { fetchData } from './apiUtils'; // Adjust path as necessary

interface MyData {
  id: number;
  name: string;
}

function MyComponent() {
  const [data, setData] = useState<MyData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchData<MyData>('/example-endpoint'); // Replace with your actual endpoint
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!data) return <p>No data.</p>;

  return <div>{data.name}</div>;
}
*/
