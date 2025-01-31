import { useState, useCallback } from 'react';

export const useApi = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const execute = useCallback(async (apiFunc) => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiFunc();
            setData(result);
            return result;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, error, loading, execute };
};