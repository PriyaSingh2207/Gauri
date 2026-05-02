import React, { useState, useEffect } from 'react'

export default function BreastHealth({ data, saveData, showToast }) {
  const [checkedItems, setCheckedItems] = useState(new Set())
  const [riskLevel, setRiskLevel] = useState('low') // low, moderate, high

  const items = [
    { id: '1', label: 'A painless, hard lump or thickening', weight: 50 },
    { id: '2', label: 'Changes in breast size or shape', weight: 15 },
    { id: '3', label: 'Dimpling or puckering of the skin (orange peel texture)', weight: 30 },
    { id: '4', label: 'Nipple discharge (especially bloody or clear)', weight: 40 },
    { id: '5', label: 'Newly inverted nipple', weight: 25 },
    { id: '6', label: 'Redness, flaking, or scaling on the nipple or breast skin', weight: 20 },
    { id: '7', label: 'Swelling or lump in the armpit or around collarbone', weight: 35 },
    { id: '8', label: 'Constant pain in one part of the breast or armpit', weight: 10 },
  ]

  useEffect(() => {
    let totalScore = 0
    checkedItems.forEach(id => {
      const item = items.find(i => i.id === id)
      if (item) totalScore += item.weight
    })

    if (totalScore >= 35) {
      setRiskLevel('high')
    } else if (totalScore >= 15) {
      setRiskLevel('moderate')
    } else {
      setRiskLevel('low')
    }
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
      riskLevel: riskLevel,
      symptoms: syms,
      date: new Date().toISOString()
    }
    saveData({ ...data, breastAssessments: [...(data.breastAssessments || []), entry] })
    showToast('Breast health assessment saved!')
  }

  let barBg = '#6A8FD8' // Low
  let scoreColor = '#3F6ABF'
  let noteText = 'No significant risk factors selected. Continue regular self-exams.'
  let statusText = 'Low Risk'

  if (riskLevel === 'moderate') {
    barBg = '#C8A97A'
    scoreColor = '#8B6340'
    noteText = 'You have selected some concerning symptoms. It is recommended to consult a doctor.'
    statusText = 'Moderate Risk'
  } else if (riskLevel === 'high') {
    barBg = '#B85C5C'
    scoreColor = '#8B2020'
    noteText = 'High priority alert! These symptoms require prompt medical evaluation. Please see a specialist immediately.'
    statusText = 'High Risk'
  }
  
  if (checkedItems.size === 0) {
    scoreColor = 'var(--teal-light)'
    barBg = 'var(--teal)'
    statusText = 'Not Assessed'
    noteText = 'Select any signs you have noticed to assess risk.'
  }

  return (
    <div id="tab-breast" className="tab-content">
      <div className="page-header">
        <div>
          <div className="page-title">Breast <em>Health</em> Assessment</div>
          <div className="page-sub">Perform your monthly self-exam and log any changes.</div>
        </div>
      </div>
      <div className="page-content">
        <div className="section-row" style={{ gridTemplateColumns: '1fr' }}>
          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="card-title"><span>🎗️</span> How to perform a self-exam</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '13px', color: 'var(--text2)', lineHeight: '1.6' }}>
              <div style={{ background: 'var(--surface2)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <strong style={{ color: 'var(--text)' }}>1. Look in the Mirror</strong><br/>
                Keep your shoulders straight and arms on your hips. Look for changes in size, shape, color, or any dimpling/puckering of the skin.
              </div>
              <div style={{ background: 'var(--surface2)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <strong style={{ color: 'var(--text)' }}>2. Raise Your Arms</strong><br/>
                Raise your arms high and look for the same changes. Also, check for any signs of fluid coming out of one or both nipples.
              </div>
              <div style={{ background: 'var(--surface2)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <strong style={{ color: 'var(--text)' }}>3. Feel in the Shower/Lying Down</strong><br/>
                Use your right hand to feel your left breast, then vice versa. Use a firm, smooth touch with the first few finger pads.
              </div>
            </div>
          </div>
        </div>

        <div className="section-row">
          <div className="card">
            <div className="card-title"><span>🔍</span> Symptom Checklist</div>
            <div style={{ marginBottom: '12px', fontSize: '12px', color: 'var(--text3)' }}>Select any signs or changes you have noticed recently:</div>
            <div className="pcos-indicators" style={{ gridTemplateColumns: '1fr' }}>
              {items.map(item => (
                <div 
                  key={item.id}
                  className={`pcos-item ${checkedItems.has(item.id) ? 'checked' : ''}`}
                  onClick={() => toggleItem(item.id)}
                  style={{ padding: '10px 12px' }}
                >
                  <div className="check-box"></div>
                  <span className="pcos-label">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{display: 'flex', flexDirection: 'column'}}>
            <div className="card-title"><span>📊</span> Assessment Result</div>
            <div className="risk-meter">
              <div className="risk-header">
                <span className="risk-title">Estimated Status</span>
                <span className="risk-score" style={{color: scoreColor, fontSize: '22px'}}>{statusText}</span>
              </div>
              <div className="risk-bar-track">
                <div className="risk-bar-fill" style={{width: checkedItems.size === 0 ? '0%' : '100%', background: barBg}}></div>
              </div>
              <div className="risk-note" style={{ fontWeight: riskLevel === 'high' ? 'bold' : 'normal', color: riskLevel === 'high' ? scoreColor : 'var(--text3)' }}>
                {noteText}
              </div>
            </div>
            <div style={{flex: 1}}></div>
            <div style={{padding: 16, background: 'rgba(237,217,184,0.3)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(200,169,122,0.3)', marginTop: 16}}>
              <div style={{fontSize: 11, color: 'var(--crema-dark)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase'}}>⚠ Disclaimer</div>
              <div style={{fontSize: 12, color: 'var(--text3)', lineHeight: 1.7}}>This tool is not a diagnosis. Breast cancer can only be diagnosed by a medical professional through imaging (mammogram/ultrasound) and biopsy. If you find a lump, do not panic, but please see a doctor.</div>
            </div>
            <div className="btn-row">
              <button className="btn btn-primary" onClick={saveAssessment} style={{ width: '100%' }}>Save Assessment</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
