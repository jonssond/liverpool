import { useState } from 'react';
import type { Customer, Address } from '../../mockData';

interface CustomerCrudProps {
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
}

export default function CustomerCrud({ customers, onAddCustomer, onUpdateCustomer }: CustomerCrudProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateCustId, setDeactivateCustId] = useState('');
  const [deactivateReason, setDeactivateReason] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [gender, setGender] = useState('Masculino');
  const [birthdate, setBirthdate] = useState('');
  const [phone, setPhone] = useState('');
  
  // Addresses in forms
  const [delivStreet, setDelivStreet] = useState('');
  const [delivNum, setDelivNum] = useState('');
  const [delivCep, setDelivCep] = useState('');
  const [delivCity, setDelivCity] = useState('');
  
  const [billStreet, setBillStreet] = useState('');
  const [billNum, setBillNum] = useState('');
  const [billCep, setBillCep] = useState('');
  const [billCity, setBillCity] = useState('');

  // Credit Card in form
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardBrand, setCardBrand] = useState('Visa');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !cpf) return;

    const mockId = `cust-${Date.now()}`;
    const newCustomer: Customer = {
      id: mockId,
      name,
      email,
      cpf,
      gender,
      birthdate,
      phone,
      active: true,
      addresses: [
        {
          id: `addr-${Date.now()}-1`,
          type: 'entrega',
          tipoResidencia: 'Casa',
          tipoLogradouro: 'Rua',
          logradouro: delivStreet,
          numero: delivNum,
          bairro: 'Centro',
          cep: delivCep,
          cidade: delivCity,
          estado: 'SP',
          pais: 'Brasil'
        },
        {
          id: `addr-${Date.now()}-2`,
          type: 'cobranca',
          tipoResidencia: 'Casa',
          tipoLogradouro: 'Rua',
          logradouro: billStreet,
          numero: billNum,
          bairro: 'Centro',
          cep: billCep,
          cidade: billCity,
          estado: 'SP',
          pais: 'Brasil'
        }
      ],
      cards: [
        {
          id: `card-${Date.now()}`,
          number: `**** **** **** ${cardNumber.slice(-4) || '5678'}`,
          name: cardName.toUpperCase() || name.toUpperCase(),
          brand: cardBrand,
          cvv: '999'
        }
      ]
    };

    onAddCustomer(newCustomer);
    setShowAddForm(false);
    resetForms();
  };

  const handleEditInit = (cust: Customer) => {
    setSelectedCustomer(cust);
    setName(cust.name);
    setEmail(cust.email);
    setCpf(cust.cpf);
    setGender(cust.gender);
    setBirthdate(cust.birthdate);
    setPhone(cust.phone);

    const delivery = cust.addresses.find(a => a.type === 'entrega');
    const billing = cust.addresses.find(a => a.type === 'cobranca');
    setDelivStreet(delivery?.logradouro || '');
    setDelivNum(delivery?.numero || '');
    setDelivCep(delivery?.cep || '');
    setDelivCity(delivery?.cidade || '');

    setBillStreet(billing?.logradouro || '');
    setBillNum(billing?.numero || '');
    setBillCep(billing?.cep || '');
    setBillCity(billing?.cidade || '');

    setShowEditForm(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const updatedCustomer: Customer = {
      ...selectedCustomer,
      name,
      email,
      cpf,
      gender,
      birthdate,
      phone,
      addresses: [
        {
          ...(selectedCustomer.addresses.find(a => a.type === 'entrega') || selectedCustomer.addresses[0] || {}),
          id: selectedCustomer.addresses.find(a => a.type === 'entrega')?.id || 'addr-deliv-edit',
          type: 'entrega',
          logradouro: delivStreet,
          numero: delivNum,
          cep: delivCep,
          cidade: delivCity
        } as Address,
        {
          ...(selectedCustomer.addresses.find(a => a.type === 'cobranca') || selectedCustomer.addresses[1] || {}),
          id: selectedCustomer.addresses.find(a => a.type === 'cobranca')?.id || 'addr-bill-edit',
          type: 'cobranca',
          logradouro: billStreet,
          numero: billNum,
          cep: billCep,
          cidade: billCity
        } as Address
      ]
    };

    onUpdateCustomer(updatedCustomer);
    setShowEditForm(false);
    setSelectedCustomer(null);
    resetForms();
  };

  const initDeactivate = (id: string) => {
    setDeactivateCustId(id);
    setDeactivateReason('');
    setShowDeactivateModal(true);
  };

  const handleDeactivateConfirm = () => {
    if (!deactivateReason.trim()) {
      alert('Por favor, informe a justificativa da inativação.');
      return;
    }

    const customer = customers.find(c => c.id === deactivateCustId);
    if (customer) {
      const updated = { ...customer, active: false };
      onUpdateCustomer(updated);
      alert(`Cliente ${customer.name} inativado. Motivo: ${deactivateReason}`);
    }
    setShowDeactivateModal(false);
  };

  const handleActivate = (cust: Customer) => {
    const updated = { ...cust, active: true };
    onUpdateCustomer(updated);
    alert(`Cliente ${cust.name} ativado com sucesso.`);
  };

  const resetForms = () => {
    setName('');
    setEmail('');
    setCpf('');
    setGender('Masculino');
    setBirthdate('');
    setPhone('');
    setDelivStreet('');
    setDelivNum('');
    setDelivCep('');
    setDelivCity('');
    setBillStreet('');
    setBillNum('');
    setBillCep('');
    setBillCity('');
    setCardNumber('');
    setCardName('');
    setCardBrand('Visa');
  };

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Customer List Header */}
      <div className="bg-white/80 border border-faded-olive/20 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-serif font-bold text-2xl text-vinyl-black">Painel de Clientes (Admin Only)</h3>
          <button
            onClick={() => { resetForms(); setShowAddForm(true); }}
            className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-warm-amber hover:bg-warm-amber/90 text-paper-white cursor-pointer border-none shadow-sm active:scale-95"
          >
            + Cadastrar Cliente
          </button>
        </div>

        {/* List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-faded-olive/20 text-faded-olive font-bold text-xs uppercase tracking-wider">
                <th className="pb-3 text-left">Nome</th>
                <th className="pb-3 text-left">CPF</th>
                <th className="pb-3 text-left">E-mail</th>
                <th className="pb-3 text-left">Telefone</th>
                <th className="pb-3 text-left">Status</th>
                <th className="pb-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-faded-olive/10">
              {customers.map(cust => (
                <tr key={cust.id} className="hover:bg-faded-olive/5 transition">
                  <td className="py-4 font-bold text-vinyl-black">{cust.name}</td>
                  <td className="py-4 font-mono text-xs text-faded-olive">{cust.cpf}</td>
                  <td className="py-4 text-vinyl-black">{cust.email}</td>
                  <td className="py-4 text-xs text-faded-olive">{cust.phone}</td>
                  <td className="py-4">
                    <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                      cust.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {cust.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEditInit(cust)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-faded-olive border border-faded-olive/40 hover:bg-faded-olive/5 cursor-pointer"
                    >
                      Alterar
                    </button>
                    {cust.active ? (
                      <button
                        onClick={() => initDeactivate(cust.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                      >
                        Inativar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(cust)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                      >
                        Reativar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD CUSTOMER FORM MODAL */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-vinyl-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl h-[90vh] overflow-y-auto bg-paper-white border border-faded-olive/20 rounded-3xl p-6 md:p-8 shadow-2xl relative scrollbar-thin">
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 text-faded-olive hover:text-vinyl-black transition cursor-pointer p-1"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="font-serif font-bold text-2xl text-vinyl-black mb-6 border-b border-faded-olive/10 pb-4">
              Cadastrar Novo Cliente
            </h3>

            <form onSubmit={handleCreate} className="space-y-6">
              {/* Profile details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-faded-olive">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-faded-olive">E-mail</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-faded-olive">CPF</label>
                  <input
                    type="text"
                    required
                    value={cpf}
                    onChange={e => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-faded-olive">Gênero</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-faded-olive">Data de Nascimento</label>
                  <input
                    type="date"
                    required
                    value={birthdate}
                    onChange={e => setBirthdate(e.target.value)}
                    className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-faded-olive">Telefone</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Celular (11) 99999-9999"
                    className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div className="border-t border-faded-olive/10 pt-4">
                <h4 className="font-serif font-bold text-lg text-vinyl-black mb-3">Endereço de Entrega</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2 flex flex-col space-y-1">
                    <label className="text-xs font-bold text-faded-olive">Rua / Logradouro</label>
                    <input
                      type="text"
                      required
                      value={delivStreet}
                      onChange={e => setDelivStreet(e.target.value)}
                      className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-faded-olive">Número</label>
                    <input
                      type="text"
                      required
                      value={delivNum}
                      onChange={e => setDelivNum(e.target.value)}
                      className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-faded-olive">CEP</label>
                    <input
                      type="text"
                      required
                      value={delivCep}
                      onChange={e => setDelivCep(e.target.value)}
                      placeholder="00000-000"
                      className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-col space-y-1">
                    <label className="text-xs font-bold text-faded-olive">Cidade</label>
                    <input
                      type="text"
                      required
                      value={delivCity}
                      onChange={e => setDelivCity(e.target.value)}
                      className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                    />
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="border-t border-faded-olive/10 pt-4">
                <h4 className="font-serif font-bold text-lg text-vinyl-black mb-3">Endereço de Cobrança</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2 flex flex-col space-y-1">
                    <label className="text-xs font-bold text-faded-olive">Rua / Logradouro</label>
                    <input
                      type="text"
                      required
                      value={billStreet}
                      onChange={e => setBillStreet(e.target.value)}
                      className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-faded-olive">Número</label>
                    <input
                      type="text"
                      required
                      value={billNum}
                      onChange={e => setBillNum(e.target.value)}
                      className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-faded-olive">CEP</label>
                    <input
                      type="text"
                      required
                      value={billCep}
                      onChange={e => setBillCep(e.target.value)}
                      placeholder="00000-000"
                      className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-col space-y-1">
                    <label className="text-xs font-bold text-faded-olive">Cidade</label>
                    <input
                      type="text"
                      required
                      value={billCity}
                      onChange={e => setBillCity(e.target.value)}
                      className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                    />
                  </div>
                </div>
              </div>

              {/* Credit Card */}
              <div className="border-t border-faded-olive/10 pt-4">
                <h4 className="font-serif font-bold text-lg text-vinyl-black mb-3">Cartão de Crédito Inicial</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-faded-olive">Número do Cartão</label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      placeholder="XXXX XXXX XXXX XXXX"
                      className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-faded-olive">Nome Impresso</label>
                    <input
                      type="text"
                      required
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                      className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-faded-olive">Bandeira</label>
                    <select
                      value={cardBrand}
                      onChange={e => setCardBrand(e.target.value)}
                      className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                    >
                      <option value="Visa">Visa</option>
                      <option value="Mastercard">Mastercard</option>
                      <option value="Elo">Elo</option>
                      <option value="Amex">Amex</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3 bg-warm-amber hover:bg-warm-amber/90 text-paper-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer border-none shadow-md"
                >
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CUSTOMER FORM MODAL */}
      {showEditForm && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-vinyl-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl h-[90vh] overflow-y-auto bg-paper-white border border-faded-olive/20 rounded-3xl p-6 md:p-8 shadow-2xl relative scrollbar-thin">
            <button
              onClick={() => { setShowEditForm(false); setSelectedCustomer(null); }}
              className="absolute top-4 right-4 text-faded-olive hover:text-vinyl-black transition cursor-pointer p-1"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="font-serif font-bold text-2xl text-vinyl-black mb-6 border-b border-faded-olive/10 pb-4">
              Alterar Dados do Cliente: {selectedCustomer.name}
            </h3>

            <form onSubmit={handleUpdateSubmit} className="space-y-6">
              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-faded-olive">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-faded-olive">E-mail</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-faded-olive">CPF</label>
                  <input
                    type="text"
                    required
                    value={cpf}
                    onChange={e => setCpf(e.target.value)}
                    className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-faded-olive">Gênero</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-faded-olive">Data de Nascimento</label>
                  <input
                    type="date"
                    required
                    value={birthdate}
                    onChange={e => setBirthdate(e.target.value)}
                    className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-faded-olive">Telefone</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                  />
                </div>
              </div>

              {/* Addresses section */}
              <div className="border-t border-faded-olive/10 pt-4">
                <h4 className="font-serif font-bold text-lg text-vinyl-black mb-3">Endereço de Entrega</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2 flex flex-col space-y-1">
                    <label className="text-xs font-bold text-faded-olive">Rua / Logradouro</label>
                    <input
                      type="text"
                      required
                      value={delivStreet}
                      onChange={e => setDelivStreet(e.target.value)}
                      className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-faded-olive">Número</label>
                    <input
                      type="text"
                      required
                      value={delivNum}
                      onChange={e => setDelivNum(e.target.value)}
                      className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-faded-olive">CEP</label>
                    <input
                      type="text"
                      required
                      value={delivCep}
                      onChange={e => setDelivCep(e.target.value)}
                      className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-col space-y-1">
                    <label className="text-xs font-bold text-faded-olive">Cidade</label>
                    <input
                      type="text"
                      required
                      value={delivCity}
                      onChange={e => setDelivCity(e.target.value)}
                      className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-faded-olive/10 pt-4">
                <h4 className="font-serif font-bold text-lg text-vinyl-black mb-3">Endereço de Cobrança</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2 flex flex-col space-y-1">
                    <label className="text-xs font-bold text-faded-olive">Rua / Logradouro</label>
                    <input
                      type="text"
                      required
                      value={billStreet}
                      onChange={e => setBillStreet(e.target.value)}
                      className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-faded-olive">Número</label>
                    <input
                      type="text"
                      required
                      value={billNum}
                      onChange={e => setBillNum(e.target.value)}
                      className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-faded-olive">CEP</label>
                    <input
                      type="text"
                      required
                      value={billCep}
                      onChange={e => setBillCep(e.target.value)}
                      className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-col space-y-1">
                    <label className="text-xs font-bold text-faded-olive">Cidade</label>
                    <input
                      type="text"
                      required
                      value={billCity}
                      onChange={e => setBillCity(e.target.value)}
                      className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-vinyl-black"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3 bg-warm-amber hover:bg-warm-amber/90 text-paper-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer border-none shadow-md"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEACTIVATE COMMENT MODAL */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 bg-vinyl-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-paper-white border border-faded-olive/20 rounded-3xl p-6 md:p-8 shadow-2xl relative text-left">
            <button
              onClick={() => setShowDeactivateModal(false)}
              className="absolute top-4 right-4 text-faded-olive hover:text-vinyl-black transition cursor-pointer p-1"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="font-serif font-bold text-xl text-vinyl-black mb-4">Justificativa de Inativação</h3>
            <p className="text-xs text-faded-olive mb-4">
              Por favor, informe a categoria ou o motivo pelo qual este perfil de cliente está sendo desativado.
            </p>

            <div className="flex flex-col space-y-2">
              <label className="text-xs font-bold text-faded-olive">Motivo / Justificativa</label>
              <textarea
                rows={3}
                required
                value={deactivateReason}
                onChange={e => setDeactivateReason(e.target.value)}
                placeholder="Ex: CPF irregular, solicitação expressa do cliente, inatividade prolongada..."
                className="bg-paper-white border border-faded-olive/40 rounded-xl px-3 py-2 text-xs focus:outline-none placeholder-faded-olive/40 text-vinyl-black"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="flex-1 py-2 rounded-xl bg-transparent border border-faded-olive/40 text-faded-olive font-bold text-xs uppercase cursor-pointer"
              >
                Voltar
              </button>
              <button
                onClick={handleDeactivateConfirm}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-paper-white font-bold text-xs uppercase cursor-pointer border-none shadow-sm"
              >
                Confirmar Inativação
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
