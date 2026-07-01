import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

// As páginas buscam dados via fetch ao montar; sem isso os testes de
// componente disparam chamadas de rede reais contra a API e derrubam a
// suíte com unhandled rejections quando não há backend rodando.
vi.mock('./services/api', () => {
  const empty = () => Promise.resolve([])
  return {
    cursosApi: { list: empty },
    alunosApi: { list: empty },
    disciplinasApi: { list: empty },
    matriculasApi: { list: empty },
  }
})

describe('App', () => {
  it('renderiza o header com o nome da aplicação', () => {
    render(<App />)
    expect(screen.getByText('GerenciadorAlunos')).toBeInTheDocument()
  })

  it('mostra as três abas de navegação', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /alunos/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cursos/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /disciplinas/i })).toBeInTheDocument()
  })

  it('abre a aba Alunos por padrão', () => {
    render(<App />)
    expect(screen.getByText('Alunos matriculados', { exact: false })).toBeInTheDocument()
  })

  it('navega para Cursos ao clicar na aba', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /cursos/i }))
    expect(screen.getByText('Cursos cadastrados', { exact: false })).toBeInTheDocument()
  })

  it('navega para Disciplinas ao clicar na aba', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /disciplinas/i }))
    expect(screen.getByText('Disciplinas cadastradas', { exact: false })).toBeInTheDocument()
  })
})
