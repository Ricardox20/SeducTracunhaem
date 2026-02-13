import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Lock, Trash2, AlertCircle, Info } from 'lucide-react';

const CalendarioEscolar = () => {
  // Pegando os dados e a função do contexto
  const { diasBloqueados = [], bloquearDia } = useAuth(); 
  
  const [novaData, setNovaData] = useState('');
  const [motivo, setMotivo] = useState('');

  const handleBloquear = (e) => {
    e.preventDefault();
    if (novaData && motivo) {
      bloquearDia(novaData, motivo);
      setNovaData('');
      setMotivo('');
    }
  };

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Calendário Letivo</h1>
          <p className="text-[10px] font-black text-primary uppercase tracking-widest">Controle de bloqueios e feriados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. FORMULÁRIO DE BLOQUEIO (A PARTE QUE TINHA SUMIDO!) */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm h-fit">
          <h3 className="font-black text-slate-700 uppercase text-xs mb-6 flex items-center gap-2">
            <Lock size={16} className="text-primary"/> Novo Bloqueio
          </h3>
          
          <form onSubmit={handleBloquear} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Data do Evento</label>
              <input 
                type="date" 
                className="w-full border-slate-200 rounded-2xl p-3 text-sm font-bold focus:ring-primary focus:border-primary transition-all"
                value={novaData}
                onChange={(e) => setNovaData(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Motivo do Bloqueio</label>
              <input 
                type="text" 
                placeholder="EX: FERIADO MUNICIPAL"
                className="w-full border-slate-200 rounded-2xl p-3 text-sm font-bold uppercase focus:ring-primary focus:border-primary transition-all"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                required
              />
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl flex gap-3 items-start border border-amber-100">
              <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold text-amber-700 uppercase leading-relaxed">
                Bloquear um dia impedirá que professores lancem frequências ou diários nesta data.
              </p>
            </div>

            <button 
              type="submit"
              className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-[10px] uppercase hover:bg-black transition-all shadow-lg shadow-slate-200 active:scale-95"
            >
              Confirmar Bloqueio
            </button>
          </form>
        </div>

        {/* 2. LISTAGEM DE DIAS BLOQUEADOS */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/30">
            <h3 className="font-black text-slate-700 uppercase text-xs">Dias Não Letivos Registrados</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição / Motivo</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-black uppercase text-[11px] text-slate-600">
                {diasBloqueados?.map((dia, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-5 flex items-center gap-3">
                      <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                        <Calendar size={14} />
                      </div>
                      {/* Formatação para o padrão brasileiro */}
                      {new Date(dia.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-5">
                      <span className="text-slate-800 tracking-tighter">{dia.motivo}</span>
                    </td>
                    <td className="p-5 text-right">
                      <button className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {diasBloqueados?.length === 0 && (
                  <tr>
                    <td colSpan="3" className="p-12 text-center">
                       <div className="flex flex-col items-center opacity-20">
                          <Calendar size={48} />
                          <p className="mt-2 font-black text-xs uppercase italic">Nenhum bloqueio ativo</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarioEscolar;