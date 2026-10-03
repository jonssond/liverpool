import { useState } from 'react';
import type { Order } from '../../mockData';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import { Textarea } from '../../components/Input';

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

  return (
    <div className="space-y-6 text-left font-sans animate-in fade-in duration-200">
      
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
              <tbody className="divide-y divide-faded-olive/10" data-cy="orders-tbody">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-faded-olive/5 transition" data-cy={`order-row-${order.id}`}>
                    <td className="py-4 font-bold text-vinyl-black" data-cy="order-id">{order.id}</td>
                    <td className="py-4 text-xs text-faded-olive">{order.createdAt}</td>
                    <td className="py-4 font-bold text-warm-amber" data-cy="order-total">R$ {order.total.toFixed(2)}</td>
                    <td className="py-4" data-cy="order-status">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-4 text-right space-x-2">
                      <Button
                        onClick={() => setSelectedOrder(order)}
                        variant="outline"
                        size="sm"
                        data-cy={`btn-details-${order.id}`}
                      >
                        Detalhes
                      </Button>

                      {/* Cancel purchase when pending */}
                      {(order.status === 'EM ABERTO' || order.status === 'EM PROCESSAMENTO' || order.status === 'PAGAMENTO REALIZADO') && (
                        <Button
                          onClick={() => {
                            if (confirm('Tem certeza de que deseja cancelar este pedido?')) {
                              onUpdateOrderStatus(order.id, 'CANCELADO');
                            }
                          }}
                          variant="danger"
                          size="sm"
                        >
                          Cancelar
                        </Button>
                      )}

                      {/* Confirm order arrival */}
                      {order.status === 'EM TRÂNSITO' && (
                        <Button
                          onClick={() => onUpdateOrderStatus(order.id, 'ENTREGUE')}
                          variant="success"
                          size="sm"
                        >
                          Confirmar Recebimento
                        </Button>
                      )}

                      {/* Request exchange */}
                      {order.status === 'ENTREGUE' && (
                        <Button
                          onClick={() => openExchangeModal(order.id)}
                          variant="secondary"
                          size="sm"
                        >
                          Solicitar Troca
                        </Button>
                      )}

                      {/* Despachar/Enviar o item de troca após aprovação */}
                      {order.status === 'TROCA ACEITA' && (
                        <Button
                          onClick={() => onUpdateOrderStatus(order.id, 'ITEM ENVIADO')}
                          variant="primary"
                          size="sm"
                          className="animate-pulse"
                        >
                          Despachar Devolução
                        </Button>
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
      <Modal
        isOpen={selectedOrder !== null}
        onClose={() => setSelectedOrder(null)}
        title={`Pedido: ${selectedOrder?.id}`}
        maxWidthClass="max-w-2xl"
      >
        {selectedOrder && (
          <>
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-faded-olive uppercase">Status do Pedido:</span>
              <StatusBadge status={selectedOrder.status} />
            </div>

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
              <Button
                onClick={() => setSelectedOrder(null)}
                variant="secondary"
              >
                Fechar Detalhes
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* Exchange/Refund Request Form Modal */}
      <Modal
        isOpen={showExchangeModal}
        onClose={() => setShowExchangeModal(false)}
        title="Solicitar Devolução / Troca"
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleRequestExchangeSubmit} className="space-y-4">
          <div className="flex flex-col space-y-1.5 text-left">
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

          <Textarea
            label="Motivo da Devolução"
            required
            rows={4}
            value={exchangeReason}
            onChange={e => setExchangeReason(e.target.value)}
            placeholder="Por favor, explique o motivo (ex: disco riscado, encarte avariado, arrependimento de compra)..."
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
          >
            Enviar Solicitação
          </Button>
        </form>
      </Modal>

    </div>
  );
}
