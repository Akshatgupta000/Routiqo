import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DeliveryCenterForm from './components/DeliveryCenterForm';
import MapComponent from './components/MapComponent';
import { MapPin, Route, ChevronDown } from 'lucide-react';

export default function AppContainer() {
    const [centers, setCenters] = useState([]);
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch existing centers on mount
    useEffect(() => {
        fetchCenters();
    }, []);

    const fetchCenters = async () => {
        try {
            const response = await axios.get('/api/centers');
            // Assuming the structure is { data: [...] } based on our earlier tests
            setCenters(response.data.data || response.data);
        } catch (err) {
            console.error('Error fetching centers:', err);
        }
    };

    const handleCenterCreated = (newCenter) => {
        setCenters(prev => [...prev, newCenter]);
        setSelectedCenter(newCenter);
    };

    const handleCenterSelect = (e) => {
        const centerId = parseInt(e.target.value);
        const center = centers.find(c => c.id === centerId);
        setSelectedCenter(center || null);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'system-ui, sans-serif', backgroundColor: '#111827', color: '#f9fafb' }}>
            <header style={{ padding: '1rem', backgroundColor: '#1f2937', borderBottom: '1px solid #374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin color="#60a5fa" />
                <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Last-Mile Route Planner</h1>
            </header>
            
            <main style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Sidebar */}
                <div style={{ width: '400px', padding: '1.5rem', backgroundColor: '#111827', borderRight: '1px solid #374151', overflowY: 'auto' }}>
                    
                    {/* Delivery Center Select (Matches Screenshot) */}
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                            Delivery Center
                        </label>
                        <div style={{ position: 'relative' }}>
                            <select 
                                value={selectedCenter?.id || ''} 
                                onChange={handleCenterSelect}
                                style={{ 
                                    width: '100%', 
                                    padding: '0.75rem 1rem', 
                                    backgroundColor: '#1f2937', 
                                    color: '#f9fafb', 
                                    border: '1px solid #374151', 
                                    borderRadius: '0.75rem',
                                    appearance: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1rem'
                                }}
                            >
                                <option value="">Select a center...</option>
                                {centers.map(center => (
                                    <option key={center.id} value={center.id}>{center.name}</option>
                                ))}
                            </select>
                            <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                <ChevronDown size={20} color="#9ca3af" />
                            </div>
                        </div>
                    </div>

                    {/* Active Route Section (Matches Screenshot) */}
                    <div style={{ padding: '1.5rem', backgroundColor: '#1f2937', borderRadius: '1rem', border: '1px solid #374151', marginBottom: '2rem' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Active Route
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                            Generate a route to see summary.
                        </p>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #374151', margin: '2rem 0' }} />

                    {/* Add New Center Section */}
                    <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#60a5fa' }}>Register New Center</h2>
                    <DeliveryCenterForm onCenterCreated={handleCenterCreated} />
                </div>

                {/* Map Area */}
                <div style={{ flex: 1, position: 'relative', backgroundColor: '#111827' }}>
                    <MapComponent selectedCenter={selectedCenter} />
                </div>
            </main>
        </div>
    );
}
