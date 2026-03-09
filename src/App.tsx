import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Clock, Package, Bell, Trash2, Plus, LogIn, ShoppingBag, Home as HomeIcon, LayoutDashboard, LogOut, ChevronRight, Star, Instagram, Facebook, MessageCircle, MapPin } from 'lucide-react';

interface Order {
  id: number;
  customer_name: string;
  items: string;
  status: 'pending' | 'ready' | 'delivered';
  created_at: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  category: 'acai' | 'sorvete';
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Açaí Tradicional', description: 'O clássico açaí da Mari, batido com guaraná e muita refrescância.', price: 'R$ 15,00', image: 'https://picsum.photos/seed/acai1/400/300', category: 'acai' },
  { id: 2, name: 'Açaí com Morango', description: 'Açaí cremoso acompanhado de morangos frescos e sabor intenso.', price: 'R$ 18,00', image: 'https://picsum.photos/seed/acai2/400/300', category: 'acai' },
  { id: 3, name: 'Sorvete de Ninho', description: 'Sorvete artesanal de Leite Ninho, cremosidade e sabor sem igual.', price: 'R$ 12,00', image: 'https://picsum.photos/seed/icecream1/400/300', category: 'sorvete' },
  { id: 4, name: 'Sorvete de Chocolate', description: 'O clássico chocolate belga em uma versão ultra refrescante.', price: 'R$ 12,00', image: 'https://picsum.photos/seed/icecream2/400/300', category: 'sorvete' },
  { id: 5, name: 'Sorvete de Frutas Vermelhas', description: 'Explosão de sabor natural com pedaços de frutas selecionadas.', price: 'R$ 14,00', image: 'https://picsum.photos/seed/icecream3/400/300', category: 'sorvete' },
  { id: 6, name: 'Barca de Açaí Especial', description: 'Uma barca completa com diversos acompanhamentos e máxima qualidade.', price: 'R$ 45,00', image: 'https://picsum.photos/seed/acai4/400/300', category: 'acai' },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'products' | 'login' | 'dashboard'>('home');
  const [activeCategory, setActiveCategory] = useState<'all' | 'acai' | 'sorvete'>('all');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [newOrderName, setNewOrderName] = useState('');
  const [newOrderItems, setNewOrderItems] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const fetchOrders = async () => {
    if (!isLoggedIn) return;
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchOrders();
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      const socket = new WebSocket(wsUrl);

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        fetchOrders();
      };

