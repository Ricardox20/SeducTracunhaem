import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, GraduationCap, Mail, Tag, Trash2, MapPin } from 'lucide-react';

const ListaProfessores = () => {
  const { escolaIdSelecionada, escolas, professores } = useAuth(); // Puxando professores do Contexto agora!

  const escolaAtual = escolas.find(e => e.id === escolaIdSelecionada);

  // --- FILTRAGEM: Mostra apenas professores vinculados a esta escola ---
  const professoresDaUnidade = professores.filter(prof => 
    prof.escolas_ids?.includes(Number(escolaIdSelecionada))
  );

  if (!escolaIdSelecionada) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border-2 border-dashed border-slate-100 italic">
        <GraduationCap size={48} className="opacity-20 mb-4" />
        <h2 className="font-black uppercase tracking-widest">Selecione uma unidade no cabeçalho</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={14} className="text-primary" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{escolaAtual?.nome}</p>
          </div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Quadro de Docentes</h1>
        </div>
        <button className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase flex items-center gap-2 hover:shadow-lg transition-all active:scale-95 shadow-lg shadow-primary/20">
          <UserPlus size={18} /> Alocar Professor
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="p-5">Professor</th>
              <th className="p-5">Atuação / Nível</th>
              <th className="p-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-black uppercase text-[11px] text-slate-600">
            {professoresDaUnidade.length > 0 ? (
              professoresDaUnidade.map(prof => (
                <tr key={prof.id} className="hover:bg-slate-50/80 transition group">
                  <td className="p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <p className="text-slate-800 tracking-tighter">{prof.nome}</p>
                      <p className="text-[9px] text-slate-400 flex items-center gap-1 font-bold lowercase italic tracking-normal">
                        <Mail size={10}/> {prof.email}
                      </p>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-primary" />
                      <span className={`px-2 py-1 rounded-lg text-[9px] ${
                        prof.nivel === 'Infantil' ? 'bg-orange-50 text-orange-600' : 
                        prof.nivel === 'Iniciais' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'
                      }`}>
                        {prof.nivel}
                      </span>
                    </div>
                  </td>
                  <td className="p-5 text-right space-x-2">
                    <button className="text-[10px] font-black text-primary hover:underline">Vínculos</button>
                    <button className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-10 text-center text-slate-300 font-black uppercase text-xs italic">
                  Nenhum professor alocado nesta unidade.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaProfessores;