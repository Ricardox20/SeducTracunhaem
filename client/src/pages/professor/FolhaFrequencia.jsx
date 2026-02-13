import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Ajuste o caminho se necessário
import { Save, Calendar as CalendarIcon, UserCheck } from 'lucide-react';

const FolhaFrequencia = () => {
  const { getAlunosPorEscola, salvarPresenca, turmas } = useAuth();
  const [turmaSelecionada, setTurmaSelecionada] = useState("");
  const [dataChamada, setDataChamada] = useState(new Date().toISOString().split('T')[0]);
  const [lista, setLista] = useState([]);

  // 1. Carrega os alunos quando o professor escolhe a turma
  useEffect(() => {
    if (turmaSelecionada) {
      const alunos = getAlunosPorEscola().filter(a => Number(a.turma_id) === Number(turmaSelecionada));
      setLista(alunos.map(a => ({ alunoId: a.id, nome: a.nome, status: 'P' })));
    } else {
      setLista([]);
    }
  }, [turmaSelecionada, getAlunosPorEscola]);

  const toggleStatus = (id) => {
    setLista(prev => prev.map(item => 
      item.alunoId === id ? { ...item, status: item.status === 'P' ? 'F' : 'P' } : item
    ));
  };

  const handleSalvar = () => {
    if (!turmaSelecionada) return alert("Selecione uma turma!");
    salvarPresenca(dataChamada, turmaSelecionada, lista);
    alert("Frequência salva com sucesso no sistema!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Chamada Diária</h1>
        
        {/* Seletor de Turma caso ele não venha por prop */}
        <select 
          value={turmaSelecionada}
          onChange={(e) => setTurmaSelecionada(e.target.value)}
          className="bg-white border-slate-200 rounded-xl text-[10px] font-black uppercase"
        >
          <option value="">Selecionar Turma...</option>
          {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {lista.length > 0 ? (
          <>
            <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CalendarIcon size={16} className="text-primary" />
                <input type="date" value={dataChamada} onChange={(e) => setDataChamada(e.target.value)} className="font-black uppercase text-xs border-none bg-transparent focus:ring-0" />
              </div>
              <button onClick={handleSalvar} className="bg-primary text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 hover:scale-105 transition-all">
                <Save size={16} /> Salvar Chamada
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {lista.map(aluno => (
                <div key={aluno.alunoId} className="p-5 flex justify-between items-center group">
                  <span className="font-black text-slate-700 uppercase text-xs">{aluno.nome}</span>
                  <button 
                    onClick={() => toggleStatus(aluno.alunoId)}
                    className={`px-6 py-2 rounded-full font-black text-[10px] uppercase transition-all ${
                      aluno.status === 'P' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-red-500 text-white shadow-lg shadow-red-100'
                    }`}
                  >
                    {aluno.status === 'P' ? 'Presente' : 'Faltou'}
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-20 text-center text-slate-300 italic font-black uppercase text-xs">
            Selecione uma turma para carregar a lista de alunos.
          </div>
        )}
      </div>
    </div>
  );
};

export default FolhaFrequencia;