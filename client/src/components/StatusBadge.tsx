import type { Order } from '../mockData';

interface StatusBadgeProps {
  status: Order['status'] | 'ATIVO' | 'INATIVO' | boolean;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  // Normalize boolean/text for customer status
  let displayStatus = '';
  let colorClasses = '';

  if (typeof status === 'boolean') {
    displayStatus = status ? 'ATIVO' : 'INATIVO';
  } else {
    displayStatus = status.toString().toUpperCase();
  }

  switch (displayStatus) {
    // Customer states
    case 'ATIVO':
      colorClasses = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      break;
    case 'INATIVO':
      colorClasses = 'bg-rose-100 text-rose-800 border-rose-300';
      break;

    // Order states
    case 'EM ABERTO':
      colorClasses = 'bg-amber-100 text-amber-800 border-amber-300';
      break;
    case 'EM PROCESSAMENTO':
      colorClasses = 'bg-blue-100 text-blue-800 border-blue-300';
      break;
    case 'PAGAMENTO REALIZADO':
      colorClasses = 'bg-indigo-100 text-indigo-800 border-indigo-300';
      break;
    case 'EM TRÂNSITO':
      colorClasses = 'bg-teal-100 text-teal-800 border-teal-300';
      break;
    case 'ENTREGUE':
      colorClasses = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      break;
    case 'TROCA SOLICITADA':
      colorClasses = 'bg-purple-100 text-purple-800 border-purple-300';
      break;
    case 'TROCA ACEITA':
      colorClasses = 'bg-cyan-100 text-cyan-800 border-cyan-300';
      break;
    case 'TROCA NEGADA':
      colorClasses = 'bg-rose-100 text-rose-800 border-rose-300';
      break;
    case 'ITEM ENVIADO':
      colorClasses = 'bg-yellow-100 text-yellow-800 border-yellow-300';
      break;
    case 'ITEM RECEBIDO':
      colorClasses = 'bg-orange-100 text-orange-800 border-orange-300';
      break;
    case 'TROCA PROCESSADA':
      colorClasses = 'bg-neutral-200 text-neutral-800 border-neutral-300';
      break;
    case 'CANCELADO':
      colorClasses = 'bg-red-100 text-red-800 border-red-300';
      break;
    default:
      colorClasses = 'bg-neutral-100 text-neutral-800 border-neutral-300';
  }

  return (
    <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold rounded-lg border uppercase tracking-wider ${colorClasses}`}>
      {displayStatus === 'ATIVO' ? 'Ativo' : displayStatus === 'INATIVO' ? 'Inativo' : displayStatus}
    </span>
  );
}
