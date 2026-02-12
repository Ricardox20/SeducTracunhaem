
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Save, CheckCircle, XCircle, FileText, Calendar, Edit2, RotateCcw, PieChart as IconPie, List as IconList, AlertTriangle, Trash2, Eye, X, BookOpen, User, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function DiarioClasse() {
    const { user } = useAuth();

    // --- ESTADOS DE SELEÇÃO ---
    const [escolas, setEscolas] = useState([]);
    const [turmas, setTurmas] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);
    const [alunos, setAlunos] = useState([]);

    const [selectedEscola, setSelectedEscola] = useState('');
    const [selectedTurma, setSelectedTurma] = useState('');
    const [selectedDisciplina, setSelectedDisciplina] = useState('');

    // --- ESTADOS DO DIÁRIO ---
    const [dataAula, setDataAula] = useState(new Date().toISOString().split('T')[0]);
    const [conteudo, setConteudo] = useState(''); // Conteudo geral ou específico dependendo do nível

    // Campos Específicos por Nível
    const [camposEspecificos, setCamposEspecificos] = useState({});

    const [chamada, setChamada] = useState({});
    const [observacoes, setObservacoes] = useState({});

    const [loading, setLoading] = useState(false);
    const [nivelEnsino, setNivelEnsino] = useState(''); // 'Infantil', 'Iniciais', 'Finais'

    const { turmaId } = useParams(); // Hook do Router
    const initRef = useRef(false);

    // --- CARREGAMENTO INICIAL ---
    useEffect(() => {
        carregarEscolas();
    }, []);

    // Se vier ID pela URL, carrega os dados da turma
    useEffect(() => {
        if (turmaId && escolas.length > 0 && !initRef.current) {
            carregarDadosPelaUrl(turmaId);
            initRef.current = true;
        }
    }, [turmaId, escolas]);

    const carregarDadosPelaUrl = async (id) => {
        // Busca a turma direto pelo ID
        const turma = await apiService.getTurmaById(id);
        if (turma && turma.escola_id) {
            setSelectedEscola(turma.escola_id);
            // Pequeno delay para garantir que o efeito da escola não limpe tudo
            setTimeout(() => {
                carregarTurmas(turma.escola_id).then(() => {
                    setSelectedTurma(turma.id);
                });
            }, 100);
        }
    };

    // Quando troca escola, limpa turma e carrega novas turmas (APENAS SE NÃO ESTIVER INICIANDO VIA URL)
    useEffect(() => {
        if (selectedEscola) {
            // Se for alteração manual do usuário ou carga normal
            if (initRef.current || !turmaId) {
                carregarTurmas(selectedEscola);
                // Se NÃO for a inicialização da URL, limpa a turma
                if (!initRef.current) {
                    setSelectedTurma('');
                    setSelectedDisciplina('');
                    setAlunos([]);
                    setNivelEnsino('');
                }
            }
        }
    }, [selectedEscola]);

    // Quando troca turma, define nível, carrega disciplinas e alunos
    useEffect(() => {
        if (selectedTurma) {
            // Se as turmas ainda não foram carregadas, busca no state ou espera
            const turmaObj = turmas.find(t => t.id === Number(selectedTurma));
            if (turmaObj) {
                setNivelEnsino(turmaObj.nivel_ensino);
                carregarDisciplinas(turmaObj.nivel_ensino);
                carregarAlunos(selectedTurma);
            } else if (turmaId) {
                // Caso extremo: Turma selecionada mas lista vazia (race condition), tenta buscar de novo
                apiService.getTurmaById(selectedTurma).then(t => {
                    setNivelEnsino(t.nivel_ensino);
                    carregarDisciplinas(t.nivel_ensino);
                    carregarAlunos(selectedTurma);
                })
            }
        }
    }, [selectedTurma, turmas]);

    // --- FUNÇÕES DE CARREGAMENTO (API MOCK) ---
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

        // Inicializa chamada com 'Presente'
        const inicial = {};
        dados.forEach(a => inicial[a.id] = 'Presente');
        setChamada(inicial);

        setLoading(false);
    };

    // --- HANDLERS ---
    const handleStatusChange = (alunoId, status) => {
        setChamada(prev => ({ ...prev, [alunoId]: status }));
        if (status !== 'Justificado') {
            setObservacoes(prev => {
                const nova = { ...prev };
                delete nova[alunoId];
                return nova;
            });
        }
    };

    const handleCampoEspecificoChange = (campo, valor) => {
        setCamposEspecificos(prev => ({ ...prev, [campo]: valor }));
    };

    const handleSalvar = async (e) => {
        e.preventDefault();

        // Validação Simples
        if (!selectedEscola || !selectedTurma || !selectedDisciplina) {
            alert("Por favor, selecione Escola, Turma e Disciplina.");
            return;
        }

        const payload = {
            escola_id: Number(selectedEscola),
            turma_id: Number(selectedTurma),
            disciplina_id: Number(selectedDisciplina),
            nivel_ensino: nivelEnsino,
            data_aula: dataAula,
            conteudo_geral: conteudo,
            campos_especificos: camposEspecificos,
            frequencia: Object.keys(chamada).map(id => ({
                aluno_id: Number(id),
                status: chamada[id],
                observacao: observacoes[id] || ''
            }))
        };

        setLoading(true);
        const res = await apiService.salvarPlanejamento(payload);
        setLoading(false);

        if (res.success) {
            alert(res.message);
            // Resetar formulário (opcional)
            setConteudo('');
            setCamposEspecificos({});
            // Reiniciar chamada
            const resetChamada = {};
            alunos.forEach(a => resetChamada[a.id] = 'Presente');
            setChamada(resetChamada);
            setObservacoes({});
        }
    };

    // --- RENDERIZAÇÃO DOS CAMPOS DINÂMICOS ---
    const renderCamposDinamicos = () => {
        if (!nivelEnsino) return null;

        if (nivelEnsino === 'Infantil') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fadeIn">
                    <div className="md:col-span-3 bg-blue-50 p-3 rounded text-blue-800 text-sm font-medium mb-2 border border-blue-100">
                        <Users size={16} className="inline mr-2" />
                        Campos Específicos para Educação Infantil
                    </div>

                    <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Registro de Vivência (O que aconteceu?)</label>
                        <textarea
                            rows="3"
                            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-seduc-primary transition"
                            placeholder="Descreva a experiência das crianças..."
                            value={camposEspecificos['registro_vivencia'] || ''}
                            onChange={(e) => handleCampoEspecificoChange('registro_vivencia', e.target.value)}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Proposta de Desenvolvimento</label>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-seduc-primary transition"
                            placeholder="Qual o objetivo da atividade?"
                            value={camposEspecificos['proposta_desenvolvimento'] || ''}
                            onChange={(e) => handleCampoEspecificoChange('proposta_desenvolvimento', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Org. Espaço/Tempo</label>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-seduc-primary transition"
                            placeholder="Ex: Roda, Parque, 30min..."
                            value={camposEspecificos['organizacao_espaco_tempo'] || ''}
                            onChange={(e) => handleCampoEspecificoChange('organizacao_espaco_tempo', e.target.value)}
                        />
                    </div>
                </div>
            );
        }

        // Anos Iniciais ou Finais
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 animate-fadeIn">
                <div className="md:col-span-2 bg-green-50 p-3 rounded text-green-800 text-sm font-medium mb-2 border border-green-100">
                    <BookOpen size={16} className="inline mr-2" />
                    Campos Específicos para Ensino Fundamental ({nivelEnsino})
                </div>

                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unidade Temática</label>
                    <input
                        type="text"
                        className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-seduc-primary transition"
                        placeholder="Ex: Matéria e Energia..."
                        value={camposEspecificos['unidade_tematica'] || ''}
                        onChange={(e) => handleCampoEspecificoChange('unidade_tematica', e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Objetivos de Aprendizagem</label>
                    <textarea
                        rows="3"
                        className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-seduc-primary transition"
                        placeholder="Códigos da BNCC ou descritivos..."
                        value={camposEspecificos['objetivos_aprendizagem'] || ''}
                        onChange={(e) => handleCampoEspecificoChange('objetivos_aprendizagem', e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Metodologia</label>
                    <textarea
                        rows="3"
                        className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-seduc-primary transition"
                        placeholder="Como a aula será conduzida..."
                        value={camposEspecificos['metodologia'] || ''}
                        onChange={(e) => handleCampoEspecificoChange('metodologia', e.target.value)}
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Atividades para Casa e/ou Avaliação</label>
                    <input
                        type="text"
                        className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-seduc-primary transition"
                        placeholder="Exercícios pág 10, Trabalho em grupo..."
                        value={camposEspecificos['atividades_casa'] || ''}
                        onChange={(e) => handleCampoEspecificoChange('atividades_casa', e.target.value)}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="animate-fadeIn pb-20 max-w-5xl mx-auto">

            {/* --- CABEÇALHO --- */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-seduc-primary flex items-center gap-2">
                    <Calendar className="text-seduc-secondary" /> Diário de Classe Digital
                </h1>
                <p className="text-gray-500 text-sm">Preencha o planejamento e realize a chamada da turma.</p>
            </div>

            <form onSubmit={handleSalvar} className="space-y-6">

                {/* --- SEÇÃO 1: SELETORES DE CONTEXTO --- */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Escola</label>
                        <select
                            className="w-full p-2.5 border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-seduc-primary focus:bg-white transition"
                            value={selectedEscola}
                            onChange={(e) => setSelectedEscola(e.target.value)}
                        >
                            <option value="">Selecione a Escola...</option>
                            {escolas.map(e => (
                                <option key={e.id} value={e.id}>{e.nome}</option>
                            ))}
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
                            {turmas.map(t => (
                                <option key={t.id} value={t.id}>{t.nome} ({t.turno})</option>
                            ))}
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
                            {disciplinas.map(d => (
                                <option key={d.id} value={d.id}>{d.nome}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* --- SEÇÃO 2: PLANEJAMENTO DINÂMICO --- */}
                {/* Só mostra se tiver contexto selecionado */}
                {selectedDisciplina && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-slideUp">
                        <h3 className="font-bold text-lg text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                            <Edit2 size={18} className="text-seduc-primary" /> Planejamento da Aula
                        </h3>

                        <div className="mb-4">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data da Aula</label>
                            <input
                                type="date"
                                value={dataAula}
                                onChange={(e) => setDataAula(e.target.value)}
                                className="w-full md:w-1/3 p-2.5 border border-gray-200 rounded-lg outline-none focus:border-seduc-primary transition"
                                required
                            />
                        </div>

                        {/* RENDERIZAÇÃO CONDICIONAL DOS CAMPOS */}
                        {renderCamposDinamicos()}

                    </div>
                )}

                {/* --- SEÇÃO 3: MÓDULO DE CHAMADA --- */}
                {selectedDisciplina && alunos.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-slideUp">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                <Users size={18} className="text-seduc-primary" /> Frequência / Chamada
                            </h3>
                            <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {alunos.length} Alunos Listados
                            </span>
                        </div>

                        <div className="space-y-2">
                            {/* Cabeçalho da Lista */}
                            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 text-xs font-bold text-gray-500 uppercase rounded-t-lg">
                                <div className="col-span-5">Nome do Aluno</div>
                                <div className="col-span-7 flex justify-between px-8">
                                    <span>Presença</span>
                                    <span>Justificativa (Se houver)</span>
                                </div>
                            </div>

                            {/* Lista de Alunos */}
                            {alunos.map(aluno => (
                                <div key={aluno.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-3 border border-gray-100 rounded-lg hover:bg-blue-50/30 transition">

                                    {/* Nome */}
                                    <div className="md:col-span-5 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-seduc-secondary/20 text-seduc-primary flex items-center justify-center font-bold text-xs">
                                            {aluno.nome.charAt(0)}
                                        </div>
                                        <span className="font-medium text-gray-700 text-sm">{aluno.nome}</span>
                                    </div>

                                    {/* Controles de Frequência */}
                                    <div className="md:col-span-7 flex flex-col md:flex-row gap-4 items-center">

                                        {/* Radio Buttons */}
                                        <div className="flex items-center gap-4 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={`presenca_${aluno.id}`}
                                                    checked={chamada[aluno.id] === 'Presente'}
                                                    onChange={() => handleStatusChange(aluno.id, 'Presente')}
                                                    className="accent-green-600 w-4 h-4"
                                                />
                                                <span className={`text-xs font-bold ${chamada[aluno.id] === 'Presente' ? 'text-green-700' : 'text-gray-400'}`}>Presente</span>
                                            </label>

                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={`presenca_${aluno.id}`}
                                                    checked={chamada[aluno.id] === 'Ausente'}
                                                    onChange={() => handleStatusChange(aluno.id, 'Ausente')}
                                                    className="accent-red-600 w-4 h-4"
                                                />
                                                <span className={`text-xs font-bold ${chamada[aluno.id] === 'Ausente' ? 'text-red-700' : 'text-gray-400'}`}>Ausente</span>
                                            </label>

                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={`presenca_${aluno.id}`}
                                                    checked={chamada[aluno.id] === 'Justificado'}
                                                    onChange={() => handleStatusChange(aluno.id, 'Justificado')}
                                                    className="accent-orange-500 w-4 h-4"
                                                />
                                                <span className={`text-xs font-bold ${chamada[aluno.id] === 'Justificado' ? 'text-orange-700' : 'text-gray-400'}`}>Justif.</span>
                                            </label>
                                        </div>

                                        {/* Input de Justificativa */}
                                        <div className="w-full">
                                            {chamada[aluno.id] === 'Justificado' && (
                                                <input
                                                    type="text"
                                                    placeholder="Motivo da falta..."
                                                    className="w-full text-xs p-2 border border-orange-200 bg-orange-50 rounded outline-none focus:border-orange-400 animate-fadeIn"
                                                    value={observacoes[aluno.id] || ''}
                                                    onChange={(e) => setObservacoes({ ...observacoes, [aluno.id]: e.target.value })}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {/* --- BOTÃO DE AÇÃO --- */}
                {selectedDisciplina && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-40 md:static md:bg-transparent md:border-0 md:p-0">
                        <div className="max-w-5xl mx-auto flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`
                                    flex items-center gap-2 bg-seduc-primary text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-blue-800 transition transform hover:-translate-y-1
                                    ${loading ? 'opacity-70 cursor-not-allowed' : ''}
                                `}
                            >
                                {loading ? 'Salvando...' : <><Save size={20} /> Salvar Diário de Classe</>}
                            </button>
                        </div>
                    </div>
                )}

            </form>
        </div>
    );
}