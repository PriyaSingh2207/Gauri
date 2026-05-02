import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import MainApp from './components/MainApp'
import SpecialistLogin from './components/SpecialistLogin'
import './index.css'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/specialist-login" element={<SpecialistLogin />} />
      </Routes>
    </Router>
  )
}
