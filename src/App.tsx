import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Clock, Package, Bell, Trash2, Plus, LogIn, ShoppingBag, Home as HomeIcon, LayoutDashboard, LogOut, ChevronRight, Star, Instagram, Facebook, MessageCircle, MapPin, Database, Calendar, Search, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabase';

const IceCreamIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 22C4 26 10 28 16 28S28 26 28 22H4Z" />
    <path d="M8 28C8 30 12 31 16 31S24 30 24 28" />
    <path d="M7 22C7 18 10 16 13 16S19 18 19 22" />
    <path d="M13 22C13 18 16 16 19 16S25 18 25 22" />
    <path d="M10 16C10 12 13 10 16 10S22 12 22 16" />
    <path d="M13 18C13 20 14 21 15 21" />
    <path d="M17 18C17 20 18 21 19 21" />
    <path d="M21 18C21 20 22 21 23 21" />
    <circle cx="16" cy="7" r="2.5" fill="currentColor" />
    <path d="M16 4.5C16 3 17 2 18 2" />
    <path d="M6 6L11 11" />
  </svg>
);

const AcaiIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 22C4 26 10 28 16 28S28 26 28 22H4Z" />
    <path d="M8 28C8 30 12 31 16 31S24 30 24 28" />
    <path d="M7 22C7 18 10 16 13 16S19 18 19 22" />
    <path d="M13 22C13 18 16 16 19 16S25 18 25 22" />
    <path d="M10 16C10 12 13 10 16 10S22 12 22 16" />
    <path d="M13 18C13 20 14 21 15 21" />
    <path d="M17 18C17 20 18 21 19 21" />
    <path d="M21 18C21 20 22 21 23 21" />
    <circle cx="14" cy="8" r="1.5" fill="currentColor" />
    <circle cx="18" cy="7" r="1.5" fill="currentColor" />
    <circle cx="16" cy="10" r="1.5" fill="currentColor" />
    <path d="M6 6L11 11" />
  </svg>
);

