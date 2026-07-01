import { useState } from 'react'
import type { Disciplina } from '../types'
import { disciplinasApi } from '../services/api'
import { useDisciplinas } from '../hooks/useDisciplinas'
import { useCursos } from '../hooks/useCursos'
import { useMatriculas } from '../hooks/useMatriculas'
import { pluralize, vagasPct } from '../utils/format'
import Modal from '../components/Modal'
import { toast } from '../components/Toast'

interface FormState {
  nome: string; codigo: string; cargaHoraria: string; limiteVagas: string
  cursoId: string; prerequisitoIds: number[]; ativa: boolean
}

const EMPTY: FormState = {
  nome: '', codigo: '', cargaHoraria: '', limiteVagas: '',
  cursoId: '', prerequisitoIds: [], ativa: true,
}

export default function DisciplinasPage() {
  const { disciplinas, reload } = useDisciplinas()
  const { cursos } = useCursos()
  const { matriculas } = useMatriculas()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Disciplina | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)

  const cursoNome = (id: number) => cursos.find(c => c.id === id)?.nome ?? '—'

  const prereqOptions = (cursoId: string) =>
    disciplinas.filter(d => String(d.cursoId) === cursoId && d.id !== editing?.id)

  const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true) }
  const openEdit = (d: Disciplina) => {
    setEditing(d)
    setForm({
      nome: d.nome, codigo: d.codigo,
      cargaHoraria: String(d.cargaHoraria), limiteVagas: String(d.limiteVagas),
      cursoId: String(d.cursoId), prerequisitoIds: d.prerequisitoIds, ativa: d.ativa,
    })
    setOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (matriculas.some(m => m.disciplinaId === id)) {
      toast('Não é possível excluir: há alunos matriculados nesta disciplina', 'error')
      return
    }
    if (!confirm('Excluir esta disciplina?')) return
    try {
      await disciplinasApi.delete(id)
      toast('Disciplina excluída com sucesso')
      reload()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao excluir disciplina', 'error')
    }
  }

  const togglePrereq = (id: number) =>
    setForm(f => ({
      ...f,
      prerequisitoIds: f.prerequisitoIds.includes(id)
        ? f.prerequisitoIds.filter(p => p !== id)
        : [...f.prerequisitoIds, id],
    }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      nome: form.nome, codigo: form.codigo,
      cargaHoraria: Number(form.cargaHoraria), limiteVagas: Number(form.limiteVagas),
      cursoId: Number(form.cursoId), prerequisitoIds: form.prerequisitoIds, ativa: form.ativa,
    }
    try {
      editing ? await disciplinasApi.update(editing.id, payload) : await disciplinasApi.create(payload)
      toast(editing ? 'Disciplina atualizada' : 'Disciplina criada com sucesso')
      setOpen(false)
      reload()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao salvar disciplina', 'error')
    } finally {
      setSaving(false)
    }
  }

  const f = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Disciplinas</h1>
          <p className="page-subtitle">{pluralize(disciplinas.length, 'disciplina cadastrada', 'disciplinas cadastradas')}</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Nova Disciplina</button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 48 }}>#</th>
              <th>Nome</th>
              <th>Código</th>
              <th>C.H.</th>
              <th>Vagas</th>
              <th>Status</th>
              <th>Curso</th>
              <th style={{ width: 120 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {disciplinas.length === 0 ? (
              <tr><td colSpan={8} className="table-empty">Nenhuma disciplina cadastrada ainda.</td></tr>
            ) : disciplinas.map(d => {
              const pct = vagasPct(d.vagasOcupadas, d.limiteVagas)
              const full = d.vagasOcupadas >= d.limiteVagas
              return (
                <tr key={d.id}>
                  <td className="cell-id">{d.id}</td>
                  <td className="cell-bold">{d.nome}</td>
                  <td><span className="badge badge-mono">{d.codigo}</span></td>
                  <td className="cell-muted">{d.cargaHoraria}h</td>
                  <td>
                    <div className="vagas-wrap">
                      <span className="vagas-label">{d.vagasOcupadas}/{d.limiteVagas}</span>
                      <div className="vagas-bar">
                        <div className={`vagas-fill ${full ? 'vagas-fill-full' : ''}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${d.ativa ? 'badge-success' : 'badge-neutral'}`}>
                      {d.ativa ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="cell-muted">{cursoNome(d.cursoId)}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-sm btn-outline" onClick={() => openEdit(d)}>Editar</button>
                      <button className="btn btn-sm btn-danger-outline" onClick={() => handleDelete(d.id)}>Excluir</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title={editing ? 'Editar Disciplina' : 'Nova Disciplina'} onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="form">
            <div className="field">
              <label className="field-label">Nome</label>
              <input className="field-input" type="text" value={form.nome} onChange={f('nome')}
                placeholder="Ex: Algoritmos e Estruturas de Dados" minLength={3} maxLength={120} required />
            </div>
            <div className="form-row">
              <div className="field">
                <label className="field-label">Código</label>
                <input className="field-input" type="text" value={form.codigo} onChange={f('codigo')}
                  placeholder="Ex: AED001" minLength={2} maxLength={20} required />
              </div>
              <div className="field">
                <label className="field-label">Carga Horária (h)</label>
                <input className="field-input" type="number" value={form.cargaHoraria} onChange={f('cargaHoraria')}
                  min={1} max={400} required />
              </div>
              <div className="field">
                <label className="field-label">Limite de Vagas</label>
                <input className="field-input" type="number" value={form.limiteVagas} onChange={f('limiteVagas')}
                  min={1} max={500} required />
              </div>
            </div>
            <div className="field">
              <label className="field-label">Curso</label>
              <select className="field-input" value={form.cursoId} onChange={f('cursoId')} required>
                <option value="">Selecione um curso</option>
                {cursos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            {form.cursoId && prereqOptions(form.cursoId).length > 0 && (
              <div className="field">
                <label className="field-label">Pré-requisitos</label>
                <div className="prereq-list">
                  {prereqOptions(form.cursoId).map(d => (
                    <label key={d.id} className="prereq-item">
                      <input type="checkbox"
                        checked={form.prerequisitoIds.includes(d.id)}
                        onChange={() => togglePrereq(d.id)} />
                      <span>{d.nome} <small>({d.codigo})</small></span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="field">
              <label className="toggle-label">
                <input type="checkbox" checked={form.ativa}
                  onChange={e => setForm(f => ({ ...f, ativa: e.target.checked }))} />
                <span className="toggle-text">Disciplina ativa</span>
              </label>
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
