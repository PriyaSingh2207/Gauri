import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export default function SpecialistTracker({ user }) {
  const [specialists, setSpecialists] = useState([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    fetchSpecialists();
  }, []);

  useEffect(() => {
    if (specialists.length > 0 && !mapInstance.current && window.L) {
      initMap();
    }
  }, [specialists]);

  useEffect(() => {
    if (selectedSpecialist) {
      fetchComments(selectedSpecialist.user_id);
      if (mapInstance.current && selectedSpecialist.latitude && selectedSpecialist.longitude) {
        mapInstance.current.setView([selectedSpecialist.latitude, selectedSpecialist.longitude], 13);
      }
    }
  }, [selectedSpecialist]);

  const fetchSpecialists = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('specialist_profiles')
      .select('*');
    
    if (error) {
      console.error('Error fetching specialists:', error);
    } else {
      // Add mock data if empty for demo
      if (!data || data.length === 0) {
        const mockSpecialists = [
          {
            user_id: 'mock-1',
            full_name: 'Dr. Sarah Johnson',
            specialty: 'Gynecologist',
            city: 'New Delhi',
            phone: '+91 98765 43210',
            latitude: 28.6139,
            longitude: 77.2090,
            bio: 'Expert in PCOS and reproductive health with 15 years of experience.'
          },
          {
            user_id: 'mock-2',
            full_name: 'Dr. Priya Mehta',
            specialty: 'Breast Specialist',
            city: 'Mumbai',
            phone: '+91 87654 32109',
            latitude: 19.0760,
            longitude: 72.8777,
            bio: 'Specializing in early detection and oncology.'
          }
        ];
        setSpecialists(mockSpecialists);
      } else {
        setSpecialists(data);
      }
    }
    setLoading(false);
  };

  const fetchComments = async (specialistId) => {
    const { data, error } = await supabase
      .from('specialist_comments')
      .select('*')
      .eq('specialist_id', specialistId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      setComments(data || []);
    }
  };

  const initMap = () => {
    if (mapInstance.current) return;

    const L = window.L;
    const initialLat = specialists[0]?.latitude || 20.5937;
    const initialLng = specialists[0]?.longitude || 78.9629;

    mapInstance.current = L.map('map').setView([initialLat, initialLng], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance.current);

    updateMarkers();
  };

  const updateMarkers = () => {
    if (!mapInstance.current || !window.L) return;
    const L = window.L;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    specialists.forEach(s => {
      if (s.latitude && s.longitude) {
        const marker = L.marker([s.latitude, s.longitude])
          .addTo(mapInstance.current)
          .bindPopup(`<strong>${s.full_name}</strong><br/>${s.specialty}`)
          .on('click', () => setSelectedSpecialist(s));
        
        markersRef.current.push(marker);
      }
    });
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedSpecialist) return;

    const commentData = {
      specialist_id: selectedSpecialist.user_id,
      user_id: user?.id,
      comment: newComment,
      is_anonymous: !user
    };

    const { data, error } = await supabase
      .from('specialist_comments')
      .insert([commentData])
      .select();

    if (error) {
      alert('Error posting comment. Note: You might need to create the "specialist_comments" table in Supabase.');
      // Fallback for demo: just add to state
      const mockComment = {
        id: Math.random(),
        ...commentData,
        created_at: new Date().toISOString()
      };
      setComments([mockComment, ...comments]);
    } else {
      setComments([data[0], ...comments]);
    }
    setNewComment('');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Specialist <em>Tracker</em></h1>
          <p className="page-sub">Find and connect with women's health experts near you.</p>
        </div>
      </div>

      <div className="page-content">
        <div className="specialist-layout">
          <div className="specialist-list-pane">
            {loading ? (
              <div className="loading-spinner">Searching for specialists...</div>
            ) : (
              specialists.map(s => (
                <div 
                  key={s.user_id} 
                  className={`specialist-mini-card ${selectedSpecialist?.user_id === s.user_id ? 'active' : ''}`}
                  onClick={() => setSelectedSpecialist(s)}
                >
                  <div className="s-header">
                    <div className="s-avatar">{s.full_name.charAt(0)}</div>
                    <div>
                      <div className="s-name">{s.full_name}</div>
                      <div className="s-specialty">{s.specialty}</div>
                    </div>
                  </div>
                  <div className="s-contact-info">
                    <div className="s-info-item">📍 {s.city}</div>
                    <div className="s-info-item">📞 {s.phone || 'No contact provided'}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="map-pane">
            <div id="map"></div>
            {!window.L && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface2)', zIndex: 10 }}>
                Loading Map Library...
              </div>
            )}
          </div>
        </div>

        {selectedSpecialist && (
          <div className="card" style={{ marginTop: '24px' }}>
            <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '22px', marginBottom: '12px' }}>
              Connect with {selectedSpecialist.full_name}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '20px', lineHeight: '1.6' }}>
              {selectedSpecialist.bio || 'This specialist has not provided a bio yet.'}
            </p>
            
            <div className="comments-container">
              <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text3)' }}>
                Direct Contact / Comments
              </h4>
              
              <div className="comment-list">
                {comments.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--text3)', fontStyle: 'italic' }}>No comments yet. Be the first to reach out!</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="comment-item">
                      <div className="comment-meta">
                        <span>{c.is_anonymous ? 'Anonymous User' : 'Verified User'}</span>
                        <span>{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="comment-text">{c.comment}</div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="comment-input-area">
                <textarea 
                  placeholder="Ask a question or leave a message for the specialist..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>
                  Send Message
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
