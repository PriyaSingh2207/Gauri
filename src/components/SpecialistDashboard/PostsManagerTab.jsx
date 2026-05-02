import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function PostsManagerTab() {
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Mock data for posts
  const [posts, setPosts] = useState([
    {
      id: 1,
      content: 'Here are 3 tips for managing PCOS symptoms naturally...',
      media_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop',
      media_type: 'image',
      likes: 42,
      comments: [
        { id: 101, user_name: 'User123', text: 'This is so helpful, thank you!', is_blocked: false },
        { id: 102, user_name: 'User456', text: 'Spam comment here', is_blocked: false }
      ]
    }
  ]);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!content && !mediaFile) return;
    
    setUploading(true);
    // Here we would upload file to Supabase Storage and create a record
    
    // Simulate network delay
    setTimeout(() => {
      const newPost = {
        id: Date.now(),
        content,
        media_url: mediaPreview,
        media_type: mediaFile?.type.startsWith('video') ? 'video' : 'image',
        likes: 0,
        comments: []
      };
      setPosts([newPost, ...posts]);
      setContent('');
      setMediaFile(null);
      setMediaPreview(null);
      setUploading(false);
    }, 1500);
  };

  const handleBlockComment = (postId, commentId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments.map(c => 
            c.id === commentId ? { ...c, is_blocked: !c.is_blocked } : c
          )
        };
      }
      return post;
    }));
  };

  return (
    <div className="tab-container">
      <h2>Manage Content</h2>
      <p className="tab-subtitle">Share educational content, videos, and photos with the community.</p>

      <div className="create-post-card card">
        <form onSubmit={handlePostSubmit}>
          <textarea 
            placeholder="What would you like to share?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="post-textarea"
          />
          
          {mediaPreview && (
            <div className="media-preview-container">
              {mediaFile?.type.startsWith('video') ? (
                <video src={mediaPreview} controls className="media-preview" />
              ) : (
                <img src={mediaPreview} alt="Preview" className="media-preview" />
              )}
              <button type="button" className="remove-media-btn" onClick={() => {setMediaFile(null); setMediaPreview(null);}}>✕</button>
            </div>
          )}

          <div className="post-actions-row">
            <label className="upload-btn">
              <input type="file" accept="image/*,video/*" onChange={handleMediaChange} hidden />
              <span>📷 Add Photo/Video</span>
            </label>
            <button type="submit" className="btn btn-primary" disabled={uploading || (!content && !mediaFile)}>
              {uploading ? 'Posting...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>

      <div className="posts-feed">
        <h3>Your Recent Posts</h3>
        {posts.map(post => (
          <div key={post.id} className="post-card card">
            <div className="post-content">
              <p>{post.content}</p>
              {post.media_url && (
                post.media_type === 'video' ? 
                  <video src={post.media_url} controls className="post-media" /> : 
                  <img src={post.media_url} alt="Post media" className="post-media" />
              )}
            </div>
            
            <div className="post-stats">
              <span>❤️ {post.likes} Likes</span>
              <span>💬 {post.comments.length} Comments</span>
            </div>

            <div className="post-comments-section">
              <h4>Comments</h4>
              {post.comments.length === 0 && <p className="no-comments">No comments yet.</p>}
              {post.comments.map(comment => (
                <div key={comment.id} className={`comment-item ${comment.is_blocked ? 'blocked-comment' : ''}`}>
                  <div className="comment-text">
                    <strong>{comment.user_name}</strong>: {comment.text}
                  </div>
                  <div className="comment-actions">
                    {/* Reply functionality would go here */}
                    <button 
                      className="block-btn" 
                      onClick={() => handleBlockComment(post.id, comment.id)}
                    >
                      {comment.is_blocked ? 'Unblock' : 'Block / Hide'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
