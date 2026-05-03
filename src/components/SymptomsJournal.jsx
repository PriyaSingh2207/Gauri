import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useTranslation } from 'react-i18next'

export default function SymptomsJournal({ user, isAnonymous, data, saveData, showToast }) {
  const { t } = useTranslation()
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [mood, setMood] = useState('')
  const [pain, setPain] = useState(0)
  const [notes, setNotes] = useState('')

  const logs = data.symptoms || []

  const symptomsList = [
    { id: 'cramps', icon: '🩸' },
    { id: 'bloating', icon: '🎈' },
    { id: 'headache', icon: '🧠' },
    { id: 'acne', icon: '✨' },
    { id: 'breast', icon: '🎗️' },
    { id: 'fatigue', icon: '😴' }
  ]

  const moods = [
    { id: 'happy', icon: '😊' },
    { id: 'calm', icon: '😌' },
    { id: 'anxious', icon: '😰' },
    { id: 'sad', icon: '😢' },
    { id: 'irritable', icon: '😠' },
    { id: 'energetic', icon: '⚡' }
  ]

  const toggleSymptom = (s) => {
    if (selectedSymptoms.includes(s)) {
      setSelectedSymptoms(selectedSymptoms.filter(item => item !== s))
    } else {
      setSelectedSymptoms([...selectedSymptoms, s])
    }
  }

  const logSymptoms = async () => {
    if (selectedSymptoms.length === 0 && !notes.trim()) {
      showToast(t('symptoms.msg_select'))
      return
    }
    if (!user) {
      showToast(t('cycle.msg_auth'))
      return
    }

    const entry = {
      symptoms: selectedSymptoms,
      mood,
      pain,
      notes
    }

    if (isAnonymous) {
      const formatted = {
        id: 'temp-' + Date.now(),
        ...entry,
        date: new Date().toISOString()
      }

      saveData({ ...data, symptoms: [...logs, formatted] })
      showToast(t('cycle.msg_local'))
    } else {
      const newLog = {
        user_id: user.id,
        symptoms: entry.symptoms,
        mood: entry.mood,
        pain: entry.pain,
        notes: entry.notes
      }

      const { data: inserted, error } = await supabase.from('symptoms').insert([newLog]).select()

      if (error) {
        showToast(t('cycle.msg_error') + error.message)
        return
      }

      const formatted = {
        id: inserted[0].id,
        symptoms: inserted[0].symptoms,
        mood: inserted[0].mood,
        pain: inserted[0].pain,
        notes: inserted[0].notes,
        date: inserted[0].created_at
      }

      saveData({ ...data, symptoms: [...logs, formatted] })
      showToast(t('symptoms.msg_saved'))
    }

    setSelectedSymptoms([])
    setMood('')
    setPain(0)
    setNotes('')
  }

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  const getSymptomIcon = (sid) => symptomsList.find(s => s.id === sid)?.icon || '💊'
  const getMoodIcon = (mid) => moods.find(m => m.id === mid)?.icon || '😶'

  return (
    <div id="tab-symptoms" className="tab-content">
      <div className="page-header">
        <div>
          <div className="page-title">{t('symptoms.title')} <em>{t('symptoms.subtitle')}</em></div>
          <div className="page-sub">{t('symptoms.desc')}</div>
        </div>
      </div>
      <div className="page-content">
        <div className="section-row">
          <div className="card">
            <div className="card-title"><span>💊</span> {t('symptoms.log_title')}</div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'block' }}>
                {t('symptoms.common')}
              </label>
              <div className="symptom-grid">
                {symptomsList.map(s => (
                  <div 
                    key={s.id} 
                    className={`symptom-chip ${selectedSymptoms.includes(s.id) ? 'selected' : ''}`}
                    onClick={() => toggleSymptom(s.id)}
                  >
                    <span className="s-icon">{s.icon}</span>
                    {t(`symptoms.${s.id}`)}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'block' }}>
                {t('symptoms.mood')}
              </label>
              <div className="mood-grid">
                {moods.map(m => (
                  <div 
                    key={m.id} 
                    className={`mood-btn ${mood === m.id ? 'selected' : ''}`}
                    onClick={() => setMood(m.id)}
                  >
                    <span className="m-icon">{m.icon}</span>
                    {t(`symptoms.${m.id}`)}
                  </div>
                ))}
              </div>
            </div>

            <div className="intensity-row">
              <span className="intensity-label">{t('symptoms.pain')}</span>
              <input 
                type="range" 
                min="0" 
                max="10" 
                value={pain} 
                onChange={e => setPain(parseInt(e.target.value))} 
              />
              <span className="intensity-val">{pain}</span>
            </div>

            <div className="input-group" style={{ marginTop: '20px' }}>
              <label>{t('symptoms.notes')}</label>
              <textarea 
                placeholder={t('symptoms.placeholder')} 
                value={notes} 
                onChange={e => setNotes(e.target.value)}
              ></textarea>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={logSymptoms}>
              {t('symptoms.save')}
            </button>
          </div>

          <div className="card">
            <div className="card-title"><span>📜</span> {t('symptoms.recent')}</div>
            <div className="history-list">
              {logs.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  {t('symptoms.empty')}
                </div>
              ) : (
                [...logs].reverse().slice(0, 10).map((log) => (
                  <div key={log.id} className="history-entry sym">
                    <div className="h-date">{formatDate(log.date)}</div>
                    <div className="h-text">
                      {log.symptoms?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                          {log.symptoms.map(s => (
                            <span key={s} style={{ fontSize: '10px', background: 'var(--surface3)', padding: '2px 8px', borderRadius: '10px', color: 'var(--text2)' }}>
                              {getSymptomIcon(s)} {t(`symptoms.${s}`)}
                            </span>
                          ))}
                        </div>
                      )}
                      <div style={{ fontSize: '12px', color: 'var(--text2)' }}>
                        {log.mood && <span>{getMoodIcon(log.mood)} <strong>{t(`symptoms.${log.mood}`)}</strong> · </span>}
                        {log.pain > 0 && <span>{t('symptoms.pain')}: <strong>{log.pain}/10</strong></span>}
                      </div>
                      {log.notes && <div style={{ marginTop: '6px', fontStyle: 'italic', color: 'var(--text3)', borderLeft: '2px solid var(--border)', paddingLeft: '8px' }}>"{log.notes}"</div>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
