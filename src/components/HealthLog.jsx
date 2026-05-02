import React from 'react'

export default function HealthLog({ data, saveData, showToast }) {
  const { cycles = [], symptoms = [], medications = [], notes = [], pcosAssessments = [] } = data

  const all = [
    ...cycles.map(c => ({ ...c, type: 'cycle', ts: new Date(c.date).getTime() })),
    ...symptoms.map(s => ({ ...s, type: 'sym', ts: new Date(s.date).getTime() })),
    ...medications.map(m => ({ ...m, type: 'med', ts: new Date(m.date).getTime() })),
    ...notes.map(n => ({ ...n, type: 'note', ts: new Date(n.date).getTime() })),
    ...pcosAssessments.map(p => ({ ...p, type: 'pcos', ts: new Date(p.date).getTime() })),
  ].sort((a, b) => b.ts - a.ts)

  const clearAll = () => {
    if (window.confirm('This will delete all your health data. Are you sure?')) {
      saveData({ cycles: [], symptoms: [], medications: [], notes: [], pcosAssessments: [] })
      showToast('All data cleared')
    }
  }

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const lastPcos = pcosAssessments.length ? pcosAssessments[pcosAssessments.length - 1].risk : '—'

  return (
    <div id="tab-history" className="tab-content">
      <div className="page-header">
        <div>
          <div className="page-title">Health <em>Log</em></div>
          <div className="page-sub">Your complete health timeline — everything in one place</div>
        </div>
      </div>
      <div className="page-content">
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-val">{cycles.length}</div>
            <div className="stat-lbl">Cycles logged</div>
            <div className="stat-accent" style={{background: 'var(--cornflower)'}}></div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{symptoms.length}</div>
            <div className="stat-lbl">Symptom entries</div>
            <div className="stat-accent" style={{background: 'var(--sky-deep)'}}></div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{medications.length}</div>
            <div className="stat-lbl">Medications tracked</div>
            <div className="stat-accent" style={{background: 'var(--crema)'}}></div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{lastPcos}</div>
            <div className="stat-lbl">Last PCOS risk check</div>
            <div className="stat-accent" style={{background: 'var(--lace-mid)'}}></div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-title" style={{justifyContent: 'space-between'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 8}}><span>📋</span> Complete Health Timeline</div>
            <button className="btn btn-secondary btn-sm" onClick={clearAll}>Clear All Data</button>
          </div>
          <div className="history-list" style={{maxHeight: 420}}>
            {all.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                Your health log is empty. Start tracking to see your timeline here.
              </div>
            ) : (
              all.map((e, i) => {
                if (e.type === 'cycle') {
                  return (
                    <div key={i} className="history-entry">
                      <div className="h-date">{formatDate(e.date)} · 🩸 Cycle Log</div>
                      <div className="h-text">
                        Period {e.start}{e.end ? ` → ${e.end}` : ''} · Flow: {e.flow || '—'} · Cycle length: {e.cycleLen} days
                      </div>
                    </div>
                  )
                }
                if (e.type === 'sym') {
                  return (
                    <div key={i} className="history-entry sym">
                      <div className="h-date">{formatDate(e.date)} · 💊 Symptoms</div>
                      <div className="h-text">
                        {e.symptoms.join(', ') || 'None selected'}
                        {e.mood ? ` · Mood: ${e.mood}` : ''} 
                        {' '}· Pain: {e.pain}/10
                        {e.notes ? <><br/>{e.notes}</> : ''}
                      </div>
                    </div>
                  )
                }
                if (e.type === 'med') {
                  return (
                    <div key={i} className="history-entry med">
                      <div className="h-date">{formatDate(e.date)} · 💉 Medication Added</div>
                      <div className="h-text">{e.name} · {e.dose || '—'} · {e.freq || '—'}</div>
                    </div>
                  )
                }
                if (e.type === 'note') {
                  return (
                    <div key={i} className="history-entry med">
                      <div className="h-date">{formatDate(e.date)} · 📝 Note</div>
                      <div className="h-text">{e.text}</div>
                    </div>
                  )
                }
                if (e.type === 'pcos') {
                  return (
                    <div key={i} className="history-entry pcos">
                      <div className="h-date">{formatDate(e.date)} · 🧬 PCOS Assessment</div>
                      <div className="h-text">
                        Estimated risk: <strong>{e.risk}</strong>
                        {e.symptoms.length ? ` · Symptoms: ${e.symptoms.slice(0,3).join(', ')}${e.symptoms.length > 3 ? '...' : ''}` : ''}
                      </div>
                    </div>
                  )
                }
                return null
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
