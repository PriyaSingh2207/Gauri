import React, { useState } from 'react';
import ChatRequestsTab from './ChatRequestsTab';
import PostsManagerTab from './PostsManagerTab';
import ReferralsTab from './ReferralsTab';
import ProfileTab from './ProfileTab';
import './SpecialistDashboard.css';

export default function SpecialistDashboard({ session, onLogout }) {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Gauri <em>Pro</em></h2>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 My Profile
          </button>
          <button 
            className={`nav-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            💬 Chat Requests
          </button>
          <button 
            className={`nav-btn ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            📸 My Posts
          </button>
          <button 
            className={`nav-btn ${activeTab === 'referrals' ? 'active' : ''}`}
            onClick={() => setActiveTab('referrals')}
          >
            🤝 Network Referrals
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-mini">
            <div className="avatar">Dr</div>
            <div className="info">
              <span className="email">{session.user.email}</span>
              <span className="role">Specialist</span>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout}>Log Out</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Welcome, Specialist!</h1>
          <p>Here's what's happening today.</p>
        </header>

        <div className="dashboard-content">
          {activeTab === 'profile' && <ProfileTab session={session} />}
          {activeTab === 'chat' && <ChatRequestsTab />}
          {activeTab === 'posts' && <PostsManagerTab />}
          {activeTab === 'referrals' && <ReferralsTab />}
        </div>
      </main>
    </div>
  );
}
