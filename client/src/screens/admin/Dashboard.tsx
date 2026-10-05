import { useState } from 'react';
import type { Order } from '../../mockData';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import { Select } from '../../components/Input';

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

  // MOCK GRAPH DATA (sales values grouped by months)
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

  const chartMonthsOptions = [
    { value: 3, label: 'Últimos 3 Meses' },
    { value: 6, label: 'Últimos 6 Meses' },
    { value: 12, label: 'Últimos 12 Meses' }
  ];

  return (
    <div className="space-y-8 text-left font-sans animate-in fade-in duration-200">
      
      {/* SECTION 1: Sales Analysis Chart */}
      <div className="bg-white/80 border border-faded-olive/20 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <div>
            <h3 className="font-serif font-bold text-2xl text-vinyl-black">Gráfico de Análise de Vendas</h3>
            <p className="text-xs text-faded-olive mt-1">Faturamento por categorias (Gêneros de Vinil)</p>
          </div>
          
          <div>
            <Select
              label=""
              value={chartMonthsCount}
              onChange={e => setChartMonthsCount(Number(e.target.value))}
              options={chartMonthsOptions}
              className="font-bold py-1.5"
            />
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
          <Button 
            onClick={() => setChartCategory('Todos')} 
            variant={chartCategory === 'Todos' ? 'secondary' : 'outline'}
            size="sm"
          >
            Todos os Gêneros
          </Button>
          <Button 
            onClick={() => setChartCategory('Rock')} 
            variant={chartCategory === 'Rock' ? 'primary' : 'outline'}
            size="sm"
            className="flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-soft-terracotta" />
            Rock / Classic
          </Button>
          <Button 
            onClick={() => setChartCategory('Jazz')} 
            variant={chartCategory === 'Jazz' ? 'primary' : 'outline'}
            size="sm"
            className="flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-warm-amber" />
            Jazz
          </Button>
          <Button 
            onClick={() => setChartCategory('Electronic')} 
            variant={chartCategory === 'Electronic' ? 'secondary' : 'outline'}
            size="sm"
            className="flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-faded-olive" />
            Electronic
          </Button>
        </div>
      </div>

      {/* SECTION 2: Orders Management & Status Control */}
      <div className="bg-white/80 border border-faded-olive/20 rounded-3xl p-6 md:p-8 shadow-sm">
        <h3 className="font-serif font-bold text-2xl text-vinyl-black mb-6">Painel de Gerenciamento de Pedidos</h3>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full md:w-80 text-left">
            <label className="text-xs font-bold text-faded-olive block mb-1">Pesquisar</label>
            <div className="relative">
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
          </div>

          <div className="flex gap-1.5 flex-wrap justify-end pt-5">
            {['Todos', 'EM ABERTO', 'EM PROCESSAMENTO', 'PAGAMENTO REALIZADO', 'EM TRÂNSITO', 'ENTREGUE', 'TROCA SOLICITADA', 'TROCA ACEITA', 'ITEM ENVIADO', 'ITEM RECEBIDO', 'TROCA PROCESSADA', 'CANCELADO'].map(st => (
              <Button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                variant={selectedStatusFilter === st ? 'secondary' : 'outline'}
                size="sm"
                className="px-2 py-1 text-[10px]"
              >
                {st}
              </Button>
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
                    <td className="py-4 font-bold text-warm-amber">R$ {Number(order.total).toFixed(2)}</td>
                    <td className="py-4" data-cy="dashboard-order-status">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-4 text-right">
                      {nextStates.length > 0 ? (
                        <div className="flex gap-1 justify-end">
                          {nextStates.map(nxt => (
                            <Button
                              key={nxt}
                              onClick={() => onUpdateOrderStatus(order.id, nxt)}
                              variant="primary"
                              size="sm"
                              className="px-2 py-1 text-[10px]"
                            >
                              {nxt}
                            </Button>
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
