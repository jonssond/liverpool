import { useState, useMemo, useEffect } from 'react';
import type { Vinyl, Customer, Coupon, Address, CreditCard } from '../../mockData';
import Button from '../../components/Button';
import { Input, Select } from '../../components/Input';
import { maskCEP, maskCreditCard, maskCVV } from '../../utils/masks';
import { validateCreditCard, detectCardBrand } from '../../utils/validators';

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
  onCheckout: (orderPayload: {
    items: { vinyl: Vinyl; quantity: number }[];
    deliveryAddress: Address;
    saveAddressToProfile: boolean;
    cards: Array<{
      id?: string;
      number: string;
      name: string;
      brand: string;
      cvv?: string;
      amount: number;
    }>;
    saveCardToProfile: boolean;
    selectedCoupons: Coupon[];
    subtotal: number;
    freight: number;
    discount: number;
    total: number;
    surplusExchangeCouponValue: number;
  }) => void;
}

export default function Cart({
  cartItems,
  customer,
  coupons,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartProps) {
  // Address selection state
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    customer.addresses.find(a => a.type === 'entrega')?.id || customer.addresses[0]?.id || ''
  );
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(true);
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({
    type: 'entrega',
    tipoResidencia: 'Apartamento',
    tipoLogradouro: 'Rua',
    logradouro: '',
    numero: '',
    bairro: 'Centro',
    cep: '',
    cidade: '',
    estado: 'SP',
    pais: 'Brasil',
  });

  const currentAddress = useMemo(() => {
    if (showNewAddressForm) return newAddress;
    return customer.addresses.find(a => a.id === selectedAddressId) || customer.addresses[0];
  }, [showNewAddressForm, newAddress, customer.addresses, selectedAddressId]);

  const totalItemsCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.vinyl.price * item.quantity, 0);
  }, [cartItems]);

  const freight = useMemo(() => {
    if (subtotal === 0) return 0;
    const uf = (currentAddress?.estado || 'SP').toUpperCase().trim();
    let base = 30.0;
    if (uf === 'SP') base = 15.0;
    else if (['RJ', 'MG', 'ES'].includes(uf)) base = 20.0;
    else if (['PR', 'SC', 'RS'].includes(uf)) base = 25.0;

    const extra = Math.max(0, totalItemsCount - 1);
    return base + extra * 2.5;
  }, [subtotal, currentAddress?.estado, totalItemsCount]);

  const orderGrossTotal = subtotal + freight;

  // Coupon selection state: support multiple coupons (RN0033, RN0035, RN0036)
  const [selectedCouponCodes, setSelectedCouponCodes] = useState<string[]>([]);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Split Credit Cards payment
  const [selectedCards, setSelectedCards] = useState<{ [cardId: string]: boolean }>({});
  const [cardAmounts, setCardAmounts] = useState<{ [cardId: string]: string }>({});
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [saveCardToProfile, setSaveCardToProfile] = useState(true);
  const [newCard, setNewCard] = useState<Omit<CreditCard, 'id'>>({
    number: '',
    name: '',
    brand: 'Visa',
    cvv: '',
  });

  // Calculate applied coupons and surplus according to DRS RN0033, RN0035, RN0036
  const couponAnalysis = useMemo(() => {
    setCouponError(null);
    // Preserve selection order by mapping selectedCouponCodes to coupons
    const chosen = selectedCouponCodes
      .map(code => coupons.find(c => c.code === code))
      .filter((c): c is Coupon => c !== undefined);
    
    // Check RN0033: only one promotional coupon
    const promoCount = chosen.filter(c => c.type === 'promocional').length;
    let promoError = promoCount > 1 ? 'RN0033: Apenas um cupom promocional pode ser utilizado por compra.' : null;

    // Check RN0036: prevent unnecessary surplus coupons
    let sum = 0;
    let unnecessary = false;
    let unnecessaryMessage = '';
    const validCoupons: Coupon[] = [];

    for (const c of chosen) {
      if (sum >= orderGrossTotal) {
        unnecessary = true;
        unnecessaryMessage = `RN0036: O cupom ${c.code} é desnecessário pois os cupons anteriores já cobrem a totalidade da compra (R$ ${orderGrossTotal.toFixed(2)}).`;
        break;
      }
      sum += Number(c.value) || 0;
      validCoupons.push(c);
    }

    const discount = Math.min(sum, orderGrossTotal);
    const surplusExchangeCouponValue = sum > orderGrossTotal ? parseFloat((sum - orderGrossTotal).toFixed(2)) : 0;
    const remainingToPay = parseFloat(Math.max(0, orderGrossTotal - discount).toFixed(2));

    return {
      promoError,
      unnecessary,
      unnecessaryMessage,
      validCoupons,
      totalCouponsValue: sum,
      discount,
      surplusExchangeCouponValue,
      remainingToPay,
    };
  }, [selectedCouponCodes, coupons, orderGrossTotal]);

  useEffect(() => {
    if (couponAnalysis.promoError) {
      setCouponError(couponAnalysis.promoError);
    } else if (couponAnalysis.unnecessary) {
      setCouponError(couponAnalysis.unnecessaryMessage);
    } else {
      setCouponError(null);
    }
  }, [couponAnalysis]);

  const totalPaidByCards = Object.entries(selectedCards)
    .filter(([_, isChecked]) => isChecked)
    .reduce((sum, [cardId]) => sum + (parseFloat(cardAmounts[cardId]) || 0), 0);

  const cardPaymentDifference = parseFloat((couponAnalysis.remainingToPay - totalPaidByCards).toFixed(2));

  // Address Handlers
  const handleAddNewAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.logradouro || !newAddress.numero || !newAddress.cep || !newAddress.cidade) {
      alert('Preencha os campos obrigatórios do endereço (RN0023).');
      return;
    }
    const mockId = `addr-${Date.now()}`;
    const created = { ...newAddress, id: mockId };
    customer.addresses.push(created);
    setSelectedAddressId(mockId);
    setShowNewAddressForm(false);
  };

  // Card Handlers
  const handleCardToggle = (cardId: string) => {
    setSelectedCards(prev => {
      const updated = { ...prev, [cardId]: !prev[cardId] };
      if (updated[cardId]) {
        // Auto-fill remaining if single checked
        const currentOtherCardsTotal = Object.entries(cardAmounts)
          .filter(([id]) => id !== cardId && updated[id])
          .reduce((sum, [id]) => sum + (parseFloat(cardAmounts[id]) || 0), 0);
        const autoAmount = Math.max(0, couponAnalysis.remainingToPay - currentOtherCardsTotal);
        setCardAmounts(prevAmt => ({ ...prevAmt, [cardId]: autoAmount > 0 ? autoAmount.toFixed(2) : '' }));
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

  const handleAddNewCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCreditCard(newCard.number)) {
      alert('Número de cartão de crédito inválido (algoritmo de Luhn).');
      return;
    }
    const mockId = `card-${Date.now()}`;
    const brandName = newCard.brand || detectCardBrand(newCard.number) || 'Visa';
    const clean = newCard.number.replace(/\D/g, '');
    const censoredNumber = `**** **** **** ${clean.slice(-4) || '1234'}`;
    const addedCard: CreditCard = {
      id: mockId,
      number: censoredNumber,
      name: newCard.name.toUpperCase(),
      brand: brandName,
      cvv: newCard.cvv || '999',
    };
    customer.cards.push(addedCard);
    setShowNewCardForm(false);
    setSelectedCards(prev => ({ ...prev, [mockId]: true }));
    const autoAmount = Math.max(0, couponAnalysis.remainingToPay - totalPaidByCards);
    setCardAmounts(prev => ({ ...prev, [mockId]: autoAmount > 0 ? autoAmount.toFixed(2) : '' }));
    setNewCard({ number: '', name: '', brand: 'Visa', cvv: '' });
  };

  // Coupon Toggle
  const handleCouponToggle = (code: string) => {
    setSelectedCouponCodes(prev => {
      if (prev.includes(code)) {
        return prev.filter(c => c !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  // Submit Order Finalization
  const handleFinishPurchase = () => {
    if (cartItems.length === 0) return;
    
    // Address resolution
    let deliveryAddress: Address | undefined;
    if (showNewAddressForm) {
      if (!newAddress.logradouro || !newAddress.numero || !newAddress.cep || !newAddress.cidade) {
        alert('Por favor, complete todos os campos do novo endereço (RN0023).');
        return;
      }
      deliveryAddress = { ...newAddress, id: `temp-${Date.now()}` };
    } else {
      deliveryAddress = customer.addresses.find(a => a.id === selectedAddressId) || customer.addresses[0];
    }

    if (!deliveryAddress) {
      alert('Selecione um endereço de entrega.');
      return;
    }

    // Coupon validations
    if (couponAnalysis.promoError) {
      alert(couponAnalysis.promoError);
      return;
    }
    if (couponAnalysis.unnecessary) {
      alert(couponAnalysis.unnecessaryMessage);
      return;
    }

    // Payment validation
    const checkedCardList = Object.entries(selectedCards).filter(([_, isChecked]) => isChecked);
    
    if (couponAnalysis.remainingToPay > 0) {
      if (checkedCardList.length === 0) {
        alert('Selecione ao menos um cartão de crédito para cobrir o restante do valor.');
        return;
      }

      if (Math.abs(cardPaymentDifference) > 0.05) {
        alert(
          `O valor distribuído nos cartões (R$ ${totalPaidByCards.toFixed(2)}) não corresponde ao saldo a pagar (R$ ${couponAnalysis.remainingToPay.toFixed(2)}).`
        );
        return;
      }

      // Validate RN0034 and RN0035
      const hasCouponsApplied = couponAnalysis.discount > 0;
      for (const [cId] of checkedCardList) {
        const val = parseFloat(cardAmounts[cId]) || 0;
        if (!hasCouponsApplied && val < 10.0) {
          alert(`RN0034: Cada cartão de crédito deve ter no mínimo R$ 10,00 quando não houver cupons combinados.`);
          return;
        }
      }
    } else {
      if (checkedCardList.length > 0 && totalPaidByCards > 0) {
        alert('A compra já foi quitada por cupons. Desmarque os cartões de crédito.');
        return;
      }
    }

    const cardsPayload = checkedCardList.map(([cardId]) => {
      const cardObj = customer.cards.find(c => c.id === cardId);
      return {
        id: cardObj?.id,
        number: cardObj?.number || '**** **** **** 1234',
        name: cardObj?.name || customer.name,
        brand: cardObj?.brand || 'Visa',
        cvv: cardObj?.cvv || '999',
        amount: parseFloat(cardAmounts[cardId]) || 0,
      };
    });

    onCheckout({
      items: cartItems,
      deliveryAddress,
      saveAddressToProfile,
      cards: cardsPayload,
      saveCardToProfile,
      selectedCoupons: couponAnalysis.validCoupons,
      subtotal,
      freight,
      discount: couponAnalysis.discount,
      total: orderGrossTotal,
      surplusExchangeCouponValue: couponAnalysis.surplusExchangeCouponValue,
    });
  };

  const addressTypeOptions = [
    { value: 'entrega', label: 'Entrega' },
    { value: 'cobranca', label: 'Cobrança' },
  ];

  const brandOptions = [
    { value: 'Visa', label: 'Visa' },
    { value: 'Mastercard', label: 'Mastercard' },
    { value: 'Elo', label: 'Elo' },
    { value: 'Amex', label: 'Amex' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left font-sans animate-in fade-in duration-200" data-cy="cart-screen">
      
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white/80 border border-faded-olive/20 rounded-3xl p-6 md:p-8 shadow-sm" data-cy="cart-items-container">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif font-bold text-2xl text-vinyl-black" data-cy="cart-title">
              Seu Carrinho de Compras
            </h3>
            <span className="text-xs font-bold px-3 py-1 bg-warm-amber/10 text-warm-amber rounded-full">
              {totalItemsCount} {totalItemsCount === 1 ? 'disco' : 'discos'}
            </span>
          </div>
          
          {cartItems.length === 0 ? (
            <div className="py-12 text-center text-faded-olive/60" data-cy="empty-cart-message">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="font-serif text-lg font-bold text-vinyl-black">O carrinho está vazio</p>
              <p className="text-xs mt-1">Adicione discos de vinil a partir do catálogo.</p>
            </div>
          ) : (
            <div className="divide-y divide-faded-olive/10" data-cy="cart-items-list">
              {cartItems.map(item => (
                <div key={item.vinyl.id} className="py-6 flex flex-col sm:flex-row gap-4 items-center justify-between first:pt-0 last:pb-0" data-cy={`cart-item-${item.vinyl.id}`}>
                  <div className="flex gap-4 items-center w-full sm:w-auto">
                    <img
                      src={item.vinyl.coverUrl}
                      alt={item.vinyl.title}
                      className="w-16 h-16 rounded-xl object-cover bg-black border border-neutral-700 shadow-sm"
                    />
                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-base text-vinyl-black truncate" data-cy="item-title">
                        {item.vinyl.title}
                      </h4>
                      <p className="text-xs text-faded-olive font-bold mt-0.5">{item.vinyl.artist}</p>
                      <p className="text-xs text-warm-amber font-bold mt-1">
                        R$ {item.vinyl.price.toFixed(2)} cada
                      </p>
                    </div>
                  </div>

                  {/* Quantity and removal */}
                  <div className="flex items-center gap-6 justify-between w-full sm:w-auto">
                    <div className="flex items-center border border-faded-olive/30 rounded-xl overflow-hidden bg-paper-white" data-cy={`qty-box-${item.vinyl.id}`}>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.vinyl.id, item.quantity - 1)}
                        className="px-3 py-1.5 text-xs text-faded-olive hover:bg-faded-olive/10 border-none cursor-pointer"
                        data-cy={`btn-decrease-${item.vinyl.id}`}
                      >
                        -
                      </button>
                      <span className="px-3 text-sm font-bold text-vinyl-black select-none" data-cy={`qty-val-${item.vinyl.id}`}>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.vinyl.id, item.quantity + 1)}
                        disabled={item.quantity >= item.vinyl.stock}
                        className="px-3 py-1.5 text-xs text-faded-olive hover:bg-faded-olive/10 border-none disabled:opacity-40 cursor-pointer"
                        data-cy={`btn-increase-${item.vinyl.id}`}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.vinyl.id)}
                      className="text-neutral-400 hover:text-rose-600 transition cursor-pointer p-1.5 border-none bg-transparent"
                      title="Remover do carrinho"
                      data-cy={`btn-remove-${item.vinyl.id}`}
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

        {cartItems.length > 0 && (
          <div className="bg-white/80 border border-faded-olive/20 rounded-3xl p-6 md:p-8 shadow-sm" data-cy="address-selection-container">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif font-bold text-xl text-vinyl-black">1. Endereço de Entrega</h3>
                <p className="text-xs text-faded-olive mt-0.5">Selecione um endereço cadastrado ou cadastre um novo para esta compra.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                className="text-xs font-bold text-warm-amber hover:underline cursor-pointer border-none bg-transparent"
                data-cy="btn-toggle-new-address"
              >
                {showNewAddressForm ? 'Usar Cadastrado' : '+ Novo Endereço'}
              </button>
            </div>

            {showNewAddressForm ? (
              <form onSubmit={handleAddNewAddressSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4" data-cy="form-new-address">
                <Select
                  label="Tipo de Endereço *"
                  value={newAddress.type}
                  onChange={e => setNewAddress(prev => ({ ...prev, type: e.target.value as 'cobranca' | 'entrega' }))}
                  options={addressTypeOptions}
                  data-cy="input-new-addr-type"
                />
                <Input
                  label="Tipo de Residência *"
                  type="text"
                  required
                  value={newAddress.tipoResidencia}
                  onChange={e => setNewAddress(prev => ({ ...prev, tipoResidencia: e.target.value }))}
                  placeholder="Apartamento, Casa, etc"
                  data-cy="input-new-addr-residence"
                />
                <Input
                  label="Tipo de Logradouro *"
                  type="text"
                  required
                  value={newAddress.tipoLogradouro}
                  onChange={e => setNewAddress(prev => ({ ...prev, tipoLogradouro: e.target.value }))}
                  placeholder="Rua, Avenida, Alameda..."
                  data-cy="input-new-addr-street-type"
                />
                <Input
                  label="Logradouro *"
                  type="text"
                  required
                  value={newAddress.logradouro}
                  onChange={e => setNewAddress(prev => ({ ...prev, logradouro: e.target.value }))}
                  placeholder="Nome do logradouro"
                  data-cy="input-new-addr-street"
                />
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    label="Número *"
                    type="text"
                    required
                    value={newAddress.numero}
                    onChange={e => setNewAddress(prev => ({ ...prev, numero: e.target.value }))}
                    wrapperClassName="col-span-1"
                    data-cy="input-new-addr-number"
                  />
                  <Input
                    label="CEP *"
                    type="text"
                    required
                    value={newAddress.cep}
                    onChange={e => setNewAddress(prev => ({ ...prev, cep: maskCEP(e.target.value) }))}
                    placeholder="00000-000"
                    wrapperClassName="col-span-2"
                    data-cy="input-new-addr-cep"
                  />
                </div>
                <Input
                  label="Bairro *"
                  type="text"
                  required
                  value={newAddress.bairro}
                  onChange={e => setNewAddress(prev => ({ ...prev, bairro: e.target.value }))}
                  data-cy="input-new-addr-bairro"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Cidade *"
                    type="text"
                    required
                    value={newAddress.cidade}
                    onChange={e => setNewAddress(prev => ({ ...prev, cidade: e.target.value }))}
                    data-cy="input-new-addr-city"
                  />
                  <Input
                    label="Estado (UF) *"
                    type="text"
                    required
                    maxLength={2}
                    value={newAddress.estado}
                    onChange={e => setNewAddress(prev => ({ ...prev, estado: e.target.value.toUpperCase() }))}
                    placeholder="SP"
                    data-cy="input-new-addr-state"
                  />
                </div>

                <div className="col-span-full pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-vinyl-black cursor-pointer bg-warm-amber/5 p-3 rounded-xl border border-warm-amber/20">
                    <input
                      type="checkbox"
                      checked={saveAddressToProfile}
                      onChange={e => setSaveAddressToProfile(e.target.checked)}
                      className="accent-warm-amber w-4 h-4"
                      data-cy="chk-save-addr-profile"
                    />
                    <span>Incorporar este novo endereço ao meu perfil</span>
                  </label>
                </div>
              </form>
            ) : (
              <div className="space-y-3" data-cy="saved-addresses-list">
                {customer.addresses.map(addr => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-4 p-4 rounded-2xl border transition cursor-pointer ${
                      selectedAddressId === addr.id
                        ? 'border-warm-amber bg-warm-amber/5'
                        : 'border-faded-olive/20 hover:border-faded-olive/40 bg-transparent'
                    }`}
                    data-cy={`addr-card-${addr.id}`}
                  >
                    <input
                      type="radio"
                      name="deliveryAddress"
                      value={addr.id}
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1 accent-warm-amber"
                      data-cy={`radio-addr-${addr.id}`}
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

      {/* RIGHT COLUMN: Order Summary, Coupons & Combined Payments */}
      {cartItems.length > 0 && (
        <div className="space-y-6">
          <div className="bg-white/80 border border-faded-olive/20 rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="font-serif font-bold text-xl text-vinyl-black mb-4">2. Pagamento & Finalização</h3>
            
            <div className="space-y-3 text-sm pb-6 border-b border-faded-olive/10">
              <div className="flex justify-between">
                <span className="text-faded-olive">Subtotal dos Discos</span>
                <span className="font-semibold text-vinyl-black" data-cy="cart-subtotal">R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-faded-olive">Frete</span>
                  <span className="text-[10px] text-faded-olive/70 block">
                    (Base estadual: {currentAddress?.estado || 'SP'} + taxa por disco adicional)
                  </span>
                </div>
                <span className="font-semibold text-vinyl-black" data-cy="cart-freight">R$ {freight.toFixed(2)}</span>
              </div>

              <div className="pt-2">
                <label className="text-xs font-bold text-faded-olive block mb-2">
                  Cupons Disponíveis (Troca e Promocionais)
                </label>
                
                {couponError && (
                  <div className="mb-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold" data-cy="coupon-error-banner">
                    {couponError}
                  </div>
                )}

                <div className="space-y-2 max-h-44 overflow-y-auto pr-1" data-cy="coupons-checkbox-list">
                  {coupons.map(cp => {
                    const isChecked = selectedCouponCodes.includes(cp.code);
                    return (
                      <label
                        key={cp.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                          isChecked ? 'border-warm-amber bg-warm-amber/10' : 'border-faded-olive/20 hover:border-faded-olive/40'
                        }`}
                        data-cy={`coupon-row-${cp.code}`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCouponToggle(cp.code)}
                            className="accent-warm-amber"
                            data-cy={`chk-coupon-${cp.code}`}
                          />
                          <div>
                            <span className="font-bold text-vinyl-black">{cp.code}</span>
                            <span className="ml-1 text-[10px] text-faded-olive uppercase">
                              ({cp.type === 'troca' ? 'Troca' : 'Promocional'})
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-warm-amber">R$ {Number(cp.value).toFixed(2)}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {couponAnalysis.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Desconto Aplicado</span>
                  <span data-cy="cart-discount">- R$ {couponAnalysis.discount.toFixed(2)}</span>
                </div>
              )}

              {/* Surplus exchange coupon notification (RN0036) */}
              {couponAnalysis.surplusExchangeCouponValue > 0 && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1" data-cy="surplus-coupon-notice">
                  <p className="font-bold">Emissão de Cupom de Troca (RN0036):</p>
                  <p>
                    O valor dos cupons superou a compra. Será gerado um novo cupom de troca de{' '}
                    <strong className="text-emerald-950 font-black">R$ {couponAnalysis.surplusExchangeCouponValue.toFixed(2)}</strong> com a diferença!
                  </p>
                </div>
              )}

              <div className="flex justify-between text-base font-bold pt-2 border-t border-faded-olive/10 text-vinyl-black">
                <span>Total do Pedido</span>
                <span className="text-warm-amber" data-cy="cart-total">R$ {orderGrossTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm font-bold text-vinyl-black bg-faded-olive/5 p-2 rounded-xl">
                <span>Resta Pagar com Cartão:</span>
                <span className={couponAnalysis.remainingToPay > 0 ? 'text-warm-amber' : 'text-emerald-700'} data-cy="remaining-to-pay">
                  R$ {couponAnalysis.remainingToPay.toFixed(2)}
                </span>
              </div>
            </div>

            {couponAnalysis.remainingToPay > 0 && (
              <div className="py-4 space-y-4" data-cy="cards-payment-section">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-faded-olive">
                      Cartões de Crédito (RN0034)
                    </h4>
                    <span className="text-[10px] text-faded-olive/70 block">
                      {couponAnalysis.discount > 0
                        ? 'Exceção RN0035: cupom aplicado permite cartão < R$ 10,00'
                        : 'Mínimo de R$ 10,00 por cartão'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNewCardForm(!showNewCardForm)}
                    className="text-[11px] font-bold text-warm-amber hover:underline bg-transparent border-none cursor-pointer"
                    data-cy="btn-toggle-new-card"
                  >
                    {showNewCardForm ? 'Cancelar' : '+ Novo Cartão'}
                  </button>
                </div>

                {showNewCardForm ? (
                  <form onSubmit={handleAddNewCardSubmit} className="space-y-3 p-4 bg-faded-olive/5 border border-faded-olive/20 rounded-2xl" data-cy="form-new-card">
                    <Input
                      label="Número do Cartão *"
                      type="text"
                      required
                      value={newCard.number}
                      onChange={e => setNewCard(prev => ({ ...prev, number: maskCreditCard(e.target.value) }))}
                      placeholder="0000 0000 0000 0000"
                      className="py-1.5 text-xs"
                      data-cy="input-new-card-number"
                    />
                    <Input
                      label="Nome Impresso *"
                      type="text"
                      required
                      value={newCard.name}
                      onChange={e => setNewCard(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome no cartão"
                      className="py-1.5 text-xs"
                      data-cy="input-new-card-name"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        label="Bandeira (RN0025) *"
                        value={newCard.brand}
                        onChange={e => setNewCard(prev => ({ ...prev, brand: e.target.value }))}
                        options={brandOptions}
                        className="py-1.5 text-xs"
                        data-cy="select-new-card-brand"
                      />
                      <Input
                        label="CVV *"
                        type="text"
                        required
                        maxLength={4}
                        value={newCard.cvv}
                        onChange={e => setNewCard(prev => ({ ...prev, cvv: maskCVV(e.target.value) }))}
                        placeholder="123"
                        className="py-1.5 text-xs"
                        data-cy="input-new-card-cvv"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-xs font-bold text-vinyl-black cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={saveCardToProfile}
                        onChange={e => setSaveCardToProfile(e.target.checked)}
                        className="accent-warm-amber w-4 h-4"
                        data-cy="chk-save-card-profile"
                      />
                      <span>Incorporar este novo cartão ao meu perfil</span>
                    </label>

                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="w-full mt-2"
                      data-cy="btn-save-new-card"
                    >
                      Adicionar e Selecionar
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-3" data-cy="saved-cards-list">
                    {customer.cards.map(card => {
                      const isChecked = selectedCards[card.id] || false;
                      return (
                        <div
                          key={card.id}
                          className={`p-3 rounded-2xl border flex flex-col gap-2.5 transition ${
                            isChecked ? 'border-warm-amber bg-warm-amber/5' : 'border-faded-olive/20 bg-transparent'
                          }`}
                          data-cy={`card-row-${card.id}`}
                        >
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleCardToggle(card.id)}
                              className="accent-warm-amber"
                              data-cy={`chk-card-${card.id}`}
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
                              <span className="text-[11px] text-faded-olive font-bold">Valor:</span>
                              <div className="relative flex-1">
                                <span className="absolute left-2.5 top-1 text-[11px] text-faded-olive">R$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="0,00"
                                  value={cardAmounts[card.id] || ''}
                                  onChange={e => handleCardAmountChange(card.id, e.target.value)}
                                  className="w-full bg-paper-white border border-faded-olive/40 rounded-lg pl-8 pr-2.5 py-1 text-xs focus:outline-none text-vinyl-black font-bold"
                                  data-cy={`input-card-amount-${card.id}`}
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
            )}

            {/* Difference & Status details */}
            <div className="mt-4 pt-4 border-t border-faded-olive/10 text-xs space-y-2">
              <div className="flex justify-between font-medium">
                <span className="text-faded-olive">Total pago nos cartões:</span>
                <span className="text-vinyl-black" data-cy="total-cards-paid">R$ {totalPaidByCards.toFixed(2)}</span>
              </div>

              <div className="flex justify-between font-bold">
                {cardPaymentDifference > 0 ? (
                  <>
                    <span className="text-rose-600">Restante a distribuir:</span>
                    <span className="text-rose-600" data-cy="payment-difference">R$ {cardPaymentDifference.toFixed(2)}</span>
                  </>
                ) : cardPaymentDifference < 0 ? (
                  <>
                    <span className="text-rose-600">Excesso nos cartões:</span>
                    <span className="text-rose-600">R$ {Math.abs(cardPaymentDifference).toFixed(2)}</span>
                  </>
                ) : (
                  <>
                    <span className="text-emerald-700">Pagamento conferido:</span>
                    <span className="text-emerald-700" data-cy="payment-status-ok">100% Coberto!</span>
                  </>
                )}
              </div>
            </div>

            <Button
              onClick={handleFinishPurchase}
              disabled={
                cartItems.length === 0 ||
                !!couponAnalysis.promoError ||
                couponAnalysis.unnecessary ||
                (couponAnalysis.remainingToPay > 0 && Math.abs(cardPaymentDifference) > 0.05)
              }
              variant="primary"
              className="w-full mt-6"
              data-cy="btn-finish-checkout"
            >
              Finalizar Compra
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
