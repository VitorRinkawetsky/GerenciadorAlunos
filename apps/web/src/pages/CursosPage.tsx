import { useState } from 'react'
import type { Curso } from '../types'
import { cursosApi } from '../services/api'
import { useCursos } from '../hooks/useCursos'
import { useAlunos } from '../hooks/useAlunos'
import { useDisciplinas } from '../hooks/useDisciplinas'
import { pluralize } from '../utils/format'
import Modal from '../components/Modal'
import { toast } from '../lib/toast'

interface FormState { nome: string; descricao: string }
const EMPTY: FormState = { nome: '', descricao: '' }

export default function CursosPage() {
  const { cursos, reload } = useCursos()
  const { alunos } = useAlunos()
  const { disciplinas } = useDisciplinas()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Curso | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)

  const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true) }
  const openEdit = (c: Curso) => { setEditing(c); setForm({ nome: c.nome, descricao: c.descricao }); setOpen(true) }

  const handleDelete = async (id: number) => {
    if (alunos.some(a => a.cursoId === id) || disciplinas.some(d => d.cursoId === id)) {
      toast('Não é possível excluir: há alunos ou disciplinas vinculados a este curso', 'error')
      return
    }
    if (!confirm('Excluir este curso?')) return
    try {
      await cursosApi.delete(id)
      toast('Curso excluído com sucesso')
      reload()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao excluir curso', 'error')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await cursosApi.update(editing.id, form)
      } else {
        await cursosApi.create(form)
      }
      toast(editing ? 'Curso atualizado' : 'Curso criado com sucesso')
      setOpen(false)
      reload()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao salvar curso', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Cursos</h1>
          <p className="page-subtitle">{pluralize(cursos.length, 'curso cadastrado', 'cursos cadastrados')}</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Novo Curso</button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 48 }}>#</th>
              <th>Nome</th>
              <th>Descrição</th>
              <th style={{ width: 120 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {cursos.length === 0 ? (
              <tr><td colSpan={4} className="table-empty">Nenhum curso cadastrado ainda.</td></tr>
            ) : cursos.map(c => (
              <tr key={c.id}>
                <td className="cell-id">{c.id}</td>
                <td className="cell-bold">{c.nome}</td>
                <td className="cell-muted cell-clamp">{c.descricao}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(c)}>Editar</button>
                    <button className="btn btn-sm btn-danger-outline" onClick={() => handleDelete(c.id)}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title={editing ? 'Editar Curso' : 'Novo Curso'} onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="form">
            <div className="field">
              <label className="field-label">Nome</label>
              <input className="field-input" type="text" value={form.nome}
                onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                placeholder="Ex: Ciência da Computação" minLength={3} maxLength={100} required />
            </div>
            <div className="field">
              <label className="field-label">Descrição</label>
              <textarea className="field-input field-textarea" value={form.descricao}
                onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                placeholder="Descreva o curso..." minLength={10} maxLength={500} required />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Salvando…' : editing ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
