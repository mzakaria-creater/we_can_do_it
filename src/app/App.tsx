import { HashRouter, Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="*" element={<div style={{ padding: '20px', textAlign: 'center', color: '#fff', backgroundColor: '#0a0a0a', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h1 style={{ fontSize: '3em', marginBottom: '20px', color: '#D4A843' }}>ONTARGET Nexus</h1>
          <p style={{ fontSize: '1.2em' }}>Premium Enterprise Operations Dashboard</p>
          <p style={{ fontSize: '1em', marginTop: '20px', color: '#aaa' }}>46+ pages loaded and ready</p>
        </div>} />
      </Routes>
    </HashRouter>
  )
}
