import React, { useState, useEffect } from 'react';
import API_BASE from './apiConfig';

export default function AdminPanel({ onLogout }) {
    const [data, setData] = useState({ enquiries: [], packages: [], settings: { whatsapp: '', adminEmail: '' } });
    const [loading, setLoading] = useState(true);
    
    // Package Form State
    const [newPackage, setNewPackage] = useState({ title: '', location: '', img: '', features: '', details: '' });
    
    // Settings Form State
    const [settings, setSettings] = useState({ whatsapp: '', adminEmail: '', appPassword: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/admin/data`);
            const result = await res.json();
            setData(result || { enquiries: [], packages: [], settings: {} });
            if (result && result.settings) {
                setSettings({ 
                    whatsapp: result.settings.whatsapp || '', 
                    adminEmail: result.settings.adminEmail || '', 
                    appPassword: '' 
                });
            }
        } catch (e) {
            console.error('Failed to load admin data:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSettingsSave = async (e) => {
        e.preventDefault();
        try {
            await fetch(`${API_BASE}/api/admin/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            alert('Settings Saved Successfully!');
            fetchData();
        } catch (e) {
            alert('Error saving settings');
        }
    };

    const handleAddPackage = async (e) => {
        e.preventDefault();
        try {
            await fetch(`${API_BASE}/api/admin/packages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPackage)
            });
            alert('Package Added!');
            setNewPackage({ title: '', location: '', img: '', features: '', details: '' });
            fetchData();
        } catch (e) {
            alert('Error adding package');
        }
    };

    const deletePackage = async (id) => {
        if (!confirm('Are you sure you want to delete this package?')) return;
        await fetch(`${API_BASE}/api/admin/packages/${id}`, { method: 'DELETE' });
        fetchData();
    };

    const deleteEnquiry = async (id) => {
        if (!confirm('Delete this enquiry?')) return;
        await fetch(`${API_BASE}/api/admin/enquiries/${id}`, { method: 'DELETE' });
        fetchData();
    };

    if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Loading Admin Panel...</div>;

    return (
        <div style={{ padding: '20px', fontFamily: 'Inter, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '30px' }}>
                <h1 style={{ color: '#0A0F1C' }}><i className="fa-solid fa-gauge"></i> Admin Dashboard</h1>
                <button onClick={onLogout} style={{ padding: '10px 20px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Logout</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
                {/* Settings Card */}
                <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}><i className="fa-solid fa-gear"></i> Global Settings</h2>
                    <form onSubmit={handleSettingsSave}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>WhatsApp Number (e.g. 37493964458)</label>
                            <input type="text" value={settings.whatsapp} onChange={e => setSettings({...settings, whatsapp: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>Admin Notification Email</label>
                            <input type="email" value={settings.adminEmail} onChange={e => setSettings({...settings, adminEmail: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>Gmail App Password (Leave blank to keep unchanged)</label>
                            <input type="password" value={settings.appPassword} onChange={e => setSettings({...settings, appPassword: e.target.value})} placeholder="16-letter app password" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
                        </div>
                        <button type="submit" style={{ padding: '10px 20px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', width: '100%' }}>Save Settings</button>
                    </form>
                </div>

                {/* Add Package Card */}
                <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}><i className="fa-solid fa-plus"></i> Add New Package</h2>
                    <form onSubmit={handleAddPackage}>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <input type="text" placeholder="Title (e.g. Explore Armenia)" required value={newPackage.title} onChange={e => setNewPackage({...newPackage, title: e.target.value})} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
                            <input type="text" placeholder="Location" required value={newPackage.location} onChange={e => setNewPackage({...newPackage, location: e.target.value})} style={{ width: '120px', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
                        </div>
                        <input type="url" placeholder="Image URL" required value={newPackage.img} onChange={e => setNewPackage({...newPackage, img: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', marginBottom: '10px' }} />
                        <input type="text" placeholder="Features (comma separated: Hotels, Flights, Guide)" value={newPackage.features} onChange={e => setNewPackage({...newPackage, features: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', marginBottom: '10px' }} />
                        <textarea placeholder="Detailed Itinerary / Premium Content (Unlocked after enquiry)" rows="3" required value={newPackage.details} onChange={e => setNewPackage({...newPackage, details: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', marginBottom: '10px' }}></textarea>
                        <button type="submit" style={{ padding: '10px 20px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', width: '100%' }}>Add Package</button>
                    </form>
                </div>
            </div>

            {/* Enquiries Table */}
            <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '40px', overflowX: 'auto' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}><i className="fa-solid fa-users"></i> Recent Enquiries (Leads)</h2>
                {data.enquiries.length === 0 ? <p style={{ color: '#666' }}>No enquiries yet.</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc' }}>
                                <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Date</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Name</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Contact</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Service</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Message</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.enquiries.map(enq => (
                                <tr key={enq.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px', fontSize: '0.9rem' }}>{new Date(enq.date).toLocaleDateString()}</td>
                                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{enq.name}</td>
                                    <td style={{ padding: '12px', fontSize: '0.9rem' }}>{enq.email}<br/>{enq.phone}</td>
                                    <td style={{ padding: '12px' }}><span style={{ background: '#DBEAFE', color: '#1E40AF', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>{enq.service}</span></td>
                                    <td style={{ padding: '12px', fontSize: '0.9rem', maxWidth: '300px' }}>{enq.details}</td>
                                    <td style={{ padding: '12px' }}><button onClick={() => deleteEnquiry(enq.id)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}><i className="fa-solid fa-trash"></i></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Manage Packages */}
            <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}><i className="fa-solid fa-map-location-dot"></i> Manage Packages</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {data.packages.map(pkg => (
                        <div key={pkg.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                            <img src={pkg.img} alt={pkg.title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                            <div style={{ padding: '15px' }}>
                                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>{pkg.title}</h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '10px' }}><i className="fa-solid fa-location-dot"></i> {pkg.location}</p>
                                <button onClick={() => deletePackage(pkg.id)} style={{ width: '100%', padding: '8px', background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete Package</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
