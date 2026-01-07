
export enum FidelizacaoStatus {
  FIDELIZADO = 'fidelizado',
  NAO_FIDELIZADO = 'não fidelizado',
  PRESTES_A_VENCER = 'prestes a vencer'
}

export enum StatusAtuacao {
  CONSEGUI_FALAR = 'Conseguir falar',
  AGENDEI_REUNIAO = 'Agendei Reunião',
  ENVIEI_PROPOSTA = 'Enviei Proposta',
  PEDI_CONTRATO_BKO = 'Pedi contrato BKO',
  ENVIEI_CONTRATO_CLIENTE = 'Enviei contrato cliente',
  ENVIEI_CONTRATO_ASSINADO_BKO = 'Enviei contrato assinado BKO',
  VENDA_EXECUTANDO = 'Venda entrou em execução',
  NENHUM = 'Nenhum'
}

export interface Product {
  nome: string;
  status: FidelizacaoStatus;
  preco: number;
}

export interface Contact {
  id: string;
  cnpj: string;
  nome: string;
  telefone: string;
  cargo: string;
}

export interface Customer {
  cnpj: string;
  cnpjRaiz: string;
  razaoSocial: string;
  consultor: string;
  statusAtuacao: StatusAtuacao;
  dataUltimaVisita: string; // ISO date string
  dataProximoContato: string; // ISO date string
  faturamentoMedia6Meses: number;
  faturamentoMes: number;
  faturamentoM1: number;
  faturamentoM2: number;
  faturamentoM3: number;
  faturamentoM4: number;
  faturamentoM5: number;
  products: Product[];
}

export interface ConsolidatedCustomer extends Customer {
  faturamentoTotalAtual: number;
  statusFidelizacaoGeral: 'Todos fidelizados' | 'Todos não fidelizados' | 'Parcialmente fidelizado';
}

export type SortConfig = {
  key: keyof ConsolidatedCustomer | string;
  direction: 'asc' | 'desc';
} | null;
