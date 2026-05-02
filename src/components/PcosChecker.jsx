import React, { useState, useEffect } from 'react'

export default function PcosChecker({ data, saveData, showToast }) {
  const [checkedItems, setCheckedItems] = useState(new Set())
  const [riskPct, setRiskPct] = useState(0)

  const items = [
    { id: '1', label: 'Irregular periods (>35 day cycles)', weight: 15 },
    { id: '2', label: 'Missed periods (3+ months)', weight: 12 },
    { id: '3', label: 'Excess facial/body hair', weight: 10 },
    { id: '4', label: 'Thinning hair / hair loss', weight: 10 },
    { id: '5', label: 'Persistent acne on face/back', weight: 8 },
    { id: '6', label: 'Unexplained weight gain', weight: 8 },
    { id: '7', label: 'Difficulty losing weight', weight: 7 },
    { id: '8', label: 'Darkened skin patches (neck/armpits)', weight: 7 },
    { id: '9', label: 'Mood swings / depression', weight: 6 },
    { id: '10', label: 'Difficulty conceiving', weight: 5 },
    { id: '11', label: 'Fatigue & low energy', weight: 5 },
    { id: '12', label: 'Pelvic pain or pressure', weight: 7 },
  ]

  useEffect(() => {
    let total = 0
    checkedItems.forEach(id => {
      const item = items.find(i => i.id === id)
      if (item) total += item.weight
    })
    const maxScore = 100
    const pct = Math.min(Math.round(total / maxScore * 100 * 1.2), 100)
    setRiskPct(pct)
  }, [checkedItems])

  const toggleItem = (id) => {
    const newSet = new Set(checkedItems)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setCheckedItems(newSet)
  }

  const saveAssessment = () => {
    const syms = Array.from(checkedItems).map(id => items.find(i => i.id === id).label)
    const entry = {
      risk: `${riskPct}%`,
      symptoms: syms,
      date: new Date().toISOString()
    }
    saveData({ ...data, pcosAssessments: [...(data.pcosAssessments || []), entry] })
    showToast('PCOS assessment saved!')
  }

  let barBg = '#6A8FD8'
  let scoreColor = '#3F6ABF'
  let noteText = 'Low risk. Keep monitoring your cycle health.'

  if (riskPct >= 25 && riskPct < 55) {
    barBg = '#C8A97A'
    scoreColor = '#8B6340'
    noteText = 'Moderate risk. Consider discussing this with a gynecologist.'
  } else if (riskPct >= 55) {
    barBg = '#B85C5C'
    scoreColor = '#8B2020'
    noteText = 'High risk. We strongly recommend a consultation with a gynecologist soon.'
  }
  
  if (riskPct === 0 && checkedItems.size === 0) {
    scoreColor = 'var(--teal-light)'
    barBg = 'var(--teal)'
    noteText = 'Select symptoms above to see your risk level.'
  }

  return (
    <div id="tab-pcos" className="tab-content">
      <div className="page-header">
        <div>
          <div className="page-title">PCOS <em>Risk</em> Checker</div>
          <div className="page-sub">Select symptoms you experience regularly to assess your PCOS risk</div>
        </div>
      </div>
      <div className="page-content">
        <div className="section-row">
          <div className="card">
            <div className="card-title"><span>🧬</span> Hormonal Indicators</div>
            <div className="pcos-indicators">
              {items.map(item => (
                <div 
                  key={item.id}
                  className={`pcos-item ${checkedItems.has(item.id) ? 'checked' : ''}`}
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="check-box"></div>
                  <span className="pcos-label">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{display: 'flex', flexDirection: 'column'}}>
            <div className="card-title"><span>📊</span> Risk Assessment</div>
            <div className="risk-meter">
              <div className="risk-header">
                <span className="risk-title">Estimated PCOS Risk</span>
                <span className="risk-score" style={{color: scoreColor}}>{riskPct}%</span>
              </div>
              <div className="risk-bar-track">
                <div className="risk-bar-fill" style={{width: `${riskPct}%`, background: barBg}}></div>
              </div>
              <div className="risk-note">{noteText}</div>
            </div>
            <div style={{flex: 1}}></div>
            <div style={{padding: 16, background: 'rgba(237,217,184,0.3)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(200,169,122,0.3)', marginTop: 16}}>
              <div style={{fontSize: 11, color: 'var(--crema-dark)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase'}}>⚠ Disclaimer</div>
              <div style={{fontSize: 12, color: 'var(--text3)', lineHeight: 1.7}}>This tool is for awareness only — not a medical diagnosis. A gynecologist can confirm PCOS through blood tests and ultrasound.</div>
            </div>
            <div className="btn-row">
              <button className="btn btn-primary" onClick={saveAssessment}>Save Assessment</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
