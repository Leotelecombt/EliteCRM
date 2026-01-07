
export const normalizeText = (text: string) => {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'fidelizado':
    case 'Todos fidelizados':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'não fidelizado':
    case 'Todos não fidelizados':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'prestes a vencer':
    case 'Parcialmente fidelizado':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    default:
      return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
  }
};
