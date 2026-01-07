
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCcw, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle, 
  Calendar,
  X,
  CheckCircle2,
  Users,
  Clock,
  AlertTriangle,
  ClipboardList
} from 'lucide-react';
import { 
  FidelizacaoStatus, 
  StatusAtuacao, 
  Customer, 
  ConsolidatedCustomer, 
  SortConfig,
  Contact
} from './types';
import { MOCK_CUSTOMERS, MOCK_CONTACTS, CONSULTANTS } from './mockData';
import { normalizeText, formatCurrency, formatDate, getStatusColor } from './utils';

// --- Helper Components ---

const Card: React.FC<{ 
  title: string, 
  value: string | number, 
  icon: React.ReactNode, 
  onClick?: () => void,
  active?: boolean 
}> = ({ title, value, icon, onClick, active }) => (
  <div 
    onClick={onClick}
    className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
      active 
        ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
    }`}
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider">{title}</span>
      <div className={active ? 'text-blue-400' : 'text-zinc-500'}>{icon}</div>
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
  </div>
);

const Modal: React.FC<{ isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

export default function App() {
  const [data, setData] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filtering States
  const [selectedConsultant, setSelectedConsultant] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [fidelizacaoFilter, setFidelizacaoFilter] = useState<string>('TODOS');
  const [subStatusFilter, setSubStatusFilter] = useState<string>('TODOS');
  const [statusAtuacaoFilter, setStatusAtuacaoFilter] = useState<StatusAtuacao | 'TODOS'>('TODOS');
  const [faturamentoRange, setFaturamentoRange] = useState({ min: 0, max: 10000000 });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [activeCardFilter, setActiveCardFilter] = useState<string | null>(null);

  // Modal States
  const [visitModal, setVisitModal] = useState<{ isOpen: boolean, cnpj?: string }>({ isOpen: false });
  const [whatsModal, setWhatsModal] = useState<{ isOpen: boolean, cnpj?: string }>({ isOpen: false });
  const [nextContactModal, setNextContactModal] = useState<{ isOpen: boolean, cnpj?: string, newStatus?: StatusAtuacao }>({ isOpen: false });
  const [updateContactsModal, setUpdateContactsModal] = useState<{ isOpen: boolean, cnpj?: string }>({ isOpen: false });

  // UI States
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [updateText, setUpdateText] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextContactDate, setNextContactDate] = useState('');

  // Data Consolidation
  const consolidatedData = useMemo(() => {
    return data.map(customer => {
      const faturamentoTotalAtual = customer.products.reduce((acc, p) => acc + p.preco, 0);
      
      const allFidelizado = customer.products.every(p => p.status === FidelizacaoStatus.FIDELIZADO);
      const allNaoFidelizado = customer.products.every(p => p.status === FidelizacaoStatus.NAO_FIDELIZADO);
      
      let statusFidelizacaoGeral: ConsolidatedCustomer['statusFidelizacaoGeral'] = 'Parcialmente fidelizado';
      if (allFidelizado) statusFidelizacaoGeral = 'Todos fidelizados';
      if (allNaoFidelizado) statusFidelizacaoGeral = 'Todos não fidelizados';

      return {
        ...customer,
        faturamentoTotalAtual,
        statusFidelizacaoGeral
      };
    });
  }, [data]);

  // Filtering Logic
  const filteredData = useMemo(() => {
    let result = [...consolidatedData];

    if (selectedConsultant !== 'TODOS') {
      if (selectedConsultant === 'SEM CONSULTOR') {
        result = result.filter(c => !c.consultor || c.consultor.trim() === '');
      } else {
        result = result.filter(c => c.consultor === selectedConsultant);
      }
    }

    if (searchTerm) {
      const term = normalizeText(searchTerm);
      result = result.filter(c => 
        normalizeText(c.razaoSocial).includes(term) || 
        c.cnpj.includes(searchTerm)
      );
    }

    if (productSearch) {
      const term = normalizeText(productSearch);
      result = result.filter(c => 
        c.products.some(p => normalizeText(p.nome).includes(term))
      );
    }

    if (fidelizacaoFilter !== 'TODOS') {
      result = result.filter(c => c.products.some(p => p.status === fidelizacaoFilter));
    }

    if (subStatusFilter !== 'TODOS') {
      result = result.filter(c => c.statusFidelizacaoGeral === subStatusFilter);
    }

    if (statusAtuacaoFilter !== 'TODOS') {
      result = result.filter(c => c.statusAtuacao === statusAtuacaoFilter);
    }

    result = result.filter(c => c.faturamentoTotalAtual >= faturamentoRange.min && c.faturamentoTotalAtual <= faturamentoRange.max);

    if (dateRange.start) {
      result = result.filter(c => c.dataUltimaVisita >= dateRange.start);
    }
    if (dateRange.end) {
      result = result.filter(c => c.dataUltimaVisita <= dateRange.end);
    }

    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.slice(0, 7);

    if (activeCardFilter) {
      switch (activeCardFilter) {
        case 'CONSULTOR': result = result.filter(c => !!c.consultor); break;
        case 'VISITA_MES': result = result.filter(c => c.dataUltimaVisita.startsWith(currentMonth)); break;
        case 'AGENDADO_HOJE': result = result.filter(c => c.dataProximoContato === today); break;
        case 'AGENDADO_FUTURO': result = result.filter(c => c.dataProximoContato >= today); break;
        case 'ATRASADO': result = result.filter(c => c.dataProximoContato && c.dataProximoContato < today); break;
        default: result = result.filter(c => c.statusAtuacao === activeCardFilter);
      }
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const valA = (a as any)[sortConfig.key];
        const valB = (b as any)[sortConfig.key];
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [consolidatedData, selectedConsultant, searchTerm, productSearch, fidelizacaoFilter, subStatusFilter, statusAtuacaoFilter, faturamentoRange, dateRange, activeCardFilter, sortConfig]);

  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const curMonth = todayStr.slice(0, 7);
    const lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

    return {
      comConsultor: filteredData.filter(c => !!c.consultor).length,
      visitaMes: filteredData.filter(c => c.dataUltimaVisita.startsWith(curMonth)).length,
      agendadoHoje: filteredData.filter(c => c.dataProximoContato === todayStr).length,
      agendadoRestoMes: filteredData.filter(c => c.dataProximoContato >= todayStr && c.dataProximoContato <= lastDayOfMonth).length,
      atrasado: filteredData.filter(c => c.dataProximoContato && c.dataProximoContato < todayStr).length,
      atuacao: Object.values(StatusAtuacao).reduce((acc, status) => {
        if (status === StatusAtuacao.NENHUM) return acc;
        acc[status] = filteredData.filter(c => c.statusAtuacao === status).length;
        return acc;
      }, {} as Record<string, number>)
    };
  }, [filteredData]);

  // Webhook Functions
  const handleUpdateVisit = async () => {
    if (!visitDate) {
      alert("Necessário preencher data");
      return;
    }
    const customer = consolidatedData.find(c => c.cnpj === visitModal.cnpj);
    if (!customer) return;

    try {
      const response = await fetch("https://webhook.elitemastervendas.com/webhook/d61c5541-1501-416e-8e91-944d4e909e4f", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...customer,
          dataNovaVisita: visitDate,
          timestampExecucao: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error("Erro ao enviar webhook de visita");

      setData(prev => prev.map(c => c.cnpj === visitModal.cnpj ? { ...c, dataUltimaVisita: visitDate } : c));
      setVisitModal({ isOpen: false });
      alert("Data da última visita atualizada e enviada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Falha ao comunicar com o servidor de visitas.");
    }
  };

  const handleWhatsApp = async () => {
    if (selectedContacts.length === 0) {
      alert("Selecione ao menos um contato.");
      return;
    }
    
    const customer = consolidatedData.find(c => c.cnpj === whatsModal.cnpj);
    const contactsToAbord = MOCK_CONTACTS.filter(c => selectedContacts.includes(c.id));

    try {
      const response = await fetch("https://auto.elitemastervendas.com/webhook-test/10f8a3f2-2169-47b4-8e9f-9a334d060bde", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cnpj: whatsModal.cnpj,
          razaoSocial: customer?.razaoSocial,
          responsavel: customer?.consultor || selectedConsultant,
          contatos: contactsToAbord
        })
      });

      if (!response.ok) throw new Error("Erro ao enviar webhook de WhatsApp");

      setWhatsModal({ isOpen: false });
      setSelectedContacts([]);
      alert("Abordagem WhatsApp enviada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Falha ao enviar abordagem WhatsApp.");
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setData([...MOCK_CUSTOMERS]);
      setIsLoading(false);
    }, 800);
  };

  const handleStatusChange = (cnpj: string, status: StatusAtuacao) => {
    setNextContactModal({ isOpen: true, cnpj, newStatus: status });
  };

  const handleConfirmNextContact = () => {
    if (!nextContactDate) {
      alert("Necessário preencher data");
      return;
    }
    setData(prev => prev.map(c => 
      c.cnpj === nextContactModal.cnpj 
        ? { ...c, statusAtuacao: nextContactModal.newStatus!, dataProximoContato: nextContactDate } 
        : c
    ));
    setNextContactModal({ isOpen: false });
    setNextContactDate('');
  };

  const handleUpdateContacts = () => {
    if (!updateText.trim()) {
      alert("Tem que ter informações para enviar");
      return;
    }
    setUpdateContactsModal({ isOpen: false });
    setUpdateText('');
    alert("Informações enviadas para atualização!");
  };

  const toggleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const toggleCardFilter = (id: string) => {
    setActiveCardFilter(prev => prev === id ? null : id);
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-blue-500 font-bold text-xl tracking-tight">ELITE CRM</span>
              <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Management Suite</span>
            </div>
            <div className="h-10 w-px bg-zinc-800 hidden md:block"></div>
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Consultor:</label>
              <select 
                value={selectedConsultant}
                onChange={(e) => setSelectedConsultant(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-sm rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500 transition-all min-w-[220px]"
              >
                <option value="TODOS">TODOS OS CONSULTORES</option>
                <option value="SEM CONSULTOR">SEM CONSULTOR ESPECIFICADO</option>
                {CONSULTANTS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-sm font-medium transition-all"
            >
              <RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Atualizar Base</span>
            </button>
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]">
              {selectedConsultant !== 'TODOS' ? selectedConsultant.charAt(0) : 'E'}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 mt-8 space-y-8">
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-2">
            <Card title="C/ Consultor" value={metrics.comConsultor} icon={<Users size={18} />} onClick={() => toggleCardFilter('CONSULTOR')} active={activeCardFilter === 'CONSULTOR'} />
          </div>
          <div className="xl:col-span-2">
            <Card title="Visita no Mês" value={metrics.visitaMes} icon={<Calendar size={18} />} onClick={() => toggleCardFilter('VISITA_MES')} active={activeCardFilter === 'VISITA_MES'} />
          </div>
          <div className="xl:col-span-2">
            <Card title="Atrasados" value={metrics.atrasado} icon={<AlertTriangle size={18} />} onClick={() => toggleCardFilter('ATRASADO')} active={activeCardFilter === 'ATRASADO'} />
          </div>
          <div className="xl:col-span-2">
            <Card title="Hoje" value={metrics.agendadoHoje} icon={<Clock size={18} />} onClick={() => toggleCardFilter('AGENDADO_HOJE')} active={activeCardFilter === 'AGENDADO_HOJE'} />
          </div>
          <div className="xl:col-span-2">
            <Card title="Agendados" value={metrics.agendadoRestoMes} icon={<CheckCircle2 size={18} />} onClick={() => toggleCardFilter('AGENDADO_FUTURO')} active={activeCardFilter === 'AGENDADO_FUTURO'} />
          </div>
          {Object.entries(metrics.atuacao).map(([status, count]) => (
            <div key={status} className="xl:col-span-2">
              <Card title={status} value={count} icon={<ClipboardList size={18} />} onClick={() => toggleCardFilter(status)} active={activeCardFilter === status} />
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <Filter size={20} className="text-blue-500" />
            <h2 className="text-lg font-semibold">Filtros de Pesquisa</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Cliente / CNPJ</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input type="text" placeholder="Razão ou CNPJ..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Fidelização Individual</label>
              <select value={fidelizacaoFilter} onChange={(e) => setFidelizacaoFilter(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 outline-none">
                <option value="TODOS">Todas</option>
                <option value={FidelizacaoStatus.FIDELIZADO}>Fidelizado</option>
                <option value={FidelizacaoStatus.NAO_FIDELIZADO}>Não Fidelizado</option>
                <option value={FidelizacaoStatus.PRESTES_A_VENCER}>Prestes a Vencer</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Fidelização do CNPJ</label>
              <select value={subStatusFilter} onChange={(e) => setSubStatusFilter(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 outline-none">
                <option value="TODOS">Todas</option>
                <option value="Todos fidelizados">Tudo Fidelizado</option>
                <option value="Todos não fidelizados">Tudo Não Fidelizado</option>
                <option value="Parcialmente fidelizado">Parcialmente Fidelizado</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Faixa Faturamento</label>
              <div className="flex gap-2">
                <input type="number" placeholder="De" onChange={(e) => setFaturamentoRange(prev => ({ ...prev, min: Number(e.target.value) || 0 }))} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white outline-none" />
                <input type="number" placeholder="Até" onChange={(e) => setFaturamentoRange(prev => ({ ...prev, max: Number(e.target.value) || 10000000 }))} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white outline-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Produto / Serviço</label>
              <input type="text" placeholder="Nome do produto..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800">
                  <th className="px-6 py-4 font-semibold text-zinc-500">Empresa / Documentos</th>
                  <th className="px-6 py-4 font-semibold text-zinc-500">Consultor</th>
                  <th className="px-6 py-4 font-semibold text-zinc-500 cursor-pointer hover:text-white" onClick={() => toggleSort('statusFidelizacaoGeral')}>Status Fidelidade {sortConfig?.key === 'statusFidelizacaoGeral' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                  <th className="px-6 py-4 font-semibold text-zinc-500 cursor-pointer hover:text-white" onClick={() => toggleSort('faturamentoTotalAtual')}>Fat. Consolidado {sortConfig?.key === 'faturamentoTotalAtual' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                  <th className="px-6 py-4 font-semibold text-zinc-500">Gestão e Contato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredData.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500 italic">Nenhum resultado para estes filtros.</td></tr>
                ) : (
                  filteredData.map(customer => (
                    <tr key={customer.cnpj} className="group hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-white group-hover:text-blue-400">{customer.razaoSocial}</span>
                          <span className="text-zinc-500 text-xs">CNPJ: {customer.cnpj}</span>
                          <span className="text-zinc-600 text-[10px]">Raiz: {customer.cnpjRaiz}</span>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {customer.products.map((p, idx) => (
                              <span key={idx} className={`text-[10px] px-1.5 py-0.5 rounded border ${getStatusColor(p.status)}`}>{p.nome}</span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold">
                            {customer.consultor ? customer.consultor.charAt(0) : '?'}
                          </div>
                          <span className="text-zinc-300">{customer.consultor || 'Livre'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-2">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase text-center border ${getStatusColor(customer.statusFidelizacaoGeral)}`}>{customer.statusFidelizacaoGeral}</span>
                          <div className="flex flex-col text-[11px] text-zinc-500">
                            <span>Última Visita: <b className="text-zinc-300">{formatDate(customer.dataUltimaVisita)}</b></span>
                            <span>Próximo Contato: <b className="text-blue-400">{formatDate(customer.dataProximoContato)}</b></span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-bold text-white">{formatCurrency(customer.faturamentoTotalAtual)}</td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-3 max-w-[200px]">
                          <select value={customer.statusAtuacao} onChange={(e) => handleStatusChange(customer.cnpj, e.target.value as StatusAtuacao)} className="bg-zinc-950 border border-zinc-800 text-[11px] rounded px-2 py-1.5 text-white focus:border-blue-500 outline-none">
                            <option value={StatusAtuacao.NENHUM}>Alterar Status Atuação</option>
                            {Object.values(StatusAtuacao).filter(v => v !== StatusAtuacao.NENHUM).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setVisitModal({ isOpen: true, cnpj: customer.cnpj })} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded">VISITA ALGAR</button>
                            <button onClick={() => setWhatsModal({ isOpen: true, cnpj: customer.cnpj })} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold rounded flex items-center justify-center gap-1"><MessageCircle size={12}/> WHATSAPP</button>
                          </div>
                          <button onClick={() => setUpdateContactsModal({ isOpen: true, cnpj: customer.cnpj })} className="text-[10px] text-zinc-500 hover:text-zinc-300 underline text-center">Atualizar Contatos CNPJ</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Modal isOpen={visitModal.isOpen} onClose={() => setVisitModal({ isOpen: false })} title="Lançar Visita Algar">
        <div className="space-y-4">
          <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
            <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Data da Visita</label>
            <input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none" />
          </div>
          <button onClick={handleUpdateVisit} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg">Modificar data da última visita</button>
        </div>
      </Modal>

      <Modal isOpen={whatsModal.isOpen} onClose={() => { setWhatsModal({ isOpen: false }); setSelectedContacts([]); }} title="Abordar via WhatsApp">
        <div className="space-y-4">
          <div className="text-xs text-zinc-400 mb-2">Selecione contatos para abordagem:</div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {MOCK_CONTACTS.filter(c => c.cnpj === whatsModal.cnpj).map(contact => (
              <div key={contact.id} onClick={() => setSelectedContacts(prev => prev.includes(contact.id) ? prev.filter(id => id !== contact.id) : [...prev, contact.id])} className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${selectedContacts.includes(contact.id) ? 'bg-blue-600/20 border-blue-500' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}`}>
                <div>
                  <div className="font-semibold text-sm text-white">{contact.nome}</div>
                  <div className="text-xs text-zinc-500">{contact.cargo} • {contact.telefone}</div>
                </div>
                {selectedContacts.includes(contact.id) && <CheckCircle2 size={16} className="text-blue-500" />}
              </div>
            ))}
          </div>
          <button onClick={handleWhatsApp} disabled={selectedContacts.length === 0} className={`w-full py-3 font-bold rounded-xl transition-all shadow-lg ${selectedContacts.length > 0 ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}>Abordar WhatsApp</button>
        </div>
      </Modal>

      <Modal isOpen={nextContactModal.isOpen} onClose={() => setNextContactModal({ isOpen: false })} title="Agendar Próximo Contato">
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">Alterando para: <b>{nextContactModal.newStatus}</b>. Defina a nova data:</p>
          <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
            <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Data do Próximo Contato</label>
            <input type="date" value={nextContactDate} onChange={(e) => setNextContactDate(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none" />
          </div>
          <button onClick={handleConfirmNextContact} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all">Confirmar e Salvar</button>
        </div>
      </Modal>

      <Modal isOpen={updateContactsModal.isOpen} onClose={() => setUpdateContactsModal({ isOpen: false })} title="Atualizar Contatos do CNPJ">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase block">Texto/Informações dos Contatos</label>
            <textarea rows={5} value={updateText} onChange={(e) => setUpdateText(e.target.value)} placeholder="Cole aqui os novos dados..." className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:border-blue-500 outline-none resize-none" />
          </div>
          <button onClick={handleUpdateContacts} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all">Enviar Atualização</button>
        </div>
      </Modal>
    </div>
  );
}
