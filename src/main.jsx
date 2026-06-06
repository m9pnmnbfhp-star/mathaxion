import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
          <div style={{ background: '#16161f', border: '1px solid #2a2a3a', borderRadius: '16px', padding: '2rem', maxWidth: '500px', width: '100%' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ color: '#ef4444', fontWeight: 700, marginBottom: '0.5rem' }}>Σφάλμα εκκίνησης</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {this.state.error.message}
            </p>
            <p style={{ color: '#64748b', fontSize: '0.75rem' }}>
              Βεβαιώσου ότι έχεις συμπληρώσει τα API keys στο <code style={{ color: '#a78bfa' }}>.env.local</code>
            </p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
