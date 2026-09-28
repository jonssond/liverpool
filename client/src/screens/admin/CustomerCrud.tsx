import { useState, useEffect } from 'react';
import type { Customer } from '../../mockData';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import SuccessModal from '../../components/SuccessModal';
import Button from '../../components/Button';
import { Input, Select, Textarea } from '../../components/Input';
import {
  maskCPF,
  maskPhone,
  maskCreditCard,
  maskCEP,
  maskCVV,
} from '../../utils/masks';
import {
  validateCPF,
  validateCreditCard,
  validatePhone,
  validateCEP,
  validateCVV,
  validateStrongPassword,
  detectCardBrand,
} from '../../utils/validators';
import {
  apiGetCustomers,
  apiCreateCustomer,
  apiUpdateCustomer,
  apiUpdateCustomerStatus,
} from '../../services/customerApi';

interface CustomerCrudProps {
  customers: Customer[] | null | undefined;
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
}

export default function CustomerCrud({
  customers: propCustomers,
  onAddCustomer,
  onUpdateCustomer,
}: CustomerCrudProps) {
  const [customers, setCustomers] = useState<Customer[]>(propCustomers ?? []);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState('');
  const [successModalTitle, setSuccessModalTitle] = useState('Sucesso!');

  const showSuccess = (message: string, title = 'Sucesso!') => {
    setSuccessModalTitle(title);
    setSuccessModalMessage(message);
    setSuccessModalOpen(true);
  };

  useEffect(() => {
    loadCustomersFromBackend();
  }, []);

  const loadCustomersFromBackend = async () => {
    setLoading(true);
    try {
      const data = await apiGetCustomers();
      if (Array.isArray(data)) {
        setCustomers(data);
      }
    } catch (err: any) {
      console.warn('Usando dados locais ou fallback:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateCustId, setDeactivateCustId] = useState('');
  const [deactivateReason, setDeactivateReason] = useState('');
  const [deactivateError, setDeactivateError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [gender, setGender] = useState('Masculino');
  const [birthdate, setBirthdate] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [delivStreet, setDelivStreet] = useState('');
  const [delivNum, setDelivNum] = useState('');
  const [delivCep, setDelivCep] = useState('');
  const [delivCity, setDelivCity] = useState('');

  const [billStreet, setBillStreet] = useState('');
  const [billNum, setBillNum] = useState('');
  const [billCep, setBillCep] = useState('');
  const [billCity, setBillCity] = useState('');

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardBrand, setCardBrand] = useState('Visa');
  const [cardCvv, setCardCvv] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (isEdit = false): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Nome completo é obrigatório.';
    if (!email.trim()) {
      newErrors.email = 'E-mail é obrigatório.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Formato de e-mail inválido.';
    }

    const cpfValidation = validateCPF(cpf);
    if (!cpfValidation.isValid) {
      newErrors.cpf = cpfValidation.error || 'CPF inválido.';
    }

    if (!birthdate) newErrors.birthdate = 'Data de nascimento é obrigatória.';

    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.error || 'Telefone inválido.';
    }

    if (!isEdit) {
      if (!password) {
        newErrors.password = 'Senha é obrigatória no cadastro.';
      } else {
        const passValidation = validateStrongPassword(password);
        if (!passValidation.isValid) {
          newErrors.password = passValidation.error || 'Senha fraca.';
        }
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'As senhas não coincidem.';
      }
    }

    if (!delivStreet.trim()) newErrors.delivStreet = 'Rua de entrega é obrigatória.';
    if (!delivNum.trim()) newErrors.delivNum = 'Número é obrigatório.';
    const delivCepValidation = validateCEP(delivCep);
    if (!delivCepValidation.isValid) newErrors.delivCep = delivCepValidation.error || 'CEP inválido.';
    if (!delivCity.trim()) newErrors.delivCity = 'Cidade é obrigatória.';

    if (!billStreet.trim()) newErrors.billStreet = 'Rua de cobrança é obrigatória.';
    if (!billNum.trim()) newErrors.billNum = 'Número é obrigatório.';
    const billCepValidation = validateCEP(billCep);
    if (!billCepValidation.isValid) newErrors.billCep = billCepValidation.error || 'CEP inválido.';
    if (!billCity.trim()) newErrors.billCity = 'Cidade é obrigatória.';

    if (!isEdit || cardNumber.trim()) {
      const cardValidation = validateCreditCard(cardNumber);
      if (!cardValidation.isValid) {
        newErrors.cardNumber = cardValidation.error || 'Número de cartão inválido.';
      }
      if (!cardName.trim()) newErrors.cardName = 'Nome no cartão é obrigatório.';
      const cvvValidation = validateCVV(cardCvv);
      if (!cvvValidation.isValid) newErrors.cardCvv = cvvValidation.error || 'CVV inválido.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm(false)) {
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      cpf: cpf.trim(),
      gender,
      birthdate,
      phone: phone.trim(),
      password,
      confirmPassword,
      addresses: [
        {
          type: 'entrega' as const,
          tipoResidencia: 'Casa',
          tipoLogradouro: 'Rua',
          logradouro: delivStreet.trim(),
          numero: delivNum.trim(),
          bairro: 'Centro',
          cep: delivCep.trim(),
          cidade: delivCity.trim(),
          estado: 'SP',
          pais: 'Brasil',
        },
        {
          type: 'cobranca' as const,
          tipoResidencia: 'Casa',
          tipoLogradouro: 'Rua',
          logradouro: billStreet.trim(),
          numero: billNum.trim(),
          bairro: 'Centro',
          cep: billCep.trim(),
          cidade: billCity.trim(),
          estado: 'SP',
          pais: 'Brasil',
        },
      ],
      cards: [
        {
          number: cardNumber.trim(),
          name: cardName.trim().toUpperCase(),
          brand: cardBrand,
          cvv: cardCvv.trim(),
        },
      ],
    };

    try {
      setLoading(true);
      const created = await apiCreateCustomer(payload);
      setCustomers(prev => [created, ...prev]);
      onAddCustomer(created);
      setShowAddForm(false);
      resetForms();
      showSuccess(`Cliente ${created.name} cadastrado com sucesso!`, 'Cadastro Concluído');
    } catch (err: any) {
      setApiError(err.message || 'Erro ao cadastrar cliente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditInit = (cust: Customer) => {
    setSelectedCustomer(cust);
    setName(cust.name);
    setEmail(cust.email);
    setCpf(maskCPF(cust.cpf));
    setGender(cust.gender || 'Masculino');
    setBirthdate(cust.birthdate || '');
    setPhone(maskPhone(cust.phone));
    setPassword('');
    setConfirmPassword('');

    const delivery = cust.addresses?.find(a => a.type === 'entrega');
    const billing = cust.addresses?.find(a => a.type === 'cobranca');

    setDelivStreet(delivery?.logradouro || '');
    setDelivNum(delivery?.numero || '');
    setDelivCep(maskCEP(delivery?.cep || ''));
    setDelivCity(delivery?.cidade || '');

    setBillStreet(billing?.logradouro || '');
    setBillNum(billing?.numero || '');
    setBillCep(maskCEP(billing?.cep || ''));
    setBillCity(billing?.cidade || '');

    const firstCard = cust.cards?.[0];
    setCardNumber(firstCard?.number || '');
    setCardName(firstCard?.name || cust.name.toUpperCase());
    setCardBrand(firstCard?.brand || 'Visa');
    setCardCvv(firstCard?.cvv || '999');

    setErrors({});
    setApiError(null);
    setShowEditForm(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setApiError(null);

    if (!validateForm(true)) {
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      cpf: cpf.trim(),
      gender,
      birthdate,
      phone: phone.trim(),
      addresses: [
        {
          id: selectedCustomer.addresses?.find(a => a.type === 'entrega')?.id,
          type: 'entrega' as const,
          tipoResidencia: 'Casa',
          tipoLogradouro: 'Rua',
          logradouro: delivStreet.trim(),
          numero: delivNum.trim(),
          bairro: 'Centro',
          cep: delivCep.trim(),
          cidade: delivCity.trim(),
          estado: 'SP',
          pais: 'Brasil',
        },
        {
          id: selectedCustomer.addresses?.find(a => a.type === 'cobranca')?.id,
          type: 'cobranca' as const,
          tipoResidencia: 'Casa',
          tipoLogradouro: 'Rua',
          logradouro: billStreet.trim(),
          numero: billNum.trim(),
          bairro: 'Centro',
          cep: billCep.trim(),
          cidade: billCity.trim(),
          estado: 'SP',
          pais: 'Brasil',
        },
      ],
      cards: cardNumber.trim()
        ? [
            {
              id: selectedCustomer.cards?.[0]?.id,
              number: cardNumber.trim(),
              name: cardName.trim().toUpperCase(),
              brand: cardBrand,
              cvv: cardCvv.trim(),
            },
          ]
        : selectedCustomer.cards,
    };

    try {
      setLoading(true);
      const updated = await apiUpdateCustomer(selectedCustomer.id, payload);
      setCustomers(prev => prev.map(c => (c.id === updated.id ? updated : c)));
      onUpdateCustomer(updated);
      setShowEditForm(false);
      setSelectedCustomer(null);
      resetForms();
      showSuccess(`Dados do cliente ${updated.name} foram atualizados com sucesso!`, 'Cliente Atualizado');
    } catch (err: any) {
      setApiError(err.message || 'Erro ao atualizar dados do cliente.');
    } finally {
      setLoading(false);
    }
  };

  const initDeactivate = (id: string) => {
    setDeactivateCustId(id);
    setDeactivateReason('');
    setDeactivateError('');
    setShowDeactivateModal(true);
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateReason.trim()) {
      setDeactivateError('Por favor, informe a justificativa da inativação.');
      return;
    }

    try {
      setLoading(true);
      const updated = await apiUpdateCustomerStatus(deactivateCustId, false, deactivateReason.trim());
      setCustomers(prev => prev.map(c => (c.id === updated.id ? updated : c)));
      onUpdateCustomer(updated);
      setShowDeactivateModal(false);
      showSuccess(
        `Cliente ${updated.name} inativado com sucesso. Justificativa: ${deactivateReason}`,
        'Cliente Inativado'
      );
    } catch (err: any) {
      setDeactivateError(err.message || 'Erro ao inativar cliente.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (cust: Customer) => {
    try {
      setLoading(true);
      const updated = await apiUpdateCustomerStatus(cust.id, true);
      setCustomers(prev => prev.map(c => (c.id === updated.id ? updated : c)));
      onUpdateCustomer(updated);
      showSuccess(`Cliente ${updated.name} reativado com sucesso!`, 'Cliente Reativado');
    } catch (err: any) {
      setApiError(err.message || 'Erro ao ativar cliente.');
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
    setName('');
    setEmail('');
    setCpf('');
    setGender('Masculino');
    setBirthdate('');
    setPhone('');
    setPassword('');
    setConfirmPassword('');
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
    setCardCvv('');
    setErrors({});
    setApiError(null);
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCPF(e.target.value);
    setCpf(masked);
    if (errors.cpf) {
      const v = validateCPF(masked);
      if (v.isValid) {
        setErrors(prev => ({ ...prev, cpf: '' }));
      }
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskPhone(e.target.value);
    setPhone(masked);
    if (errors.phone) {
      const v = validatePhone(masked);
      if (v.isValid) {
        setErrors(prev => ({ ...prev, phone: '' }));
      }
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCreditCard(e.target.value);
    setCardNumber(masked);
    const autoBrand = detectCardBrand(masked);
    setCardBrand(autoBrand);
    if (errors.cardNumber) {
      const v = validateCreditCard(masked);
      if (v.isValid) {
        setErrors(prev => ({ ...prev, cardNumber: '' }));
      }
    }
  };

  const handleDelivCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCEP(e.target.value);
    setDelivCep(masked);
    if (errors.delivCep && validateCEP(masked).isValid) {
      setErrors(prev => ({ ...prev, delivCep: '' }));
    }
  };

  const handleBillCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCEP(e.target.value);
    setBillCep(masked);
    if (errors.billCep && validateCEP(masked).isValid) {
      setErrors(prev => ({ ...prev, billCep: '' }));
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCVV(e.target.value);
    setCardCvv(masked);
    if (errors.cardCvv && validateCVV(masked).isValid) {
      setErrors(prev => ({ ...prev, cardCvv: '' }));
    }
  };

  const genderOptions = [
    { value: 'Masculino', label: 'Masculino' },
    { value: 'Feminino', label: 'Feminino' },
    { value: 'Outro', label: 'Outro' },
  ];

  const brandOptions = [
    { value: 'Visa', label: 'Visa' },
    { value: 'Mastercard', label: 'Mastercard' },
    { value: 'Elo', label: 'Elo' },
    { value: 'Amex', label: 'Amex' },
  ];

  return (
    <div className="space-y-6 text-left font-sans animate-in fade-in duration-200" data-cy="customer-crud-container">
      
      {/* Customer List Header */}
      <div className="bg-white/80 border border-faded-olive/20 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="font-serif font-bold text-2xl text-vinyl-black" data-cy="page-title">
              Painel de Clientes
            </h3>
            <p className="text-xs text-faded-olive mt-1">
              Gerencie cadastros, endereços e status de clientes (Exclusivo Administrador).
            </p>
          </div>
          <Button
            onClick={() => {
              resetForms();
              setShowAddForm(true);
            }}
            variant="primary"
            data-cy="btn-new-customer"
          >
            + Cadastrar Cliente
          </Button>
        </div>

        {apiError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold" data-cy="api-error-banner">
            {apiError}
          </div>
        )}

        {/* List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-cy="customers-table">
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
            <tbody className="divide-y divide-faded-olive/10" data-cy="customers-tbody">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-faded-olive italic">
                    {loading ? 'Carregando clientes...' : 'Nenhum cliente cadastrado.'}
                  </td>
                </tr>
              ) : (
                customers.map(cust => (
                  <tr key={cust.id} className="hover:bg-faded-olive/5 transition" data-cy={`customer-row-${cust.id}`}>
                    <td className="py-4 font-bold text-vinyl-black" data-cy="customer-name">{cust.name}</td>
                    <td className="py-4 font-mono text-xs text-faded-olive" data-cy="customer-cpf">{cust.cpf}</td>
                    <td className="py-4 text-vinyl-black" data-cy="customer-email">{cust.email}</td>
                    <td className="py-4 text-xs text-faded-olive" data-cy="customer-phone">{cust.phone}</td>
                    <td className="py-4" data-cy="customer-status">
                      <StatusBadge status={cust.active} />
                    </td>
                    <td className="py-4 text-right space-x-2">
                      <Button
                        onClick={() => handleEditInit(cust)}
                        variant="outline"
                        size="sm"
                        data-cy={`btn-edit-${cust.id}`}
                      >
                        Alterar
                      </Button>
                      {cust.active ? (
                        <Button
                          onClick={() => initDeactivate(cust.id)}
                          variant="danger"
                          size="sm"
                          data-cy={`btn-inactivate-${cust.id}`}
                        >
                          Inativar
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleActivate(cust)}
                          variant="success"
                          size="sm"
                          data-cy={`btn-activate-${cust.id}`}
                        >
                          Reativar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
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
        <form onSubmit={handleCreate} noValidate className="space-y-6" data-cy="form-add-customer">
          {apiError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold" data-cy="form-error-banner">
              {apiError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Nome Completo *"
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              error={errors.name}
              data-cy="input-name"
            />
            <Input
              label="E-mail *"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={errors.email}
              data-cy="input-email"
            />
            <Input
              label="CPF *"
              type="text"
              required
              maxLength={14}
              value={cpf}
              onChange={handleCpfChange}
              onBlur={() => {
                const v = validateCPF(cpf);
                if (!v.isValid) setErrors(prev => ({ ...prev, cpf: v.error || 'CPF inválido.' }));
              }}
              error={errors.cpf}
              placeholder="000.000.000-00"
              data-cy="input-cpf"
            />
            <Select
              label="Gênero"
              value={gender}
              onChange={e => setGender(e.target.value)}
              options={genderOptions}
              data-cy="select-gender"
            />
            <Input
              label="Data de Nascimento *"
              type="date"
              required
              value={birthdate}
              onChange={e => setBirthdate(e.target.value)}
              error={errors.birthdate}
              data-cy="input-birthdate"
            />
            <Input
              label="Telefone (com DDD) *"
              type="text"
              required
              maxLength={15}
              value={phone}
              onChange={handlePhoneChange}
              onBlur={() => {
                const v = validatePhone(phone);
                if (!v.isValid) setErrors(prev => ({ ...prev, phone: v.error || 'Telefone inválido.' }));
              }}
              error={errors.phone}
              placeholder="(XX) XXXXX-XXXX"
              data-cy="input-phone"
            />
            <Input
              label="Senha (Mín. 8 caracteres, maiúsculas, números) *"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={errors.password}
              data-cy="input-password"
            />
            <Input
              label="Confirmar Senha *"
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              data-cy="input-confirm-password"
            />
          </div>

          <div className="border-t border-faded-olive/10 pt-4">
            <h4 className="font-serif font-bold text-lg text-vinyl-black mb-3">Endereço de Entrega *</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="Rua / Logradouro *"
                type="text"
                required
                value={delivStreet}
                onChange={e => setDelivStreet(e.target.value)}
                error={errors.delivStreet}
                wrapperClassName="md:col-span-2"
                data-cy="input-deliv-street"
              />
              <Input
                label="Número *"
                type="text"
                required
                value={delivNum}
                onChange={e => setDelivNum(e.target.value)}
                error={errors.delivNum}
                data-cy="input-deliv-num"
              />
              <Input
                label="CEP *"
                type="text"
                required
                maxLength={9}
                value={delivCep}
                onChange={handleDelivCepChange}
                error={errors.delivCep}
                placeholder="00000-000"
                data-cy="input-deliv-cep"
              />
              <Input
                label="Cidade *"
                type="text"
                required
                value={delivCity}
                onChange={e => setDelivCity(e.target.value)}
                error={errors.delivCity}
                wrapperClassName="md:col-span-2"
                data-cy="input-deliv-city"
              />
            </div>
          </div>

          <div className="border-t border-faded-olive/10 pt-4">
            <h4 className="font-serif font-bold text-lg text-vinyl-black mb-3">Endereço de Cobrança *</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="Rua / Logradouro *"
                type="text"
                required
                value={billStreet}
                onChange={e => setBillStreet(e.target.value)}
                error={errors.billStreet}
                wrapperClassName="md:col-span-2"
                data-cy="input-bill-street"
              />
              <Input
                label="Número *"
                type="text"
                required
                value={billNum}
                onChange={e => setBillNum(e.target.value)}
                error={errors.billNum}
                data-cy="input-bill-num"
              />
              <Input
                label="CEP *"
                type="text"
                required
                maxLength={9}
                value={billCep}
                onChange={handleBillCepChange}
                error={errors.billCep}
                placeholder="00000-000"
                data-cy="input-bill-cep"
              />
              <Input
                label="Cidade *"
                type="text"
                required
                value={billCity}
                onChange={e => setBillCity(e.target.value)}
                error={errors.billCity}
                wrapperClassName="md:col-span-2"
                data-cy="input-bill-city"
              />
            </div>
          </div>

          <div className="border-t border-faded-olive/10 pt-4">
            <h4 className="font-serif font-bold text-lg text-vinyl-black mb-3">Cartão de Crédito Inicial *</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="Número do Cartão *"
                type="text"
                required
                maxLength={19}
                value={cardNumber}
                onChange={handleCardNumberChange}
                onBlur={() => {
                  const v = validateCreditCard(cardNumber);
                  if (!v.isValid) setErrors(prev => ({ ...prev, cardNumber: v.error || 'Cartão inválido.' }));
                }}
                error={errors.cardNumber}
                placeholder="0000 0000 0000 0000"
                wrapperClassName="md:col-span-2"
                data-cy="input-card-number"
              />
              <Input
                label="Nome Impresso *"
                type="text"
                required
                value={cardName}
                onChange={e => setCardName(e.target.value)}
                error={errors.cardName}
                data-cy="input-card-name"
              />
              <Select
                label="Bandeira"
                value={cardBrand}
                onChange={e => setCardBrand(e.target.value)}
                options={brandOptions}
                data-cy="select-card-brand"
              />
              <Input
                label="CVV *"
                type="text"
                required
                maxLength={4}
                value={cardCvv}
                onChange={handleCvvChange}
                error={errors.cardCvv}
                placeholder="000"
                data-cy="input-card-cvv"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              variant="primary"
              className="w-full py-3"
              disabled={loading}
              data-cy="btn-submit-customer"
            >
              {loading ? 'Salvando...' : 'Confirmar Cadastro'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT CUSTOMER FORM MODAL */}
      <Modal
        isOpen={showEditForm}
        onClose={() => {
          setShowEditForm(false);
          setSelectedCustomer(null);
        }}
        title={`Alterar Dados do Cliente: ${selectedCustomer?.name || ''}`}
        maxWidthClass="max-w-4xl"
      >
        <form onSubmit={handleUpdateSubmit} noValidate className="space-y-6" data-cy="form-edit-customer">
          {apiError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold" data-cy="edit-form-error-banner">
              {apiError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Nome Completo *"
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              error={errors.name}
              data-cy="edit-input-name"
            />
            <Input
              label="E-mail *"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={errors.email}
              data-cy="edit-input-email"
            />
            <Input
              label="CPF *"
              type="text"
              required
              maxLength={14}
              value={cpf}
              onChange={handleCpfChange}
              error={errors.cpf}
              data-cy="edit-input-cpf"
            />
            <Select
              label="Gênero"
              value={gender}
              onChange={e => setGender(e.target.value)}
              options={genderOptions}
              data-cy="edit-select-gender"
            />
            <Input
              label="Data de Nascimento *"
              type="date"
              required
              value={birthdate}
              onChange={e => setBirthdate(e.target.value)}
              error={errors.birthdate}
              data-cy="edit-input-birthdate"
            />
            <Input
              label="Telefone *"
              type="text"
              required
              maxLength={15}
              value={phone}
              onChange={handlePhoneChange}
              error={errors.phone}
              data-cy="edit-input-phone"
            />
          </div>

          <div className="border-t border-faded-olive/10 pt-4">
            <h4 className="font-serif font-bold text-lg text-vinyl-black mb-3">Endereço de Entrega</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="Rua / Logradouro *"
                type="text"
                required
                value={delivStreet}
                onChange={e => setDelivStreet(e.target.value)}
                error={errors.delivStreet}
                wrapperClassName="md:col-span-2"
                data-cy="edit-input-deliv-street"
              />
              <Input
                label="Número *"
                type="text"
                required
                value={delivNum}
                onChange={e => setDelivNum(e.target.value)}
                error={errors.delivNum}
                data-cy="edit-input-deliv-num"
              />
              <Input
                label="CEP *"
                type="text"
                required
                maxLength={9}
                value={delivCep}
                onChange={handleDelivCepChange}
                error={errors.delivCep}
                data-cy="edit-input-deliv-cep"
              />
              <Input
                label="Cidade *"
                type="text"
                required
                value={delivCity}
                onChange={e => setDelivCity(e.target.value)}
                error={errors.delivCity}
                wrapperClassName="md:col-span-2"
                data-cy="edit-input-deliv-city"
              />
            </div>
          </div>

          <div className="border-t border-faded-olive/10 pt-4">
            <h4 className="font-serif font-bold text-lg text-vinyl-black mb-3">Endereço de Cobrança</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="Rua / Logradouro *"
                type="text"
                required
                value={billStreet}
                onChange={e => setBillStreet(e.target.value)}
                error={errors.billStreet}
                wrapperClassName="md:col-span-2"
                data-cy="edit-input-bill-street"
              />
              <Input
                label="Número *"
                type="text"
                required
                value={billNum}
                onChange={e => setBillNum(e.target.value)}
                error={errors.billNum}
                data-cy="edit-input-bill-num"
              />
              <Input
                label="CEP *"
                type="text"
                required
                maxLength={9}
                value={billCep}
                onChange={handleBillCepChange}
                error={errors.billCep}
                data-cy="edit-input-bill-cep"
              />
              <Input
                label="Cidade *"
                type="text"
                required
                value={billCity}
                onChange={e => setBillCity(e.target.value)}
                error={errors.billCity}
                wrapperClassName="md:col-span-2"
                data-cy="edit-input-bill-city"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              variant="primary"
              className="w-full py-3"
              disabled={loading}
              data-cy="btn-save-edit-customer"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
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
        <div data-cy="deactivate-modal-content">
          <p className="text-xs text-faded-olive mb-4">
            Por favor, informe a justificativa ou o motivo pelo qual este perfil de cliente está sendo desativado.
          </p>
          {deactivateError && (
            <div className="mb-3 p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg" data-cy="deactivate-error">
              {deactivateError}
            </div>
          )}
          <Textarea
            label="Motivo / Justificativa *"
            required
            rows={3}
            value={deactivateReason}
            onChange={e => setDeactivateReason(e.target.value)}
            placeholder="Ex: Solicitação do cliente, CPF irregular, inatividade..."
            data-cy="textarea-deactivate-reason"
          />
          <div className="mt-6 flex gap-3">
            <Button
              onClick={() => setShowDeactivateModal(false)}
              variant="outline"
              className="flex-1"
              data-cy="btn-cancel-deactivate"
            >
              Voltar
            </Button>
            <Button
              onClick={handleDeactivateConfirm}
              variant="danger"
              className="flex-1"
              disabled={loading}
              data-cy="btn-confirm-deactivate"
            >
              {loading ? 'Inativando...' : 'Confirmar Inativação'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* GENERIC SUCCESS MODAL */}
      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title={successModalTitle}
        message={successModalMessage}
      />

    </div>
  );
}
