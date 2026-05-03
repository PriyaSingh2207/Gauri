import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function ProfileTab({ session }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    specialty: '',
    highest_education: '',
    experience_years: '',
    city: '',
    phone: '',
    latitude: '',
    longitude: '',
    bio: '',
    avatar_url: ''
  });

  useEffect(() => {
    getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      const { user } = session;

      let { data, error, status } = await supabase
        .from('specialist_profiles')
        .select(`full_name, specialty, highest_education, experience_years, city, phone, latitude, longitude, bio, avatar_url`)
        .eq('user_id', user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(e) {
    e.preventDefault();
    try {
      setSaving(true);
      const { user } = session;

      const updates = {
        user_id: user.id,
        ...profile,
        updated_at: new Date(),
      };

      let { error } = await supabase.from('specialist_profiles').upsert(updates);

      if (error) throw error;
      alert('Profile updated successfully!');
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="loading-spinner">Loading profile...</div>;
  }

  return (
    <div className="tab-container">
      <h2>Your Profile</h2>
      <p className="tab-subtitle">Manage your personal and professional details.</p>

      <div className="card profile-card">
        <form onSubmit={updateProfile} className="profile-form">
          <div className="form-row">
            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                value={profile.full_name || ''}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <label>Specialty</label>
              <input
                type="text"
                value={profile.specialty || ''}
                onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Highest Education</label>
              <input
                type="text"
                placeholder="e.g. MD, PhD, MBBS"
                value={profile.highest_education || ''}
                onChange={(e) => setProfile({ ...profile, highest_education: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label>Years of Experience</label>
              <input
                type="number"
                value={profile.experience_years || ''}
                onChange={(e) => setProfile({ ...profile, experience_years: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>City / Location</label>
              <input
                type="text"
                value={profile.city || ''}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <label>Phone / Contact</label>
              <input
                type="text"
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+1 234 567 890"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Latitude (for Map)</label>
              <input
                type="number"
                step="any"
                value={profile.latitude || ''}
                onChange={(e) => setProfile({ ...profile, latitude: e.target.value })}
                placeholder="e.g. 28.6139"
              />
            </div>
            <div className="input-group">
              <label>Longitude (for Map)</label>
              <input
                type="number"
                step="any"
                value={profile.longitude || ''}
                onChange={(e) => setProfile({ ...profile, longitude: e.target.value })}
                placeholder="e.g. 77.2090"
              />
            </div>
          </div>

          <div className="input-group">
            <label>Professional Bio</label>
            <textarea
              rows="4"
              value={profile.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell users about your expertise and approach..."
            />
          </div>

          <div className="profile-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
