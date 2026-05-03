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

  const symptomsList = ['cramps', 'bloating', 'headache', 'acne', 'breast', 'fatigue']
  const moods = ['happy', 'calm', 'anxious', 'sad', 'irritable', 'energetic']

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
      const mockInserted = {
        id: 'temp-' + Date.now(),
        ...entry,
        created_at: new Date().toISOString()
      }
      
      const formatted = {
        id: mockInserted.id,
        symptoms: mockInserted.symptoms,
        mood: mockInserted.mood,
        pain: mockInserted.pain,
        notes: mockInserted.notes,
        date: mockInserted.created_at
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
            <div className="card-title"><span>💊</span> {t('symptoms.log_title')} <span className="badge">{t('symptoms.today')}</span></div>
            
            <div className="symptom-section">
              <label className="input-label">{t('symptoms.common')}</label>
              <div className="symptom-tags">
                {symptomsList.map(s => (
                  <div 
                    key={s} 
                    className={`symptom-tag ${selectedSymptoms.includes(s) ? 'active' : ''}`}
                    onClick={() => toggleSymptom(s)}
                  >
                    {t(`symptoms.${s}`)}
                  </div>
                ))}
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>{t('symptoms.mood')}</label>
                <select value={mood} onChange={e => setMood(e.target.value)}>
                  <option value="">{t('symptoms.select_mood')}</option>
                  {moods.map(m => (
                    <option key={m} value={m}>{t(`symptoms.${m}`)}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>{t('symptoms.pain')} (0-10)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="range" min="0" max="10" value={pain} onChange={e => setPain(parseInt(e.target.value))} style={{ flex: 1 }} />
                  <span style={{ minWidth: '20px', fontWeight: 'bold' }}>{pain}</span>
                </div>
              </div>
            </div>

            <div className="input-group">
              <label>{t('symptoms.notes')}</label>
              <textarea 
                placeholder={t('symptoms.placeholder')} 
                rows="3" 
                value={notes} 
                onChange={e => setNotes(e.target.value)}
              ></textarea>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={logSymptoms}>{t('symptoms.save')}</button>
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
                [...logs].reverse().slice(0, 10).map((log, i) => (
                  <div key={i} className="history-entry">
                    <div className="h-date">{formatDate(log.date)}</div>
                    <div className="h-text">
                      {log.symptoms?.length > 0 && (
                        <div style={{ marginBottom: '4px' }}>
                          {log.symptoms.map(s => <span key={s} className="mini-tag">{t(`symptoms.${s}`)}</span>)}
                        </div>
                      )}
                      {log.mood && <span>{t('symptoms.mood')}: <strong>{t(`symptoms.${log.mood}`)}</strong> · </span>}
                      {log.pain > 0 && <span>{t('symptoms.pain')}: <strong>{log.pain}/10</strong></span>}
                      {log.notes && <div className="h-notes">"{log.notes}"</div>}
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
