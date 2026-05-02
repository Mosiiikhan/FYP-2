import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const IslamicAdjustment = () => {
    const [offset, setOffset] = useState(0);
    const [loading, setLoading] = useState(true);

    // ✅ Base URL update kiya gaya hai (/api/islamic)
    const API_URL = 'http://localhost:5000/api/islamic';

    // Database se current offset uthana
    useEffect(() => {
        const fetchCurrentOffset = async () => {
            try {
                // ✅ URL updated to match new route
                const res = await axios.get(`${API_URL}/get-hijri-offset`);
                setOffset(res.data.offset);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching offset", err);
                setLoading(false);
            }
        };
        fetchCurrentOffset();
    }, []);

    const handleUpdate = async (val) => {
        try {
            // ✅ URL updated to match new route
            const res = await axios.put(`${API_URL}/update-hijri-offset`, { 
                offsetValue: val // Backend 'offsetValue' ya 'offset' dono handle kar lega
            });

            if (res.data.success) {
                setOffset(val);
                Swal.fire({
                    title: 'Success!',
                    text: `Islamic Calendar adjusted by ${val} days.`,
                    icon: 'success',
                    confirmButtonColor: '#00645c'
                });
            }
        } catch (err) {
            console.error("Update error:", err);
            Swal.fire('Error', 'Failed to update calendar settings.', 'error');
        }
    };

    const btnStyle = (color, active) => ({
        padding: '12px 24px',
        backgroundColor: active ? color : '#e0e0e0',
        color: active ? 'white' : '#333',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: '0.3s',
        boxShadow: active ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
    });

    if (loading) return <div style={{ padding: '20px' }}>Loading settings...</div>;

    return (
        <div style={{ padding: '40px', fontFamily: "'Segoe UI', sans-serif" }}>
            <h2 style={{ color: '#00645c', marginBottom: '10px' }}>🌙 Islamic Calendar Adjustment</h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>Adjust Hijri dates for holidays like Eid, Ashura, etc.</p>

            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxWidth: '600px' }}>
                <div style={{ marginBottom: '25px', padding: '15px', borderLeft: '5px solid #00645c', backgroundColor: '#f0f9f8' }}>
                    <span style={{ fontSize: '16px', color: '#555' }}>Current System Offset:</span>
                    <h3 style={{ margin: '5px 0 0 0', fontSize: '24px', color: '#00645c' }}>{offset} Day(s)</h3>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                    <button onClick={() => handleUpdate(-1)} style={btnStyle('#d32f2f', offset === -1)}>-1 Day</button>
                    <button onClick={() => handleUpdate(0)} style={btnStyle('#00645c', offset === 0)}>Normal (0)</button>
                    <button onClick={() => handleUpdate(1)} style={btnStyle('#388e3c', offset === 1)}>+1 Day</button>
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <label style={{ display: 'block', fontSize: '14px', color: '#888', marginBottom: '8px' }}>Custom Adjustment (Advanced):</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input 
                            type="number" 
                            value={offset}
                            onChange={(e) => setOffset(e.target.value)}
                            onBlur={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val)) handleUpdate(val);
                            }}
                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', width: '100px', fontSize: '16px' }}
                        />
                        <span style={{ fontSize: '13px', color: '#999' }}>Type a number and click away to save.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IslamicAdjustment;