import { useState } from 'react'
import './App.css'
import AlunosPage from './pages/AlunosPage'
import CursosPage from './pages/CursosPage'
import DisciplinasPage from './pages/DisciplinasPage'

type Tab = 'alunos' | 'cursos' | 'disciplinas'

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'alunos', label: 'Alunos', icon: '👤' },
  { key: 'cursos', label: 'Cursos', icon: '📚' },
  { key: 'disciplinas', label: 'Disciplinas', icon: '📋' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('alunos')

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-icon">🎓</span>
            <span className="brand-name">GerenciadorAlunos</span>
          </div>
          <nav className="nav">
            {TABS.map(t => (
              <button
                key={t.key}
                className={`nav-btn ${tab === t.key ? 'nav-btn-active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                <span className="nav-icon">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="main">
        {tab === 'alunos' && <AlunosPage />}
        {tab === 'cursos' && <CursosPage />}
        {tab === 'disciplinas' && <DisciplinasPage />}
      </main>
    </div>
  )
}
