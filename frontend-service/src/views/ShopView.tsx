import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { orderService } from '../services/orderService';
import { aiService } from '../services/aiService';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { Product } from '../types/product';
import { Category } from '../types/category';
import { Address } from '../types/user';
import { formatCurrency, formatDate } from '../utils/formatters';
import Search from '@mui/icons-material/Search';
import Close from '@mui/icons-material/Close';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import Chat from '@mui/icons-material/Chat';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LogOut from '@mui/icons-material/Logout';
import History from '@mui/icons-material/History';
import Send from '@mui/icons-material/Send';
import LocalOfferOutlined from '@mui/icons-material/LocalOfferOutlined';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import NavigateBefore from '@mui/icons-material/NavigateBefore';
import NavigateNext from '@mui/icons-material/NavigateNext';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import AdminPanelSettings from '@mui/icons-material/AdminPanelSettings';

interface CartItem {
  product: Product;
  quantity: number;
}

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export const ShopView: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(authService.getCurrentSession());

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorProducts, setErrorProducts] = useState('');

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(8);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('shopping_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [customerName, setCustomerName] = useState(session?.username || '');
  const [customerEmail, setCustomerEmail] = useState(session?.email || '');
  const [shippingAddress, setShippingAddress] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Address states during checkout
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('NEW');
  const [phone, setPhone] = useState('');
  const [saveNewAddress, setSaveNewAddress] = useState(false);

  // Dynamic states
  const [cartBounce, setCartBounce] = useState(false);
  const [checkoutHeight, setCheckoutHeight] = useState(session ? 420 : 180);
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState<any | null>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (session) {
      userService.getMyAddresses()
        .then(data => {
          setAddresses(data);
          const defaultAddr = data.find(a => a.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(String(defaultAddr.id));
            setShippingAddress(defaultAddr.addressLine);
            setPhone(defaultAddr.phone);
          } else if (data.length > 0) {
            setSelectedAddressId(String(data[0].id));
            setShippingAddress(data[0].addressLine);
            setPhone(data[0].phone);
          } else {
            setSelectedAddressId('NEW');
          }
        })
        .catch(err => console.error('Failed to load user addresses', err));
      setCheckoutHeight(420);
    } else {
      setAddresses([]);
      setSelectedAddressId('NEW');
      setCheckoutHeight(180);
    }
  }, [session]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    const newHeight = window.innerHeight - e.clientY;
    const minHeight = 150;
    const maxHeight = window.innerHeight - 150;
    if (newHeight >= minHeight && newHeight <= maxHeight) {
      setCheckoutHeight(newHeight);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleSelectAddress = (id: string) => {
    setSelectedAddressId(id);
    if (id === 'NEW') {
      setShippingAddress('');
      setPhone('');
    } else {
      const addr = addresses.find(a => String(a.id) === id);
      if (addr) {
        setShippingAddress(addr.addressLine);
        setPhone(addr.phone);
      }
    }
  };

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailQty, setDetailQty] = useState(1);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [errorOrders, setErrorOrders] = useState('');

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: 'Hello! I am your AI Shopping Assistant. How can I help you choose clothing or answer policy questions today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleLogout = () => {
      setSession(null);
      setCustomerName('');
      setCustomerEmail('');
      setMyOrders([]);
    };
    window.addEventListener('auth-logout', handleLogout);
    return () => window.removeEventListener('auth-logout', handleLogout);
  }, []);

  useEffect(() => {
    localStorage.setItem('shopping_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatOpen]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories('', 0, 100);
        setCategories(data.content);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      setErrorProducts('');
      try {
        const catId = selectedCategory === 'ALL' ? undefined : Number(selectedCategory);
        const data = await productService.getProducts(search, catId, page, pageSize);
        setProducts(data.content);
        setTotalPages(data.totalPages);
      } catch (err: any) {
        setErrorProducts(err.message || 'Failed to fetch products catalog.');
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [page, search, selectedCategory]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleAddToCart = (e: React.MouseEvent | null, product: Product, quantityToAdd: number) => {
    if (product.stock <= 0) {
      alert('Product is out of stock!');
      return;
    }
    const existing = cart.find(item => item.product.id === product.id);
    const currentQty = existing ? existing.quantity : 0;

    if (currentQty + quantityToAdd > product.stock) {
      alert(`Cannot add more. Available stock: ${product.stock}`);
      return;
    }

    if (existing) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + quantityToAdd }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: quantityToAdd }]);
    }

    // Fly anim
    if (e) {
      const cartBtn = document.getElementById('cart-btn');
      if (cartBtn) {
        const buttonEl = e.currentTarget as HTMLElement;
        const cardEl = buttonEl.closest('.product-card');
        const imgEl = cardEl ? cardEl.querySelector('img') : null;
        const startRect = imgEl ? imgEl.getBoundingClientRect() : buttonEl.getBoundingClientRect();
        const cartRect = cartBtn.getBoundingClientRect();

        const flyingImg = document.createElement('img');
        flyingImg.src = getImageUrl(product.imageUrl);
        flyingImg.style.position = 'fixed';
        flyingImg.style.left = `${startRect.left}px`;
        flyingImg.style.top = `${startRect.top}px`;
        flyingImg.style.width = `${startRect.width}px`;
        flyingImg.style.height = `${startRect.height}px`;
        flyingImg.style.borderRadius = '50%';
        flyingImg.style.objectFit = 'cover';
        flyingImg.style.zIndex = '9999';
        flyingImg.style.pointerEvents = 'none';
        flyingImg.style.transition = 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)';

        document.body.appendChild(flyingImg);

        // Force layout engine reflow
        flyingImg.offsetWidth;

        flyingImg.style.left = `${cartRect.left + cartRect.width / 2 - 15}px`;
        flyingImg.style.top = `${cartRect.top + cartRect.height / 2 - 15}px`;
        flyingImg.style.width = '30px';
        flyingImg.style.height = '30px';
        flyingImg.style.opacity = '0.3';

        setTimeout(() => {
          flyingImg.remove();
          setCartBounce(true);
          setTimeout(() => setCartBounce(false), 300);
        }, 800);
      }
    }
  };

  const updateCartQty = (productId: number, delta: number) => {
    const item = cart.find(i => i.product.id === productId);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      setCart(cart.filter(i => i.product.id !== productId));
    } else if (newQty > item.product.stock) {
      alert(`Cannot increase. Stock limit: ${item.product.stock}`);
    } else {
      setCart(cart.map(i => i.product.id === productId ? { ...i, quantity: newQty } : i));
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(i => i.product.id !== productId));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      alert('Please login to place an order.');
      navigate('/login');
      return;
    }
    if (cart.length === 0) {
      setOrderError('Your cart is empty.');
      return;
    }
    if (!shippingAddress.trim() || !customerName.trim() || !customerEmail.trim() || !phone.trim()) {
      setOrderError('Please enter shipping address, phone, and contact details.');
      return;
    }

    setOrderError('');
    setIsOrdering(true);
    try {
      if (selectedAddressId === 'NEW' && saveNewAddress) {
        try {
          await userService.createAddress({
            addressName: 'Shipping Address',
            addressLine: shippingAddress,
            phone: phone,
            isDefault: addresses.length === 0
          });
        } catch (addrErr: any) {
          console.error("Failed to save address to address book", addrErr);
        }
      }

      const items = cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      const formattedAddress = `${shippingAddress} (Phone: ${phone})`;

      const checkoutRes = await orderService.checkout({
        customerName,
        customerEmail,
        shippingAddress: formattedAddress,
        items
      });

      setCart([]);
      setIsCartOpen(false);

      if (checkoutRes.approveUrl) {
        window.location.href = checkoutRes.approveUrl;
      } else {
        throw new Error('PayPal checkout url is unavailable.');
      }
    } catch (err: any) {
      setOrderError(err.message || 'Checkout failed. Please try again.');
    } finally {
      setIsOrdering(false);
    }
  };

  const handleOpenHistory = async () => {
    if (!session) {
      alert('Please login to view order history.');
      navigate('/login');
      return;
    }
    setIsHistoryOpen(true);
    setLoadingOrders(true);
    setErrorOrders('');
    try {
      const data = await orderService.getMyOrders(0, 50);
      setMyOrders(data.content);
    } catch (err: any) {
      setErrorOrders(err.message || 'Failed to load order history.');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    if (!session) {
      alert('Please log in to chat with the support chatbot.');
      navigate('/login');
      return;
    }

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setSendingChat(true);

    try {
      const res = await aiService.sendMessage(userMsg);
      setChatMessages(prev => [...prev, { sender: 'bot', text: res.response }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I am having trouble connecting to my service right now.' }]);
    } finally {
      setSendingChat(false);
    }
  };

  const getImageUrl = (url?: string) =>
    url ? (url.startsWith('http') ? url : `http://localhost:8000${url}`) : 'https://placehold.co/400x500/1e1b4b/a5b4fc?text=FASHION';

  const getStatusStyle = (status: string): React.CSSProperties => {
    const map: Record<string, React.CSSProperties> = {
      COMPLETED: { background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' },
      PAID: { background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' },
      PENDING: { background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' },
      CANCELLED: { background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' },
    };
    return map[status] || map.PENDING;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#e2e8f0', fontFamily: "'Inter', sans-serif" }}>

      {/* ────────────── NAVBAR ────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 900,
        background: scrolled ? 'rgba(10,10,18,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        transition: 'all 0.3s ease',
        padding: '0 40px',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Brand */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          onClick={() => { setSelectedCategory('ALL'); setPage(0); setSearch(''); }}
        >
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AutoAwesome style={{ fontSize: '18px', color: '#fff' }} />
          </div>
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px',
            background: 'linear-gradient(90deg, #c4b5fd, #f0abfc)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            LUXE FASHION
          </span>
        </div>

        {/* Nav Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Cart Button */}
          <button
            id="cart-btn"
            onClick={() => setIsCartOpen(true)}
            style={{
              position: 'relative', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#e2e8f0', borderRadius: '50px', padding: '8px 16px 8px 14px',
              display: 'flex', alignItems: 'center', gap: '8px',
              cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              transform: cartBounce ? 'scale(1.15)' : 'scale(1)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          >
            <ShoppingCart style={{ fontSize: '18px' }} />
            <span>Cart</span>
            {cart.length > 0 && (
              <span style={{
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                color: '#fff', fontWeight: 700, fontSize: '10px',
                padding: '2px 7px', borderRadius: '50px',
                minWidth: '20px', textAlign: 'center',
              }}>
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>

          {session ? (
            <>
              {/* My Orders */}
              <button
                onClick={handleOpenHistory}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#c4b5fd', borderRadius: '50px', padding: '8px 16px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              >
                <History style={{ fontSize: '17px' }} />
                <span className="hidden md:inline">My Orders</span>
              </button>

              {/* User chip → click to go to Profile */}
              <button
                onClick={() => navigate('/profile')}
                title="My Profile"
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                  padding: '6px 14px', borderRadius: '50px', cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; }}
              >
                <AccountCircle style={{ fontSize: '18px', color: '#818cf8' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#c7d2fe' }}>{session.username}</span>
              </button>

              {session.role === 'ADMIN' && (
                <button
                  onClick={() => navigate('/admin')}
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    color: '#fff', border: 'none', borderRadius: '50px',
                    padding: '8px 16px', fontSize: '12px', fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  <AdminPanelSettings style={{ fontSize: '16px' }} />
                  Admin
                </button>
              )}

              <button
                onClick={handleLogout}
                title="Logout"
                style={{
                  background: 'transparent', border: '1px solid rgba(239,68,68,0.2)',
                  color: '#f87171', borderRadius: '50%', width: '38px', height: '38px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <LogOut style={{ fontSize: '17px' }} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: 'transparent', border: 'none', color: '#94a3b8',
                  padding: '8px 14px', borderRadius: '50px', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 600, transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#e2e8f0')}
                onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  color: '#fff', border: 'none', borderRadius: '50px',
                  padding: '9px 22px', fontSize: '13px', fontWeight: 700,
                  cursor: 'pointer', transition: 'opacity 0.2s', boxShadow: '0 0 20px rgba(99,102,241,0.3)',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Register
              </button>
            </>
          )}
        </div>
      </header>

      {/* ────────────── HERO ────────────── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        padding: '100px 40px 80px',
        background: 'linear-gradient(160deg, #0d0b1e 0%, #130f2e 50%, #0a0a12 100%)',
        textAlign: 'center',
      }}>
        {/* Radial glow blobs */}
        <div style={{
          position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', right: '10%',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(168,85,247,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '50px', padding: '6px 16px', marginBottom: '28px',
            fontSize: '12px', fontWeight: 600, color: '#a5b4fc', letterSpacing: '1px',
          }}>
            <AutoAwesome style={{ fontSize: '14px' }} />
            NEW COLLECTION 2025
          </div>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 900,
            lineHeight: 1.08, letterSpacing: '-2px',
            background: 'linear-gradient(135deg, #ffffff 30%, #c4b5fd 70%, #f0abfc 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '20px',
          }}>
            Dress to<br />Impress
          </h1>
          <p style={{ fontSize: '16px', color: '#94a3b8', lineHeight: 1.7, marginBottom: '36px' }}>
            Explore our curated collections of premium fashion. From everyday essentials to statement pieces — shop securely with PayPal.
          </p>
          <button
            onClick={() => document.getElementById('shop-catalog')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              color: '#fff', border: 'none', borderRadius: '50px',
              padding: '14px 36px', fontSize: '15px', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.3s',
              boxShadow: '0 8px 30px rgba(99,102,241,0.4)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(99,102,241,0.4)'; }}
          >
            Shop Now
          </button>
        </div>
      </section>

      {/* ────────────── MAIN CATALOG ────────────── */}
      <main id="shop-catalog" style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 40px 80px' }}>

        {/* Filter + Search Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>

          {/* Category Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {[{ id: 'ALL', name: 'All' }, ...categories.map(c => ({ id: String(c.id), name: c.name }))].map(cat => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setPage(0); }}
                  style={{
                    padding: '8px 18px', borderRadius: '50px', fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s',
                    background: active ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.05)',
                    color: active ? '#fff' : '#94a3b8',
                    border: active ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: active ? '0 4px 15px rgba(99,102,241,0.35)' : 'none',
                  }}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search style={{
              position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
              fontSize: '18px', color: '#64748b', pointerEvents: 'none',
            }} />
            <input
              type="text"
              placeholder="Search fashion..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              style={{
                width: '100%', padding: '10px 16px 10px 42px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '50px', color: '#e2e8f0', fontSize: '13px', outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = '#6366f1')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>
        </div>

        {/* Products Grid */}
        {loadingProducts ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', gap: '16px', color: '#64748b' }}>
            <div style={{
              width: '48px', height: '48px', border: '3px solid rgba(99,102,241,0.2)',
              borderTop: '3px solid #6366f1', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Loading collection...</span>
          </div>
        ) : errorProducts ? (
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '16px', padding: '24px', textAlign: 'center', color: '#f87171',
          }}>
            {errorProducts}
          </div>
        ) : products.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px', padding: '80px 40px', textAlign: 'center', color: '#475569',
          }}>
            <Inventory2Outlined style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.4 }} />
            <p style={{ fontSize: '15px', fontWeight: 500 }}>No items match your current filters.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '24px',
          }}>
            {products.map(prod => {
              const imgUrl = getImageUrl(prod.imageUrl);
              const outOfStock = prod.stock <= 0;

              return (
                <div
                  key={prod.id}
                  className="product-card"
                  style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
                    e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.2)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Image */}
                  <div
                    style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', background: '#111827' }}
                    onClick={() => { setSelectedProduct(prod); setDetailQty(1); }}
                  >
                    <img
                      src={imgUrl}
                      alt={prod.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.07)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    />

                    {/* Wishlist btn */}
                    <button
                      style={{
                        position: 'absolute', top: '12px', right: '12px',
                        width: '34px', height: '34px', borderRadius: '50%',
                        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#e2e8f0', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s',
                      }}
                      onClick={e => e.stopPropagation()}
                      onMouseEnter={e => (e.currentTarget.style.color = '#f472b6')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#e2e8f0')}
                    >
                      <FavoriteBorder style={{ fontSize: '16px' }} />
                    </button>

                    {/* Category badge */}
                    <div style={{
                      position: 'absolute', bottom: '12px', left: '12px',
                      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50px',
                      padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '5px',
                      fontSize: '11px', fontWeight: 600, color: '#c4b5fd', letterSpacing: '0.5px',
                    }}>
                      <LocalOfferOutlined style={{ fontSize: '11px' }} />
                      {prod.categoryName || 'General'}
                    </div>

                    {outOfStock && (
                      <div style={{
                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)',
                        backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{
                          background: 'rgba(239,68,68,0.9)', color: '#fff',
                          fontWeight: 700, fontSize: '11px', padding: '6px 16px',
                          borderRadius: '50px', letterSpacing: '1.5px', textTransform: 'uppercase',
                        }}>Sold Out</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: '16px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h3
                      style={{ fontWeight: 700, fontSize: '15px', color: '#e2e8f0', lineHeight: 1.3 }}
                      onClick={() => { setSelectedProduct(prod); setDetailQty(1); }}
                    >
                      {prod.name}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {prod.description || 'Premium fashion item.'}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#475569', fontWeight: 500, marginBottom: '2px' }}>Price</div>
                        <div style={{
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: '20px', fontWeight: 800, color: '#a5b4fc',
                        }}>
                          {formatCurrency(prod.price)}
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleAddToCart(e, prod, 1)}
                        disabled={outOfStock}
                        style={{
                          background: outOfStock ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #6366f1, #a855f7)',
                          color: outOfStock ? '#475569' : '#fff',
                          border: 'none', borderRadius: '50px',
                          padding: '9px 18px', fontSize: '12px', fontWeight: 700,
                          cursor: outOfStock ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: outOfStock ? 'none' : '0 4px 15px rgba(99,102,241,0.3)',
                        }}
                        onMouseEnter={e => { if (!outOfStock) e.currentTarget.style.transform = 'scale(1.04)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '48px' }}>
            <button
              onClick={() => setPage(prev => Math.max(0, prev - 1))}
              disabled={page === 0}
              style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: page === 0 ? '#334155' : '#c4b5fd', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: page === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
              }}
            >
              <NavigateBefore />
            </button>

            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: i === page ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.06)',
                    border: i === page ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    color: i === page ? '#fff' : '#64748b',
                    fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={page >= totalPages - 1}
              style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: page >= totalPages - 1 ? '#334155' : '#c4b5fd', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
              }}
            >
              <NavigateNext />
            </button>
          </div>
        )}
      </main>

      {/* ────────────── FOOTER ────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '32px 40px', textAlign: 'center',
        color: '#334155', fontSize: '13px',
        background: 'rgba(0,0,0,0.3)',
      }}>
        <span style={{
          fontFamily: "'Outfit', sans-serif", fontWeight: 800,
          background: 'linear-gradient(90deg, #c4b5fd, #f0abfc)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginRight: '8px',
        }}>LUXE FASHION</span>
        © {new Date().getFullYear()} · All rights reserved
      </footer>

      {/* ────────────── CART DRAWER ────────────── */}
      {isCartOpen && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1100 }}
            onClick={() => setIsCartOpen(false)}
          />
          <div style={{
            position: 'fixed', top: 0, right: 0, height: '100%', width: '100%', maxWidth: '440px',
            background: '#0f0e1e', borderLeft: '1px solid rgba(255,255,255,0.08)',
            zIndex: 1200, display: 'flex', flexDirection: 'column',
            boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
            animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            {/* Drawer Header */}
            <div style={{
              padding: '24px 24px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ShoppingCart style={{ fontSize: '18px', color: '#fff' }} />
                </div>
                <div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '18px', color: '#e2e8f0' }}>
                    Shopping Cart
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {cart.reduce((s, i) => s + i.quantity, 0)} items
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8', width: '36px', height: '36px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <Close style={{ fontSize: '18px' }} />
              </button>
            </div>

            {/* Cart Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cart.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#334155', gap: '12px', padding: '60px 0' }}>
                  <ShoppingCart style={{ fontSize: '48px', opacity: 0.3 }} />
                  <p style={{ fontSize: '14px', fontWeight: 500 }}>Your cart is empty</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    style={{
                      background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                      color: '#a5b4fc', borderRadius: '50px', padding: '8px 20px',
                      fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} style={{
                    display: 'flex', gap: '14px', padding: '14px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px', position: 'relative',
                  }}>
                    <img
                      src={getImageUrl(item.product.imageUrl)}
                      alt={item.product.name}
                      style={{ width: '70px', height: '85px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#e2e8f0', marginBottom: '4px', lineHeight: 1.3 }}>
                        {item.product.name}
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '15px', color: '#a5b4fc', marginBottom: '10px', fontFamily: "'Outfit', sans-serif" }}>
                        {formatCurrency(item.product.price)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => updateCartQty(item.product.id, -1)}
                          style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                            color: '#e2e8f0', fontSize: '14px', fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >−</button>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: '#e2e8f0', minWidth: '24px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.product.id, 1)}
                          style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                            color: '#e2e8f0', fontSize: '14px', fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >+</button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      style={{
                        position: 'absolute', top: '10px', right: '10px',
                        background: 'transparent', border: 'none', color: '#334155',
                        cursor: 'pointer', transition: 'color 0.2s', padding: '4px',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#334155')}
                    >
                      <Close style={{ fontSize: '16px' }} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Resizer */}
            {cart.length > 0 && (
              <div
                onMouseDown={handleMouseDown}
                style={{
                  height: '8px',
                  background: 'rgba(255,255,255,0.06)',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'ns-resize',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                  userSelect: 'none',
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(99,102,241,0.2)';
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                <div style={{ width: '32px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.3)' }} />
              </div>
            )}

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div style={{
                height: `${checkoutHeight}px`,
                overflowY: 'auto',
                flexShrink: 0,
                padding: '20px 24px 28px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(0,0,0,0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>Subtotal</span>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 900, color: '#a5b4fc' }}>
                    {formatCurrency(getCartTotal())}
                  </span>
                </div>

                {session ? (
                  <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {orderError && (
                      <div style={{ fontSize: '12px', color: '#f87171', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '8px 12px' }}>
                        {orderError}
                      </div>
                    )}

                    {/* Customer Name */}
                    <div>
                      <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>
                        YOUR NAME
                      </label>
                      <input
                        type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} required
                        style={{ width: '100%', padding: '9px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#e2e8f0', fontSize: '13px', outline: 'none', transition: 'border-color 0.2s' }}
                        onFocus={e => (e.target.style.borderColor = '#6366f1')}
                        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>
                        EMAIL
                      </label>
                      <input
                        type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} required
                        style={{ width: '100%', padding: '9px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#e2e8f0', fontSize: '13px', outline: 'none', transition: 'border-color 0.2s' }}
                        onFocus={e => (e.target.style.borderColor = '#6366f1')}
                        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                      />
                    </div>

                    {/* Saved Addresses dropdown */}
                    {addresses.length > 0 && (
                      <div>
                        <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>
                          SELECT SHIPPING ADDRESS
                        </label>
                        <select
                          value={selectedAddressId}
                          onChange={e => handleSelectAddress(e.target.value)}
                          style={{
                            width: '100%', padding: '9px 14px',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px', color: '#e2e8f0', fontSize: '13px', outline: 'none',
                            transition: 'border-color 0.2s', cursor: 'pointer'
                          }}
                        >
                          {addresses.map(addr => (
                            <option key={addr.id} value={addr.id} style={{ background: '#0f0e1e', color: '#e2e8f0' }}>
                              {addr.addressName}: {addr.addressLine} ({addr.phone}){addr.isDefault ? ' [Default]' : ''}
                            </option>
                          ))}
                          <option value="NEW" style={{ background: '#0f0e1e', color: '#e2e8f0' }}>
                            -- Enter New Address --
                          </option>
                        </select>
                      </div>
                    )}

                    {selectedAddressId !== 'NEW' ? (
                      // Read-only selected address details card
                      (() => {
                        const activeAddr = addresses.find(a => String(a.id) === selectedAddressId);
                        if (!activeAddr) return null;
                        return (
                          <div style={{ marginTop: '5px', padding: '12px 14px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '10px' }}>
                            <div style={{ fontWeight: 700, fontSize: '12px', color: '#a5b4fc', marginBottom: '3px' }}>
                              {activeAddr.addressName.toUpperCase()}
                            </div>
                            <div style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.4 }}>
                              {activeAddr.addressLine}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                              Phone: {activeAddr.phone}
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      // Form for new address details
                      <>
                        <div>
                          <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>
                            SHIPPING ADDRESS
                          </label>
                          <input
                            type="text" value={shippingAddress} onChange={e => setShippingAddress(e.target.value)}
                            placeholder="123 Fashion Street..." required
                            style={{ width: '100%', padding: '9px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#e2e8f0', fontSize: '13px', outline: 'none', transition: 'border-color 0.2s' }}
                            onFocus={e => (e.target.style.borderColor = '#6366f1')}
                            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>
                            PHONE NUMBER
                          </label>
                          <input
                            type="text" value={phone} onChange={e => setPhone(e.target.value)}
                            placeholder="09XXXXXXXX" required
                            style={{ width: '100%', padding: '9px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#e2e8f0', fontSize: '13px', outline: 'none', transition: 'border-color 0.2s' }}
                            onFocus={e => (e.target.style.borderColor = '#6366f1')}
                            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                          />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                          <input
                            type="checkbox" id="saveNewAddress" checked={saveNewAddress} onChange={e => setSaveNewAddress(e.target.checked)}
                            style={{ cursor: 'pointer', width: '14px', height: '14px' }}
                          />
                          <label htmlFor="saveNewAddress" style={{ color: '#94a3b8', fontSize: '12px', cursor: 'pointer', userSelect: 'none' }}>
                            Save to my addresses for future use
                          </label>
                        </div>
                      </>
                    )}

                    <button
                      type="submit"
                      disabled={isOrdering}
                      style={{
                        marginTop: '6px', padding: '13px',
                        background: isOrdering ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #a855f7)',
                        color: '#fff', border: 'none', borderRadius: '12px',
                        fontWeight: 700, fontSize: '14px', cursor: isOrdering ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 20px rgba(99,102,241,0.4)', transition: 'opacity 0.2s',
                      }}
                    >
                      {isOrdering ? 'Redirecting to PayPal...' : 'Place Order · Pay with PayPal'}
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => { setIsCartOpen(false); navigate('/login'); }}
                    style={{
                      width: '100%', padding: '13px',
                      background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                      color: '#fff', border: 'none', borderRadius: '12px',
                      fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                      boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                    }}
                  >
                    Sign In to Checkout
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* ────────────── PRODUCT DETAIL MODAL ────────────── */}
      {selectedProduct && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
            zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={() => setSelectedProduct(null)}
        >
          <div
            style={{
              background: '#0f0e1e', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px', maxWidth: '760px', width: '100%',
              display: 'flex', overflow: 'hidden', position: 'relative',
              boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
              animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProduct(null)}
              style={{
                position: 'absolute', top: '16px', right: '16px', zIndex: 10,
                background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8', width: '36px', height: '36px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <Close style={{ fontSize: '18px' }} />
            </button>

            {/* Product Image */}
            <div style={{ width: '45%', flexShrink: 0, background: '#111827' }}>
              <img
                src={getImageUrl(selectedProduct.imageUrl)}
                alt={selectedProduct.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Product Info */}
            <div style={{ flex: 1, padding: '36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflowY: 'auto', maxHeight: '70vh' }}>
              <div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)',
                  borderRadius: '50px', padding: '4px 14px',
                  fontSize: '11px', fontWeight: 700, color: '#a5b4fc', letterSpacing: '0.5px',
                  marginBottom: '16px',
                }}>
                  <LocalOfferOutlined style={{ fontSize: '11px' }} />
                  {selectedProduct.categoryName || 'General'}
                </div>

                <h3 style={{
                  fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '26px',
                  color: '#f1f5f9', lineHeight: 1.2, marginBottom: '14px',
                }}>
                  {selectedProduct.name}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '28px', color: '#a5b4fc' }}>
                    {formatCurrency(selectedProduct.price)}
                  </span>
                  <span style={{
                    padding: '4px 12px', borderRadius: '50px', fontSize: '11px', fontWeight: 700,
                    ...(selectedProduct.stock > 0
                      ? { background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }
                      : { background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' })
                  }}>
                    {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : 'Out of Stock'}
                  </span>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                  <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.7 }}>
                    {selectedProduct.description || 'No description available for this fashion product.'}
                  </p>
                </div>
              </div>

              {selectedProduct.stock > 0 && (
                <div style={{ marginTop: '28px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '50px', padding: '6px 8px',
                  }}>
                    <button
                      onClick={() => setDetailQty(prev => Math.max(1, prev - 1))}
                      style={{
                        width: '30px', height: '30px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.08)', border: 'none',
                        color: '#e2e8f0', fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >−</button>
                    <span style={{ fontWeight: 800, fontSize: '16px', color: '#e2e8f0', minWidth: '32px', textAlign: 'center' }}>
                      {detailQty}
                    </span>
                    <button
                      onClick={() => setDetailQty(prev => Math.min(selectedProduct.stock, prev + 1))}
                      style={{
                        width: '30px', height: '30px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.08)', border: 'none',
                        color: '#e2e8f0', fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >+</button>
                  </div>
                  <button
                    onClick={(e) => { handleAddToCart(e, selectedProduct, detailQty); setSelectedProduct(null); }}
                    style={{
                      flex: 1, background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                      color: '#fff', border: 'none', borderRadius: '50px',
                      padding: '13px 24px', fontWeight: 700, fontSize: '14px',
                      cursor: 'pointer', boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    Add to Cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ────────────── ORDER HISTORY DRAWER ────────────── */}
      {isHistoryOpen && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1100 }}
            onClick={() => setIsHistoryOpen(false)}
          />
          <div style={{
            position: 'fixed', top: 0, right: 0, height: '100%', width: '100%', maxWidth: '520px',
            background: '#0f0e1e', borderLeft: '1px solid rgba(255,255,255,0.08)',
            zIndex: 1200, display: 'flex', flexDirection: 'column',
            boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
            animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            {/* Header */}
            <div style={{
              padding: '24px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <History style={{ fontSize: '18px', color: '#fff' }} />
                </div>
                <div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '18px', color: '#e2e8f0' }}>
                    Order History
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Your past purchases</div>
                </div>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8', width: '36px', height: '36px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Close style={{ fontSize: '18px' }} />
              </button>
            </div>

            {/* Orders list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {loadingOrders ? (
                <div style={{ textAlign: 'center', color: '#475569', padding: '60px 0', fontSize: '14px' }}>
                  Loading orders...
                </div>
              ) : errorOrders ? (
                <div style={{ color: '#f87171', textAlign: 'center', padding: '40px 0' }}>{errorOrders}</div>
              ) : myOrders.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#334155', padding: '60px 0' }}>
                  <Inventory2Outlined style={{ fontSize: '40px', marginBottom: '10px', opacity: 0.3 }} />
                  <p style={{ fontSize: '14px', fontWeight: 500 }}>No orders placed yet</p>
                </div>
              ) : (
                myOrders.map(order => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedHistoryOrder(order)}
                    style={{
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '18px', padding: '18px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#c7d2fe' }}>Order #{order.id}</div>
                        <div style={{ fontSize: '11px', color: '#475569', marginTop: '3px' }}>
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                      <span style={{
                        padding: '4px 12px', borderRadius: '50px', fontSize: '11px', fontWeight: 700,
                        ...getStatusStyle(order.status),
                      }}>
                        {order.status}
                      </span>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {order.items && order.items.map((item: any) => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span style={{ color: '#94a3b8' }}>{item.productName} × {item.quantity}</span>
                          <span style={{ color: '#c7d2fe', fontWeight: 600 }}>{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{
                      borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>Total</span>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '18px', color: '#a5b4fc' }}>
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* ────────────── AI CHATBOT WIDGET ────────────── */}
      {session && (
        <div style={{ position: 'fixed', bottom: '28px', right: '28px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
          {isChatOpen && (
            <div style={{
              width: '360px', height: '500px',
              background: '#0f0e1e', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              {/* Chat Header */}
              <div style={{
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <AutoAwesome style={{ fontSize: '16px', color: '#fff' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff', fontFamily: "'Outfit', sans-serif" }}>AI Style Assistant</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                      Online
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  style={{
                    background: 'rgba(255,255,255,0.15)', border: 'none',
                    color: '#fff', borderRadius: '50%', width: '30px', height: '30px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Close style={{ fontSize: '16px' }} />
                </button>
              </div>

              {/* Chat Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(0,0,0,0.2)' }}>
                {chatMessages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '82%', borderRadius: '16px', padding: '10px 14px',
                      fontSize: '13px', lineHeight: 1.5,
                      ...(msg.sender === 'user'
                        ? { background: 'linear-gradient(135deg, #6366f1, #7c3aed)', color: '#fff', borderBottomRightRadius: '4px' }
                        : { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', borderBottomLeftRadius: '4px' })
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {sendingChat && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div style={{
                      background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px', borderBottomLeftRadius: '4px',
                      padding: '10px 16px', display: 'flex', gap: '4px', alignItems: 'center',
                    }}>
                      {[0, 0.15, 0.3].map((delay, i) => (
                        <span key={i} style={{
                          width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1',
                          animation: `bounce 0.8s ${delay}s infinite`,
                          display: 'inline-block',
                        }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '8px', background: '#0f0e1e' }}>
                <input
                  type="text"
                  placeholder="Ask about style, sizes, returns..."
                  disabled={sendingChat}
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  style={{
                    flex: 1, padding: '10px 14px',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '50px', color: '#e2e8f0', fontSize: '13px', outline: 'none',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#6366f1')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
                <button
                  type="submit"
                  disabled={sendingChat || !chatInput.trim()}
                  style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    background: sendingChat || !chatInput.trim() ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #6366f1, #a855f7)',
                    border: 'none', color: '#fff', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: sendingChat || !chatInput.trim() ? 'not-allowed' : 'pointer',
                    flexShrink: 0, transition: 'opacity 0.2s',
                  }}
                >
                  <Send style={{ fontSize: '16px' }} />
                </button>
              </form>
            </div>
          )}

          {/* Floating Chat Button */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            title="AI Style Assistant"
            style={{
              width: '58px', height: '58px', borderRadius: '50%',
              background: isChatOpen ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #6366f1, #a855f7)',
              border: isChatOpen ? '2px solid rgba(99,102,241,0.5)' : 'none',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 8px 25px rgba(99,102,241,0.45)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isChatOpen ? 'scale(0.9)' : 'scale(1)',
            }}
            onMouseEnter={e => { if (!isChatOpen) e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = isChatOpen ? 'scale(0.9)' : 'scale(1)'; }}
          >
            {isChatOpen ? <Close style={{ fontSize: '22px' }} /> : <Chat style={{ fontSize: '24px' }} />}
          </button>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedHistoryOrder && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)',
            zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={() => setSelectedHistoryOrder(null)}
        >
          <div
            style={{
              background: '#0f0e1e', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px', maxWidth: '500px', width: '100%',
              padding: '32px', position: 'relative',
              boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
              animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex', flexDirection: 'column', gap: '20px',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedHistoryOrder(null)}
              style={{
                position: 'absolute', top: '16px', right: '16px', zIndex: 10,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8', width: '36px', height: '36px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <Close style={{ fontSize: '18px' }} />
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '1px dashed rgba(255,255,255,0.15)', paddingBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: '#6366f1', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Receipt
              </div>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '22px', color: '#f1f5f9', margin: 0 }}>
                Order #{selectedHistoryOrder.id}
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '6px 0 0 0' }}>
                Placed on {formatDate(selectedHistoryOrder.createdAt)}
              </p>
            </div>

            {/* Status & Payment info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, marginBottom: '2px' }}>STATUS</div>
                <span style={{
                  padding: '4px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: 700,
                  ...getStatusStyle(selectedHistoryOrder.status)
                }}>
                  {selectedHistoryOrder.status}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, marginBottom: '2px' }}>PAYMENT METHOD</div>
                <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600 }}>
                  {selectedHistoryOrder.paypalOrderId ? 'PayPal' : 'Cash on Delivery'}
                </span>
              </div>
            </div>

            {/* Customer Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontSize: '12px', color: '#a5b4fc', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Shipping details
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Recipient:</span>
                  <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{selectedHistoryOrder.customerName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Email:</span>
                  <span style={{ color: '#e2e8f0' }}>{selectedHistoryOrder.customerEmail}</span>
                </div>
                {selectedHistoryOrder.shippingAddress && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                    <span style={{ color: '#64748b' }}>Address:</span>
                    <span style={{ color: '#cbd5e1', lineHeight: 1.4 }}>{selectedHistoryOrder.shippingAddress}</span>
                  </div>
                )}
                {selectedHistoryOrder.paypalOrderId && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px', fontSize: '11px' }}>
                    <span style={{ color: '#475569' }}>PayPal Order ID:</span>
                    <span style={{ color: '#475569', fontFamily: 'monospace' }}>{selectedHistoryOrder.paypalOrderId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Items bought */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontSize: '12px', color: '#a5b4fc', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Items Purchased
              </h4>
              <div style={{
                maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px',
                paddingRight: '4px'
              }}>
                {selectedHistoryOrder.items && selectedHistoryOrder.items.map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', alignItems: 'center' }}>
                    <div>
                      <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{item.productName}</span>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        {formatCurrency(item.price)} × {item.quantity}
                      </div>
                    </div>
                    <span style={{ color: '#c7d2fe', fontWeight: 600 }}>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total block */}
            <div style={{
              marginTop: 'auto', borderTop: '1px dashed rgba(255,255,255,0.15)', paddingTop: '16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 700 }}>Total amount</span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 900, color: '#a5b4fc' }}>
                {formatCurrency(selectedHistoryOrder.totalAmount)}
              </span>
            </div>

            <button
              onClick={() => setSelectedHistoryOrder(null)}
              style={{
                width: '100%', padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#e2e8f0', borderRadius: '12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateY(-20px) scale(0.97); opacity: 0; } to { transform: none; opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(1); } 40% { transform: scale(1.4); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>
    </div>
  );
};
