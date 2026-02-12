import { MOCK_DATA } from '../mocks/data';

// Simula delay de rede (500ms a 1500ms)
const simulateDelay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

export const apiService = {
    getEscolas: async () => {
        await simulateDelay();
        return MOCK_DATA.escolas;
    },

    getTurmas: async (escolaId) => {
        await simulateDelay();
        let lista = MOCK_DATA.turmas;
        if (escolaId) {
            lista = lista.filter(t => t.escola_id === Number(escolaId));
        }

        return lista.map(t => {
            const escola = MOCK_DATA.escolas.find(e => e.id === t.escola_id);
            return {
                ...t,
                nome_escola: escola ? escola.nome : "Escola Não Identificada"
            };
        });
    },

    getDisciplinas: async (nivel) => {
        await simulateDelay();
        if (!nivel) return MOCK_DATA.disciplinasPadrao;
        return MOCK_DATA.disciplinasPadrao.filter(d => d.nivel === nivel);
    },

    getAlunos: async (turmaId) => {
        await simulateDelay();
        let lista = MOCK_DATA.alunos;
        if (turmaId) {
            lista = lista.filter(a => a.turma_id === Number(turmaId));
        }

        // Mapeia para o formato esperado pela ListaAlunos e GerenciarTurma
        return lista.map(a => ({
            ...a,
            nome_completo: a.nome,
            cpf: "000.000.000-00", // CPF Mock
            data_nascimento: "2015-01-01", // Data Mock
            telefones: "(81) 99999-9999",
            status_financeiro: "Em dia"
        }));
    },

    salvarPlanejamento: async (dados) => {
        await simulateDelay(1500); // Demora um pouco mais pra salvar
        console.log("Planejamento Salvo (MOCK):", dados);
        return { success: true, message: "Planejamento registrado com sucesso!" };
    },

    salvarAvaliacao: async (dados) => {
        await simulateDelay(1500);
        console.log("Avaliação Salva (MOCK):", dados);
        return { success: true, message: "Avaliação registrada com sucesso!" };
    },

    // --- NOVOS MÉTODOS MOCKADOS ---
    getAlunoById: async (id) => {
        await simulateDelay();
        const aluno = MOCK_DATA.alunos.find(a => a.id === Number(id));
        return aluno || null;
    },

    createAluno: async (dados) => {
        await simulateDelay(1500);
        console.log("Novo Aluno (MOCK):", dados);
        return { success: true, matricula: "2024" + Math.floor(Math.random() * 1000) };
    },

    updateAluno: async (id, dados) => {
        await simulateDelay(1500);
        console.log(`Aluno ${id} Atualizado (MOCK):`, dados);
        return { success: true };
    },

    buscarCep: async (cep) => {
        await simulateDelay();
        // Retorno fixo para teste, ou poderia ser um fetch real se permitido
        if (cep === "55880-000") {
            return {
                logradouro: "Av. Principal",
                bairro: "Centro",
                localidade: "Tracunhaém",
                uf: "PE",
                erro: false
            };
        }
        return { erro: true };
    },

    getDashboardStats: async () => {
        await simulateDelay(1000);
        return {
            cards: {
                total_alunos: MOCK_DATA.alunos.length,
                total_turmas: MOCK_DATA.turmas.length,
                total_professores: 18, // Mock fixo
                total_aulas: 1240 // Mock fixo
            },
            graficos: {
                status: [
                    { name: 'Presente', value: 75, fill: '#22c55e' },
                    { name: 'Ausente', value: 15, fill: '#ef4444' },
                    { name: 'Justificado', value: 10, fill: '#f97316' }
                ],
                turmas: MOCK_DATA.turmas.map(t => ({
                    name: t.nome,
                    percentual: Math.floor(Math.random() * (95 - 70 + 1) + 70) // Random entre 70 e 95
                })),
                sexo: [
                    { name: 'Masculino', value: 45 },
                    { name: 'Feminino', value: 55 }
                ],
                idade: [
                    { name: '6 Anos', alunos: 12 },
                    { name: '7 Anos', alunos: 15 },
                    { name: '8 Anos', alunos: 10 },
                    { name: '9 Anos', alunos: 18 }
                ]
            }
        };
    },

    getTurmasProfessor: async (idProf) => {
        await simulateDelay();
        // Retorna turmas baseadas no ID do professor (1=Infantil, 2=Iniciais, 3=Finais)
        let turmasAlvo = [];

        if (Number(idProf) === 1) { // Infantil (Escola 1)
            turmasAlvo = MOCK_DATA.turmas.filter(t => t.escola_id === 1);
        } else if (Number(idProf) === 2) { // Iniciais (Escola 2)
            turmasAlvo = MOCK_DATA.turmas.filter(t => t.escola_id === 2);
        } else if (Number(idProf) === 3) { // Finais (Escola 3)
            turmasAlvo = MOCK_DATA.turmas.filter(t => t.escola_id === 3);
        } else {
            turmasAlvo = MOCK_DATA.turmas.slice(0, 2); // Fallback
        }

        return turmasAlvo.map(t => {
            const escola = MOCK_DATA.escolas.find(e => e.id === t.escola_id);
            return {
                alocacao_id: t.id,
                id: t.id, // Adicionado para facilitar
                codigo: t.codigo,
                nome_turma: t.nome,
                nome_disciplina: Number(idProf) === 3 ? "Matemática" : "Polivalente",
                nome_curso: t.nome_curso,
                periodo: t.periodo,
                turno: t.turno,
                total_alunos: t.total_alunos,
                nome_escola: escola ? escola.nome : "Escola Municipal" // Adicionado nome da escola
            };
        });
    },
    // --- MOCKS PARA LISTA DE TURMAS ---
    getCursos: async () => {
        await simulateDelay();
        return [
            { id: 1, nome: "Educação Infantil" },
            { id: 2, nome: "Ensino Fundamental - Anos Iniciais" },
            { id: 3, nome: "Ensino Fundamental - Anos Finais" },
            { id: 4, nome: "EJA" }
        ];
    },

    createTurma: async (dados) => {
        await simulateDelay(1000);
        console.log("Nova Turma (MOCK):", dados);
        return { success: true, id: Math.floor(Math.random() * 1000) };
    },

    deleteTurma: async (id) => {
        await simulateDelay(500);
        console.log(`Turma ${id} Excluída (MOCK)`);
        return { success: true };
    },

    // --- MOCKS PARA LISTA DE PROFESSORES ---
    getProfessores: async () => {
        await simulateDelay();
        return [
            { id: 1, nome_completo: "Maria Silva", cpf: "111.111.111-11", telefone_celular: "(81) 98888-8888", conselho_tipo: "MEC", conselho_numero: "12345", conselho_uf: "PE", ativo: true, data_contratacao: "2023-01-15" },
            { id: 2, nome_completo: "João Santos", cpf: "222.222.222-22", telefone_celular: "(81) 97777-7777", conselho_tipo: "MEC", conselho_numero: "54321", conselho_uf: "PE", ativo: true, data_contratacao: "2022-03-10" },
            { id: 3, nome_completo: "Ana Costa", cpf: "333.333.333-33", telefone_celular: "(81) 96666-6666", conselho_tipo: "MEC", conselho_numero: "98765", conselho_uf: "PE", ativo: false, data_contratacao: "2021-05-20" }
        ];
    },

    deleteProfessor: async (id) => {
        await simulateDelay(500);
        console.log(`Professor ${id} Excluído (MOCK)`);
        return { success: true };
    },

    getProfessorById: async (id) => {
        await simulateDelay();
        return {
            id: id,
            nome_completo: "Maria Silva",
            cpf: "111.111.111-11",
            data_nascimento: "1980-05-20",
            sexo: "Feminino",
            telefone_celular: "(81) 98888-8888",
            email: "maria@email.com",
            escolaridade: "Superior Completo",
            conselho_tipo: "MEC",
            conselho_numero: "12345",
            conselho_uf: "PE",
            cep: "50000-000",
            endereco: "Rua das Flores",
            numero: "123",
            bairro: "Centro",
            cidade: "Recife",
            estado: "PE",
            data_contratacao: "2023-01-15"
        };
    },

    createProfessor: async (dados) => {
        await simulateDelay(1000);
        console.log("Novo Professor (MOCK):", dados);
        return { success: true, id: Math.floor(Math.random() * 1000) };
    },

    updateProfessor: async (id, dados) => {
        await simulateDelay(1000);
        console.log(`Professor ${id} Atualizado (MOCK):`, dados);
        return { success: true };
    },

    // --- MOCKS PARA GERENCIAR TURMA ---
    getTurmaById: async (id) => {
        await simulateDelay();
        return MOCK_DATA.turmas.find(t => t.id === Number(id)) || {};
    },

    getGradeTurma: async (id) => {
        await simulateDelay();
        // Retorna disciplinas mockadas
        return MOCK_DATA.disciplinasPadrao.slice(0, 5).map(d => ({
            id: d.id,
            nome: d.nome,
            carga_horaria: 60
        }));
    },

    getProfessoresAlocados: async (id) => {
        await simulateDelay();
        return [
            { id: 1, nome_completo: "Maria Silva", disciplina: "Matemática", data_inicio: "2024-02-01", ativo: 1 },
            { id: 2, nome_completo: "João Santos", disciplina: "História", data_inicio: "2024-02-01", ativo: 1 }
        ];
    },

    getMatriculados: async (id) => {
        await simulateDelay();
        return MOCK_DATA.alunos.filter(a => a.turma_id === Number(id)).map(a => ({
            matricula_id: a.id,
            nome_completo: a.nome,
            numero_matricula: "2024" + a.id,
            telefone_celular: "(81) 99999-9999",
            status: a.status
        }));
    },

    getAlunosDisponiveis: async (id) => {
        await simulateDelay();
        // Retorna alunos de outras turmas
        return MOCK_DATA.alunos
            .filter(a => a.turma_id !== Number(id))
            .map(a => ({
                id: a.id,
                nome_completo: a.nome,
                cpf: "000.000.000-00", // CPF Mock
                turma_origem_id: a.turma_id
            }));
    },

    alocarProfessor: async (data) => {
        await simulateDelay();
        return { success: true };
    },

    desvincularProfessor: async (id) => {
        await simulateDelay();
        return { success: true };
    },

    encerrarAlocacao: async (id) => {
        await simulateDelay();
        return { success: true };
    },

    reintegrarProfessor: async (id) => {
        await simulateDelay();
        return { success: true };
    },

    matricularAlunos: async (turmaId, alunosIds) => {
        await simulateDelay();
        return { success: true };
    },

    removerMatricula: async (id) => {
        await simulateDelay();
        return { success: true };
    },

    adicionarDisciplinaTurma: async (turmaId, data) => {
        await simulateDelay();
        return { success: true };
    },

    removerDisciplinaTurma: async (id) => {
        await simulateDelay();
        return { success: true };
    },

    // --- MOCKS PARA DISCIPLINAS ---
    createDisciplina: async (dados) => {
        await simulateDelay();
        return { success: true, id: Math.floor(Math.random() * 1000) };
    },

    deleteDisciplina: async (id) => {
        await simulateDelay();
        return { success: true };
    },

    // --- MOCKS PARA RELATÓRIOS ---
    getTurmasAtivas: async () => {
        await simulateDelay();
        return MOCK_DATA.turmas.filter(t => t.ativa);
    },

    getDisciplinasTurma: async (turmaId) => {
        await simulateDelay();
        return [
            { alocacao_id: 1, disciplina: "Matemática", professor: "Maria Silva" },
            { alocacao_id: 2, disciplina: "Português", professor: "João Santos" }
        ];
    },

    getEstatisticasAlocacao: async (alocacaoId) => {
        await simulateDelay();
        return {
            resumo: [
                { name: 'Presente', value: 75, fill: '#22c55e' },
                { name: 'Ausente', value: 15, fill: '#ef4444' },
                { name: 'Justificado', value: 10, fill: '#f97316' }
            ],
            alunos: MOCK_DATA.alunos.map(a => ({
                matricula_id: a.id,
                nome: a.nome,
                faltas: Math.floor(Math.random() * 10),
                percentual: Math.floor(Math.random() * (100 - 70) + 70)
            }))
        };
    },

    getDetalhesAlunoAlocacao: async (alunoId, alocacaoId) => {
        await simulateDelay();
        return [
            { data_aula: "2024-03-10", conteudo_ministrado: "Introdução à Álgebra", status: "Presente" },
            { data_aula: "2024-03-12", conteudo_ministrado: "Equações de 1º Grau", status: "Ausente", observacao: "Atestado médico" },
            { data_aula: "2024-03-14", conteudo_ministrado: "Resolução de Problemas", status: "Presente" }
        ];
    }
};
