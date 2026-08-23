import AsyncStorage from '@react-native-async-storage/async-storage';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbym9DGWB6hBj7nEmoWFM0vmErbzbq4VVobxY4PYRVEsgPmu7A98OxjLfiFY6D4E_ESUXw/exec';

class APIService {
  
  // ===== LOGIN =====
  static async login(email, senha) {
    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operacao: 'LOGIN_RESPONSAVEL',
          email: email.toLowerCase().trim(),
          senha: senha.replace(/\D/g, '')
        })
      });
      
      const data = await response.json();
      console.log('Resposta do login:', data);
      
      if (data.status === 'success') {
        await AsyncStorage.setItem('@user_data', JSON.stringify({
          nome: data.nome,
          email: email,
          alunos: data.alunos || []
        }));
        
        console.log('Alunos encontrados:', data.alunos);
        
        const alunosData = [];
        if (data.alunos && data.alunos.length > 0) {
          for (const aluno of data.alunos) {
            console.log('Buscando informações do aluno:', aluno);
            const info = await this.getAlunoInfo(aluno);
            alunosData.push(info);
          }
          await AsyncStorage.setItem('@alunos_data', JSON.stringify(alunosData));
        } else {
          console.log('Nenhum aluno encontrado para este responsável');
        }
        
        return { success: true, data };
      } else {
        return { success: false, message: data.message || 'Credenciais inválidas' };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, message: 'Erro de conexão. Tente novamente.' };
    }
  }

  // ===== BUSCAR INFORMAÇÕES DO ALUNO =====
  static async getAlunoInfo(nomeAluno) {
    try {
      console.log('Buscando informações para:', nomeAluno);
      const ocorrencias = await this.getOcorrencias(nomeAluno);
      const documentos = await this.getDocumentos(nomeAluno);
      const turma = await this.getTurmaAluno(nomeAluno);
      
      console.log('Turma encontrada:', turma);
      
      return {
        nome: nomeAluno,
        turma: turma || 'Não definida',
        ocorrencias: ocorrencias || [],
        documentos: documentos || [],
        totalOcorrencias: (ocorrencias || []).length,
        pendentesDocumentos: (documentos || []).filter(d => d.status === 'Pendente' || d.status === 'Solicitado').length,
      };
    } catch (error) {
      console.error('Erro ao buscar dados do aluno:', error);
      return {
        nome: nomeAluno,
        turma: 'Erro ao carregar',
        ocorrencias: [],
        documentos: [],
        totalOcorrencias: 0,
        pendentesDocumentos: 0,
      };
    }
  }

  // ===== BUSCAR OCORRÊNCIAS =====
  static async getOcorrencias(nomeAluno) {
    try {
      console.log('Buscando ocorrências para:', nomeAluno);
      const response = await fetch(`${APPS_SCRIPT_URL}?aba=fatos_aluno&aluno=${encodeURIComponent(nomeAluno)}&pendentes=false`);
      const data = await response.json();
      console.log('Ocorrências encontradas:', data);
      
      if (data.fatos) {
        return data.fatos.map(fato => ({
          id: fato.idLinha || Math.random().toString(),
          data: fato.data || 'Data não informada',
          tipo: fato.tipo || 'Geral',
          descricao: fato.descricao || 'Sem descrição',
          status: fato.status || 'Pendente',
          protocolo: fato.protocolo || ''
        }));
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar ocorrências:', error);
      return [];
    }
  }

  // ===== BUSCAR DOCUMENTOS =====
  static async getDocumentos(nomeAluno) {
    try {
      console.log('Buscando documentos para:', nomeAluno);
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operacao: 'listar_documentos_aluno',
          aluno: nomeAluno
        })
      });
      
      const data = await response.json();
      console.log('Documentos encontrados:', data);
      
      if (Array.isArray(data)) {
        return data.map(doc => ({
          id: Math.random().toString(),
          tipo: doc.documento || 'Documento',
          status: doc.status || 'Pendente',
          data: doc.dataSolicitacao || 'Data não informada',
          link: doc.link || '',
          observacoes: doc.observacoes || ''
        }));
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
      return [];
    }
  }

  // ===== BUSCAR TURMA DO ALUNO =====
  static async getTurmaAluno(nomeAluno) {
    try {
      console.log('Buscando turma para:', nomeAluno);
      const response = await fetch(`${APPS_SCRIPT_URL}?aba=alunos`);
      const alunos = await response.json();
      console.log('Lista de alunos:', alunos);
      
      const aluno = alunos.find(a => a.nome.toLowerCase() === nomeAluno.toLowerCase());
      console.log('Aluno encontrado:', aluno);
      return aluno ? aluno.turma : null;
    } catch (error) {
      console.error('Erro ao buscar turma:', error);
      return null;
    }
  }

  // ===== SOLICITAR DOCUMENTO =====
  static async solicitarDocumento(aluno, documento, observacoes = '') {
    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operacao: 'salvar_documento',
          aluno: aluno,
          turma: '',
          documento: documento,
          status: 'Solicitado',
          data: new Date().toLocaleDateString('pt-BR'),
          observacoes: observacoes
        })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao solicitar documento:', error);
      return { status: 'error', message: 'Erro de conexão' };
    }
  }
}

export default APIService;