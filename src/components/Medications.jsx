import React, { useState } from 'react'

export default function Medications({ data, saveData, showToast }) {
  const [medName, setMedName] = useState('')
  const [medDose, setMedDose] = useState('')
  const [medFreq, setMedFreq] = useState('')
  const [noteText, setNoteText] = useState('')

  const medications = data.medications || []
  const notes = data.notes || []

  const addMed = () => {
    if (!medName.trim()) {
      showToast('Please enter a medication name')
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
    showToast('Medication added!')
  }

  const deleteMed = (id) => {
    saveData({ ...data, medications: medications.filter(m => m.id !== id) })
  }

  const saveNote = () => {
    if (!noteText.trim()) {
      showToast('Please write a note first')
      return
    }
    const newNote = {
      text: noteText.trim(),
      date: new Date().toISOString()
    }
    saveData({ ...data, notes: [...notes, newNote] })
    setNoteText('')
    showToast('Note saved!')
  }

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div id="tab-meds" className="tab-content">
      <div className="page-header">
        <div>
          <div className="page-title">Medications <em>& Notes</em></div>
          <div className="page-sub">Track your medicines, supplements and health notes</div>
        </div>
      </div>
      <div className="page-content">
        <div className="section-row">
          <div className="card">
            <div className="card-title"><span>💊</span> Add Medication</div>
            <div className="input-group" style={{marginBottom: 10}}>
              <label>Medication / Supplement Name</label>
              <input type="text" placeholder="e.g. Folic Acid 5mg" value={medName} onChange={e => setMedName(e.target.value)} />
            </div>
            <div className="med-form">
              <div className="input-group">
                <label>Dosage</label>
                <input type="text" placeholder="e.g. 1 tablet" value={medDose} onChange={e => setMedDose(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Frequency</label>
                <select value={medFreq} onChange={e => setMedFreq(e.target.value)}>
                  <option value="">Select</option>
                  <option>Once daily</option>
                  <option>Twice daily</option>
                  <option>Three times daily</option>
                  <option>Weekly</option>
                  <option>As needed</option>
                </select>
              </div>
              <button className="btn btn-primary btn-sm" onClick={addMed} style={{alignSelf: 'flex-end', whiteSpace: 'nowrap'}}>+ Add</button>
            </div>
          </div>
          <div className="card">
            <div className="card-title"><span>📝</span> Health Notes</div>
            <textarea 
              placeholder="Any notes for your next doctor visit, questions you want to ask, or health observations..."
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
            ></textarea>
            <div className="btn-row">
              <button className="btn btn-primary" onClick={saveNote}>Save Note</button>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-title"><span>💉</span> Current Medications</div>
          <div className="med-list">
            {medications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💊</div>
                No medications added yet.
              </div>
            ) : (
              medications.map(m => (
                <div key={m.id} className="med-item">
                  <div className="med-info">
                    <div className="med-name">{m.name}</div>
                    <div className="med-detail">{m.dose || '—'} · {m.freq || '—'}</div>
                  </div>
                  <button className="med-delete" onClick={() => deleteMed(m.id)}>✕</button>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="card" style={{marginTop: 16}}>
          <div className="card-title"><span>📋</span> Saved Notes</div>
          <div className="history-list">
            {notes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                No notes saved yet.
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
