import { useState } from 'react';
import type { Order } from '../../mockData';

interface DashboardProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
}

export default function Dashboard({ orders, onUpdateOrderStatus }: DashboardProps) {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Chart states
  const [chartCategory, setChartCategory] = useState<string>('Todos');
  const [chartMonthsCount, setChartMonthsCount] = useState<number>(6); // Default 6 months
  const [activeTooltip, setActiveTooltip] = useState<{ month: string; value: number; x: number; y: number } | null>(null);

  // Filter orders for listing
  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatusFilter === 'Todos' || order.status === selectedStatusFilter;
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Allowed state machine transitions helper
  const getNextAvailableStates = (currentStatus: Order['status']): Order['status'][] => {
    switch (currentStatus) {
      case 'EM ABERTO':
        return ['EM PROCESSAMENTO'];
      case 'EM PROCESSAMENTO':
        return ['PAGAMENTO REALIZADO', 'CANCELADO'];
      case 'PAGAMENTO REALIZADO':
        return ['EM TRÂNSITO'];
      case 'EM TRÂNSITO':
        return ['ENTREGUE'];
      case 'TROCA SOLICITADA':
        return ['TROCA ACEITA', 'TROCA NEGADA'];
      case 'ITEM ENVIADO':
        return ['ITEM RECEBIDO'];
      case 'ITEM RECEBIDO':
        return ['TROCA PROCESSADA'];
      default:
        return []; // terminal states (ENTREGUE, CANCELADO, TROCA NEGADA, TROCA PROCESSADA)
    }
  };

  const getStatusLabelColor = (status: Order['status']) => {
    switch (status) {
      case 'EM ABERTO': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'EM PROCESSAMENTO': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'PAGAMENTO REALIZADO': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'EM TRÂNSITO': return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'ENTREGUE': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'TROCA SOLICITADA': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'TROCA ACEITA': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'TROCA NEGADA': return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'ITEM ENVIADO': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'ITEM RECEBIDO': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'TROCA PROCESSADA': return 'bg-neutral-200 text-neutral-800 border-neutral-300';
      case 'CANCELADO': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-300';
    }
  };

  // MOCK GRAPH DATA (sales values grouped by months)
  // Let's create an SVG line chart
  const months = ['Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto'];
  
  // Mock data for categories: Rock, Jazz, Pop, Electronic
  const rockSales = [12000, 15000, 18000, 14000, 22000, 28000];
  const jazzSales = [8000, 9500, 11000, 10500, 13000, 16000];
  const electronicSales = [5000, 7000, 9000, 8500, 12000, 15000];

  const getChartPoints = (data: number[]) => {
    const width = 500;
    const height = 180;
    const maxVal = 30000;
    
    return data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width + 50;
      const y = height - (val / maxVal) * height + 20;
      return { x, y, value: val, month: months[idx] || '' };
    });
  };

  const rockPoints = getChartPoints(rockSales);
  const jazzPoints = getChartPoints(jazzSales);
  const electronicPoints = getChartPoints(electronicSales);

  const getSvgPath = (points: { x: number; y: number }[]) => {
    return points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  };

  return (
    <div className="space-y-8 text-left font-sans">
      
      {/* SECTION 1: Sales Analysis Chart */}
      <div className="bg-white/80 border border-faded-olive/20 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <div>
            <h3 className="font-serif font-bold text-2xl text-vinyl-black">Gráfico de Análise de Vendas</h3>
            <p className="text-xs text-faded-olive mt-1">Faturamento por categorias (Gêneros de Vinil)</p>
          </div>
          
          <div className="flex gap-3">
            {/* Months Filter */}
            <select
              value={chartMonthsCount}
              onChange={e => setChartMonthsCount(Number(e.target.value))}
              className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none text-vinyl-black"
            >
              <option value={3}>Últimos 3 Meses</option>
              <option value={6}>Últimos 6 Meses</option>
              <option value={12}>Últimos 12 Meses</option>
            </select>
          </div>
        </div>

        {/* SVG Rendered Line Chart */}
        <div className="relative border border-faded-olive/15 rounded-2xl bg-paper-white p-4 overflow-hidden">
          <svg className="w-full h-64" viewBox="0 0 600 240">
            {/* Grid Lines */}
            <line x1="50" y1="20" x2="550" y2="20" stroke="#4A5844" strokeOpacity="0.08" />
            <line x1="50" y1="80" x2="550" y2="80" stroke="#4A5844" strokeOpacity="0.08" />
            <line x1="50" y1="140" x2="550" y2="140" stroke="#4A5844" strokeOpacity="0.08" />
            <line x1="50" y1="200" x2="550" y2="200" stroke="#4A5844" strokeOpacity="0.2" />

            {/* Y Axis Labels */}
            <text x="15" y="25" fill="#4A5844" fontSize="10" fontWeight="bold">R$ 30K</text>
            <text x="15" y="85" fill="#4A5844" fontSize="10" fontWeight="bold">R$ 20K</text>
            <text x="15" y="145" fill="#4A5844" fontSize="10" fontWeight="bold">R$ 10K</text>
            <text x="25" y="205" fill="#4A5844" fontSize="10" fontWeight="bold">R$ 0</text>

            {/* X Axis Labels */}
            {months.map((m, idx) => (
              <text key={idx} x={((idx / (months.length - 1)) * 500 + 40)} y="225" fill="#4A5844" fontSize="10" fontWeight="bold" textAnchor="middle">
                {m}
              </text>
            ))}

            {/* Line: Rock (Terracotta) */}
            {(chartCategory === 'Todos' || chartCategory === 'Rock') && (
              <>
                <path d={getSvgPath(rockPoints)} fill="none" stroke="#B85D43" strokeWidth="3" strokeLinecap="round" />
                {rockPoints.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    fill="#B85D43"
                    className="hover:scale-150 transition cursor-pointer"
                    onMouseEnter={() => setActiveTooltip({ month: p.month, value: p.value, x: p.x, y: p.y })}
                    onMouseLeave={() => setActiveTooltip(null)}
                  />
                ))}
              </>
            )}

            {/* Line: Jazz (Amber) */}
            {(chartCategory === 'Todos' || chartCategory === 'Jazz') && (
              <>
                <path d={getSvgPath(jazzPoints)} fill="none" stroke="#D97724" strokeWidth="3" strokeLinecap="round" />
                {jazzPoints.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    fill="#D97724"
                    className="hover:scale-150 transition cursor-pointer"
                    onMouseEnter={() => setActiveTooltip({ month: p.month, value: p.value, x: p.x, y: p.y })}
                    onMouseLeave={() => setActiveTooltip(null)}
                  />
                ))}
              </>
            )}

            {/* Line: Electronic (Olive) */}
            {(chartCategory === 'Todos' || chartCategory === 'Electronic') && (
              <>
                <path d={getSvgPath(electronicPoints)} fill="none" stroke="#4A5844" strokeWidth="3" strokeLinecap="round" />
                {electronicPoints.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    fill="#4A5844"
                    className="hover:scale-150 transition cursor-pointer"
                    onMouseEnter={() => setActiveTooltip({ month: p.month, value: p.value, x: p.x, y: p.y })}
                    onMouseLeave={() => setActiveTooltip(null)}
                  />
                ))}
              </>
            )}

            {/* Interactive SVG Tooltip */}
            {activeTooltip && (
              <g>
                <rect 
                  x={activeTooltip.x - 55} 
                  y={activeTooltip.y - 45} 
                  width="110" 
                  height="35" 
                  rx="6" 
                  fill="#121212" 
                  filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.3))" 
                />
                <text x={activeTooltip.x} y={activeTooltip.y - 32} fill="#F4EFE6" fontSize="9" textAnchor="middle" fontWeight="bold">
                  {activeTooltip.month}
                </text>
                <text x={activeTooltip.x} y={activeTooltip.y - 18} fill="#D97724" fontSize="10" textAnchor="middle" fontWeight="bold">
                  R$ {activeTooltip.value.toFixed(2)}
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Legend buttons */}
        <div className="flex gap-4 mt-4 justify-center">
          <button 
            onClick={() => setChartCategory('Todos')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
              chartCategory === 'Todos' ? 'bg-vinyl-black text-paper-white border-vinyl-black' : 'bg-transparent text-faded-olive border-neutral-300'
            }`}
          >
            Todos os Gêneros
          </button>
          <button 
            onClick={() => setChartCategory('Rock')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border flex items-center gap-2 ${
              chartCategory === 'Rock' ? 'bg-soft-terracotta text-white border-soft-terracotta' : 'bg-transparent text-faded-olive border-neutral-300'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-soft-terracotta" />
            Rock / Classic
          </button>
          <button 
            onClick={() => setChartCategory('Jazz')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border flex items-center gap-2 ${
              chartCategory === 'Jazz' ? 'bg-warm-amber text-white border-warm-amber' : 'bg-transparent text-faded-olive border-neutral-300'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-warm-amber" />
            Jazz
          </button>
          <button 
            onClick={() => setChartCategory('Electronic')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border flex items-center gap-2 ${
              chartCategory === 'Electronic' ? 'bg-faded-olive text-paper-white border-faded-olive' : 'bg-transparent text-faded-olive border-neutral-300'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-faded-olive" />
            Electronic
          </button>
        </div>
      </div>

      {/* SECTION 2: Orders Management & Status Control */}
      <div className="bg-white/80 border border-faded-olive/20 rounded-3xl p-6 md:p-8 shadow-sm">
        <h3 className="font-serif font-bold text-2xl text-vinyl-black mb-6">Painel de Gerenciamento de Pedidos</h3>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por cliente ou Nº pedido..."
              className="w-full pl-10 pr-4 py-2 text-xs text-vinyl-black bg-paper-white border border-faded-olive/40 rounded-xl focus:outline-none focus:border-warm-amber"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-faded-olive/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex gap-2 flex-wrap">
            {['Todos', 'EM ABERTO', 'EM PROCESSAMENTO', 'PAGAMENTO REALIZADO', 'EM TRÂNSITO', 'ENTREGUE', 'TROCA SOLICITADA', 'TROCA ACEITA', 'ITEM ENVIADO', 'ITEM RECEBIDO', 'TROCA PROCESSADA', 'CANCELADO'].map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition border cursor-pointer ${
                  selectedStatusFilter === st
                    ? 'bg-vinyl-black text-paper-white border-vinyl-black'
                    : 'bg-transparent text-faded-olive border-faded-olive/30 hover:bg-faded-olive/5'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-faded-olive/20 text-faded-olive font-bold text-xs uppercase tracking-wider">
                <th className="pb-3 text-left">Pedido</th>
                <th className="pb-3 text-left">Cliente</th>
                <th className="pb-3 text-left">Itens</th>
                <th className="pb-3 text-left">Total</th>
                <th className="pb-3 text-left">Status Atual</th>
                <th className="pb-3 text-right">Alterar Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-faded-olive/10">
              {filteredOrders.map(order => {
                const nextStates = getNextAvailableStates(order.status);
                return (
                  <tr key={order.id} className="hover:bg-faded-olive/5 transition">
                    <td className="py-4 font-bold text-vinyl-black">{order.id}</td>
                    <td className="py-4 text-vinyl-black">{order.customerName}</td>
                    <td className="py-4 text-xs max-w-[200px] truncate text-vinyl-black">
                      {order.items.map(it => `${it.quantity}x ${it.title}`).join(', ')}
                    </td>
                    <td className="py-4 font-bold text-warm-amber">R$ {order.total.toFixed(2)}</td>
                    <td className="py-4">
                      <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold rounded border uppercase ${getStatusLabelColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      {nextStates.length > 0 ? (
                        <div className="flex gap-1 justify-end">
                          {nextStates.map(nxt => (
                            <button
                              key={nxt}
                              onClick={() => onUpdateOrderStatus(order.id, nxt)}
                              className="px-2 py-1 text-[10px] font-bold rounded-lg bg-warm-amber hover:bg-warm-amber/90 text-paper-white border-none transition cursor-pointer"
                            >
                              Mudar para: {nxt}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-faded-olive/50 italic">Processo Finalizado</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-faded-olive/60">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
