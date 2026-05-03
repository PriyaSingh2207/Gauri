import React from 'react'
import { useTranslation } from 'react-i18next'

export default function HealthLog({ data, saveData, showToast }) {
  const { t } = useTranslation()
  const { cycles = [], symptoms = [], medications = [], notes = [], pcosAssessments = [] } = data

  const all = [
    ...cycles.map(c => ({ ...c, type: 'cycle', ts: new Date(c.date).getTime() })),
    ...symptoms.map(s => ({ ...s, type: 'sym', ts: new Date(s.date).getTime() })),
    ...medications.map(m => ({ ...m, type: 'med', ts: new Date(m.date).getTime() })),
    ...notes.map(n => ({ ...n, type: 'note', ts: new Date(n.date).getTime() })),
    ...pcosAssessments.map(p => ({ ...p, type: 'pcos', ts: new Date(p.date).getTime() })),
  ].sort((a, b) => b.ts - a.ts)

  const clearAll = () => {
    if (window.confirm(t('history.confirm_clear'))) {
      saveData({ cycles: [], symptoms: [], medications: [], notes: [], pcosAssessments: [] })
      showToast(t('history.msg_cleared'))
    }
  }

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const lastPcos = pcosAssessments.length ? pcosAssessments[pcosAssessments.length - 1].risk : '—'

  return (
    <div id="tab-history" className="tab-content">
      <div className="page-header">
        <div>
          <div className="page-title">{t('history.title')} <em>{t('history.subtitle')}</em></div>
          <div className="page-sub">{t('history.desc')}</div>
        </div>
      </div>
      <div className="page-content">
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-val">{cycles.length}</div>
            <div className="stat-lbl">{t('history.stat_cycles')}</div>
            <div className="stat-accent" style={{background: 'var(--cornflower)'}}></div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{symptoms.length}</div>
            <div className="stat-lbl">{t('history.stat_symptoms')}</div>
            <div className="stat-accent" style={{background: 'var(--sky-deep)'}}></div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{medications.length}</div>
            <div className="stat-lbl">{t('history.stat_meds')}</div>
            <div className="stat-accent" style={{background: 'var(--crema)'}}></div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{lastPcos}</div>
            <div className="stat-lbl">{t('history.stat_pcos')}</div>
            <div className="stat-accent" style={{background: 'var(--lace-mid)'}}></div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-title" style={{justifyContent: 'space-between'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 8}}><span>📋</span> {t('history.timeline_title')}</div>
            <button className="btn btn-secondary btn-sm" onClick={clearAll}>{t('history.clear_btn')}</button>
          </div>
          <div className="history-list" style={{maxHeight: 420}}>
            {all.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                {t('history.empty')}
              </div>
            ) : (
              all.map((e, i) => {
                if (e.type === 'cycle') {
                  return (
                    <div key={i} className="history-entry">
                      <div className="h-date">{formatDate(e.date)} · 🩸 {t('history.cycle_log')}</div>
                      <div className="h-text">
                        {t('history.period')} {e.start}{e.end ? ` → ${e.end}` : ''} · {t('history.flow')}: {e.flow || '—'} · {t('history.cycle_len')}: {e.cycleLen} {t('history.days')}
                      </div>
                    </div>
                  )
                }
                if (e.type === 'sym') {
                  return (
                    <div key={i} className="history-entry sym">
                      <div className="h-date">{formatDate(e.date)} · 💊 {t('history.sym_log')}</div>
                      <div className="h-text">
                        {e.symptoms.map(s => t(`symptoms.${s}`)).join(', ') || t('history.none')}
                        {e.mood ? ` · ${t('history.mood')}: ${t(`symptoms.${e.mood}`)}` : ''} 
                        {' '}· {t('history.pain')}: {e.pain}/10
                        {e.notes ? <><br/>{e.notes}</> : ''}
                      </div>
                    </div>
                  )
                }
                if (e.type === 'med') {
                  return (
                    <div key={i} className="history-entry med">
                      <div className="h-date">{formatDate(e.date)} · 💉 {t('history.med_log')}</div>
                      <div className="h-text">{e.name} · {e.dose || '—'} · {t(`meds.${e.freq}`) || '—'}</div>
                    </div>
                  )
                }
                if (e.type === 'note') {
                  return (
                    <div key={i} className="history-entry med">
                      <div className="h-date">{formatDate(e.date)} · 📝 {t('history.note_log')}</div>
                      <div className="h-text">{e.text}</div>
                    </div>
                  )
                }
                if (e.type === 'pcos') {
                  return (
                    <div key={i} className="history-entry pcos">
                      <div className="h-date">{formatDate(e.date)} · 🧬 {t('history.pcos_log')}</div>
                      <div className="h-text">
                        {t('history.est_risk')}: <strong>{e.risk}</strong>
                        {e.symptoms.length ? ` · ${t('symptoms.common')}: ${e.symptoms.slice(0,3).join(', ')}${e.symptoms.length > 3 ? '...' : ''}` : ''}
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
