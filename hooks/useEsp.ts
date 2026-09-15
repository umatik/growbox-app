import { useCallback, useMemo, useState } from "react";
import { EspResponse } from "@box-controller/shared/interfaces/esp.interface";
import { createBoxService } from "@box-controller/shared/services/box.services";

export const useEsp = () => {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    const apiToken = process.env.EXPO_PUBLIC_API_TOKEN;

    const [data, setData] = useState<EspResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const boxService = useMemo(() => {
        if (!apiUrl || !apiToken) {
            throw new Error("ESP API configuration is missing");
        }

        return createBoxService(apiUrl, apiToken);
    }, [apiUrl, apiToken]);

    const fetchConfig = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const response = await boxService.getConfig();
            setData(response);
        } catch (err) {
            const error =
                err instanceof Error ? err : new Error("Connection error");

            setError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [boxService]);

    const toggleLight = useCallback(async () => {
        await boxService.toggleLight();
        await fetchConfig();
    }, [boxService, fetchConfig]);

    const toggleFan = useCallback(async () => {
        await boxService.toggleFan();
        await fetchConfig();
    }, [boxService, fetchConfig]);


    return {
        loading,
        error,
        data,
        fetchConfig,
        toggleLight,
    };
};

export default useEsp;