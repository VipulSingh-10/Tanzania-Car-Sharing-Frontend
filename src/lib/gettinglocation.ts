export type Loc = [number, number];

export async function getLocation(options?: {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
}): Promise<Loc | null> {
    if (!('geolocation' in navigator)) return null;
    const timeoutMs = options?.timeout ?? 10000;
    return new Promise<Loc | null>((resolve) => {
        const timer = window.setTimeout(() => resolve(null), timeoutMs);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                clearTimeout(timer);
                resolve([pos.coords.longitude, pos.coords.latitude]);
            },
            () => {
                clearTimeout(timer);
                resolve(null);
            },
            {
                enableHighAccuracy: options?.enableHighAccuracy ?? true,
                timeout: timeoutMs,
                maximumAge: options?.maximumAge ?? 0,
            }
        );
    });
}

export default getLocation;