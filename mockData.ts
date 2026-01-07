
import { FidelizacaoStatus, StatusAtuacao, Customer, Contact } from './types';

const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const nextWeek = new Date(Date.now() + 604800000).toISOString().split('T')[0];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    cnpj: '12.345.678/0001-90',
    cnpjRaiz: '12.345.678',
    razaoSocial: 'Tecnologia Avançada LTDA',
    consultor: 'João Silva',
    statusAtuacao: StatusAtuacao.CONSEGUI_FALAR,
    dataUltimaVisita: today,
    dataProximoContato: nextWeek,
    faturamentoMedia6Meses: 15000,
    faturamentoMes: 16000,
    faturamentoM1: 14500,
    faturamentoM2: 15200,
    faturamentoM3: 14800,
    faturamentoM4: 15100,
    faturamentoM5: 14900,
    products: [
      { nome: 'Internet Fibra 500MB', status: FidelizacaoStatus.FIDELIZADO, preco: 500 },
      { nome: 'Telefonia Fixa', status: FidelizacaoStatus.FIDELIZADO, preco: 150 }
    ]
  },
  {
    cnpj: '98.765.432/0001-10',
    cnpjRaiz: '98.765.432',
    razaoSocial: 'Indústria Metalúrgica Sul',
    consultor: 'Maria Oliveira',
    statusAtuacao: StatusAtuacao.AGENDEI_REUNIAO,
    dataUltimaVisita: yesterday,
    dataProximoContato: today,
    faturamentoMedia6Meses: 45000,
    faturamentoMes: 42000,
    faturamentoM1: 46000,
    faturamentoM2: 44000,
    faturamentoM3: 45500,
    faturamentoM4: 44800,
    faturamentoM5: 45200,
    products: [
      { nome: 'Link Dedicado 1GB', status: FidelizacaoStatus.NAO_FIDELIZADO, preco: 2500 },
      { nome: 'Cloud Server', status: FidelizacaoStatus.PRESTES_A_VENCER, preco: 1200 }
    ]
  },
  {
    cnpj: '11.222.333/0001-44',
    cnpjRaiz: '11.222.333',
    razaoSocial: 'Padaria e Confeitaria Delícia',
    consultor: 'João Silva',
    statusAtuacao: StatusAtuacao.ENVIEI_PROPOSTA,
    dataUltimaVisita: '2023-11-15',
    dataProximoContato: yesterday, // Atrasado
    faturamentoMedia6Meses: 5000,
    faturamentoMes: 5200,
    faturamentoM1: 4900,
    faturamentoM2: 5100,
    faturamentoM3: 5000,
    faturamentoM4: 4800,
    faturamentoM5: 5050,
    products: [
      { nome: 'Internet Combo PME', status: FidelizacaoStatus.NAO_FIDELIZADO, preco: 250 }
    ]
  },
  {
    cnpj: '55.666.777/0001-88',
    cnpjRaiz: '55.666.777',
    razaoSocial: 'Logística Expressa Brasil',
    consultor: '', // Sem consultor
    statusAtuacao: StatusAtuacao.NENHUM,
    dataUltimaVisita: '',
    dataProximoContato: '',
    faturamentoMedia6Meses: 80000,
    faturamentoMes: 85000,
    faturamentoM1: 78000,
    faturamentoM2: 81000,
    faturamentoM3: 79500,
    faturamentoM4: 80500,
    faturamentoM5: 80200,
    products: [
      { nome: 'Gestão de Frotas Pro', status: FidelizacaoStatus.FIDELIZADO, preco: 3500 },
      { nome: 'Monitoramento Realtime', status: FidelizacaoStatus.NAO_FIDELIZADO, preco: 1500 }
    ]
  }
];

export const MOCK_CONTACTS: Contact[] = [
  { id: '1', cnpj: '12.345.678/0001-90', nome: 'Ricardo Souza', telefone: '11999998888', cargo: 'TI Manager' },
  { id: '2', cnpj: '12.345.678/0001-90', nome: 'Ana Paula', telefone: '11988887777', cargo: 'Diretora' },
  { id: '3', cnpj: '98.765.432/0001-10', nome: 'Carlos Mendes', telefone: '31977776666', cargo: 'Compras' },
  { id: '4', cnpj: '11.222.333/0001-44', nome: 'Maria Doce', telefone: '21966665555', cargo: 'Dona' }
];

export const CONSULTANTS = [
  'João Silva',
  'Maria Oliveira',
  'Carlos Pedroso',
  'Ana Beatriz'
];
