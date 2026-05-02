import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function CycleTracker({ user, isAnonymous, data, saveData, showToast }) {
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [flow, setFlow] = useState('')
  const [cycleLen, setCycleLen] = useState('')

  const cycles = data.cycles || []

  const logPeriod = async () => {
    if (!start) {
      showToast('Please enter a start date')
      return
    }
    if (!user) {
      showToast('Waiting for authentication...')
      return
    }

    if (isAnonymous) {
      // Don't save to Supabase for anonymous users
      const mockInserted = {
        id: 'temp-' + Date.now(),
        start_date: start,
        end_date: end || null,
        flow,
        cycle_len: parseInt(cycleLen) || 28,
        created_at: new Date().toISOString()
      }
      
      const formatted = {
        id: mockInserted.id,
        start: mockInserted.start_date,
        end: mockInserted.end_date,
        flow: mockInserted.flow,
        cycleLen: mockInserted.cycle_len,
        date: mockInserted.created_at
      }

      saveData({ ...data, cycles: [...cycles, formatted] })
      showToast('Period logged locally (Session only)')
    } else {
      const newCycle = {
        user_id: user.id,
        start_date: start,
        end_date: end || null,
        flow,
        cycle_len: parseInt(cycleLen) || 28
      }

      const { data: inserted, error } = await supabase.from('cycles').insert([newCycle]).select()

      if (error) {
        showToast('Error saving: ' + error.message)
        return
      }

      const formatted = {
        id: inserted[0].id,
        start: inserted[0].start_date,
        end: inserted[0].end_date,
        flow: inserted[0].flow,
        cycleLen: inserted[0].cycle_len,
        date: inserted[0].created_at
      }

      saveData({ ...data, cycles: [...cycles, formatted] })
      showToast('Period logged!')
    }
    setStart('')
    setEnd('')
    setFlow('')
    setCycleLen('')
  }

  // Stats
  let avgLen = '—'
  let avgPer = '—'
  let nextDiffText = '—'

  if (cycles.length > 0) {
    avgLen = Math.round(cycles.reduce((a, c) => a + c.cycleLen, 0) / cycles.length)
    const withEnd = cycles.filter(c => c.end && c.start)
    if (withEnd.length) {
      avgPer = Math.round(withEnd.reduce((a, c) => {
        const d = (new Date(c.end) - new Date(c.start)) / (1000 * 86400) + 1
        return a + d
      }, 0) / withEnd.length)
    }
    const last = cycles[cycles.length - 1]
    if (last && last.start) {
      const nextDate = new Date(last.start)
      nextDate.setDate(nextDate.getDate() + last.cycleLen)
      const diff = Math.ceil((nextDate - new Date()) / (1000 * 86400))
      nextDiffText = diff >= 0 ? diff : 'Overdue'
    }
  }

  // Calendar
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const first = new Date(year, month, 1)
  const lastDate = new Date(year, month + 1, 0)
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const emptyDays = Array(first.getDay()).fill(null)
  
  const lastCycle = cycles.length ? cycles[cycles.length - 1] : null
  const calDays = []
  
  for (let d = 1; d <= lastDate.getDate(); d++) {
    const date = new Date(year, month, d)
    let cls = 'cal-day'
    if (d === now.getDate()) cls += ' today'
    
    if (lastCycle) {
      const startD = new Date(lastCycle.start)
      const endD = lastCycle.end ? new Date(lastCycle.end) : null
      const nextStart = new Date(startD)
      nextStart.setDate(nextStart.getDate() + lastCycle.cycleLen)
      const ovDay = new Date(nextStart)
      ovDay.setDate(ovDay.getDate() - 14)
      
      if (endD && date >= startD && date <= endD) cls += ' period'
      else if (Math.abs(date - ovDay) < 86400 * 1.5) cls += ' ovulation'
      else if (date > new Date(ovDay.getTime() - 5 * 86400000) && date < new Date(ovDay.getTime() + 2 * 86400000) && !(endD && date >= startD && date <= endD)) cls += ' fertile'
    }
    calDays.push({ d, cls })
  }

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div id="tab-cycle" className="tab-content">
      <div className="page-header">
        <div>
          <div className="page-title">Cycle <em>Tracker</em></div>
          <div className="page-sub">Log your menstrual cycle and predict upcoming phases</div>
        </div>
      </div>
      <div className="page-content">
        <div className="stats-row" id="cycle-stats">
          <div className="stat-card">
            <div className="stat-val">{avgLen}{avgLen !== '—' && <span className="stat-unit"> days</span>}</div>
            <div className="stat-lbl">Avg. cycle length</div>
            <div className="stat-accent" style={{background: 'var(--cornflower)'}}></div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{avgPer}{avgPer !== '—' && <span className="stat-unit"> days</span>}</div>
            <div className="stat-lbl">Avg. period length</div>
            <div className="stat-accent" style={{background: 'var(--sky-deep)'}}></div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{nextDiffText}{nextDiffText !== '—' && nextDiffText !== 'Overdue' && <span className="stat-unit"> days</span>}</div>
            <div className="stat-lbl">Days until next period</div>
            <div className="stat-accent" style={{background: 'var(--crema)'}}></div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{cycles.length}</div>
            <div className="stat-lbl">Cycles logged</div>
            <div className="stat-accent" style={{background: 'var(--lace-mid)'}}></div>
          </div>
        </div>
        
        <div className="section-row">
          <div className="card">
            <div className="card-title"><span>📅</span> Log Period</div>
            <div className="cycle-grid">
              <div className="input-group">
                <label>Start Date</label>
                <input type="date" value={start} onChange={e => setStart(e.target.value)} />
              </div>
              <div className="input-group">
                <label>End Date</label>
                <input type="date" value={end} onChange={e => setEnd(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Flow Intensity</label>
                <select value={flow} onChange={e => setFlow(e.target.value)}>
                  <option value="">Select flow</option>
                  <option value="spotting">Spotting</option>
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="heavy">Heavy</option>
                </select>
              </div>
              <div className="input-group">
                <label>Cycle Length (days)</label>
                <input type="number" min="21" max="45" placeholder="28" value={cycleLen} onChange={e => setCycleLen(e.target.value)} />
              </div>
            </div>
            <div className="btn-row">
              <button className="btn btn-primary" onClick={logPeriod}>Log Period</button>
              {isAnonymous && <span style={{ fontSize: '10px', color: 'var(--text3)', alignSelf: 'center' }}>⚠ Not saved to cloud</span>}
            </div>
          </div>
          
          <div className="card">
            <div className="card-title"><span>🗓️</span> This Month</div>
            <div className="cycle-calendar">
              {days.map(d => <div key={d} className="cal-header">{d}</div>)}
              {emptyDays.map((_, i) => <div key={`empty-${i}`} className="cal-day empty"></div>)}
              {calDays.map((day, i) => (
                <div key={i} className={day.cls}>{day.d}</div>
              ))}
            </div>
            <div className="legend">
              <div className="legend-item"><div className="legend-dot" style={{background: 'rgba(194,24,91,0.5)'}}></div>Period</div>
              <div className="legend-item"><div className="legend-dot" style={{background: 'rgba(212,160,23,0.5)'}}></div>Ovulation</div>
              <div className="legend-item"><div className="legend-dot" style={{background: 'rgba(26,122,106,0.4)'}}></div>Fertile window</div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-title"><span>📌</span> Cycle History</div>
          <div className="history-list">
            {cycles.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🩸</div>
                No cycles logged yet. Start by adding a period above.
              </div>
            ) : (
              [...cycles].reverse().map((c, i) => (
                <div key={i} className="history-entry">
                  <div className="h-date">{formatDate(c.date)}</div>
                  <div className="h-text">
                    Period: <strong>{c.start}</strong>{c.end ? ` → ${c.end}` : ''} · Flow: {c.flow || '—'} · Cycle: {c.cycleLen} days
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
