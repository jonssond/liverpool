import { useState } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  NavLink, 
  useLocation,
  useNavigate
} from 'react-router-dom';
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
import ItemDetails from './screens/customer/ItemDetails';
import CustomerCrud from './screens/admin/CustomerCrud';
import Dashboard from './screens/admin/Dashboard';
import Chatbot from './components/Chatbot';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith('/admin');

  // Shared mock databases in state
  const [vinyls, setVinyls] = useState<Vinyl[]>(INITIAL_VINYLS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  
  // Shopping Cart state
  const [cart, setCart] = useState<{ vinyl: Vinyl; quantity: number }[]>([]);

  const diogoUser = customers[0] || INITIAL_CUSTOMERS[0]; // Logged in client simulation

  // 🛒 Cart Handlers
  const handleAddToCart = (product: Vinyl) => {
    setCart(prev => {
      const existing = prev.find(item => item.vinyl.id === product.id);
      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + 1);
        return prev.map(item => item.vinyl.id === product.id ? { ...item, quantity: newQty } : item);
      }
      return [...prev, { vinyl: product, quantity: 1 }];
    });
    // Redirect to checkout path
    navigate('/checkout');
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
    setVinyls(prevVinyls => prevVinyls.map(v => {
      const cartItem = items.find(item => item.vinyl.id === v.id);
      if (cartItem) {
        return { ...v, stock: Math.max(0, v.stock - cartItem.quantity) };
      }
      return v;
    }));

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
    setCart([]);
    navigate('/my-orders');
    alert('Compra efetuada! Pedido criado com sucesso com status EM ABERTO.');
  };

  // 🚦 Order status changes
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prevOrders => prevOrders.map(order => {
      if (order.id === orderId) {
        if (newStatus === 'TROCA ACEITA') {
          const generatedCouponCode = `TROCA-${orderId}-${Math.floor(100 + Math.random() * 900)}`;
          const newCoupon: Coupon = {
            id: `cp-${Date.now()}`,
            code: generatedCouponCode,
            value: order.total,
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
      
      {/* HEADER COMPONENT */}
      <header className="border-b border-faded-olive/20 bg-vinyl-black text-paper-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Logo & title */}
          <Link to="/" className="flex items-center gap-3 select-none hover:opacity-90 transition">
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
          </Link>

          {/* Navigation Links based on role */}
          <nav className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-wider">
            {!isAdmin ? (
              <>
                <NavLink
                  to="/"
                  className={({ isActive }) => 
                    `px-3 py-2 transition rounded-xl ${isActive ? 'text-warm-amber bg-white/5' : 'text-faded-olive hover:text-paper-white'}`
                  }
                >
                  Discos (Loja)
                </NavLink>
                <NavLink
                  to="/checkout"
                  className={({ isActive }) => 
                    `px-3 py-2 transition rounded-xl flex items-center gap-1.5 ${isActive ? 'text-warm-amber bg-white/5' : 'text-faded-olive hover:text-paper-white'}`
                  }
                >
                  Carrinho
                  {totalCartCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-warm-amber text-white">
                      {totalCartCount}
                    </span>
                  )}
                </NavLink>
                <NavLink
                  to="/my-orders"
                  className={({ isActive }) => 
                    `px-3 py-2 transition rounded-xl ${isActive ? 'text-warm-amber bg-white/5' : 'text-faded-olive hover:text-paper-white'}`
                  }
                >
                  Meus Pedidos
                </NavLink>
                <NavLink
                  to="/my-coupons"
                  className={({ isActive }) => 
                    `px-3 py-2 transition rounded-xl ${isActive ? 'text-warm-amber bg-white/5' : 'text-faded-olive hover:text-paper-white'}`
                  }
                >
                  Meus Cupons
                </NavLink>
                <Link
                  to="/admin"
                  className="px-4 py-2 border border-warm-amber/60 text-warm-amber hover:bg-warm-amber hover:text-paper-white transition rounded-xl ml-2 font-extrabold"
                >
                  Painel ADM
                </Link>
              </>
            ) : (
              <>
                <NavLink
                  to="/admin"
                  end
                  className={({ isActive }) => 
                    `px-3 py-2 transition rounded-xl ${isActive ? 'text-warm-amber bg-white/5' : 'text-faded-olive hover:text-paper-white'}`
                  }
                >
                  Painel Geral (ADM)
                </NavLink>
                <NavLink
                  to="/admin/customers"
                  className={({ isActive }) => 
                    `px-3 py-2 transition rounded-xl ${isActive ? 'text-warm-amber bg-white/5' : 'text-faded-olive hover:text-paper-white'}`
                  }
                >
                  Clientes (CRUD)
                </NavLink>
                <Link
                  to="/"
                  className="px-4 py-2 border border-faded-olive/60 text-faded-olive hover:bg-white/5 hover:text-paper-white transition rounded-xl ml-2"
                >
                  Sair do Admin
                </Link>
              </>
            )}
          </nav>

        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto w-full px-6 py-8 flex-1 flex flex-col justify-start">
        <Routes>
          {/* Client Routes */}
          <Route path="/" element={<Storefront vinyls={vinyls} onAddToCart={handleAddToCart} />} />
          <Route path="/item/:id" element={<ItemDetails vinyls={vinyls} onAddToCart={handleAddToCart} />} />
          <Route 
            path="/checkout" 
            element={
              <Cart
                cartItems={cart}
                customer={diogoUser}
                coupons={coupons}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onCheckout={handleCheckout}
              />
            } 
          />
          <Route 
            path="/my-orders" 
            element={
              <OrderHistory 
                orders={orders.filter(o => o.customerId === diogoUser.id)} 
                onUpdateOrderStatus={handleUpdateOrderStatus} 
              />
            } 
          />
          <Route path="/my-coupons" element={<Coupons coupons={coupons} />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Dashboard orders={orders} onUpdateOrderStatus={handleUpdateOrderStatus} />} />
          <Route 
            path="/admin/customers" 
            element={
              <CustomerCrud
                customers={customers}
                onAddCustomer={handleAddCustomer}
                onUpdateCustomer={handleUpdateCustomer}
              />
            } 
          />
        </Routes>
      </main>

      {/* Floating Chatbot widget (only on customer routes) */}
      {!isAdmin && <Chatbot vinyls={vinyls} onAddProductToCart={handleAddToCart} />}

      {/* FOOTER */}
      <footer className="border-t border-faded-olive/15 bg-white/40 py-8 text-center text-xs text-faded-olive">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>Liverpool Discos &copy; 2026. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <span className="hover:text-vinyl-black transition cursor-pointer">Termos de Uso</span>
            <span className="hover:text-vinyl-black transition cursor-pointer">Política de Privacidade</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
