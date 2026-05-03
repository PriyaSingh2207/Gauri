import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function BreastHealth({ data, saveData, showToast }) {
  const { t } = useTranslation()
  const [checkedItems, setCheckedItems] = useState(new Set())
  const [riskLevel, setRiskLevel] = useState('low') // low, moderate, high

  const items = [
    { id: '1', label: t('breast.item1'), weight: 50 },
    { id: '2', label: t('breast.item2'), weight: 15 },
    { id: '3', label: t('breast.item3'), weight: 30 },
    { id: '4', label: t('breast.item4'), weight: 40 },
    { id: '5', label: t('breast.item5'), weight: 25 },
    { id: '6', label: t('breast.item6'), weight: 20 },
    { id: '7', label: t('breast.item7'), weight: 35 },
    { id: '8', label: t('breast.item8'), weight: 10 },
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
    showToast(t('breast.msg_saved'))
  }

  let barBg = '#6A8FD8' // Low
  let scoreColor = '#3F6ABF'
  let noteText = t('breast.note_low')
  let statusText = t('breast.risk_low')

  if (riskLevel === 'moderate') {
    barBg = '#C8A97A'
    scoreColor = '#8B6340'
    noteText = t('breast.note_mod')
    statusText = t('breast.risk_mod')
  } else if (riskLevel === 'high') {
    barBg = '#B85C5C'
    scoreColor = '#8B2020'
    noteText = t('breast.note_high')
    statusText = t('breast.risk_high')
  }

  return (
    <div id="tab-breast" className="tab-content">
      <div className="page-header">
        <div>
          <div className="page-title">{t('breast.title')} <em>{t('breast.subtitle')}</em></div>
          <div className="page-sub">{t('breast.desc')}</div>
        </div>
      </div>
      <div className="page-content">
        <div className="section-row" style={{ gridTemplateColumns: '1fr' }}>
          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="card-title"><span>🎗️</span> {t('breast.how_to')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '13px', color: 'var(--text2)', lineHeight: '1.6' }}>
              <div style={{ background: 'var(--surface2)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <strong style={{ color: 'var(--text)' }}>{t('breast.step1_title')}</strong><br/>
                {t('breast.step1_text')}
              </div>
              <div style={{ background: 'var(--surface2)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <strong style={{ color: 'var(--text)' }}>{t('breast.step2_title')}</strong><br/>
                {t('breast.step2_text')}
              </div>
              <div style={{ background: 'var(--surface2)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <strong style={{ color: 'var(--text)' }}>{t('breast.step3_title')}</strong><br/>
                {t('breast.step3_text')}
              </div>
            </div>
          </div>
        </div>

        <div className="section-row">
          <div className="card">
            <div className="card-title"><span>🔍</span> {t('breast.checklist_title')}</div>
            <div style={{ marginBottom: '12px', fontSize: '12px', color: 'var(--text3)' }}>{t('breast.checklist_sub')}</div>
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
            <div className="card-title"><span>📊</span> {t('breast.result')}</div>
            <div className="risk-meter">
              <div className="risk-header">
                <span className="risk-title">{t('breast.status')}</span>
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
              <div style={{fontSize: 11, color: 'var(--crema-dark)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase'}}>⚠ {t('breast.disclaimer')}</div>
              <div style={{fontSize: 12, color: 'var(--text3)', lineHeight: 1.7}}>{t('breast.disclaimer_text')}</div>
            </div>
            <div className="btn-row">
              <button className="btn btn-primary" onClick={saveAssessment} style={{ width: '100%' }}>{t('breast.save')}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
