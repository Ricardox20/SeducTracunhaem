import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, Save, Coffee, CheckCircle, Clock, AlertCircle 
} from 'lucide-react';

const FolhaFrequencia = () => {
  const { turmaId } = useParams();
  const navigate = useNavigate();
  const { user, turmas, alunos, salvarPresenca } = useAuth();

  const [modoVisao, setModoVisao] = useState('diario'); 
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());
  
  const turma = turmas.find(t => t.id === Number(turmaId));
  const alunosDaTurma = alunos.filter(a => Number(a.turma_id) === Number(turmaId));

  // --- LÓGICA DE CALENDÁRIO ---
  const isFinalDeSemana = (dataStr) => {
    const data = new Date(dataStr + 'T12:00:00');
    return data.getDay() === 0 || data.getDay() === 6; 
  };

  const listaDiasUteis = useMemo(() => {
    const ano = 2026;
    const diasNoMes = new Date(ano, mesSelecionado + 1, 0).getDate();
    const uteis = [];
    for (let i = 1; i <= diasNoMes; i++) {
      const data = new Date(ano, mesSelecionado, i);
      if (data.getDay() !== 0 && data.getDay() !== 6) uteis.push(i);
    }
    return uteis;
  }, [mesSelecionado]);

  // --- ESTADOS DE CHAMADA ---
  const [chamadaDia, setChamadaDia] = useState({});
  const [gradeMensal, setGradeMensal] = useState({});

  // EFEITO DE INICIALIZAÇÃO
  useEffect(() => {
    if (modoVisao === 'diario') {
      // 1. NO DIÁRIO: Pré-seleciona todo mundo com 'P' (Presença)
      const inicialDiario = {};
      alunosDaTurma.forEach(a => {
        inicialDiario[a.id] = { status: 'P' };
      });
      setChamadaDia(inicialDiario);
    } else {
      // 2. NO MENSAL: Inicia em branco (-)
      setGradeMensal({});
    }
  }, [turmaId, modoVisao, dataSelecionada, mesSelecionado]);

  const toggleStatus = (alunoId, dia = null) => {
    if (modoVisao === 'diario') {
      if (isFinalDeSemana(dataSelecionada)) return;
      setChamadaDia(prev => {
        const atual = prev[alunoId]?.status;
        // Ciclo no Diário: P -> F -> J (já começa no P)
        const proximo = atual === 'P' ? 'F' : atual === 'F' ? 'J' : 'P';
        return { ...prev, [alunoId]: { status: proximo } };
      });
    } else {
      setGradeMensal(prev => {
        const chave = `${alunoId}-${dia}`;
        const atual = prev[chave];
        // Ciclo no Mensal: Branco -> P -> F -> J
        let proximo = 'P';
        if (atual === 'P') proximo = 'F';
        else if (atual === 'F') proximo = 'J';
        else if (atual === 'J') proximo = undefined;
        return { ...prev, [chave]: proximo };
      });
    }
  };

  const handleSalvar = () => {
    alert("Frequência registrada com sucesso!");
    navigate('/portal-professor');
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-400 shadow-sm"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase italic leading-none">Frequência</h1>
            <p className="text-[10px] font-black text-primary uppercase mt-1">
              {modoVisao === 'diario' ? 'Chamada Diária (Padrão: Presença)' : 'Lançamento Mensal em Branco'}
            </p>
          </div>
        </div>

        <div className="bg-slate-100 p-1 rounded-2xl flex shadow-inner">
          <button onClick={() => setModoVisao('diario')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${modoVisao === 'diario' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}>Diário</button>
          <button onClick={() => setModoVisao('mensal')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${modoVisao === 'mensal' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}>Mensal</button>
        </div>
      </div>

      {modoVisao === 'diario' ? (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 bg-slate-50/50 flex items-center justify-between border-b">
            <input type="date" value={dataSelecionada} onChange={(e) => setDataSelecionada(e.target.value)} className="bg-white border border-slate-100 rounded-xl text-xs font-black p-2 shadow-sm" />
            <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase">
              <CheckCircle size={14} className="text-emerald-500"/> Todos iniciam com Presença
            </div>
          </div>

          {!isFinalDeSemana(dataSelecionada) ? (
            <div className="divide-y divide-slate-50">
              {alunosDaTurma.map((aluno) => (
                <div key={aluno.id} className="p-4 px-8 flex items-center justify-between hover:bg-slate-50/30">
                  <span className="text-xs font-bold text-slate-700 uppercase">{aluno.nome}</span>
                  <button 
                    onClick={() => toggleStatus(aluno.id)} 
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white transition-all ${
                      chamadaDia[aluno.id]?.status === 'P' ? 'bg-emerald-500' : 
                      chamadaDia[aluno.id]?.status === 'F' ? 'bg-red-500' : 'bg-amber-500'
                    }`}
                  >
                    {chamadaDia[aluno.id]?.status}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-20 text-center"><Coffee size={40} className="mx-auto text-slate-200 mb-2"/><p className="text-xs font-black text-slate-300 uppercase">Fim de semana sem aula</p></div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          {/* Tabela Mensal permanece com lógica de preenchimento manual */}
          <div className="p-6 bg-slate-50/50 border-b flex justify-between items-center">
            <select value={mesSelecionado} onChange={(e) => setMesSelecionado(Number(e.target.value))} className="bg-white border-none rounded-xl text-xs font-black p-2 uppercase shadow-sm">
              <option value={1}>Fevereiro</option><option value={2}>Março</option>
            </select>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Preencha os dias letivos manualmente</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-4 border sticky left-0 bg-slate-50 z-20 min-w-[150px] uppercase text-slate-400">Estudante</th>
                  {listaDiasUteis.map(d => <th key={d} className="p-2 border text-center min-w-[35px] text-slate-400">{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {alunosDaTurma.map(aluno => (
                  <tr key={aluno.id}>
                    <td className="p-3 border font-bold uppercase sticky left-0 bg-white z-10">{aluno.nome}</td>
                    {listaDiasUteis.map(dia => {
                      const status = gradeMensal[`${aluno.id}-${dia}`];
                      return (
                        <td key={dia} className="p-1 border text-center">
                          <button 
                            onClick={() => toggleStatus(aluno.id, dia)}
                            className={`w-7 h-7 rounded-md font-black text-[9px] transition-all ${
                              status === 'P' ? 'text-white bg-emerald-500' : 
                              status === 'F' ? 'text-white bg-red-500' : 
                              status === 'J' ? 'text-white bg-amber-500' : 
                              'bg-slate-50 text-slate-300'
                            }`}
                          >
                            {status || '-'}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button onClick={handleSalvar} className="bg-slate-800 text-white px-12 py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-primary transition-all">
          Salvar Frequência
        </button>
      </div>
    </div>
  );
};

export default FolhaFrequencia;