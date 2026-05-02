import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Sidebar from './Sidebar'
import CycleTracker from './CycleTracker'
import SymptomsJournal from './SymptomsJournal'
import PcosChecker from './PcosChecker'
import Medications from './Medications'
import HealthLog from './HealthLog'
import BreastHealth from './BreastHealth'
import UserAuth from './UserAuth'
import Chatbot from './Chatbot'

export default function MainApp() {
  const [activeTab, setActiveTab] = useState('cycle')
  const [user, setUser] = useState(null)
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  
  // Data state
  const [data, setData] = useState({
    cycles: [],
    symptoms: [],
    medications: [],
    notes: [],
    pcosAssessments: [],
    breastAssessments: []
  })

  // Authentication logic
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        setUser(session.user)
        setIsAnonymous(session.user.is_anonymous || false)
      } else {
        // Sign in anonymously by default for privacy-first experience
        const { data: authData, error } = await supabase.auth.signInAnonymously()
        if (!error) {
          setUser(authData.user)
          setIsAnonymous(true)
        }
      }
    }
    
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user)
        setIsAnonymous(session.user.is_anonymous || false)
      } else {
        setUser(null)
        setIsAnonymous(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load local data for tables not yet in Supabase
  useEffect(() => {
    try {
      const stored = localStorage.getItem('gauri_data_local')
      if (stored) {
        const parsed = JSON.parse(stored)
        setData(prev => ({
          ...prev,
          medications: parsed.medications || [],
          notes: parsed.notes || [],
          pcosAssessments: parsed.pcosAssessments || [],
          breastAssessments: parsed.breastAssessments || []
        }))
      }
    } catch(e) {}
  }, [])

  // Fetch Supabase data
  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      // Fetch cycles
      const { data: cyclesData } = await supabase
        .from('cycles')
        .select('*')
        .order('created_at', { ascending: true })
      
      // Fetch symptoms
      const { data: symData } = await supabase
        .from('symptoms')
        .select('*')
        .order('created_at', { ascending: true })

      setData(prev => {
        const newState = { ...prev }
        if (cyclesData) {
          newState.cycles = cyclesData.map(c => ({
            id: c.id,
            start: c.start_date,
            end: c.end_date,
            flow: c.flow,
            cycleLen: c.cycle_len,
            date: c.created_at
          }))
        }
        if (symData) {
          newState.symptoms = symData.map(s => ({
            id: s.id,
            symptoms: s.symptoms,
            mood: s.mood,
            pain: s.pain,
            notes: s.notes,
            date: s.created_at
          }))
        }
        return newState
      })
    }
    
    fetchData()
  }, [user])

  const saveData = (newData) => {
    setData(newData)
    // Only persist local-only tables to localStorage
    const localData = {
      medications: newData.medications,
      notes: newData.notes,
      pcosAssessments: newData.pcosAssessments,
      breastAssessments: newData.breastAssessments
    }
    localStorage.setItem('gauri_data_local', JSON.stringify(localData))
  }

  const [toastMsg, setToastMsg] = useState('')
  const showToast = (msg = 'Saved!') => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }

  return (
    <div className="app">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        isAnonymous={isAnonymous} 
        onLoginClick={() => setShowAuthModal(true)} 
      />
      <div className="main" id="main-content">
        {activeTab === 'cycle' && <CycleTracker user={user} isAnonymous={isAnonymous} data={data} saveData={saveData} showToast={showToast} />}
        {activeTab === 'symptoms' && <SymptomsJournal user={user} isAnonymous={isAnonymous} data={data} saveData={saveData} showToast={showToast} />}
        {activeTab === 'pcos' && <PcosChecker data={data} saveData={saveData} showToast={showToast} />}
        {activeTab === 'breast' && <BreastHealth data={data} saveData={saveData} showToast={showToast} />}
        {activeTab === 'meds' && <Medications data={data} saveData={saveData} showToast={showToast} />}
        {activeTab === 'history' && <HealthLog data={data} saveData={saveData} showToast={showToast} />}
        {activeTab === 'chat' && <Chatbot data={data} />}
      </div>
      <div className={`toast ${toastMsg ? 'show' : ''}`} id="toast">
        ✓ {toastMsg}
      </div>

      {showAuthModal && (
        <UserAuth 
          onClose={() => setShowAuthModal(false)} 
          onAuthSuccess={(u) => {
            setUser(u)
            setIsAnonymous(false)
            setShowAuthModal(false)
          }} 
        />
      )}
    </div>
  )
}
