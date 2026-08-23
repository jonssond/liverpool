import { useState } from 'react';
import { 
  INITIAL_VINYLS, 
  INITIAL_CUSTOMERS, 
  INITIAL_COUPONS, 
  INITIAL_ORDERS
} from './mockData';
import type { 
  Vinyl, 
  Customer, 
  Coupon, 
  Order,
  OrderItem
} from './mockData';

import Storefront from './screens/customer/Storefront';
import Cart from './screens/customer/Cart';
import OrderHistory from './screens/customer/OrderHistory';
import Coupons from './screens/customer/Coupons';
import CustomerCrud from './screens/admin/CustomerCrud';
import Dashboard from './screens/admin/Dashboard';
import Chatbot from './components/Chatbot';

type ActiveTabCustomer = 'loja' | 'carrinho' | 'pedidos' | 'cupons';
type ActiveTabAdmin = 'dashboard' | 'clientes';

export default function App() {
  // Shared mock databases in state
  const [vinyls, setVinyls] = useState<Vinyl[]>(INITIAL_VINYLS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  
  // Shopping Cart state
  const [cart, setCart] = useState<{ vinyl: Vinyl; quantity: number }[]>([]);

  // Simulation settings
  const [userRole, setUserRole] = useState<'cliente' | 'admin'>('cliente');
  const [activeTabCustomer, setActiveTabCustomer] = useState<ActiveTabCustomer>('loja');
  const [activeTabAdmin, setActiveTabAdmin] = useState<ActiveTabAdmin>('dashboard');

  const diogoUser = customers[0] || INITIAL_CUSTOMERS[0]; // Logged in client simulation

  // 🛒 Cart Handlers
  const handleAddToCart = (product: Vinyl) => {
    setCart(prev => {
      const existing = prev.find(item => item.vinyl.id === product.id);
      if (existing) {
        // limit to available stock
        const newQty = Math.min(product.stock, existing.quantity + 1);
        return prev.map(item => item.vinyl.id === product.id ? { ...item, quantity: newQty } : item);
      }
      return [...prev, { vinyl: product, quantity: 1 }];
    });
    // Open Cart page to show it
    setActiveTabCustomer('carrinho');
  };

  const handleUpdateQuantity = (vinylId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(vinylId);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.vinyl.id === vinylId) {
        const product = vinyls.find(v => v.id === vinylId);
        const stockLimit = product ? product.stock : 99;
        return { ...item, quantity: Math.min(stockLimit, quantity) };
      }
      return item;
    }));
  };

  const handleRemoveItem = (vinylId: string) => {
    setCart(prev => prev.filter(item => item.vinyl.id !== vinylId));
  };

  const handleCheckout = (
    items: { vinyl: Vinyl; quantity: number }[],
    total: number,
    paymentDetails: string
  ) => {
    // 1. Subtract stock
    setVinyls(prevVinyls => prevVinyls.map(v => {
      const cartItem = items.find(item => item.vinyl.id === v.id);
      if (cartItem) {
        return { ...v, stock: Math.max(0, v.stock - cartItem.quantity) };
      }
      return v;
    }));

    // 2. Create Order items
    const orderItems: OrderItem[] = items.map(item => ({
      vinylId: item.vinyl.id,
      title: item.vinyl.title,
      artist: item.vinyl.artist,
      coverUrl: item.vinyl.coverUrl,
      price: item.vinyl.price,
      quantity: item.quantity
    }));

    const subtotal = items.reduce((sum, item) => sum + item.vinyl.price * item.quantity, 0);

    const newOrder: Order = {
      id: `PED-00${orders.length + 1}`,
      customerId: diogoUser.id,
      customerName: diogoUser.name,
      items: orderItems,
      subtotal,
      freight: 15.00,
      discount: subtotal + 15.00 - total,
      total,
      status: 'EM ABERTO',
      paymentDetails,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setOrders(prev => [newOrder, ...prev]);
    setCart([]); // Clear Cart
    setActiveTabCustomer('pedidos'); // Go to orders page
    alert('Compra efetuada! Pedido criado com sucesso com status EM ABERTO.');
  };

  // 🚦 Order status changes
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prevOrders => prevOrders.map(order => {
      if (order.id === orderId) {
        // If return is approved (TROCA ACEITA), generate an exchange coupon automatically
        if (newStatus === 'TROCA ACEITA') {
          const generatedCouponCode = `TROCA-${orderId}-${Math.floor(100 + Math.random() * 900)}`;
          const newCoupon: Coupon = {
            id: `cp-${Date.now()}`,
            code: generatedCouponCode,
            value: order.total, // Full refund value in coupon
            type: 'troca',
            active: true
          };
          setCoupons(prevCoupons => [newCoupon, ...prevCoupons]);
          alert(`Solicitação Aprovada! Cupom de Troca gerado: ${generatedCouponCode} (R$ ${order.total.toFixed(2)})`);
        }
        return { ...order, status: newStatus };
      }
      return order;
    }));
  };

  // 👥 Customer CRUD handlers
  const handleAddCustomer = (cust: Customer) => {
    setCustomers(prev => [...prev, cust]);
    alert(`Cliente ${cust.name} cadastrado com sucesso.`);
  };

  const handleUpdateCustomer = (cust: Customer) => {
    setCustomers(prev => prev.map(c => c.id === cust.id ? cust : c));
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-paper-white text-vinyl-black font-sans selection:bg-warm-amber selection:text-paper-white relative flex flex-col justify-between">
      
      {/* HEADER COMPONENT (Dark Vinyl Header for contrast) */}
      <header className="border-b border-faded-olive/20 bg-vinyl-black text-paper-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo & title */}
          <div className="flex items-center gap-3 select-none">
            <img 
              src="/logo.png" 
              alt="Liverpool Discos Logo" 
              className="w-12 h-12 object-contain" 
            />
            <div className="text-left">
              <h1 className="font-serif font-bold text-2xl tracking-tight text-paper-white">
                Liverpool Discos
              </h1>
              <span className="text-[9px] uppercase tracking-widest text-warm-amber font-bold block">
                Premium Vinyl Records
              </span>
            </div>
          </div>

          {/* User simulation bar */}
          <div className="flex items-center gap-4 bg-paper-white/5 border border-faded-olive/30 px-4 py-2 rounded-2xl">
            <div className="text-right text-xs">
              <p className="text-faded-olive font-bold">Autenticado como:</p>
              <p className="font-bold text-paper-white">{userRole === 'cliente' ? `${diogoUser.name} (Cliente)` : 'Administrador'}</p>
            </div>
            
            {/* Role switch toggle */}
            <div className="flex border border-faded-olive/40 rounded-xl overflow-hidden bg-transparent">
              <button
                onClick={() => { setUserRole('cliente'); }}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase transition cursor-pointer border-none ${
                  userRole === 'cliente' ? 'bg-warm-amber text-paper-white' : 'bg-transparent text-faded-olive hover:bg-paper-white/5'
                }`}
              >
                Cliente
              </button>
              <button
                onClick={() => { setUserRole('admin'); }}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase transition cursor-pointer border-none ${
                  userRole === 'admin' ? 'bg-warm-amber text-paper-white' : 'bg-transparent text-faded-olive hover:bg-paper-white/5'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* CORE NAVIGATION & CONTAINER */}
      <div className="max-w-6xl mx-auto w-full px-6 py-8 flex-1 flex flex-col md:flex-row gap-8 items-start">
        
        {/* Navigation Sidebar (Using Off-White contrast styling) */}
        <aside className="w-full md:w-56 bg-white/70 border border-faded-olive/20 rounded-3xl p-4 space-y-2 sticky top-24 shadow-sm text-left">
          <p className="text-[10px] font-bold uppercase tracking-wider text-faded-olive px-3 mb-3">Navegação</p>
          
          {userRole === 'cliente' ? (
            <>
              <button
                onClick={() => setActiveTabCustomer('loja')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-3 border-none cursor-pointer ${
                  activeTabCustomer === 'loja' ? 'bg-faded-olive text-paper-white' : 'bg-transparent text-vinyl-black hover:bg-faded-olive/5'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Discos (Loja)
              </button>
              <button
                onClick={() => setActiveTabCustomer('carrinho')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between border-none cursor-pointer ${
                  activeTabCustomer === 'carrinho' ? 'bg-faded-olive text-paper-white' : 'bg-transparent text-vinyl-black hover:bg-faded-olive/5'
                }`}
              >
                <span className="flex items-center gap-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Carrinho
                </span>
                {totalCartCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-warm-amber text-white">
                    {totalCartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTabCustomer('pedidos')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-3 border-none cursor-pointer ${
                  activeTabCustomer === 'pedidos' ? 'bg-faded-olive text-paper-white' : 'bg-transparent text-vinyl-black hover:bg-faded-olive/5'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Meus Pedidos
              </button>
              <button
                onClick={() => setActiveTabCustomer('cupons')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-3 border-none cursor-pointer ${
                  activeTabCustomer === 'cupons' ? 'bg-faded-olive text-paper-white' : 'bg-transparent text-vinyl-black hover:bg-faded-olive/5'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Meus Cupons
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTabAdmin('dashboard')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-3 border-none cursor-pointer ${
                  activeTabAdmin === 'dashboard' ? 'bg-faded-olive text-paper-white' : 'bg-transparent text-vinyl-black hover:bg-faded-olive/5'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Painel Geral (ADM)
              </button>
              <button
                onClick={() => setActiveTabAdmin('clientes')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-3 border-none cursor-pointer ${
                  activeTabAdmin === 'clientes' ? 'bg-faded-olive text-paper-white' : 'bg-transparent text-vinyl-black hover:bg-faded-olive/5'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Clientes (CRUD)
              </button>
            </>
          )}
        </aside>

        {/* Dynamic content page render */}
        <section className="flex-1 w-full bg-transparent overflow-hidden">
          {userRole === 'cliente' ? (
            <>
              {activeTabCustomer === 'loja' && (
                <Storefront vinyls={vinyls} onAddToCart={handleAddToCart} />
              )}
              {activeTabCustomer === 'carrinho' && (
                <Cart
                  cartItems={cart}
                  customer={diogoUser}
                  coupons={coupons}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                  onCheckout={handleCheckout}
                />
              )}
              {activeTabCustomer === 'pedidos' && (
                <OrderHistory orders={orders.filter(o => o.customerId === diogoUser.id)} onUpdateOrderStatus={handleUpdateOrderStatus} />
              )}
              {activeTabCustomer === 'cupons' && (
                <Coupons coupons={coupons} />
              )}
            </>
          ) : (
            <>
              {activeTabAdmin === 'dashboard' && (
                <Dashboard orders={orders} onUpdateOrderStatus={handleUpdateOrderStatus} />
              )}
              {activeTabAdmin === 'clientes' && (
                <CustomerCrud
                  customers={customers}
                  onAddCustomer={handleAddCustomer}
                  onUpdateCustomer={handleUpdateCustomer}
                />
              )}
            </>
          )}
        </section>

      </div>

      {/* Floating Chatbot widget */}
      <Chatbot vinyls={vinyls} onAddProductToCart={handleAddToCart} />

      {/* FOOTER */}
      <footer className="border-t border-faded-olive/15 bg-white/40 py-8 text-center text-xs text-faded-olive">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>Liverpool Discos &copy; 2026. Todos os direitos reservados. UI Português / Code English.</p>
          <div className="flex gap-4">
            <span className="hover:text-vinyl-black transition cursor-pointer">Termos de Uso</span>
            <span className="hover:text-vinyl-black transition cursor-pointer">Política de Privacidade</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
