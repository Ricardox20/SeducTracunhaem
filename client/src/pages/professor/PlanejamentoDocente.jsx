import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Save, CheckCircle, Info } from 'lucide-react';

const PlanejamentoDocente = () => {
  const { turmaId } = useParams();
  const navigate = useNavigate();
  const { user, turmas } = useAuth();
  const [salvo, setSalvo] = useState(false);

  const turma = turmas.find(t => t.id === Number(turmaId));
  const nivel = turma?.nivel_ensino || user?.nivel_ensino;

  const [plano, setPlano] = useState({
    data: new Date().toISOString().split('T')[0],
    conteudo: '',
    metodologia: '',
    avaliacao: '',
    materiais: '',
    // Campos Específicos Infantil
    remanejar: '',
    vivencia: '',
    proposta: '',
    organizacao: '',
    // Campos Anos Iniciais (1º ao 5º)
    atividadesCasa: '',
    objetoAprendizagem: '',
    // Campos Anos Finais (6º ao 9º)
    unidadeTematica: '',
    competenciasBNCC: ''
  });

  const handleSalvar = () => {
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-400"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Planejamento de Aula</h1>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest">{turma?.nome} — {nivel}</p>
          </div>
        </div>
        <button onClick={handleSalvar} className="bg-slate-800 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-primary transition-all shadow-lg"><Save size={16} /> Salvar Plano</button>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Data da Aula</label>
            <input type="date" value={plano.data} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold" />
          </div>

          {/* CAMPOS DINÂMICOS CONFORME O NÍVEL (Item 1 e 2 do checklist) */}
          
          {/* ANOS FINAIS: Unidade Temática */}
          {nivel === 'Finais' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Unidade Temática</label>
              <input type="text" placeholder="Ex: Álgebra, Geometria..." className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold" />
            </div>
          )}
        </div>

        {/* CAMPOS DE TEXTO GRANDE */}
        <div className="grid grid-cols-1 gap-6">
          
          {/* EDUCAÇÃO INFANTIL: Campos do PDF */}
          {nivel === 'Infantil' && (
            <>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Registro de Vivência</label>
                <textarea className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs min-h-[100px]" placeholder="Relate as experiências vividas..."></textarea>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Remanejar / Ampliar</label>
                <textarea className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs min-h-[100px]" placeholder="Observações sobre mudanças no plano..."></textarea>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Organização de Tempo e Espaço</label>
                <textarea className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs min-h-[100px]"></textarea>
              </div>
            </>
          )}

          {/* ANOS INICIAIS: Campos do PDF */}
          {(nivel === 'Iniciais') && (
            <>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Objeto de Aprendizagem</label>
                <textarea className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs min-h-[80px]"></textarea>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Atividades para Casa</label>
                <textarea className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs min-h-[80px]"></textarea>
              </div>
            </>
          )}

          {/* COMUM A TODOS: Conteúdo, Metodologia, Materiais */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Metodologia / Procedimentos Didáticos</label>
            <textarea className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs min-h-[120px]"></textarea>
          </div>

          {nivel === 'Finais' && (
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Competências da BNCC</label>
              <textarea className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs min-h-[100px]" placeholder="Ex: (EF06MA01), (EF06MA02)..."></textarea>
            </div>
          )}
        </div>
      </div>

      {salvo && (
        <div className="fixed bottom-10 right-10 bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle size={20}/>
          <span className="text-[11px] font-black uppercase">Plano de Aula salvo com sucesso!</span>
        </div>
      )}
    </div>
  );
};

export default PlanejamentoDocente;