// useAxios.ts
import { useState, useEffect } from 'react';
import axios, { AxiosRequestConfig } from 'axios';

const useAxios = <T>(url: string, reqBody?: any, method: 'GET' | 'POST' = 'GET') => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const config: AxiosRequestConfig = {
                    withCredentials: true,
                };

                let response;
                if (method === 'GET') {
                    response = await axios.get(url, config);
                } else if (method === 'POST') {
                    response = await axios.post(url, reqBody, config);
                }

                if (response) {
                    setData(response.data);
                } else {
                    setError('Response is undefined');
                }
            } catch (err) {
                setError('---------  Request Failed! ----------');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url, reqBody, method]);

    return { data, loading, error };
};

export default useAxios;
