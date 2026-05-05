import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export default function MapFlyTo({ center }) {
    const map = useMap();

    useEffect(() => {
        if (center && center.latitude && center.longitude) {
            map.flyTo([center.latitude, center.longitude], 13, {
                duration: 1.5,
                animate: true
            });
        }
    }, [center, map]);

    return null;
}
