import { useState } from 'react';
import type { Customer, Address } from '../../mockData';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import { Input, Select, Textarea } from '../../components/Input';

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

  const genderOptions = [
    { value: 'Masculino', label: 'Masculino' },
    { value: 'Feminino', label: 'Feminino' },
    { value: 'Outro', label: 'Outro' }
  ];

  const brandOptions = [
    { value: 'Visa', label: 'Visa' },
    { value: 'Mastercard', label: 'Mastercard' },
    { value: 'Elo', label: 'Elo' },
    { value: 'Amex', label: 'Amex' }
  ];

  return (
    <div className="space-y-6 text-left font-sans animate-in fade-in duration-200">
      
      {/* Customer List Header */}
      <div className="bg-white/80 border border-faded-olive/20 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-serif font-bold text-2xl text-vinyl-black">Painel de Clientes (Admin Only)</h3>
          <Button
            onClick={() => { resetForms(); setShowAddForm(true); }}
            variant="primary"
          >
            + Cadastrar Cliente
          </Button>
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
                    <StatusBadge status={cust.active} />
                  </td>
                  <td className="py-4 text-right space-x-2">
                    <Button
                      onClick={() => handleEditInit(cust)}
                      variant="outline"
                      size="sm"
                    >
                      Alterar
                    </Button>
                    {cust.active ? (
                      <Button
                        onClick={() => initDeactivate(cust.id)}
                        variant="danger"
                        size="sm"
                      >
                        Inativar
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleActivate(cust)}
                        variant="success"
                        size="sm"
                      >
                        Reativar
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD CUSTOMER FORM MODAL */}
      <Modal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Cadastrar Novo Cliente"
        maxWidthClass="max-w-4xl"
      >
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Nome Completo" type="text" required value={name} onChange={e => setName(e.target.value)} />
            <Input label="E-mail" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
            <Input label="CPF" type="text" required value={cpf} onChange={e => setCpf(e.target.value)} placeholder="000.000.000-00" />
            <Select label="Gênero" value={gender} onChange={e => setGender(e.target.value)} options={genderOptions} />
            <Input label="Data de Nascimento" type="date" required value={birthdate} onChange={e => setBirthdate(e.target.value)} />
            <Input label="Telefone" type="text" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="Celular (11) 99999-9999" />
          </div>

          <div className="border-t border-faded-olive/10 pt-4">
            <h4 className="font-serif font-bold text-lg text-vinyl-black mb-3">Endereço de Entrega</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input label="Rua / Logradouro" type="text" required value={delivStreet} onChange={e => setDelivStreet(e.target.value)} wrapperClassName="md:col-span-2" />
              <Input label="Número" type="text" required value={delivNum} onChange={e => setDelivNum(e.target.value)} />
              <Input label="CEP" type="text" required value={delivCep} onChange={e => setDelivCep(e.target.value)} placeholder="00000-000" />
              <Input label="Cidade" type="text" required value={delivCity} onChange={e => setDelivCity(e.target.value)} wrapperClassName="md:col-span-2" />
            </div>
          </div>

          <div className="border-t border-faded-olive/10 pt-4">
            <h4 className="font-serif font-bold text-lg text-vinyl-black mb-3">Endereço de Cobrança</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input label="Rua / Logradouro" type="text" required value={billStreet} onChange={e => setBillStreet(e.target.value)} wrapperClassName="md:col-span-2" />
              <Input label="Número" type="text" required value={billNum} onChange={e => setBillNum(e.target.value)} />
              <Input label="CEP" type="text" required value={billCep} onChange={e => setBillCep(e.target.value)} placeholder="00000-000" />
              <Input label="Cidade" type="text" required value={billCity} onChange={e => setBillCity(e.target.value)} wrapperClassName="md:col-span-2" />
            </div>
          </div>

          <div className="border-t border-faded-olive/10 pt-4">
            <h4 className="font-serif font-bold text-lg text-vinyl-black mb-3">Cartão de Crédito Inicial</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Número do Cartão" type="text" required value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="XXXX XXXX XXXX XXXX" />
              <Input label="Nome Impresso" type="text" required value={cardName} onChange={e => setCardName(e.target.value)} />
              <Select label="Bandeira" value={cardBrand} onChange={e => setCardBrand(e.target.value)} options={brandOptions} />
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" variant="primary" className="w-full">
              Confirmar Cadastro
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT CUSTOMER FORM MODAL */}
      <Modal
        isOpen={showEditForm}
        onClose={() => { setShowEditForm(false); setSelectedCustomer(null); }}
        title={`Alterar Dados do Cliente: ${selectedCustomer?.name}`}
        maxWidthClass="max-w-4xl"
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Nome Completo" type="text" required value={name} onChange={e => setName(e.target.value)} />
            <Input label="E-mail" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
            <Input label="CPF" type="text" required value={cpf} onChange={e => setCpf(e.target.value)} />
            <Select label="Gênero" value={gender} onChange={e => setGender(e.target.value)} options={genderOptions} />
            <Input label="Data de Nascimento" type="date" required value={birthdate} onChange={e => setBirthdate(e.target.value)} />
            <Input label="Telefone" type="text" required value={phone} onChange={e => setPhone(e.target.value)} />
          </div>

          <div className="border-t border-faded-olive/10 pt-4">
            <h4 className="font-serif font-bold text-lg text-vinyl-black mb-3">Endereço de Entrega</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input label="Rua / Logradouro" type="text" required value={delivStreet} onChange={e => setDelivStreet(e.target.value)} wrapperClassName="md:col-span-2" />
              <Input label="Número" type="text" required value={delivNum} onChange={e => setDelivNum(e.target.value)} />
              <Input label="CEP" type="text" required value={delivCep} onChange={e => setDelivCep(e.target.value)} />
              <Input label="Cidade" type="text" required value={delivCity} onChange={e => setDelivCity(e.target.value)} wrapperClassName="md:col-span-2" />
            </div>
          </div>

          <div className="border-t border-faded-olive/10 pt-4">
            <h4 className="font-serif font-bold text-lg text-vinyl-black mb-3">Endereço de Cobrança</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input label="Rua / Logradouro" type="text" required value={billStreet} onChange={e => setBillStreet(e.target.value)} wrapperClassName="md:col-span-2" />
              <Input label="Número" type="text" required value={billNum} onChange={e => setBillNum(e.target.value)} />
              <Input label="CEP" type="text" required value={billCep} onChange={e => setBillCep(e.target.value)} />
              <Input label="Cidade" type="text" required value={billCity} onChange={e => setBillCity(e.target.value)} wrapperClassName="md:col-span-2" />
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" variant="primary" className="w-full">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Modal>

      {/* DEACTIVATE COMMENT MODAL */}
      <Modal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        title="Justificativa de Inativação"
        maxWidthClass="max-w-md"
      >
        <p className="text-xs text-faded-olive mb-4">
          Por favor, informe a categoria ou o motivo pelo qual este perfil de cliente está sendo desativado.
        </p>
        <Textarea
          label="Motivo / Justificativa"
          required
          rows={3}
          value={deactivateReason}
          onChange={e => setDeactivateReason(e.target.value)}
          placeholder="Ex: CPF irregular, solicitação expressa do cliente, inatividade prolongada..."
        />
        <div className="mt-6 flex gap-3">
          <Button
            onClick={() => setShowDeactivateModal(false)}
            variant="outline"
            className="flex-1"
          >
            Voltar
          </Button>
          <Button
            onClick={handleDeactivateConfirm}
            variant="danger"
            className="flex-1"
          >
            Confirmar Inativação
          </Button>
        </div>
      </Modal>

    </div>
  );
}
