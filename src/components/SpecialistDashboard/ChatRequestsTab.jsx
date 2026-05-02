import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function ChatRequestsTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we would fetch from the chat_requests table
    // For now, we'll use some mock data to build the UI
    setTimeout(() => {
      setRequests([
        { id: 1, user_name: 'Anonymous User', message: 'Hi, I need some advice regarding my recent PCOS diagnosis.', status: 'pending', date: '2 hrs ago' },
        { id: 2, user_name: 'Anonymous User', message: 'Hello Dr., I have a question about birth control side effects.', status: 'pending', date: '5 hrs ago' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAction = (id, action) => {
    setRequests(requests.filter(req => req.id !== id));
    // Here we would call supabase to update the status
  };

  return (
    <div className="tab-container">
      <h2>Chat Requests</h2>
      <p className="tab-subtitle">Manage your incoming patient consultation requests.</p>
      
      {loading ? (
        <div className="loading-spinner">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="empty-state">No pending requests right now.</div>
      ) : (
        <div className="requests-grid">
          {requests.map(req => (
            <div key={req.id} className="request-card">
              <div className="request-header">
                <div className="request-avatar">{req.user_name.charAt(0)}</div>
                <div className="request-info">
                  <h4>{req.user_name}</h4>
                  <span>{req.date}</span>
                </div>
              </div>
              <p className="request-message">"{req.message}"</p>
              <div className="request-actions">
                <button className="btn btn-secondary" onClick={() => handleAction(req.id, 'decline')}>Decline</button>
                <button className="btn btn-primary" onClick={() => handleAction(req.id, 'accept')}>Accept Chat</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