      return () => socket.close();
    }
  }, [isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'adminmari' && password === 'adminmariaçai') {
      setIsLoggedIn(true);
      setCurrentPage('dashboard');
      setLoginError('');
    } else {
      setLoginError('Credenciais inválidas');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('home');
  };

  const triggerLed = async () => {
    try {
      await fetch('/api/esp32/trigger', { method: 'POST' });
    } catch (error) {
      console.error('Error triggering LED:', error);
    }
  };

  const markAsReady = async (id: number) => {
    try {
      await fetch(`/api/orders/${id}/ready`, { method: 'PATCH' });
      fetchOrders();
    } catch (error) {
      console.error('Error marking as ready:', error);
    }
  };

  const markAsDelivered = async (id: number) => {
    try {
      await fetch(`/api/orders/${id}/delivered`, { method: 'PATCH' });
      fetchOrders();
    } catch (error) {
      console.error('Error marking as delivered:', error);
    }
  };

  const createOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_name: newOrderName, items: newOrderItems }),
      });
      setNewOrderName('');
      setNewOrderItems('');
      setShowAddModal(false);
      fetchOrders();
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const renderHome = () => (
    <div className="space-y-12 pb-20">
      <section className="relative h-[70vh] flex items-end justify-center overflow-hidden rounded-b-[4rem] shadow-2xl pb-20">
        <img 
          src="https://picsum.photos/seed/mariacai/1920/1080" 
          className="absolute inset-0 w-full h-full object-cover brightness-50"
          alt="Mari Açaí Background"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-10 text-center text-white px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-black tracking-tighter mb-4 drop-shadow-2xl"
          >
            MARI AÇAÍ
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-2xl font-light tracking-wide max-w-2xl mx-auto drop-shadow-lg"
          >
            Qualidade, Sabor e Refrescância em cada colherada. O melhor açaí e sorvetes artesanais da região.
          </motion.p>
          <motion.button 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            onClick={() => setCurrentPage('products')}
            className="mt-8 bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl flex items-center gap-2 mx-auto active:scale-95"
          >
            Ver Cardápio <ChevronRight size={20} />
          </motion.button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Star, title: 'Qualidade Incomparável', text: 'Ingredientes selecionados para garantir o padrão Mari Açaí.' },
          { icon: Star, title: 'Sabor Irresistível', text: 'Receitas exclusivas que conquistam o paladar desde a primeira vez.' },
          { icon: Clock, title: 'Refrescância Total', text: 'A temperatura ideal para refrescar os seus dias mais quentes.' }
        ].map((feat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-pink-50 text-center"
          >
            <div className="bg-pink-100 w-16 h-16 rounded-2xl flex items-center justify-center text-pink-600 mx-auto mb-6">
              <feat.icon size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
            <p className="text-slate-500 leading-relaxed">{feat.text}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );

  const renderProducts = () => {
    const filteredProducts = activeCategory === 'all' 
      ? PRODUCTS 
      : PRODUCTS.filter(p => p.category === activeCategory);

    return (
      <div className="max-w-7xl mx-auto px-6 py-12 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-pink-700 mb-4">Nosso Cardápio</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Escolha entre nossas opções clássicas ou monte sua própria combinação perfeita.</p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center gap-4 mb-16">
          {[
            { id: 'all', label: 'Todos', icon: ShoppingBag },
            { id: 'acai', label: 'Açaí', icon: Star },
            { id: 'sorvete', label: 'Sorvetes', icon: Star },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all shadow-sm ${
                activeCategory === cat.id 
                  ? 'bg-pink-600 text-white shadow-pink-200' 
                  : 'bg-white text-slate-500 hover:bg-pink-50 hover:text-pink-600'
              }`}
            >
              <cat.icon size={18} />
              {cat.label}
            </button>
          ))}
        </div>

        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, i) => (
              <motion.div 
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-pink-50 hover:shadow-xl transition-all group"
              >
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={product.image} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    alt={product.name}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-pink-600 font-bold text-sm">
                    {product.price}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-pink-600 transition-colors">{product.name}</h3>
                  <p className="text-slate-500 text-sm mb-4">{product.description}</p>
                  <button className="w-full bg-pink-50 text-pink-600 py-3 rounded-xl font-bold hover:bg-pink-600 hover:text-white transition-all">
                    Pedir Agora
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  };

  const renderLogin = () => (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md border border-pink-50"
      >
        <div className="text-center mb-8">
          <div className="bg-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-pink-200">
            <LayoutDashboard size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-800">Acesso Restrito</h2>
          <p className="text-slate-400 mt-2">Área exclusiva para a equipe Mari Açaí</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2 ml-1">Usuário</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
              placeholder="Digite seu usuário"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2 ml-1">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          {loginError && <p className="text-red-500 text-sm text-center font-medium">{loginError}</p>}
          <button 
            type="submit"
            className="w-full bg-pink-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-pink-700 transition-all shadow-lg shadow-pink-200"
          >
            Entrar no Painel
          </button>
        </form>
      </motion.div>
    </div>
  );

  const renderDashboard = () => {
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const readyOrders = orders.filter(o => o.status === 'ready');

    return (
      <div className="max-w-7xl mx-auto p-6 pb-24">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-pink-700">Painel de Produção</h2>
            <p className="text-slate-500">Gerencie os pedidos em tempo real</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={triggerLed}
              className="bg-pink-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-pink-400 transition-colors shadow-md"
            >
              <Bell size={20} /> Testar LED
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-white text-pink-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-pink-50 transition-colors shadow-md border border-pink-100"
            >
              <Plus size={20} /> Novo Pedido
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Pending Column */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                <Clock size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-700 uppercase tracking-widest">Em Preparo ({pendingOrders.length})</h3>
            </div>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {pendingOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-pink-50 flex justify-between items-center group hover:shadow-md transition-all"
                  >
                    <div>
                      <span className="text-[10px] font-mono text-slate-400">#ORD-{order.id}</span>
                      <h4 className="text-xl font-bold text-pink-700">{order.customer_name}</h4>
                      <p className="text-slate-600 mt-1 italic">"{order.items}"</p>
                    </div>
                    <button
                      onClick={() => markAsReady(order.id)}
                      className="bg-pink-100 text-pink-600 p-4 rounded-2xl hover:bg-pink-600 hover:text-white transition-all"
                    >
                      <Bell size={24} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          {/* Ready Column */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                <CheckCircle size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-700 uppercase tracking-widest">Prontos ({readyOrders.length})</h3>
            </div>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {readyOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-emerald-50 rounded-3xl p-6 shadow-sm border border-emerald-100 flex justify-between items-center"
                  >
                    <div>
                      <span className="text-[10px] font-mono text-emerald-600/60">#ORD-{order.id}</span>
                      <h4 className="text-xl font-bold text-emerald-800">{order.customer_name}</h4>
                      <p className="text-emerald-700/80 mt-1 italic">"{order.items}"</p>
                    </div>
                    <button
                      onClick={() => markAsDelivered(order.id)}
                      className="bg-emerald-600 text-white p-4 rounded-2xl hover:bg-emerald-700 transition-all"
                    >
                      <CheckCircle size={24} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDF2F8] font-sans text-slate-900 selection:bg-pink-200 selection:text-pink-900">
      {/* Navigation */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 flex justify-center items-start pt-4 md:pt-6 pointer-events-none`}
        style={scrolled ? {
          height: '100px',
          background: 'rgba(255, 255, 255, 0)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(13.7px)',
          WebkitBackdropFilter: 'blur(13.7px)',
        } : { height: '0px' }}
      >
        <nav className={`pointer-events-auto transition-all duration-500 
          w-[92%] sm:w-auto flex items-center justify-between sm:justify-start gap-2 sm:gap-8 px-4 sm:px-8 py-3 sm:py-4 rounded-full shadow-2xl border
          ${scrolled 
            ? 'bg-white/30 border-white/20' 
            : 'bg-white/70 backdrop-blur-xl border-pink-100'
          }`}>
          <div 
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2 cursor-pointer group shrink-0"
          >
            <div className="bg-pink-600 p-1.5 rounded-lg text-white group-hover:rotate-12 transition-transform">
              <Package size={18} />
            </div>
            <span className="font-black text-pink-700 tracking-tighter text-base md:text-lg hidden xs:inline">MARI AÇAÍ</span>
          </div>
          
          <div className="h-6 w-px bg-pink-100 hidden sm:block" />
          
          <div className="flex items-center gap-1 sm:gap-6">
            <button 
              onClick={() => setCurrentPage('home')}
              className={`flex items-center gap-2 font-bold text-xs sm:text-sm transition-all px-2 sm:px-3 py-1.5 rounded-full ${currentPage === 'home' ? 'text-pink-600 bg-pink-50' : 'text-slate-500 hover:text-pink-400'}`}
            >
              <HomeIcon size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden sm:inline">Início</span>
            </button>
            <button 
              onClick={() => setCurrentPage('products')}
              className={`flex items-center gap-2 font-bold text-xs sm:text-sm transition-all px-2 sm:px-3 py-1.5 rounded-full ${currentPage === 'products' ? 'text-pink-600 bg-pink-50' : 'text-slate-500 hover:text-pink-400'}`}
            >
              <ShoppingBag size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden sm:inline">Produtos</span>
            </button>
            {isLoggedIn ? (
              <>
                <button 
                  onClick={() => setCurrentPage('dashboard')}
                  className={`flex items-center gap-2 font-bold text-xs sm:text-sm transition-all px-2 sm:px-3 py-1.5 rounded-full ${currentPage === 'dashboard' ? 'text-pink-600 bg-pink-50' : 'text-slate-500 hover:text-pink-400'}`}
                >
                  <LayoutDashboard size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden sm:inline">Painel</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-400 hover:text-red-500 transition-all px-2 sm:px-3 py-1.5 rounded-full"
                >
                  <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden sm:inline">Sair</span>
                </button>
              </>
            ) : (
              <button 
                onClick={() => setCurrentPage('login')}
                className={`flex items-center gap-2 font-bold text-xs sm:text-sm transition-all px-2 sm:px-3 py-1.5 rounded-full ${currentPage === 'login' ? 'text-pink-600 bg-pink-50' : 'text-slate-500 hover:text-pink-400'}`}
              >
                <LogIn size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden sm:inline">Admin</span>
              </button>
            )}
          </div>
        </nav>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="pt-24"
        >
          {currentPage === 'home' && renderHome()}
          {currentPage === 'products' && renderProducts()}
          {currentPage === 'login' && renderLogin()}
          {currentPage === 'dashboard' && (isLoggedIn ? renderDashboard() : renderLogin())}
        </motion.div>
      </AnimatePresence>

      {/* Add Order Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl border border-pink-50"
            >
              <h2 className="text-3xl font-black text-pink-600 mb-6">Novo Pedido</h2>
              <form onSubmit={createOrder} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2 ml-1">Nome do Cliente</label>
                  <input
                    required
                    type="text"
                    value={newOrderName}
                    onChange={(e) => setNewOrderName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                    placeholder="Ex: João Silva"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2 ml-1">Itens do Pedido</label>
                  <textarea
                    required
                    value={newOrderItems}
                    onChange={(e) => setNewOrderItems(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-pink-500 outline-none transition-all h-32"
                    placeholder="Ex: Açaí 500ml + Morango + Leite Ninho"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-100 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-pink-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-pink-700 transition-all shadow-lg shadow-pink-200"
                  >
                    Criar Pedido
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Footer */}
      <footer className="bg-white border-t border-pink-100 pt-16 pb-24 mt-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand & Social */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-pink-600 p-1.5 rounded-lg text-white">
                <Package size={24} />
              </div>
              <span className="font-black text-pink-700 tracking-tighter text-2xl">MARI AÇAÍ</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Levando a qualidade, o sabor e a refrescância do melhor açaí da região diretamente para você.
            </p>
            <div className="flex gap-4">
              <a href="#" className="bg-pink-50 p-3 rounded-2xl text-pink-600 hover:bg-pink-600 hover:text-white transition-all shadow-sm">
                <Instagram size={20} />
              </a>
              <a href="#" className="bg-pink-50 p-3 rounded-2xl text-pink-600 hover:bg-pink-600 hover:text-white transition-all shadow-sm">
                <Facebook size={20} />
              </a>
              <a href="#" className="bg-pink-50 p-3 rounded-2xl text-pink-600 hover:bg-pink-600 hover:text-white transition-all shadow-sm">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-slate-800 uppercase tracking-widest">Onde Estamos</h4>
            <div className="flex gap-4 items-start">
              <div className="bg-pink-100 p-3 rounded-2xl text-pink-600">
                <MapPin size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-700">Mari Açaí - Matriz</p>
                <p className="text-slate-500 text-sm mt-1">
                  Rua das Palmeiras, 123<br />
                  Bairro Tropical - Cidade do Açaí<br />
                  CEP: 12345-678
                </p>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-slate-800 uppercase tracking-widest">Horário</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Segunda - Sexta</span>
                <span className="font-bold text-slate-700">14:00 - 22:00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Sábado - Domingo</span>
                <span className="font-bold text-slate-700">12:00 - 23:00</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-50 text-center">
          <p className="text-slate-400 text-xs">
            © {new Date().getFullYear()} Mari Açaí. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* ESP32 Info Footer (Only on Dashboard) */}
      {currentPage === 'dashboard' && isLoggedIn && (
        <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-pink-100 p-3 text-center z-40">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
            ESP32 Endpoint: <span className="text-pink-500 font-bold">{window.location.origin}/api/esp32/status</span>
          </p>
        </footer>
      )}
    </div>
  );
}
