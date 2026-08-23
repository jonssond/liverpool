import { useState } from 'react';
import type { Order } from '../../mockData';

interface OrderHistoryProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
}

export default function OrderHistory({ orders, onUpdateOrderStatus }: OrderHistoryProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Exchange request states
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [exchangeOrderId, setExchangeOrderId] = useState<string>('');
  const [exchangeReason, setExchangeReason] = useState('');
  const [exchangeType, setExchangeType] = useState<'troca' | 'devolucao'>('troca');

  const handleRequestExchangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exchangeReason.trim()) {
      alert('Por favor, informe o motivo da solicitação.');
      return;
    }
    onUpdateOrderStatus(exchangeOrderId, 'TROCA SOLICITADA');
    setShowExchangeModal(false);
    setExchangeReason('');
    
    // Update local state copy if modal is open
    if (selectedOrder && selectedOrder.id === exchangeOrderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: 'TROCA SOLICITADA' } : null);
    }
    alert('Sua solicitação de troca/devolução foi registrada com sucesso e aguarda análise da administração.');
  };

  const openExchangeModal = (orderId: string) => {
    setExchangeOrderId(orderId);
    setShowExchangeModal(true);
  };

  const getStatusBadgeClass = (status: Order['status']) => {
    switch (status) {
      case 'EM ABERTO':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'EM PROCESSAMENTO':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'PAGAMENTO REALIZADO':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'EM TRÂNSITO':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'ENTREGUE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'TROCA SOLICITADA':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'TROCA ACEITA':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'TROCA NEGADA':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'ITEM ENVIADO':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'ITEM RECEBIDO':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'TROCA PROCESSADA':
        return 'bg-neutral-200 text-neutral-800 border-neutral-300';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-300';
    }
  };

  return (
    <div className="space-y-6 text-left font-sans">
      
      <div className="bg-white/80 border border-faded-olive/20 rounded-3xl p-6 md:p-8 shadow-sm">
        <h3 className="font-serif font-bold text-2xl text-vinyl-black mb-6">Seus Pedidos</h3>
        
        {orders.length === 0 ? (
          <div className="py-12 text-center text-faded-olive/60">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="font-serif text-lg font-bold text-vinyl-black">Nenhum pedido registrado</p>
            <p className="text-xs mt-1">Quando você finalizar compras, elas aparecerão aqui.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-faded-olive/20 text-faded-olive font-bold text-xs uppercase tracking-wider">
                  <th className="pb-3 text-left">Nº Pedido</th>
                  <th className="pb-3 text-left">Data</th>
                  <th className="pb-3 text-left">Total</th>
                  <th className="pb-3 text-left">Status</th>
                  <th className="pb-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-faded-olive/10">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-faded-olive/5 transition">
                    <td className="py-4 font-bold text-vinyl-black">{order.id}</td>
                    <td className="py-4 text-xs text-faded-olive">{order.createdAt}</td>
                    <td className="py-4 font-bold text-warm-amber">R$ {order.total.toFixed(2)}</td>
                    <td className="py-4">
                      <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-lg border uppercase ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-faded-olive border border-faded-olive/40 hover:bg-faded-olive/5 cursor-pointer"
                      >
                        Detalhes
                      </button>

                      {/* Cancel purchase when pending */}
                      {(order.status === 'EM ABERTO' || order.status === 'EM PROCESSAMENTO' || order.status === 'PAGAMENTO REALIZADO') && (
                        <button
                          onClick={() => {
                            if (confirm('Tem certeza de que deseja cancelar este pedido?')) {
                              onUpdateOrderStatus(order.id, 'CANCELADO');
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                        >
                          Cancelar
                        </button>
                      )}

                      {/* Confirm order arrival */}
                      {order.status === 'EM TRÂNSITO' && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'ENTREGUE')}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                        >
                          Confirmar Recebimento
                        </button>
                      )}

                      {/* Request exchange */}
                      {order.status === 'ENTREGUE' && (
                        <button
                          onClick={() => openExchangeModal(order.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 cursor-pointer"
                        >
                          Solicitar Troca
                        </button>
                      )}

                      {/* Despachar/Enviar o item de troca após aprovação */}
                      {order.status === 'TROCA ACEITA' && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'ITEM ENVIADO')}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100 cursor-pointer animate-pulse"
                        >
                          Despachar Devolução
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expanded Order Details Modal/Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-vinyl-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-paper-white border border-faded-olive/20 rounded-3xl p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-faded-olive hover:text-vinyl-black transition cursor-pointer p-1"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="font-serif font-bold text-2xl text-vinyl-black mb-6 border-b border-faded-olive/10 pb-4 flex justify-between items-center pr-8">
              <span>Pedido: {selectedOrder.id}</span>
              <span className={`text-xs px-2.5 py-1 rounded-full uppercase border font-sans ${getStatusBadgeClass(selectedOrder.status)}`}>
                {selectedOrder.status}
              </span>
            </h3>

            {/* Items details */}
            <div className="space-y-4 max-h-60 overflow-y-auto mb-6">
              {selectedOrder.items.map(item => (
                <div key={item.vinylId} className="flex items-center gap-4 py-2 border-b border-faded-olive/5 last:border-none">
                  <img
                    src={item.coverUrl}
                    alt={item.title}
                    className="w-12 h-12 rounded-lg object-cover bg-black border border-neutral-700"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-bold text-sm text-vinyl-black truncate">{item.title}</h4>
                    <p className="text-xs text-faded-olive">{item.artist}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-bold text-vinyl-black">{item.quantity} x R$ {item.price.toFixed(2)}</p>
                    <p className="text-warm-amber font-bold mt-0.5">Subtotal: R$ {(item.quantity * item.price).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Details & Payments */}
            <div className="bg-faded-olive/5 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 text-vinyl-black">
                <h5 className="font-bold text-faded-olive uppercase tracking-wider">Resumo Financeiro</h5>
                <p><span className="text-faded-olive">Subtotal:</span> R$ {selectedOrder.subtotal.toFixed(2)}</p>
                <p><span className="text-faded-olive">Frete:</span> R$ {selectedOrder.freight.toFixed(2)}</p>
                {selectedOrder.discount > 0 && (
                  <p className="text-emerald-700 font-medium"><span className="text-emerald-700">Desconto:</span> R$ {selectedOrder.discount.toFixed(2)}</p>
                )}
                <p className="font-bold text-warm-amber text-sm"><span className="text-faded-olive">Total:</span> R$ {selectedOrder.total.toFixed(2)}</p>
              </div>

              <div className="space-y-1.5 text-vinyl-black">
                <h5 className="font-bold text-faded-olive uppercase tracking-wider">Forma de Pagamento</h5>
                <p className="font-medium text-vinyl-black">{selectedOrder.paymentDetails}</p>
                <p className="text-[10px] text-faded-olive/60 mt-2">Data do Pedido: {selectedOrder.createdAt}</p>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 rounded-xl bg-faded-olive text-paper-white font-bold text-xs uppercase tracking-wider cursor-pointer border-none"
              >
                Fechar Detalhes
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Exchange/Refund Request Form Modal */}
      {showExchangeModal && (
        <div className="fixed inset-0 z-50 bg-vinyl-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-paper-white border border-faded-olive/20 rounded-3xl p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowExchangeModal(false)}
              className="absolute top-4 right-4 text-faded-olive hover:text-vinyl-black transition cursor-pointer p-1"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="font-serif font-bold text-xl text-vinyl-black mb-6">Solicitar Devolução / Troca</h3>

            <form onSubmit={handleRequestExchangeSubmit} className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-faded-olive">Tipo de Solicitação</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs font-bold text-vinyl-black cursor-pointer">
                    <input
                      type="radio"
                      name="exchangeType"
                      checked={exchangeType === 'troca'}
                      onChange={() => setExchangeType('troca')}
                      className="accent-warm-amber"
                    />
                    Troca (Gera cupom de troca)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-vinyl-black cursor-pointer">
                    <input
                      type="radio"
                      name="exchangeType"
                      checked={exchangeType === 'devolucao'}
                      onChange={() => setExchangeType('devolucao')}
                      className="accent-warm-amber"
                    />
                    Devolução (Reembolso)
                  </label>
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-faded-olive">Motivo da Devolução</label>
                <textarea
                  rows={4}
                  required
                  value={exchangeReason}
                  onChange={e => setExchangeReason(e.target.value)}
                  placeholder="Por favor, explique o motivo (ex: disco riscado, encarte avariado, arrependimento de compra)..."
                  className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-xs focus:outline-none placeholder-faded-olive/50 text-vinyl-black"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-warm-amber hover:bg-warm-amber/90 text-paper-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md border-none"
              >
                Enviar Solicitação
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
