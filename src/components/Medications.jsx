import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function Medications({ data, saveData, showToast }) {
  const { t } = useTranslation()
  const [medName, setMedName] = useState('')
  const [medDose, setMedDose] = useState('')
  const [medFreq, setMedFreq] = useState('')
  const [noteText, setNoteText] = useState('')

  const medications = data.medications || []
  const notes = data.notes || []

  const addMed = () => {
    if (!medName.trim()) {
      showToast(t('meds.msg_name'))
      return
    }
    const newMed = {
      name: medName.trim(),
      dose: medDose.trim(),
      freq: medFreq,
      date: new Date().toISOString(),
      id: Date.now()
    }
    saveData({ ...data, medications: [...medications, newMed] })
    setMedName('')
    setMedDose('')
    setMedFreq('')
    showToast(t('meds.msg_added'))
  }

  const deleteMed = (id) => {
    saveData({ ...data, medications: medications.filter(m => m.id !== id) })
  }

  const saveNote = () => {
    if (!noteText.trim()) {
      showToast(t('meds.msg_note'))
      return
    }
    const newNote = {
      text: noteText.trim(),
      date: new Date().toISOString()
    }
    saveData({ ...data, notes: [...notes, newNote] })
    setNoteText('')
    showToast(t('meds.msg_note_saved'))
  }

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const freqOptions = [
    { label: t('meds.once'), val: 'once' },
    { label: t('meds.twice'), val: 'twice' },
    { label: t('meds.thrice'), val: 'thrice' },
    { label: t('meds.weekly'), val: 'weekly' },
    { label: t('meds.needed'), val: 'needed' }
  ]

  return (
    <div id="tab-meds" className="tab-content">
      <div className="page-header">
        <div>
          <div className="page-title">{t('meds.title')} <em>{t('meds.subtitle')}</em></div>
          <div className="page-sub">{t('meds.desc')}</div>
        </div>
      </div>
      <div className="page-content">
        <div className="section-row">
          <div className="card">
            <div className="card-title"><span>💊</span> {t('meds.add_title')}</div>
            <div className="input-group" style={{marginBottom: 10}}>
              <label>{t('meds.name_label')}</label>
              <input type="text" placeholder={t('meds.name_placeholder')} value={medName} onChange={e => setMedName(e.target.value)} />
            </div>
            <div className="med-form">
              <div className="input-group">
                <label>{t('meds.dose_label')}</label>
                <input type="text" placeholder={t('meds.dose_placeholder')} value={medDose} onChange={e => setMedDose(e.target.value)} />
              </div>
              <div className="input-group">
                <label>{t('meds.freq_label')}</label>
                <select value={medFreq} onChange={e => setMedFreq(e.target.value)}>
                  <option value="">{t('meds.select')}</option>
                  {freqOptions.map(opt => (
                    <option key={opt.val} value={opt.val}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary btn-sm" onClick={addMed} style={{alignSelf: 'flex-end', whiteSpace: 'nowrap'}}>{t('meds.add_btn')}</button>
            </div>
          </div>
          <div className="card">
            <div className="card-title"><span>📝</span> {t('meds.notes_title')}</div>
            <textarea 
              placeholder={t('meds.notes_placeholder')}
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
            ></textarea>
            <div className="btn-row">
              <button className="btn btn-primary" onClick={saveNote}>{t('meds.save_note')}</button>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-title"><span>💉</span> {t('meds.current_title')}</div>
          <div className="med-list">
            {medications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💊</div>
                {t('meds.empty_meds')}
              </div>
            ) : (
              medications.map(m => (
                <div key={m.id} className="med-item">
                  <div className="med-info">
                    <div className="med-name">{m.name}</div>
                    <div className="med-detail">{m.dose || '—'} · {t(`meds.${m.freq}`) || '—'}</div>
                  </div>
                  <button className="med-delete" onClick={() => deleteMed(m.id)}>✕</button>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="card" style={{marginTop: 16}}>
          <div className="card-title"><span>📋</span> {t('meds.saved_notes')}</div>
          <div className="history-list">
            {notes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                {t('meds.empty_notes')}
              </div>
            ) : (
              [...notes].reverse().map((n, i) => (
                <div key={i} className="history-entry med">
                  <div className="h-date">{formatDate(n.date)}</div>
                  <div className="h-text">{n.text}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
