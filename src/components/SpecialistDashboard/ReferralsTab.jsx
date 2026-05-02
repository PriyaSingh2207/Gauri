import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function ReferralsTab() {
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for nearby specialists
    setTimeout(() => {
      setSpecialists([
        { id: 1, name: 'Dr. Sarah Jenkins', specialty: 'Gynecology', city: 'New York', distance: '1.2 km' },
        { id: 2, name: 'Dr. Emily Chen', specialty: 'Oncology', city: 'New York', distance: '3.4 km' },
        { id: 3, name: 'Dr. Michael Roberts', specialty: 'Endocrinology', city: 'New York', distance: '5.0 km' },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="tab-container">
      <h2>Referrals Network</h2>
      <p className="tab-subtitle">Find and connect with other specialists nearby to refer patients.</p>

      <div className="filters-bar">
        <input type="text" placeholder="Search by name or specialty..." className="search-input" />
        <select className="filter-select">
          <option>Within 5 km</option>
          <option>Within 10 km</option>
          <option>Within 25 km</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading network...</div>
      ) : (
        <div className="specialists-grid">
          {specialists.map(spec => (
            <div key={spec.id} className="specialist-card card">
              <div className="spec-avatar">{spec.name.charAt(4)}</div>
              <h3>{spec.name}</h3>
              <p className="spec-specialty">{spec.specialty}</p>
              <div className="spec-location">
                <span>📍 {spec.city}</span>
                <span>{spec.distance}</span>
              </div>
              <button className="btn btn-primary w-100 mt-3">Refer Patient</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
