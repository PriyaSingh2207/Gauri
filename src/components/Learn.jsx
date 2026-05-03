import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

export default function Learn({ user }) {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [followState, setFollowState] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    // In a real app, fetch from Supabase
    // const { data } = await supabase.from('specialist_posts').select('*, specialist_profiles(*)');
    
    // Mock data for demo
    const mockPosts = [
      {
        id: 1,
        content: "Understanding the different phases of your menstrual cycle can help you manage symptoms better. Here's a quick guide on the Luteal phase...",
        media_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
        media_type: "image",
        created_at: new Date().toISOString(),
        likes: 124,
        specialist: {
          user_id: "spec-1",
          full_name: "Dr. Sarah Johnson",
          specialty: "Gynecologist",
          avatar_url: ""
        }
      },
      {
        id: 2,
        content: "Watch this video to learn the correct way to perform a breast self-examination. Early detection is key!",
        media_url: "https://www.w3schools.com/html/mov_bbb.mp4",
        media_type: "video",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        likes: 89,
        specialist: {
          user_id: "spec-2",
          full_name: "Dr. Priya Mehta",
          specialty: "Oncologist",
          avatar_url: ""
        }
      }
    ];

    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 800);
  };

  const handleLike = (postId) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  };

  const handleSave = (postId) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, saved: !p.saved } : p));
  };

  const toggleFollow = (specId) => {
    setFollowState(prev => ({ ...prev, [specId]: !prev[specId] }));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('learn.title')} <em>{t('learn.subtitle')}</em></h1>
          <p className="page-sub">{t('learn.desc')}</p>
        </div>
      </div>

      <div className="page-content">
        {loading ? (
          <div className="loading-spinner">{t('learn.loading')}</div>
        ) : (
          <div className="learn-feed">
            {posts.map(post => (
              <div key={post.id} className="card post-card">
                <div className="post-header">
                  <div className="post-author">
                    <div className="s-avatar">{post.specialist.full_name.charAt(0)}</div>
                    <div>
                      <div className="s-name">{post.specialist.full_name}</div>
                      <div className="s-specialty">{post.specialist.specialty}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className={`follow-btn ${followState[post.specialist.user_id] ? 'following' : ''}`}
                      onClick={() => toggleFollow(post.specialist.user_id)}
                    >
                      {followState[post.specialist.user_id] ? t('learn.following') : t('learn.follow')}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setActiveChat(post.specialist)}>
                      💬 {t('learn.chat')}
                    </button>
                  </div>
                </div>

                <div className="post-body">
                  <p style={{ fontSize: '15px', lineHeight: '1.6', marginBottom: '16px', color: 'var(--text)' }}>
                    {post.content}
                  </p>
                  {post.media_type === 'video' ? (
                    <video src={post.media_url} controls className="post-media" />
                  ) : (
                    <img src={post.media_url} alt="Post media" className="post-media" />
                  )}
                </div>

                <div className="post-actions">
                  <button 
                    className={`post-action-btn ${post.liked ? 'active' : ''}`}
                    onClick={() => handleLike(post.id)}
                  >
                    {post.liked ? '❤️' : '🤍'} {post.likes}
                  </button>
                  <button 
                    className={`post-action-btn ${post.saved ? 'active' : ''}`}
                    onClick={() => handleSave(post.id)}
                  >
                    {post.saved ? `🔖 ${t('learn.saved')}` : `🔖 ${t('learn.save')}`}
                  </button>
                  <button className="post-action-btn">
                    💬 {t('learn.comment')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeChat && (
        <ChatWindow 
          specialist={activeChat} 
          user={user} 
          onClose={() => setActiveChat(null)} 
        />
      )}
    </div>
  );
}

function ChatWindow({ specialist, user, onClose }) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    { id: 1, text: t('learn.chat_intro', { name: specialist.full_name }), sender: 'spec' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages([...messages, newMsg]);
    setInput('');

    // Simulate reply
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: t('learn.chat_reply'), 
        sender: 'spec' 
      }]);
    }, 1500);
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div>
          <strong style={{ display: 'block', fontSize: '14px' }}>{specialist.full_name}</strong>
          <span style={{ fontSize: '10px', opacity: 0.8 }}>{t('learn.online')}</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>✕</button>
      </div>
      <div className="chat-messages">
        {messages.map(m => (
          <div key={m.id} className={`chat-message ${m.sender === 'user' ? 'user' : 'assistant'}`}>
            <div className="message-content">
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="chat-input">
        <input 
          placeholder={t('learn.type_msg')} 
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="btn btn-primary btn-sm">{t('learn.send')}</button>
      </form>
    </div>
  );
}
