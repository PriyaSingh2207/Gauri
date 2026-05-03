import { supabase } from '../lib/supabase'
import { useTranslation } from 'react-i18next'

export default function Sidebar({ activeTab, setActiveTab, user, isAnonymous, onLoginClick, isOpen, onClose }) {
  const { t, i18n } = useTranslation()

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button 
        className="close-sidebar-btn" 
        style={{ 
          position: 'absolute', 
          top: '10px', 
          right: '10px', 
          background: 'none', 
          border: 'none', 
          color: '#fff', 
          fontSize: '20px', 
          cursor: 'pointer',
          display: 'none'
        }}
        onClick={onClose}
      >
        ✕
      </button>
      <div className="brand">
        <div className="brand-icon" style={{ overflow: 'hidden', padding: 0 }}>
          <img src="/logo.jpeg" alt="Gauri Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div className="brand-name">Gauri</div>
        <div className="brand-sub">Health Companion</div>
      </div>
      <nav className="nav">
        <div className={`nav-item ${activeTab === 'learn' ? 'active' : ''}`} onClick={() => setActiveTab('learn')}>
          <span className="nav-icon">🎓</span> {t('nav.learn')}
        </div>
        <div className={`nav-item ${activeTab === 'cycle' ? 'active' : ''}`} onClick={() => setActiveTab('cycle')}>
          <span className="nav-icon">🩸</span> {t('nav.cycle')}
        </div>
        <div className={`nav-item ${activeTab === 'symptoms' ? 'active' : ''}`} onClick={() => setActiveTab('symptoms')}>
          <span className="nav-icon">💊</span> {t('nav.symptoms')}
        </div>
        <div className={`nav-item ${activeTab === 'pcos' ? 'active' : ''}`} onClick={() => setActiveTab('pcos')}>
          <span className="nav-icon">🧬</span> {t('nav.pcos')}
        </div>
        <div className={`nav-item ${activeTab === 'breast' ? 'active' : ''}`} onClick={() => setActiveTab('breast')}>
          <span className="nav-icon">🎗️</span> {t('nav.breast')}
        </div>
        <div className={`nav-item ${activeTab === 'meds' ? 'active' : ''}`} onClick={() => setActiveTab('meds')}>
          <span className="nav-icon">💉</span> {t('nav.meds')}
        </div>
        <div className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <span className="nav-icon">📋</span> {t('nav.history')}
        </div>
        <div className={`nav-item ${activeTab === 'specialists' ? 'active' : ''}`} onClick={() => setActiveTab('specialists')}>
          <span className="nav-icon">📍</span> {t('nav.specialists')}
        </div>
        <div className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
          <span className="nav-icon">🤖</span> {t('nav.chat')}
        </div>
        <div className="nav-separator" style={{ height: '1px', background: 'rgba(255,255,255,0.15)', margin: '12px 0' }}></div>
        <div className="nav-item" onClick={() => window.location.href='/specialist-login'}>
          <span className="nav-icon">🩺</span> {t('auth.specialist_login')}
        </div>
      </nav>
    </div>
  )
}
