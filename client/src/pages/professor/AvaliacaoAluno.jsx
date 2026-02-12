
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Save, User, BookOpen, GraduationCap, CheckCircle, AlertTriangle, FileText, Star, Brain } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AvaliacaoAluno() {
    const { user } = useAuth();

    // --- ESTADOS DE SELEÇÃO DE CONTEXTO ---
    const [escolas, setEscolas] = useState([]);
    const [turmas, setTurmas] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);

    const [selectedEscola, setSelectedEscola] = useState('');
    const [selectedTurma, setSelectedTurma] = useState('');
    const [selectedDisciplina, setSelectedDisciplina] = useState('');

    // --- ESTADOS DE DADOS ---
    const [alunos, setAlunos] = useState([]);
    const [alunoSelecionado, setAlunoSelecionado] = useState(null);
    const [nivelEnsino, setNivelEnsino] = useState('');

    // --- ESTADOS DO FORMULÁRIO DE AVALIAÇÃO ---
    // Estrutura genérica para aguentar tanto notas quanto conceitos
    const [avaliacao, setAvaliacao] = useState({
        parecer_descritivo: '',
        conceito: '',
        nota_1: '',
        nota_2: '',
        nota_3: '',
        recuperacao: '',
        aspectos_atitudinais: {
            participacao: false,
            organizacao: false,
            respeito: false
        }
    });

    const [loading, setLoading] = useState(false);

    // --- CARREGAMENTO INICIAL ---
    useEffect(() => {
        carregarEscolas();
    }, []);

    useEffect(() => {
        if (selectedEscola) {
            carregarTurmas(selectedEscola);
            resetContexto('turma');
        }
    }, [selectedEscola]);

    useEffect(() => {
        if (selectedTurma) {
            const t = turmas.find(t => t.id === Number(selectedTurma));
            if (t) {
                setNivelEnsino(t.nivel_ensino);
                carregarDisciplinas(t.nivel_ensino);
                carregarAlunos(selectedTurma);
            }
            resetContexto('disciplina');
        }
    }, [selectedTurma, turmas]);

    // Reseta seleção de aluno se mudar a disciplina (pois é uma nova pauta)
    useEffect(() => {
        setAlunoSelecionado(null);
        resetAvaliacao();
    }, [selectedDisciplina]);


    // --- FUNÇÕES DE API ---
    const carregarEscolas = async () => {
        const dados = await apiService.getEscolas();
        setEscolas(dados);
    };

    const carregarTurmas = async (escolaId) => {
        const dados = await apiService.getTurmas(escolaId);
        setTurmas(dados);
    };

    const carregarDisciplinas = async (nivel) => {
        const dados = await apiService.getDisciplinas(nivel);
        setDisciplinas(dados);
    };

    const carregarAlunos = async (turmaId) => {
        setLoading(true);
        const dados = await apiService.getAlunos(turmaId);
        setAlunos(dados);
        setLoading(false);
    };

    const resetContexto = (nivel) => {
        if (nivel === 'turma') {
            setSelectedTurma('');
            setSelectedDisciplina('');
            setAlunos([]);
            setAlunoSelecionado(null);
        } else if (nivel === 'disciplina') {
            setSelectedDisciplina('');
            setAlunoSelecionado(null);
        }
    };

    const resetAvaliacao = () => {
        setAvaliacao({
            parecer_descritivo: '',
            conceito: '',
            nota_1: '',
            nota_2: '',
            nota_3: '',
            recuperacao: '',
            aspectos_atitudinais: {
                participacao: false,
                organizacao: false,
                respeito: false
            }
        });
    };

    // --- HANDLERS ---
    const handleSelectAluno = (aluno) => {
        setAlunoSelecionado(aluno);
        // Em um app real, aqui buscaríamos a avaliação já existente deste aluno nesta disciplina.
        // Como é mock, vamos apenas limpar o form para simular uma nova entrada ou manter o estado se fosse persistido localmente.
        // resetAvaliacao(); 
    };

    const handleChange = (campo, valor) => {
        setAvaliacao(prev => ({ ...prev, [campo]: valor }));
    };

    const handleAtitudinalChange = (campo) => {
        setAvaliacao(prev => ({
            ...prev,
            aspectos_atitudinais: {
                ...prev.aspectos_atitudinais,
                [campo]: !prev.aspectos_atitudinais[campo]
            }
        }));
    };

    const handleSalvar = async () => {
        if (!alunoSelecionado || !selectedDisciplina) return;

        setLoading(true);
        const payload = {
            aluno_id: alunoSelecionado.id,
            aluno_nome: alunoSelecionado.nome,
            disciplina_id: selectedDisciplina,
            turma_id: selectedTurma,
            nivel_ensino: nivelEnsino,
            dados_avaliacao: avaliacao
        };

        const res = await apiService.salvarAvaliacao(payload);
        setLoading(false);

        if (res.success) {
            alert(res.message);
        }
    };

    // --- RENDERIZADORES DO FORMULÁRIO ---

    const renderFormInfantil = () => (
        <div className="space-y-6 animate-fadeIn">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
                <Brain className="text-blue-500 mt-1" />
                <div>
                    <h4 className="font-bold text-blue-800 text-sm uppercase">Avaliação de Desenvolvimento</h4>
                    <p className="text-sm text-blue-600">Para a Educação Infantil, o foco é no acompanhamento dos processos de aprendizagem e desenvolvimento.</p>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Parecer Descritivo (Semestral)</label>
                <textarea
                    rows="8"
                    className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-seduc-primary transition bg-gray-50 focus:bg-white resize-none"
                    placeholder="Descreva avanços, dificuldades e observações sobre o desenvolvimento da criança..."
                    value={avaliacao.parecer_descritivo}
                    onChange={(e) => handleChange('parecer_descritivo', e.target.value)}
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Conceito Global</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {['Construído', 'Em Construção', 'Não Construído'].map((opcao) => (
                        <button
                            key={opcao}
                            onClick={() => handleChange('conceito', opcao)}
                            className={`p-3 rounded-lg border text-sm font-bold transition flex items-center justify-center gap-2
                                ${avaliacao.conceito === opcao
                                    ? 'bg-seduc-primary text-white border-seduc-primary shadow-lg transform scale-105'
                                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                        >
                            {avaliacao.conceito === opcao && <CheckCircle size={16} />}
                            {opcao}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderFormFundamental = () => (
        <div className="space-y-6 animate-fadeIn">
            <div className="bg-green-50 border border-green-100 p-4 rounded-lg flex items-start gap-3">
                <GraduationCap className="text-green-600 mt-1" />
                <div>
                    <h4 className="font-bold text-green-800 text-sm uppercase">Boletim Escolar ({nivelEnsino})</h4>
                    <p className="text-sm text-green-600">Registro quantitativo e qualitativo de desempenho.</p>
                </div>
            </div>

            {/* NOTAS NUMÉRICAS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3].map(unidade => (
                    <div key={unidade}>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nota Unidade {unidade}</label>
                        <input
                            type="number"
                            min="0" max="10" step="0.1"
                            className="w-full p-3 text-center font-bold text-lg border border-gray-200 rounded-lg outline-none focus:border-seduc-primary transition"
                            placeholder="-"
                            value={avaliacao[`nota_${unidade}`]}
                            onChange={(e) => handleChange(`nota_${unidade}`, e.target.value)}
                        />
                    </div>
                ))}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 text-red-500">Recuperação</label>
                    <input
                        type="number"
                        min="0" max="10" step="0.1"
                        className="w-full p-3 text-center font-bold text-lg border border-red-200 bg-red-50 rounded-lg outline-none focus:border-red-500 transition text-red-600"
                        placeholder="-"
                        value={avaliacao.recuperacao}
                        onChange={(e) => handleChange('recuperacao', e.target.value)}
                    />
                </div>
            </div>

            {/* ASPECTOS ATITUDINAIS (Apenas Iniciais - 1º ao 5º) */}
            {nivelEnsino === 'Iniciais' && (
                <div className="border-t pt-4 mt-6">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                        <Star size={14} className="text-yellow-500" /> Aspectos Atitudinais
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${avaliacao.aspectos_atitudinais.participacao ? 'bg-yellow-50 border-yellow-400' : 'bg-white border-gray-200'}`}>
                            <input
                                type="checkbox"
                                className="w-5 h-5 accent-yellow-500"
                                checked={avaliacao.aspectos_atitudinais.participacao}
                                onChange={() => handleAtitudinalChange('participacao')}
                            />
                            <span className="text-sm font-medium text-gray-700">Participação Ativa</span>
                        </label>

                        <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${avaliacao.aspectos_atitudinais.organizacao ? 'bg-yellow-50 border-yellow-400' : 'bg-white border-gray-200'}`}>
                            <input
                                type="checkbox"
                                className="w-5 h-5 accent-yellow-500"
                                checked={avaliacao.aspectos_atitudinais.organizacao}
                                onChange={() => handleAtitudinalChange('organizacao')}
                            />
                            <span className="text-sm font-medium text-gray-700">Organização</span>
                        </label>

                        <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${avaliacao.aspectos_atitudinais.respeito ? 'bg-yellow-50 border-yellow-400' : 'bg-white border-gray-200'}`}>
                            <input
                                type="checkbox"
                                className="w-5 h-5 accent-yellow-500"
                                checked={avaliacao.aspectos_atitudinais.respeito}
                                onChange={() => handleAtitudinalChange('respeito')}
                            />
                            <span className="text-sm font-medium text-gray-700">Colaboração e Respeito</span>
                        </label>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-fadeIn">
            {/* --- CABEÇALHO --- */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-seduc-primary flex items-center gap-2">
                    <FileText className="text-seduc-secondary" /> Avaliação de Desempenho
                </h1>
                <p className="text-gray-500 text-sm">Registro de notas, conceitos e pareceres descritivos por aluno.</p>
            </div>

            {/* --- SELETORES DE CONTEXTO --- */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Escola</label>
                    <select
                        className="w-full p-2.5 border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-seduc-primary focus:bg-white transition"
                        value={selectedEscola}
                        onChange={(e) => setSelectedEscola(e.target.value)}
                    >
                        <option value="">Selecione a Escola...</option>
                        {escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Turma</label>
                    <select
                        className="w-full p-2.5 border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-seduc-primary focus:bg-white transition"
                        value={selectedTurma}
                        onChange={(e) => setSelectedTurma(e.target.value)}
                        disabled={!selectedEscola}
                    >
                        <option value="">Selecione a Turma...</option>
                        {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Disciplina</label>
                    <select
                        className="w-full p-2.5 border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-seduc-primary focus:bg-white transition"
                        value={selectedDisciplina}
                        onChange={(e) => setSelectedDisciplina(e.target.value)}
                        disabled={!selectedTurma}
                    >
                        <option value="">Selecione a Disciplina...</option>
                        {disciplinas.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
                    </select>
                </div>
            </div>

            {/* --- CONTEÚDO PRINCIPAL (SPLIT VIEW) --- */}
            {selectedDisciplina && alunos.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slideUp">

                    {/* COLUNA DA ESQUERDA: LISTA DE ALUNOS */}
                    <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-[600px] flex flex-col">
                        <div className="p-4 bg-gray-50 border-b border-gray-100">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                <User size={18} /> Alunos Matriculados
                            </h3>
                            <p className="text-xs text-gray-500">Selecione um aluno para avaliar</p>
                        </div>
                        <div className="overflow-y-auto flex-1 p-2 space-y-1">
                            {alunos.map(aluno => (
                                <button
                                    key={aluno.id}
                                    onClick={() => handleSelectAluno(aluno)}
                                    className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition border
                                        ${alunoSelecionado?.id === aluno.id
                                            ? 'bg-blue-50 border-blue-200 shadow-sm'
                                            : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
                                        ${alunoSelecionado?.id === aluno.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        {aluno.nome.charAt(0)}
                                    </div>
                                    <div className="truncate">
                                        <p className={`text-sm font-bold ${alunoSelecionado?.id === aluno.id ? 'text-blue-800' : 'text-gray-700'}`}>{aluno.nome}</p>
                                        <p className="text-xs text-gray-400">Status: {aluno.status}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* COLUNA DA DIREITA: FORMULÁRIO DE AVALIAÇÃO */}
                    <div className="lg:col-span-8">
                        {alunoSelecionado ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 h-full">
                                <div className="flex justify-between items-center mb-6 border-b pb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-seduc-primary">{alunoSelecionado.nome}</h2>
                                        <p className="text-sm text-gray-500">Matrícula: #{alunoSelecionado.id} • Situação: <span className="text-green-600 font-bold">Regular</span></p>
                                    </div>
                                    <div className="text-right hidden md:block">
                                        <p className="text-xs font-bold text-gray-400 uppercase">Período Letivo</p>
                                        <p className="font-bold text-gray-800">2024.1</p>
                                    </div>
                                </div>

                                {/* FORMULÁRIO DINÂMICO */}
                                {nivelEnsino === 'Infantil' ? renderFormInfantil() : renderFormFundamental()}

                                {/* BOTÃO SALVAR */}
                                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                                    <button
                                        onClick={handleSalvar}
                                        disabled={loading}
                                        className={`px-8 py-3 bg-seduc-primary text-white font-bold rounded-lg shadow-lg hover:bg-blue-800 transition flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {loading ? 'Processando...' : <><Save size={20} /> Salvar Avaliação</>}
                                    </button>
                                </div>

                            </div>
                        ) : (
                            <div className="h-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                                <User size={48} className="mb-4 opacity-20" />
                                <h3 className="font-bold text-lg mb-2">Nenhum aluno selecionado</h3>
                                <p className="text-sm">Clique em um aluno na lista ao lado para lançar as notas ou pareceres.</p>
                            </div>
                        )}
                    </div>

                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-gray-500">Selecione uma Escola, Turma e Disciplina para começar.</p>
                </div>
            )}
        </div>
    );
}
