import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import MapFlyTo from './MapFlyTo';

// Fix for default Leaflet marker icons not loading correctly in React/Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for the delivery center
const centerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export default function MapComponent({ selectedCenter }) {
    // Default to a generic view (e.g., center of US)
    const defaultCenter = [39.8283, -98.5795];

    return (
        <MapContainer 
            center={defaultCenter} 
            zoom={4} 
            style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapFlyTo center={selectedCenter} />

            {selectedCenter && selectedCenter.latitude && selectedCenter.longitude && (
                <Marker 
                    position={[selectedCenter.latitude, selectedCenter.longitude]}
                    icon={centerIcon}
                >
                    <Popup>
                        <strong>{selectedCenter.name}</strong><br/>
                        Delivery Center
                    </Popup>
                </Marker>
            )}
        </MapContainer>
    );
}
