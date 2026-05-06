import React, { useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

export default function DeliveryCenterForm({ onCenterCreated }) {
    const [cityOrAddress, setCityOrAddress] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const geocodeAddress = async (address) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
            const data = await response.json();
            
            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon),
                    displayName: data[0].display_name
                };
            }
            return null;
        } catch (err) {
            console.error('Geocoding error:', err);
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!cityOrAddress.trim()) {
            setError('Please enter a city or address');
            setLoading(false);
            return;
        }

        try {
            // 1. Geocode the address to get coordinates
            const coords = await geocodeAddress(cityOrAddress);
            
            if (!coords) {
                setError('Could not find coordinates for that address. Please try something more specific.');
                setLoading(false);
                return;
            }

            const centerName = name.trim() ? name : `${cityOrAddress} Hub`;

            // 2. Submit to API
            const payload = {
                name: centerName,
                latitude: coords.lat,
                longitude: coords.lon,
            };

            const response = await axios.post('/api/centers', payload);

            // Our API returns data nested inside a 'data' key based on recent tests
            const createdCenter = response.data.data || response.data;

            setSuccess('Delivery center added successfully!');
            setCityOrAddress('');
            setName('');
            
            // 3. Inform parent component
            onCenterCreated(createdCenter);
            
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.errors) {
                const firstError = Object.values(err.response.data.errors)[0][0];
                setError(firstError);
            } else {
                setError('An error occurred while creating the delivery center.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
                <div style={{ padding: '0.75rem', backgroundColor: '#450a0a', color: '#fca5a5', borderRadius: '0.5rem', fontSize: '0.875rem', border: '1px solid #7f1d1d' }}>
                    {error}
                </div>
            )}
            
            {success && (
                <div style={{ padding: '0.75rem', backgroundColor: '#064e3b', color: '#6ee7b7', borderRadius: '0.5rem', fontSize: '0.875rem', border: '1px solid #065f46' }}>
                    {success}
                </div>
            )}

            <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#d1d5db' }}>
                    City or Address
                </label>
                <input 
                    type="text" 
                    value={cityOrAddress}
                    onChange={(e) => setCityOrAddress(e.target.value)}
                    placeholder="e.g., Los Angeles, CA"
                    style={{ 
                        width: '100%', 
                        padding: '0.75rem', 
                        backgroundColor: '#1f2937', 
                        color: '#f9fafb', 
                        border: '1px solid #374151', 
                        borderRadius: '0.5rem',
                        outline: 'none'
                    }}
                    disabled={loading}
                />
            </div>

            <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#d1d5db' }}>
                    Center Name (Optional)
                </label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Main Hub"
                    style={{ 
                        width: '100%', 
                        padding: '0.75rem', 
                        backgroundColor: '#1f2937', 
                        color: '#f9fafb', 
                        border: '1px solid #374151', 
                        borderRadius: '0.5rem',
                        outline: 'none'
                    }}
                    disabled={loading}
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                style={{ 
                    marginTop: '0.5rem', 
                    padding: '0.75rem 1rem', 
                    backgroundColor: '#2563eb', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'background-color 0.2s'
                }}
            >
                {loading && <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />}
                {loading ? 'Processing...' : 'Register Delivery Center'}
            </button>
            
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes spin { 100% { transform: rotate(360deg); } }
                button:hover { background-color: #1d4ed8 !important; }
            `}} />
        </form>
    );
}
