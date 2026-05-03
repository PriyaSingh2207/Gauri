import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function PcosChecker({ data, saveData, showToast }) {
  const { t } = useTranslation()
  const [checkedItems, setCheckedItems] = useState(new Set())
  const [riskPct, setRiskPct] = useState(0)

  const items = [
    { id: '1', label: t('pcos.item1'), weight: 15 },
    { id: '2', label: t('pcos.item2'), weight: 12 },
    { id: '3', label: t('pcos.item3'), weight: 10 },
    { id: '4', label: t('pcos.item4'), weight: 10 },
    { id: '5', label: t('pcos.item5'), weight: 8 },
    { id: '6', label: t('pcos.item6'), weight: 8 },
    { id: '7', label: t('pcos.item7'), weight: 7 },
    { id: '8', label: t('pcos.item8'), weight: 7 },
    { id: '9', label: t('pcos.item9'), weight: 6 },
    { id: '10', label: t('pcos.item10'), weight: 5 },
    { id: '11', label: t('pcos.item11'), weight: 5 },
    { id: '12', label: t('pcos.item12'), weight: 7 },
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
    showToast(t('pcos.msg_saved'))
  }

  let barBg = '#6A8FD8'
  let scoreColor = '#3F6ABF'
  let noteText = t('pcos.risk_low')

  if (riskPct >= 25 && riskPct < 55) {
    barBg = '#C8A97A'
    scoreColor = '#8B6340'
    noteText = t('pcos.risk_mod')
  } else if (riskPct >= 55) {
    barBg = '#B85C5C'
    scoreColor = '#8B2020'
    noteText = t('pcos.risk_high')
  }
  
  if (riskPct === 0 && checkedItems.size === 0) {
    scoreColor = 'var(--teal-light)'
    barBg = 'var(--teal)'
    noteText = t('pcos.risk_empty')
  }

  return (
    <div id="tab-pcos" className="tab-content">
      <div className="page-header">
        <div>
          <div className="page-title">{t('pcos.title')} <em>{t('pcos.subtitle')}</em></div>
          <div className="page-sub">{t('pcos.desc')}</div>
        </div>
      </div>
      <div className="page-content">
        <div className="section-row">
          <div className="card">
            <div className="card-title"><span>🧬</span> {t('pcos.indicators')}</div>
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
            <div className="card-title"><span>📊</span> {t('pcos.assessment')}</div>
            <div className="risk-meter">
              <div className="risk-header">
                <span className="risk-title">{t('pcos.estimated')}</span>
                <span className="risk-score" style={{color: scoreColor}}>{riskPct}%</span>
              </div>
              <div className="risk-bar-track">
                <div className="risk-bar-fill" style={{width: `${riskPct}%`, background: barBg}}></div>
              </div>
              <div className="risk-note">{noteText}</div>
            </div>
            <div style={{flex: 1}}></div>
            <div style={{padding: 16, background: 'rgba(237,217,184,0.3)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(200,169,122,0.3)', marginTop: 16}}>
              <div style={{fontSize: 11, color: 'var(--crema-dark)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase'}}>⚠ {t('pcos.disclaimer')}</div>
              <div style={{fontSize: 12, color: 'var(--text3)', lineHeight: 1.7}}>{t('pcos.disclaimer_text')}</div>
            </div>
            <div className="btn-row">
              <button className="btn btn-primary" onClick={saveAssessment}>{t('pcos.save')}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