const ProductImage = ({ src, alt, className = "" }: { src: string, alt: string, className?: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const finalClassName = className.replace('transition-transform', 'transition-all');

  return (
    <>
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center z-0">
          <Loader2 className="w-8 h-8 text-pink-300 animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${finalClassName} ${isLoaded ? 'opacity-100' : 'opacity-0'} relative z-10`}
        onLoad={() => setIsLoaded(true)}
        referrerPolicy="no-referrer"
      />
    </>
  );
};

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
  ingredients: string;
  price: string;
  image: string;
  category: 'acai' | 'sorvete';
}

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Açaí Tradicional',
    description: 'Açaí puro com granola e banana, o clássico que nunca erra.',
    ingredients: 'Açaí orgânico, granola crocante, rodelas de banana prata e xarope de guaraná.',
    price: 'R$ 18,50',
    image: 'https://i.ibb.co/ksWCr0zV/a-ai.jpg',
    category: 'acai'
  },
  {
    id: 2,
    name: 'Sorvete de Ninho c/ Nutella',
    description: 'Cremosidade extrema com o melhor creme de avelã do mundo.',
    ingredients: 'Leite Ninho integral, Nutella artesanal, base cremosa de leite condensado.',
    price: 'R$ 12,00',
    image: 'https://i.ibb.co/tp6F3500/sorvete.jpg',
    category: 'sorvete'
  },
  {
    id: 3,
    name: 'Taça Mari Especial',
    description: 'Uma explosão de sabores com açaí e morangos frescos.',
    ingredients: 'Camadas de açaí, leite em pó, morangos, leite condensado e chantilly.',
    price: 'R$ 25,00',
    image: 'https://picsum.photos/seed/icecream/400/300',
    category: 'acai'
  },
  {
    id: 4,
    name: 'Shake de Chocolate',
    description: 'Muito chocolate e cremosidade em um só lugar.',
    ingredients: 'Sorvete de chocolate belga, calda de chocolate e pedaços de brownie.',
    price: 'R$ 15,00',
    image: 'https://picsum.photos/seed/shake/400/300',
    category: 'sorvete'
  }
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'products' | 'login' | 'dashboard'>('home');
  const [activeCategory, setActiveCategory] = useState<'all' | 'acai' | 'sorvete'>('all');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [dashboardTab, setDashboardTab] = useState<'orders' | 'products' | 'deliveries'>('orders');
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [newOrderName, setNewOrderName] = useState('');
  const [newOrderItems, setNewOrderItems] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [selectedOrderProducts, setSelectedOrderProducts] = useState<{ productId: number, quantity: number }[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<'connected' | 'error' | 'not_configured'>('not_configured');

  // New Product Form State
  const [searchQuery, setSearchQuery] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductIng, setNewProductIng] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductImage, setNewProductImage] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<'acai' | 'sorvete'>('acai');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchQuery('');
  }, [currentPage, dashboardTab]);

  useEffect(() => {
    const checkSupabase = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setSupabaseStatus('not_configured');
        return;
      }
      try {
        // Try searching for any response, not necessarily a successful table read
        // because the user might not have tables yet
        const { error } = await supabase.from('products').select('*', { count: 'exact', head: true }).limit(1);
        
        if (error && error.code === 'PGRST116') {
          // Table doesn't exist yet, but connection is alive
          setSupabaseStatus('connected');
        } else if (error) {
          // Other error (maybe auth/network)
          console.error('Supabase connection error check:', error);
          setSupabaseStatus('connected'); // Still set to connected to allow attempt
        } else {
          setSupabaseStatus('connected');
        }
      } catch (err) {
        console.error('Supabase initialization catch:', err);
        setSupabaseStatus('connected'); // Set to connected to try fetching anyway
      }
    };
    checkSupabase();
  }, []);

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsLoggedIn(true);
        setCurrentPage('dashboard');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setCurrentPage('home');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProducts = async () => {
    if (supabaseStatus === 'connected' && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('id', { ascending: true });
        
        if (error) throw error;
        if (data) {
          // Merge with default products if empty?
          // For now just set data if it exists
          if (data.length > 0) {
            setProducts(data);
          } else {
            setProducts(PRODUCTS); // Keep defaults if table is empty
          }
        }
      } catch (error) {
        console.error('Supabase fetch products error:', error);
        setProducts(PRODUCTS); // Fallback to defaults on error
      }
    } else {
      setProducts(PRODUCTS); // Ensure defaults are set if not connected
    }
  };

  const fetchOrders = async () => {
    if (!isLoggedIn) return;

    // Use Supabase if configured
    if (supabaseStatus === 'connected' && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        console.error('Supabase fetch error:', error);
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroImageIndex((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [supabaseStatus]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchOrders();

      // Real-time with Supabase
      let supabaseSubscription: any = null;
      if (supabaseStatus === 'connected' && supabase) {
        supabaseSubscription = supabase
          .channel('orders_changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
            fetchOrders();
          })
          .subscribe();
      }

      return () => {
        if (supabaseSubscription) supabase.removeChannel(supabaseSubscription);
      };
    }
  }, [isLoggedIn, supabaseStatus]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);

    if (supabaseStatus === 'connected' && supabase) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setLoginError(error.message === 'Invalid login credentials' ? 'Credenciais inválidas' : error.message);
          setLoggingIn(false);
          return;
        }

        setCurrentPage('dashboard');
      } catch (err) {
        console.error('Login error:', err);
        setLoginError('Erro ao conectar ao servidor');
      } finally {
        setLoggingIn(false);
      }
    } else {
      setLoginError('Supabase não configurado ou offline');
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsLoggedIn(false);
    setCurrentPage('home');
  };

  const triggerLed = async () => {
    try {
      await updateLedStatus('on');
      setTimeout(() => updateLedStatus('off'), 3000);
    } catch (error) {
      console.error('Error triggering LED:', error);
    }
  };

  const updateLedStatus = async (status: 'on' | 'off') => {
    try {
      await fetch('/api/esp32/led', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error('Error updating LED status:', error);
    }
  };

  const markAsReady = async (id: number) => {
    if (supabaseStatus === 'connected' && supabase) {
      try {
        const { error } = await supabase
          .from('orders')
          .update({ status: 'ready' })
          .eq('id', id);
        if (error) throw error;
        await updateLedStatus('on');
        fetchOrders();
      } catch (error) {
        console.error('Supabase update error:', error);
      }
    }
  };

  const markAsDelivered = async (id: number) => {
    if (supabaseStatus === 'connected' && supabase) {
      try {
        const { error } = await supabase
          .from('orders')
          .update({ status: 'delivered' })
          .eq('id', id);
        if (error) throw error;
        await updateLedStatus('off');
        fetchOrders();
      } catch (error) {
        console.error('Supabase update error:', error);
      }
    }
  };

  const createOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format items string from selected products
    const itemsList = selectedOrderProducts
      .map(item => {
        const product = products.find(p => p.id === item.productId);
        return product ? `${item.quantity}x ${product.name}` : '';
      })
      .filter(Boolean)
      .join(', ');

    if (!itemsList && !newOrderItems) {
      alert('Selecione pelo menos um produto ou descreva o pedido.');
      return;
    }

    const finalItems = itemsList || newOrderItems;

    if (supabaseStatus === 'connected' && supabase) {
      try {
        if (editingOrder) {
          const { error } = await supabase
            .from('orders')
            .update({ 
              customer_name: newOrderName, 
              items: finalItems
            })
            .eq('id', editingOrder.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('orders')
            .insert([{ 
              customer_name: newOrderName, 
              items: finalItems,
              status: 'pending'
            }]);
          if (error) throw error;
        }
        
        resetOrderForm();
        fetchOrders();
      } catch (error) {
        console.error('Supabase order operation error:', error);
      }
    }
  };

  const resetOrderForm = () => {
    setNewOrderName('');
    setNewOrderItems('');
    setSelectedOrderProducts([]);
    setEditingOrder(null);
    setShowAddModal(false);
  };

  const openAddOrder = () => {
    resetOrderForm();
    setShowAddModal(true);
  };

  const openEditOrder = (order: Order) => {
    setEditingOrder(order);
    setNewOrderName(order.customer_name);
    setNewOrderItems(order.items);
    setShowAddModal(true);
  };

  const deleteOrder = async (id: number) => {
    if (supabaseStatus === 'connected' && supabase) {
      try {
        const { error } = await supabase.from('orders').delete().eq('id', id);
        if (error) throw error;
        fetchOrders();
      } catch (error) {
        console.error('Supabase delete order error:', error);
      }
    } else {
      setOrders(orders.filter(o => o.id !== id));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!supabase || supabaseStatus !== 'connected') {
      alert('Supabase não está conectado para upload de imagens.');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;

      // Try server-side S3 upload first (using the endpoint provided by user)
      try {
        const presignedResponse = await fetch('/api/storage/presigned-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName, contentType: file.type })
        });

        if (presignedResponse.ok) {
          const contentType = presignedResponse.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Servidor retornou uma resposta inválida (não JSON). Verifique se o servidor está rodando corretamente.');
          }
          const { uploadUrl, publicUrl } = await presignedResponse.json();
          const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type }
          });

          if (uploadRes.ok) {
            setNewProductImage(publicUrl);
            return;
          }
        }
      } catch (s3Error) {
        console.warn('Server-side S3 upload failed, falling back to standard SDK:', s3Error);
      }

      // Fallback to standard Supabase SDK clientside upload
      const filePath = `${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('imagens')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('imagens')
        .getPublicUrl(filePath);

      setNewProductImage(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erro ao carregar imagem.');
    } finally {
      setUploading(false);
    }
  };

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (supabaseStatus === 'connected' && supabase) {
      try {
        const productData = { 
          name: newProductName,
          description: newProductDesc,
          ingredients: newProductIng,
          price: newProductPrice,
          image: newProductImage || 'https://picsum.photos/seed/new/400/300',
          category: newProductCategory
        };

        if (editingProduct) {
          const { error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', editingProduct.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('products')
            .insert([productData]);
          if (error) throw error;
        }
        
        resetProductForm();
        fetchProducts();
      } catch (error) {
        console.error('Supabase product operation error:', error);
      }
    }
  };

  const resetProductForm = () => {
    setNewProductName('');
    setNewProductDesc('');
    setNewProductIng('');
    setNewProductPrice('');
    setNewProductImage('');
    setNewProductCategory('acai');
    setEditingProduct(null);
    setShowAddProductModal(false);
  };

  const openAddProduct = () => {
    resetProductForm();
    setShowAddProductModal(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProductName(product.name);
    setNewProductDesc(product.description);
    setNewProductIng(product.ingredients);
    setNewProductPrice(product.price);
    setNewProductImage(product.image);
    setNewProductCategory(product.category);
    setShowAddProductModal(true);
  };

  const deleteProduct = async (id: number) => {
    if (supabaseStatus === 'connected' && supabase) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        fetchProducts();
      } catch (error) {
        console.error('Supabase delete product error:', error);
      }
    }
  };

  const updateProductQuantity = (productId: number, delta: number) => {
    setSelectedOrderProducts(prev => {
      const existing = prev.find(p => p.productId === productId);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) {
          return prev.filter(p => p.productId !== productId);
        }
        return prev.map(p => p.productId === productId ? { ...p, quantity: newQty } : p);
      }
      if (delta > 0) {
        return [...prev, { productId, quantity: 1 }];
      }
      return prev;
    });
  };

  const formatPrice = (price: string | number) => {
    if (price === undefined || price === null || price === '') return 'R$ 0,00';
    const s = String(price).trim();
    if (s.startsWith('R$')) return s;
    
    // Remove symbols and spaces
    let clean = s.replace(/[R$\s]/g, '');
    
    // Logic: only remove dots if there's a comma (Brazilian style thousands)
    // OR if there are multiple dots (also likely thousands)
    // If only one dot exists and NO comma, it's likely a decimal separator (US/Standard style)
    const hasComma = clean.includes(',');
    const dotCount = (clean.match(/\./g) || []).length;
    
    if (hasComma || dotCount > 1) {
      clean = clean.replace(/\./g, '').replace(',', '.');
    }
    
    const num = parseFloat(clean);
    if (isNaN(num)) return s;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  };

  const calculateTotal = () => {
    return selectedOrderProducts.reduce((acc, item) => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        let cleanPrice = product.price.replace(/[R$\s]/g, '');
        
        const hasComma = cleanPrice.includes(',');
        const dotCount = (cleanPrice.match(/\./g) || []).length;
        
        if (hasComma || dotCount > 1) {
          cleanPrice = cleanPrice.replace(/\./g, '').replace(',', '.');
        }
        
        const price = parseFloat(cleanPrice);
        return acc + (isNaN(price) ? 0 : price * item.quantity);
      }
      return acc;
    }, 0);
  };

  const renderHome = () => {
    const heroImages = [
      "https://i.ibb.co/tp6F3500/sorvete.jpg",
      "https://i.ibb.co/ksWCr0zV/a-ai.jpg"
    ];

    return (
      <div className="space-y-12 pb-20">
        <section className="relative h-[70vh] flex items-end justify-center overflow-hidden rounded-b-[4rem] shadow-2xl pb-20 bg-pink-950">
          <AnimatePresence initial={false}>
            <motion.img 
              key={heroImageIndex}
              src={heroImages[heroImageIndex]} 
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ 
                x: { type: "tween", duration: 1.5, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 1.2 }
              }}
              className="absolute inset-0 w-full h-full object-cover brightness-30 z-0"
              alt="Mari Açaí Background"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>

          {/* Carousel Dots */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroImageIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${heroImageIndex === i ? 'bg-pink-500 w-6' : 'bg-white/50'}`}
              />
            ))}
          </div>

          <div className="absolute bottom-4 right-8 z-20 text-[10px] text-white/40">
            <a href="https://pt.vecteezy.com/fotos-gratis/sorvetes" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Sorvetes Fotos de banco de imagens por Vecteezy
            </a>
          </div>
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
  };

  const renderProducts = () => {
    const filteredProducts = products.filter(p => {
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    return (
      <div className="max-w-7xl mx-auto px-6 py-12 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-pink-700 mb-4">Nosso Cardápio</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Escolha entre nossas opções clássicas ou monte sua própria combinação perfeita.</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome ou descrição..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-pink-100 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
          {[
            { id: 'all', label: 'Todos', icon: ShoppingBag },
            { id: 'acai', label: 'Açaí', icon: AcaiIcon },
            { id: 'sorvete', label: 'Sorvetes', icon: IceCreamIcon },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`flex items-center justify-center gap-2 px-8 py-3 rounded-full font-bold transition-all shadow-sm w-full sm:w-auto ${
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
                  <ProductImage 
                    src={product.image} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    alt={product.name}
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-pink-600 font-bold text-sm z-20">
                    {formatPrice(product.price)}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-pink-600 transition-colors">{product.name}</h3>
                  <p className="text-slate-500 text-sm mb-4">{product.description}</p>
                  <button 
                    onClick={() => setSelectedProduct(product)}
                    className="w-full bg-pink-50 text-pink-600 py-3 rounded-xl font-bold hover:bg-pink-600 hover:text-white transition-all"
                  >
                    Ingredientes
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Ingredients Modal */}
        <AnimatePresence>
          {selectedProduct && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl border border-pink-50 relative"
              >
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-6 right-6 text-slate-400 hover:text-pink-600 transition-colors"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
                
                <div className="bg-pink-100 w-16 h-16 rounded-2xl flex items-center justify-center text-pink-600 mb-6">
                  <Star size={32} />
                </div>
                
                <h2 className="text-3xl font-black text-pink-700 mb-2">{selectedProduct.name}</h2>
                <p className="text-slate-400 font-medium mb-6 uppercase tracking-widest text-xs">Composição e Ingredientes</p>
                
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <p className="text-slate-600 leading-relaxed italic">
                    "{selectedProduct.ingredients}"
                  </p>
                </div>

                <button
                  onClick={() => setSelectedProduct(null)}
                  className="w-full mt-8 bg-pink-600 text-white py-4 rounded-2xl font-bold hover:bg-pink-700 transition-all shadow-lg shadow-pink-200"
                >
                  Fechar
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
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
            <label className="block text-sm font-bold text-slate-600 mb-2 ml-1">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
              placeholder="seu@email.com"
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
            disabled={loggingIn}
            className="w-full bg-pink-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-pink-700 transition-all shadow-lg shadow-pink-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loggingIn ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Verificando...
              </>
            ) : (
              'Entrar no Painel'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );

  const renderDashboard = () => {
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const readyOrders = orders.filter(o => o.status === 'ready');
    const deliveredOrders = orders.filter(o => {
      if (o.status !== 'delivered') return false;
      // Handle both ISO (Supabase) and SQLite date formats
      const orderDate = o.created_at.includes('T') 
        ? o.created_at.split('T')[0] 
        : o.created_at.split(' ')[0];
      return orderDate >= startDate && orderDate <= endDate;
    });

    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6 pb-24">
        {/* Dashboard Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div className="w-full lg:w-auto">
            <h2 className="text-2xl md:text-3xl font-black text-pink-700 mb-4 lg:mb-0">Painel Administrativo</h2>
            
            {/* Segmented Control Tabs */}
            <div className="bg-slate-100 p-1 rounded-2xl flex w-full lg:w-fit mt-4">
              <button 
                onClick={() => setDashboardTab('orders')}
                className={`flex-1 lg:flex-none px-4 md:px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${dashboardTab === 'orders' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Pedidos
              </button>
              <button 
                onClick={() => setDashboardTab('deliveries')}
                className={`flex-1 lg:flex-none px-4 md:px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${dashboardTab === 'deliveries' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Entregas
              </button>
              <button 
                onClick={() => setDashboardTab('products')}
                className={`flex-1 lg:flex-none px-4 md:px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${dashboardTab === 'products' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Produtos
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {dashboardTab === 'orders' && (
              <>
                <button 
                  onClick={triggerLed}
                  className="flex-1 lg:flex-none bg-pink-500 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-pink-400 transition-colors shadow-lg shadow-pink-100"
                >
                  <Bell size={20} /> <span className="sm:hidden lg:inline">Testar LED</span>
                </button>
                <button 
                  onClick={openAddOrder}
                  className="flex-1 lg:flex-none bg-white text-pink-600 px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-pink-50 transition-colors shadow-lg shadow-pink-50 border border-pink-100"
                >
                  <Plus size={20} /> Novo Pedido
                </button>
              </>
            )}
            {dashboardTab === 'products' && (
              <button 
                onClick={openAddProduct}
                className="w-full lg:w-auto bg-pink-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-pink-700 transition-colors shadow-lg shadow-pink-200"
              >
                <Plus size={20} /> Novo Produto
              </button>
            )}
          </div>
        </div>

        {dashboardTab === 'orders' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pending Column */}
            <section>
              <div className="flex items-center gap-3 mb-6 sticky top-0 bg-slate-50/80 backdrop-blur-sm py-2 z-10">
                <div className="bg-amber-100 p-2.5 rounded-xl text-amber-600">
                  <Clock size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-700 uppercase tracking-widest">Em Preparo ({pendingOrders.length})</h3>
              </div>
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {pendingOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white rounded-[2rem] p-5 md:p-6 shadow-sm border border-pink-50 flex justify-between items-center group hover:shadow-md transition-all"
                    >
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded">#ORD-{order.id}</span>
                          <span className="text-[10px] font-bold text-amber-500 uppercase">{new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <h4 className="text-lg md:text-xl font-bold text-slate-800 leading-tight">{order.customer_name}</h4>
                        <p className="text-slate-500 mt-1 text-sm italic line-clamp-2">"{order.items}"</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditOrder(order)}
                          className="bg-slate-100 text-slate-500 p-3 rounded-2xl hover:bg-pink-100 hover:text-pink-600 transition-all active:scale-95"
                          title="Editar Pedido"
                        >
                          <Plus size={18} className="rotate-0" />
                        </button>
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="bg-slate-100 text-slate-500 p-3 rounded-2xl hover:bg-red-100 hover:text-red-600 transition-all active:scale-95"
                          title="Excluir Pedido"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => markAsReady(order.id)}
                          className="bg-pink-100 text-pink-600 p-5 rounded-2xl hover:bg-pink-600 hover:text-white transition-all shadow-sm active:scale-95"
                          title="Marcar como Pronto"
                        >
                          <Bell size={24} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {pendingOrders.length === 0 && (
                  <div className="py-12 text-center bg-white/50 rounded-[2rem] border border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">Nenhum pedido em preparo</p>
                  </div>
                )}
              </div>
            </section>

            {/* Ready Column */}
            <section>
              <div className="flex items-center gap-3 mb-6 sticky top-0 bg-slate-50/80 backdrop-blur-sm py-2 z-10">
                <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600">
                  <CheckCircle size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-700 uppercase tracking-widest">Prontos ({readyOrders.length})</h3>
              </div>
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {readyOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-emerald-50/50 rounded-[2rem] p-5 md:p-6 shadow-sm border border-emerald-100 flex justify-between items-center group hover:shadow-md transition-all"
                    >
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded">#ORD-{order.id}</span>
                          <span className="text-[10px] font-bold text-emerald-500 uppercase">Pronto</span>
                        </div>
                        <h4 className="text-lg md:text-xl font-bold text-emerald-900 leading-tight">{order.customer_name}</h4>
                        <p className="text-emerald-700/70 mt-1 text-sm italic line-clamp-2">"{order.items}"</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditOrder(order)}
                          className="bg-white/50 text-emerald-600 p-3 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all active:scale-95"
                          title="Editar Pedido"
                        >
                          <Plus size={18} className="rotate-0" />
                        </button>
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="bg-white/50 text-red-500 p-3 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-95"
                          title="Excluir Pedido"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => markAsDelivered(order.id)}
                          className="bg-emerald-600 text-white p-5 rounded-2xl hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                          title="Marcar como Entregue"
                        >
                          <CheckCircle size={24} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {readyOrders.length === 0 && (
                  <div className="py-12 text-center bg-emerald-50/30 rounded-[2rem] border border-dashed border-emerald-100">
                    <p className="text-emerald-400 font-medium">Nenhum pedido pronto para entrega</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : dashboardTab === 'deliveries' ? (
          <div className="space-y-8">
            {/* Date Filter Bar */}
            <div className="bg-white p-5 md:p-6 rounded-[2rem] shadow-sm border border-pink-50 flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Data Início</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400" size={18} />
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-pink-500 transition-all font-bold text-slate-600 text-sm"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Data Fim</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400" size={18} />
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-pink-500 transition-all font-bold text-slate-600 text-sm"
                  />
                </div>
              </div>
              <button className="bg-pink-600 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-pink-700 transition-all shadow-lg shadow-pink-100 active:scale-95">
                <Search size={18} /> <span className="sm:hidden lg:inline">Filtrar</span>
              </button>
            </div>

            {/* Deliveries Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {deliveredOrders.length > 0 ? (
                  deliveredOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded">#ORD-{order.id}</span>
                          <h4 className="text-xl font-bold text-slate-800 mt-1">{order.customer_name}</h4>
                        </div>
                        <div className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                          Entregue
                        </div>
                      </div>
                      <p className="text-slate-500 text-sm italic line-clamp-3">"{order.items}"</p>
                      <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Data</span>
                          <span className="text-xs font-bold text-slate-500">{new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Hora</span>
                          <span className="text-xs font-bold text-slate-500">{new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center bg-white/50 rounded-[3rem] border border-dashed border-slate-200">
                    <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                      <Search size={32} />
                    </div>
                    <p className="text-slate-400 font-bold">Nenhuma entrega encontrada para este período.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Search Bar for Dashboard Products */}
            <div className="max-w-md relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar produtos..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-pink-100 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm transition-all"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products
                .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((product) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-pink-50 flex flex-col group hover:shadow-xl transition-all duration-500"
              >
                <div className="h-48 relative overflow-hidden">
                  <ProductImage src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-black text-pink-600 shadow-sm z-20">
                    {formatPrice(product.price)}
                  </div>
                  <div className="absolute top-4 left-4 bg-pink-600/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5 z-20">
                    {product.category === 'acai' ? (
                      <>
                        <AcaiIcon className="w-3 h-3" />
                        Açaí
                      </>
                    ) : (
                      <>
                        <IceCreamIcon className="w-3 h-3" />
                        Sorvete
                      </>
                    )}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h4 className="text-xl font-bold text-slate-800 mb-2">{product.name}</h4>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-1">{product.description}</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openEditProduct(product)}
                      className="flex-1 bg-pink-50 text-pink-600 py-3 rounded-2xl font-bold hover:bg-pink-600 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => deleteProduct(product.id)}
                      className="bg-red-50 text-red-500 p-3 rounded-2xl font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center active:scale-95"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            </div>
          </div>
        )}
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
            <div className="flex flex-col">
              <span className="font-black text-pink-700 tracking-tighter text-base md:text-lg leading-none">MARI AÇAÍ</span>
              <div className="flex items-center gap-1 mt-0.5">
                <div className={`w-1 h-1 rounded-full ${
                  supabaseStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 
                  supabaseStatus === 'error' ? 'bg-red-500' : 'bg-slate-300'
                }`} />
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest hidden xs:inline">
                  {supabaseStatus === 'connected' ? 'Supabase Online' : 
                   supabaseStatus === 'error' ? 'Supabase Error' : 'Local Mode'}
                </span>
              </div>
            </div>
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

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddProductModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[3rem] p-10 w-full max-w-2xl shadow-2xl border border-pink-50 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black text-pink-600">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
                <button onClick={resetProductForm} className="text-slate-400 hover:text-pink-600">
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>
              <form onSubmit={createProduct} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 ml-1">Nome do Produto</label>
                    <input
                      required
                      type="text"
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                      placeholder="Ex: Açaí com Nutella"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 ml-1">Preço</label>
                    <input
                      required
                      type="text"
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                      placeholder="Ex: R$ 22,00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2 ml-1">Categoria</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setNewProductCategory('acai')}
                      className={`flex items-center justify-center gap-3 py-4 rounded-2xl font-bold border-2 transition-all ${
                        newProductCategory === 'acai' 
                          ? 'border-pink-600 bg-pink-50 text-pink-600' 
                          : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-pink-200'
                      }`}
                    >
                      <AcaiIcon className="w-6 h-6" />
                      Açaí
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewProductCategory('sorvete')}
                      className={`flex items-center justify-center gap-3 py-4 rounded-2xl font-bold border-2 transition-all ${
                        newProductCategory === 'sorvete' 
                          ? 'border-pink-600 bg-pink-50 text-pink-600' 
                          : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-pink-200'
                      }`}
                    >
                      <IceCreamIcon className="w-6 h-6" />
                      Sorvete
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2 ml-1">Descrição Curta</label>
                  <textarea
                    required
                    value={newProductDesc}
                    onChange={(e) => setNewProductDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-pink-500 outline-none transition-all h-24 resize-none"
                    placeholder="Descreva o sabor..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2 ml-1">Ingredientes (Separados por vírgula)</label>
                  <textarea
                    required
                    value={newProductIng}
                    onChange={(e) => setNewProductIng(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-pink-500 outline-none transition-all h-24 resize-none"
                    placeholder="Ex: Açaí, Nutella, Leite em pó..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2 ml-1">Imagem do Produto</label>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <input
                        type="text"
                        value={newProductImage}
                        onChange={(e) => setNewProductImage(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                        placeholder="URL da imagem ou carregue um arquivo"
                      />
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="bg-pink-50 text-pink-600 px-6 rounded-2xl font-bold border-2 border-pink-100 hover:border-pink-600 transition-all flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
                      >
                        {uploading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Upload className="w-5 h-5" />
                        )}
                        {uploading ? 'Enviando...' : 'Upload'}
                      </button>
                    </div>
                    {newProductImage && (
                      <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                        <ProductImage 
                          src={newProductImage} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setNewProductImage('')}
                          className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full text-pink-600 hover:bg-pink-600 hover:text-white transition-all shadow-sm"
                        >
                          <Plus size={16} className="rotate-45" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-pink-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-pink-700 transition-all shadow-lg shadow-pink-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Aguarde o upload...' : (editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[3rem] p-10 w-full max-w-2xl shadow-2xl border border-pink-50 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black text-pink-600">{editingOrder ? 'Editar Pedido' : 'Novo Pedido'}</h2>
                <button onClick={resetOrderForm} className="text-slate-400 hover:text-pink-600">
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>
              
              <form onSubmit={createOrder} className="space-y-8">
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
                  <label className="block text-sm font-bold text-slate-600 mb-4 ml-1">Selecione os Produtos</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-60 overflow-y-auto pr-2 no-scrollbar">
                    {products.map(product => {
                      const selected = selectedOrderProducts.find(p => p.productId === product.id);
                      return (
                        <div key={product.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="bg-white p-2 rounded-xl text-pink-500 shadow-sm">
                              {product.category === 'acai' ? <AcaiIcon className="w-4 h-4" /> : <IceCreamIcon className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="font-bold text-slate-700 text-sm">{product.name}</p>
                              <p className="text-pink-600 text-xs font-bold">{formatPrice(product.price)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => updateProductQuantity(product.id, -1)}
                              className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-pink-50 hover:text-pink-600 transition-all"
                            >
                              -
                            </button>
                            <span className="font-bold text-slate-700 w-4 text-center">{selected?.quantity || 0}</span>
                            <button
                              type="button"
                              onClick={() => updateProductQuantity(product.id, 1)}
                              className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-pink-50 hover:text-pink-600 transition-all"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-pink-50 p-6 rounded-[2rem] border border-pink-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-pink-600 text-xs font-bold uppercase tracking-widest">Total do Pedido</p>
                      <h3 className="text-3xl font-black text-pink-700">
                        R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-[10px] uppercase font-bold">Itens Selecionados</p>
                      <p className="text-pink-600 font-bold">
                        {selectedOrderProducts.reduce((acc, curr) => acc + curr.quantity, 0)} un.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={resetOrderForm}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-100 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-pink-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-pink-700 transition-all shadow-lg shadow-pink-200"
                  >
                    {editingOrder ? 'Salvar Alterações' : 'Finalizar Pedido'}
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
