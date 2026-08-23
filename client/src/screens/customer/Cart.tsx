import { useState } from 'react';
import type { Vinyl, Customer, Coupon, Address, CreditCard } from '../../mockData';

interface CartItem {
  vinyl: Vinyl;
  quantity: number;
}

interface CartProps {
  cartItems: CartItem[];
  customer: Customer;
  coupons: Coupon[];
  onUpdateQuantity: (vinylId: string, quantity: number) => void;
  onRemoveItem: (vinylId: string) => void;
  onCheckout: (
    items: { vinyl: Vinyl; quantity: number }[],
    total: number,
    paymentDetails: string
  ) => void;
}

export default function Cart({
  cartItems,
  customer,
  coupons,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: CartProps) {
  // Address selection state
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    customer.addresses.find(a => a.type === 'entrega')?.id || ''
  );
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({
    type: 'entrega',
    tipoResidencia: 'Apartamento',
    tipoLogradouro: 'Rua',
    logradouro: '',
    numero: '',
    bairro: '',
    cep: '',
    cidade: '',
    estado: 'SP',
    pais: 'Brasil'
  });

  // Payment states
  const [selectedCards, setSelectedCards] = useState<{ [cardId: string]: boolean }>({});
  const [cardAmounts, setCardAmounts] = useState<{ [cardId: string]: string }>({});
  const [selectedCouponCode, setSelectedCouponCode] = useState<string>('');
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [newCard, setNewCard] = useState<Omit<CreditCard, 'id'>>({
    number: '',
    name: '',
    brand: 'Visa',
    cvv: ''
  });

  // Calculate order totals
  const subtotal = cartItems.reduce((acc, item) => acc + item.vinyl.price * item.quantity, 0);
  const freight = subtotal > 0 ? 15.00 : 0;
  
  // Find selected coupon value
  const activeCoupon = coupons.find(c => c.code === selectedCouponCode && c.active);
  const discount = activeCoupon ? activeCoupon.value : 0;

  const total = Math.max(0, subtotal + freight - discount);

  // Address Handlers
  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const mockId = `addr-${Date.now()}`;
    const addedAddress = { ...newAddress, id: mockId };
    customer.addresses.push(addedAddress); // update local database directly
    setSelectedAddressId(mockId);
    setShowNewAddressForm(false);
    // reset form
    setNewAddress({
      type: 'entrega',
      tipoResidencia: 'Apartamento',
      tipoLogradouro: 'Rua',
      logradouro: '',
      numero: '',
      bairro: '',
      cep: '',
      cidade: '',
      estado: 'SP',
      pais: 'Brasil'
    });
  };

  // Card Handlers
  const handleCardToggle = (cardId: string) => {
    setSelectedCards(prev => {
      const updated = { ...prev, [cardId]: !prev[cardId] };
      // initialize card amount with 0 if checked
      if (updated[cardId]) {
        setCardAmounts(prevAmt => ({ ...prevAmt, [cardId]: '' }));
      } else {
        setCardAmounts(prevAmt => {
          const copy = { ...prevAmt };
          delete copy[cardId];
          return copy;
        });
      }
      return updated;
    });
  };

  const handleCardAmountChange = (cardId: string, amount: string) => {
    setCardAmounts(prev => ({ ...prev, [cardId]: amount }));
  };

  const handleAddNewCard = (e: React.FormEvent) => {
    e.preventDefault();
    const mockId = `card-${Date.now()}`;
    const brandName = newCard.brand || 'Visa';
    const censoredNumber = `**** **** **** ${newCard.number.slice(-4) || '1234'}`;
    const addedCard = {
      id: mockId,
      number: censoredNumber,
      name: newCard.name.toUpperCase(),
      brand: brandName,
      cvv: newCard.cvv
    };
    customer.cards.push(addedCard); // update local database directly
    setShowNewCardForm(false);
    // automatically check the new card
    setSelectedCards(prev => ({ ...prev, [mockId]: true }));
    setCardAmounts(prev => ({ ...prev, [mockId]: '' }));
    setNewCard({ number: '', name: '', brand: 'Visa', cvv: '' });
  };

  // Calculate remaining payment validation
  const totalPaidByCards = Object.entries(selectedCards)
    .filter(([_, isChecked]) => isChecked)
    .reduce((sum, [cardId]) => sum + (parseFloat(cardAmounts[cardId]) || 0), 0);

  const remainingToPay = total - totalPaidByCards;

  const handleFinishPurchase = () => {
    if (cartItems.length === 0) return;
    if (!selectedAddressId) {
      alert('Por favor, selecione um endereço de entrega.');
      return;
    }

    const checkedCardList = Object.entries(selectedCards).filter(([_, isChecked]) => isChecked);
    if (checkedCardList.length === 0) {
      alert('Selecione pelo menos um cartão de crédito para efetuar o pagamento.');
      return;
    }

    // Validation: check sum of split card payments matches total
    if (Math.abs(remainingToPay) > 0.05) {
      alert(`O valor total distribuído nos cartões (R$ ${totalPaidByCards.toFixed(2)}) não corresponde ao total do pedido (R$ ${total.toFixed(2)}). Falta pagar R$ ${remainingToPay.toFixed(2)}.`);
      return;
    }

    // Build description of split payment
    let cardDescription = checkedCardList.map(([cardId]) => {
      const card = customer.cards.find(c => c.id === cardId);
      const val = parseFloat(cardAmounts[cardId]) || 0;
      return `${card?.brand} (R$ ${val.toFixed(2)})`;
    }).join(' + ');

    const paymentText = activeCoupon 
      ? `Cupom ${activeCoupon.code} (R$ ${activeCoupon.value.toFixed(2)}) + ${cardDescription}`
      : cardDescription;

    // Trigger purchase success
    onCheckout(cartItems, total, paymentText);
    
    // reset states
    setSelectedCards({});
    setCardAmounts({});
    setSelectedCouponCode('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left font-sans">
      
      {/* LEFT COLUMN: Shopping Cart List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white/80 border border-faded-olive/20 rounded-3xl p-6 md:p-8 shadow-sm">
          <h3 className="font-serif font-bold text-2xl text-vinyl-black mb-6">Seu Carrinho de Compras</h3>
          
          {cartItems.length === 0 ? (
            <div className="py-12 text-center text-faded-olive/60">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="font-serif text-lg font-bold text-vinyl-black">O carrinho está vazio</p>
              <p className="text-xs mt-1">Adicione discos de vinil a partir do catálogo.</p>
            </div>
          ) : (
            <div className="divide-y divide-faded-olive/10">
              {cartItems.map(item => (
                <div key={item.vinyl.id} className="py-6 flex flex-col sm:flex-row gap-4 items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex gap-4 items-center w-full sm:w-auto">
                    <img
                      src={item.vinyl.coverUrl}
                      alt={item.vinyl.title}
                      className="w-16 h-16 rounded-xl object-cover bg-black border border-neutral-700 shadow-sm"
                    />
                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-base text-vinyl-black truncate">{item.vinyl.title}</h4>
                      <p className="text-xs text-faded-olive font-bold mt-0.5">{item.vinyl.artist}</p>
                      <p className="text-xs text-warm-amber font-bold mt-1">R$ {item.vinyl.price.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Quantity and removal */}
                  <div className="flex items-center gap-6 justify-between w-full sm:w-auto">
                    <div className="flex items-center border border-faded-olive/30 rounded-xl overflow-hidden bg-transparent">
                      <button
                        onClick={() => onUpdateQuantity(item.vinyl.id, item.quantity - 1)}
                        className="px-3 py-1.5 text-xs text-faded-olive hover:bg-faded-olive/5 border-none cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-3 text-sm font-bold text-vinyl-black select-none">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.vinyl.id, item.quantity + 1)}
                        disabled={item.quantity >= item.vinyl.stock}
                        className="px-3 py-1.5 text-xs text-faded-olive hover:bg-faded-olive/5 border-none disabled:opacity-40 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.vinyl.id)}
                      className="text-neutral-400 hover:text-rose-600 transition cursor-pointer p-1.5"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Address Selection Card */}
        {cartItems.length > 0 && (
          <div className="bg-white/80 border border-faded-olive/20 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif font-bold text-xl text-vinyl-black">1. Endereço de Entrega</h3>
              <button
                onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                className="text-xs font-bold text-warm-amber hover:underline cursor-pointer border-none bg-transparent"
              >
                {showNewAddressForm ? 'Cancelar' : '+ Novo Endereço'}
              </button>
            </div>

            {showNewAddressForm ? (
              <form onSubmit={handleAddNewAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-faded-olive">Tipo de Endereço</label>
                  <select
                    value={newAddress.type}
                    onChange={e => setNewAddress(prev => ({ ...prev, type: e.target.value as 'cobranca' | 'entrega' }))}
                    className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="entrega">Entrega</option>
                    <option value="cobranca">Cobrança</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-faded-olive">Tipo de Residência</label>
                  <input
                    type="text"
                    required
                    value={newAddress.tipoResidencia}
                    onChange={e => setNewAddress(prev => ({ ...prev, tipoResidencia: e.target.value }))}
                    placeholder="Casa, Apartamento, Comercial..."
                    className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-faded-olive">Rua / Logradouro</label>
                  <input
                    type="text"
                    required
                    value={newAddress.logradouro}
                    onChange={e => setNewAddress(prev => ({ ...prev, logradouro: e.target.value }))}
                    placeholder="Nome da rua/avenida"
                    className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1 flex flex-col space-y-1.5">
                    <label className="text-xs font-bold text-faded-olive">Número</label>
                    <input
                      type="text"
                      required
                      value={newAddress.numero}
                      onChange={e => setNewAddress(prev => ({ ...prev, numero: e.target.value }))}
                      className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2 flex flex-col space-y-1.5">
                    <label className="text-xs font-bold text-faded-olive">CEP</label>
                    <input
                      type="text"
                      required
                      value={newAddress.cep}
                      onChange={e => setNewAddress(prev => ({ ...prev, cep: e.target.value }))}
                      placeholder="00000-000"
                      className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-faded-olive">Bairro</label>
                  <input
                    type="text"
                    required
                    value={newAddress.bairro}
                    onChange={e => setNewAddress(prev => ({ ...prev, bairro: e.target.value }))}
                    className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-bold text-faded-olive">Cidade</label>
                    <input
                      type="text"
                      required
                      value={newAddress.cidade}
                      onChange={e => setNewAddress(prev => ({ ...prev, cidade: e.target.value }))}
                      className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-bold text-faded-olive">Estado</label>
                    <input
                      type="text"
                      required
                      value={newAddress.estado}
                      onChange={e => setNewAddress(prev => ({ ...prev, estado: e.target.value }))}
                      className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>
                </div>
                <div className="col-span-full pt-2">
                  <button
                    type="submit"
                    className="w-full py-2 bg-faded-olive hover:bg-faded-olive/90 text-paper-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer border-none"
                  >
                    Salvar Endereço
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                {customer.addresses.map(addr => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-4 p-4 rounded-2xl border transition cursor-pointer ${
                      selectedAddressId === addr.id
                        ? 'border-warm-amber bg-warm-amber/5'
                        : 'border-faded-olive/20 hover:border-faded-olive/40 bg-transparent'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryAddress"
                      value={addr.id}
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1 accent-warm-amber"
                    />
                    <div className="text-sm text-vinyl-black">
                      <span className="inline-block px-2 py-0.5 text-[9px] font-bold rounded bg-faded-olive/20 text-faded-olive uppercase mb-1">
                        {addr.type === 'entrega' ? 'Entrega' : 'Cobrança'} &bull; {addr.tipoResidencia}
                      </span>
                      <p className="font-semibold text-vinyl-black">
                        {addr.tipoLogradouro} {addr.logradouro}, {addr.numero}
                      </p>
                      <p className="text-xs text-faded-olive/80 mt-0.5">
                        {addr.bairro} &bull; CEP: {addr.cep} &bull; {addr.cidade} - {addr.estado}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Order Summary & Combined Payments */}
      {cartItems.length > 0 && (
        <div className="space-y-6">
          <div className="bg-white/80 border border-faded-olive/20 rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="font-serif font-bold text-xl text-vinyl-black mb-6">2. Pagamento & Finalização</h3>
            
            {/* Totals */}
            <div className="space-y-3 text-sm pb-6 border-b border-faded-olive/10">
              <div className="flex justify-between">
                <span className="text-faded-olive">Subtotal</span>
                <span className="font-semibold text-vinyl-black">R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-faded-olive">Frete</span>
                <span className="font-semibold text-vinyl-black">R$ {freight.toFixed(2)}</span>
              </div>
              
              {/* Promo Coupon Selection */}
              <div className="flex flex-col gap-1.5 pt-2">
                <label className="text-xs font-bold text-faded-olive">Cupom de Desconto / Troca</label>
                <select
                  value={selectedCouponCode}
                  onChange={e => setSelectedCouponCode(e.target.value)}
                  className="w-full bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-xs focus:outline-none text-vinyl-black"
                >
                  <option value="">Nenhum cupom selecionado</option>
                  {coupons.map(cp => (
                    <option key={cp.id} value={cp.code} disabled={!cp.active}>
                      {cp.code} - R$ {cp.value.toFixed(2)} ({cp.type === 'troca' ? 'Troca' : 'Promo'})
                    </option>
                  ))}
                </select>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Desconto Cupom</span>
                  <span>- R$ {discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-bold pt-2 border-t border-faded-olive/10 text-vinyl-black">
                <span>Total a Pagar</span>
                <span className="text-warm-amber">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Split Credit Cards payment */}
            <div className="py-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-faded-olive">Pagar com Cartão (Combinar)</h4>
                <button
                  onClick={() => setShowNewCardForm(!showNewCardForm)}
                  className="text-[11px] font-bold text-warm-amber hover:underline bg-transparent border-none cursor-pointer"
                >
                  {showNewCardForm ? 'Cancelar' : '+ Novo Cartão'}
                </button>
              </div>

              {showNewCardForm ? (
                <form onSubmit={handleAddNewCard} className="space-y-3 p-4 bg-faded-olive/5 border border-faded-olive/20 rounded-2xl">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-faded-olive">Número do Cartão</label>
                    <input
                      type="text"
                      required
                      value={newCard.number}
                      onChange={e => setNewCard(prev => ({ ...prev, number: e.target.value }))}
                      placeholder="16 dígitos"
                      className="bg-paper-white border border-faded-olive/40 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-faded-olive">Nome Impresso</label>
                    <input
                      type="text"
                      required
                      value={newCard.name}
                      onChange={e => setNewCard(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome no cartão"
                      className="bg-paper-white border border-faded-olive/40 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold text-faded-olive">Bandeira</label>
                      <select
                        value={newCard.brand}
                        onChange={e => setNewCard(prev => ({ ...prev, brand: e.target.value }))}
                        className="bg-paper-white border border-faded-olive/40 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                      >
                        <option value="Visa">Visa</option>
                        <option value="Mastercard">Mastercard</option>
                        <option value="Elo">Elo</option>
                        <option value="Amex">Amex</option>
                      </select>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold text-faded-olive">CVV</label>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        value={newCard.cvv}
                        onChange={e => setNewCard(prev => ({ ...prev, cvv: e.target.value }))}
                        className="bg-paper-white border border-faded-olive/40 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-warm-amber hover:bg-warm-amber/90 text-paper-white text-xs font-bold rounded-lg cursor-pointer border-none"
                  >
                    Adicionar e Selecionar
                  </button>
                </form>
              ) : (
                <div className="space-y-3">
                  {customer.cards.map(card => {
                    const isChecked = selectedCards[card.id] || false;
                    return (
                      <div
                        key={card.id}
                        className={`p-3 rounded-2xl border flex flex-col gap-2.5 transition ${
                          isChecked
                            ? 'border-warm-amber bg-warm-amber/5'
                            : 'border-faded-olive/20 bg-transparent'
                        }`}
                      >
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCardToggle(card.id)}
                            className="accent-warm-amber"
                          />
                          <div className="text-xs">
                            <p className="font-bold text-vinyl-black">
                              {card.brand} - {card.number}
                            </p>
                            <p className="text-[10px] text-faded-olive/80">{card.name}</p>
                          </div>
                        </label>

                        {/* Amount input block for multi-card splitting */}
                        {isChecked && (
                          <div className="flex items-center gap-2 pl-6">
                            <span className="text-[11px] text-faded-olive font-bold">Valor cobrado:</span>
                            <div className="relative flex-1">
                              <span className="absolute left-2.5 top-1.5 text-[11px] text-faded-olive">R$</span>
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0,00"
                                value={cardAmounts[card.id] || ''}
                                onChange={e => handleCardAmountChange(card.id, e.target.value)}
                                className="w-full bg-paper-white border border-faded-olive/40 rounded-lg pl-8 pr-2.5 py-1 text-xs focus:outline-none text-vinyl-black"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Combined checkout state details */}
            <div className="mt-4 pt-4 border-t border-faded-olive/10 text-xs space-y-2">
              <div className="flex justify-between font-medium">
                <span className="text-faded-olive">Total pago nos cartões:</span>
                <span className="text-vinyl-black">R$ {totalPaidByCards.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                {remainingToPay > 0 ? (
                  <>
                    <span className="text-rose-600">Restante a pagar:</span>
                    <span className="text-rose-600">R$ {remainingToPay.toFixed(2)}</span>
                  </>
                ) : remainingToPay < 0 ? (
                  <>
                    <span className="text-rose-600">Excesso de pagamento:</span>
                    <span className="text-rose-600">R$ {Math.abs(remainingToPay).toFixed(2)}</span>
                  </>
                ) : (
                  <>
                    <span className="text-emerald-700">Pagamento quitado:</span>
                    <span className="text-emerald-700">R$ 0,00 (Pronto!)</span>
                  </>
                )}
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleFinishPurchase}
              disabled={cartItems.length === 0 || Math.abs(remainingToPay) > 0.05}
              className="w-full mt-6 py-3 text-xs uppercase tracking-wider font-bold rounded-xl bg-warm-amber hover:bg-warm-amber/90 text-paper-white border-none shadow-md transition disabled:bg-neutral-300 disabled:text-neutral-500 disabled:shadow-none cursor-pointer active:scale-95"
            >
              Finalizar Compra
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
