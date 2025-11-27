import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShoppingBag, X, ChevronRight, MapPin, Store, User, CheckCircle, 
  Plus, Minus, Search, Menu, Loader2, 
  ArrowRight, Instagram, Facebook, Twitter, ZoomIn, ArrowLeft, MousePointer2,
  Phone, Mail, Clock
} from 'lucide-react';

// --- DATOS MOCK ---
const BASE_PRODUCTS = [
  {
    id: 1,
    name: "Orbital Vision Pro",
    category: "Sol",
    price: 120,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800",
    description: "Diseño vanguardista con protección UV400. Ideales para conducción y exteriores de alta luminosidad.",
    colors: ["Negro Mate", "Carey", "Transparente"],
    lenses: ["Polarizado", "Neutro"]
  },
  {
    id: 2,
    name: "Quantum Frame",
    category: "Receta",
    price: 85,
    image: "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&q=80&w=800",
    description: "Montura ligera de titanio. Apenas sentirás que los llevas puestos. Resistencia superior.",
    colors: ["Oro", "Plata", "Gunmetal"],
    lenses: ["Solo Marco", "Anti-Reflejo"]
  },
  {
    id: 3,
    name: "Nebula Round",
    category: "Moda",
    price: 95,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800",
    description: "Estilo retro renovado. Perfectos para rostros angulares que buscan suavizar facciones.",
    colors: ["Negro", "Azul Noche"],
    lenses: ["Degradado", "Oscuro"]
  },
  {
    id: 4,
    name: "Hyperion Sport",
    category: "Deporte",
    price: 150,
    image: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=800",
    description: "Agarre máximo y resistencia a impactos. Tu compañero ideal de ruta y montaña.",
    colors: ["Rojo Neon", "Negro Carbón"],
    lenses: ["Espejado", "Photochromic"]
  },
  {
    id: 5,
    name: "Stellar Wayfarer",
    category: "Sol",
    price: 110,
    image: "https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&q=80&w=800",
    description: "Un clásico atemporal rediseñado con materiales de bio-acetato sostenibles.",
    colors: ["Tortoise", "Black"],
    lenses: ["G15", "Café"]
  },
  {
    id: 6,
    name: "Luna Cat-Eye",
    category: "Moda",
    price: 135,
    image: "https://images.unsplash.com/photo-1570222094114-28a9d88a2d64?auto=format&fit=crop&q=80&w=800",
    description: "Elegancia felina para una mirada que no pasa desapercibida.",
    colors: ["Rojo", "Negro"],
    lenses: ["Neutro", "Degradado"]
  }
];

const PRODUCTS = [
  ...BASE_PRODUCTS,
  ...BASE_PRODUCTS.map(p => ({ ...p, id: p.id + 10, name: p.name + " II", price: p.price + 10 })),
  ...BASE_PRODUCTS.map(p => ({ ...p, id: p.id + 20, name: p.name + " Ltd", price: p.price + 25 }))
];

// --- COMPONENTES VISUALES ---

const Toast = ({ message, onClose }) => (
  <div className="fixed top-24 right-6 z-[60] bg-black text-white px-6 py-4 rounded-none shadow-2xl flex items-center gap-3 animate-slide-left border-l-4 border-white">
    <CheckCircle size={18} className="text-white" />
    <span className="text-sm font-bold uppercase tracking-wide">{message}</span>
  </div>
);

const FloatingTotalButton = ({ total, count, onClick }) => {
  if (count === 0) return null;
  return (
    <button 
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 bg-black text-white pl-6 pr-8 py-4 shadow-2xl hover:scale-105 transition-all flex items-center gap-4 group border border-zinc-800"
    >
      <div className="relative">
        <ShoppingBag size={20} />
        <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
          {count}
        </span>
      </div>
      <div className="flex flex-col items-start">
        <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Total</span>
        <span className="font-bold font-serif text-lg leading-none">${total}</span>
      </div>
      <ChevronRight size={16} className="text-zinc-500 group-hover:text-white transition-colors ml-1" />
    </button>
  );
};

// --- APP PRINCIPAL ---

export default function OpticaPro() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [toastMessage, setToastMessage] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;

  const [checkoutStep, setCheckoutStep] = useState(0);
  const [orderData, setOrderData] = useState({ 
    deliveryType: 'pickup', 
    name: '', 
    phone: '', 
    street: '', 
    number: '', 
    locality: '', 
    notes: '' 
  });

  const filteredProducts = PRODUCTS.filter(p => activeCategory === "Todos" || p.category === activeCategory);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    const catalogSection = document.getElementById('catalogo');
    if (catalogSection) catalogSection.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const addToCart = (product, config) => {
    const newItem = { 
      ...product, 
      cartId: Date.now(), 
      selectedColor: config.color, 
      quantity: config.quantity 
    };
    setCart([...cart, newItem]);
    setSelectedProduct(null);
    setToastMessage(`${product.name} agregado`);
  };

  const removeFromCart = (cartId) => setCart(cart.filter(item => item.cartId !== cartId));
  const cartTotal = useMemo(() => cart.reduce((total, item) => total + (item.price * item.quantity), 0), [cart]);

  const handleCheckout = () => {
    // --- LÓGICA WHATSAPP ---
    const isPlural = cart.length > 1;
    const productIntro = isPlural ? "éstos productos" : "éste producto";
    
    const lineItems = cart.map(item => `👓 ${item.name} (${item.selectedColor}) x${item.quantity} - $${item.price * item.quantity}`).join('\n');
    
    let deliveryInfo = "";
    if (orderData.deliveryType === 'delivery') {
      deliveryInfo = `🚚 *Envío a Domicilio*\n📍 Dirección: ${orderData.street} ${orderData.number}, ${orderData.locality}`;
    } else {
      deliveryInfo = `🏪 *Retiro en Local*`;
    }

    const greeting = `Hola, me llamo ${orderData.name} y me gustaría hacer el pedido de ${productIntro}:`;
    
    const msg = `${greeting}\n\n${lineItems}\n\n💰 *Total Final: $${cartTotal}*\n\n------------------\n📂 *Datos del Cliente:*\n👤 Nombre: ${orderData.name}\n📞 Tel: ${orderData.phone}\n${deliveryInfo}\n📝 Notas: ${orderData.notes || "Sin notas"}`;

    const encodedMsg = encodeURIComponent(msg);
    window.open(`https://wa.me/5491124952866?text=${encodedMsg}`, '_blank');
  };

  return (
    // CAMBIO IMPORTANTE: bg-white (Blanco puro) - Se eliminaron efectos canvas y ruido
    <div className="relative min-h-screen font-sans text-zinc-900 bg-white selection:bg-black selection:text-white pb-0">
      {/* Estilos personalizados */}
      <style>{`
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-left { animation: slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideLeft { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        html { scroll-behavior: smooth; }
      `}</style>
      
      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-black/95 backdrop-blur-md py-0' : 'bg-transparent py-4'} border-b border-white/10`}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 cursor-pointer text-white group" onClick={() => scrollToSection('inicio')}>
              <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-bold text-xl tracking-tighter group-hover:bg-zinc-200 transition-colors">O</div>
              <span className={`text-xl font-bold tracking-[0.2em] uppercase ${scrolled ? 'text-white' : 'text-white drop-shadow-md'}`}>OPTICA</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-12">
              <button onClick={() => scrollToSection('inicio')} className="text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors">Inicio</button>
              <button onClick={() => scrollToSection('catalogo')} className="text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors">Colección</button>
              <button onClick={() => scrollToSection('nosotros')} className="text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors">Nosotros</button>
              <button onClick={() => scrollToSection('contacto')} className="text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors">Contacto</button>
            </div>

            <div className="flex items-center gap-6 text-white">
              <button className="hover:text-zinc-300 transition-colors hidden sm:block">
                <Search size={20} strokeWidth={1.5} />
              </button>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative hover:text-zinc-300 transition-colors group"
              >
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-black text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full">
                    {cart.length}
                  </span>
                )}
              </button>
              <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/95 border-t border-zinc-800 p-4 absolute w-full shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col space-y-4">
              <button onClick={() => scrollToSection('inicio')} className="text-white text-sm font-bold uppercase tracking-widest text-center py-3 border-b border-zinc-800">Inicio</button>
              <button onClick={() => scrollToSection('catalogo')} className="text-white text-sm font-bold uppercase tracking-widest text-center py-3 border-b border-zinc-800">Colección</button>
              <button onClick={() => scrollToSection('nosotros')} className="text-white text-sm font-bold uppercase tracking-widest text-center py-3 border-b border-zinc-800">Nosotros</button>
              <button onClick={() => scrollToSection('contacto')} className="text-white text-sm font-bold uppercase tracking-widest text-center py-3">Contacto</button>
            </div>
          </div>
        )}
      </nav>

      {/* MAIN */}
      <main className="relative z-10">
        
        {/* HERO SECTION RENOVADO (Full Background + Responsive) */}
        <section id="inicio" className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-black">
          {/* Fondo para Celular (Vertical) */}
          <div className="absolute inset-0 z-0 md:hidden">
            <img 
              src="https://lookvision.es/wp-content/uploads/2017/12/INFACE-GAFAS.jpg" 
              alt="Hero Background Mobile" 
              className="w-full h-full object-cover object-center brightness-[0.7]"
            />
          </div>

          {/* Fondo para Escritorio (Horizontal) - NUEVA IMAGEN + EFECTOS */}
          <div className="absolute inset-0 z-0 hidden md:block">
            <img 
              src="https://www.lavanguardia.com/files/og_thumbnail/files/fp/uploads/2025/03/13/67d2e48d68359.r_d.813-361-11218.jpeg" 
              alt="Hero Background Desktop" 
              // AQUI ESTA LA CLAVE: grayscale (blanco y negro) + brightness-50 (oscurecer)
              className="w-full h-full object-cover object-center grayscale brightness-50"
            />
          </div>

          {/* Contenido (Texto) */}
          <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto mt-16 animate-fade-in-up">
            <span className="inline-block py-1 px-4 border border-white/40 backdrop-blur-md text-white text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] mb-8 shadow-sm">
              Nueva Colección 2025
            </span>
            <h1 className="text-5xl md:text-8xl lg:text-9xl font-bold mb-8 tracking-tighter leading-none drop-shadow-lg text-white">
              VISION<br/>REBELDE
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-12 max-w-xl mx-auto font-medium leading-relaxed tracking-wide drop-shadow-md">
              Diseño industrial y materiales premium. No seguimos tendencias, las definimos.
            </p>
            <button 
              onClick={() => scrollToSection('catalogo')}
              className="bg-white text-black px-12 py-5 font-bold text-xs md:text-sm uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all inline-flex items-center gap-4 group shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Ver Catálogo <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/70 animate-bounce hidden md:block drop-shadow-md">
            <MousePointer2 size={24} />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          
          {/* Filtros */}
          <div id="catalogo" className="sticky top-24 z-30 bg-white/80 backdrop-blur-md py-6 mb-12 border-b border-zinc-100 flex gap-2 overflow-x-auto no-scrollbar scroll-mt-32 shadow-sm">
            {["Todos", "Sol", "Receta", "Moda", "Deporte"].map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all border border-transparent whitespace-nowrap ${
                  activeCategory === cat 
                  ? 'bg-black text-white shadow-md' 
                  : 'bg-white text-zinc-500 hover:bg-zinc-50 hover:text-black border-zinc-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* GRID DE PRODUCTOS */}
          <div className="min-h-[600px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 mb-16">
              {currentProducts.map(product => (
                <div 
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="group cursor-pointer bg-white hover:bg-white transition-all duration-300 p-4 rounded-xl shadow-sm hover:shadow-xl border border-zinc-100 hover:border-zinc-200"
                >
                  <div className="aspect-[5/4] bg-zinc-50 mb-6 relative overflow-hidden rounded-lg">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="bg-white text-black px-6 py-3 text-xs font-bold uppercase tracking-widest transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg rounded-full">
                        Ver Detalle
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-start px-1">
                    <div>
                      <h3 className="font-bold text-lg text-black mb-1 uppercase tracking-tight">{product.name}</h3>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{product.category}</p>
                    </div>
                    <span className="font-medium text-black bg-zinc-50 px-3 py-1 rounded text-sm">${product.price}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 py-12 border-t border-zinc-100 bg-white/50 backdrop-blur-sm rounded-2xl mb-12">
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="p-3 border border-zinc-200 hover:border-black hover:bg-black hover:text-white disabled:opacity-20 disabled:border-zinc-200 disabled:hover:bg-white disabled:hover:text-zinc-300 transition-colors rounded-full"
                >
                  <ArrowLeft size={18} />
                </button>
                
                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => paginate(i + 1)}
                      className={`w-10 h-10 text-sm font-bold transition-all rounded-full ${
                        currentPage === i + 1 
                        ? 'bg-black text-white shadow-md' 
                        : 'text-zinc-400 hover:text-black hover:bg-zinc-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="p-3 border border-zinc-200 hover:border-black hover:bg-black hover:text-white disabled:opacity-20 disabled:border-zinc-200 disabled:hover:bg-white disabled:hover:text-zinc-300 transition-colors rounded-full"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Sección Nosotros */}
          <section id="nosotros" className="py-20 border-t border-zinc-100 text-center max-w-3xl mx-auto px-6 bg-white shadow-xl rounded-3xl mb-20 border border-zinc-100">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4 block">Sobre la Marca</span>
            <h2 className="text-4xl font-bold mb-6 tracking-tight">ARTESANÍA MODERNA</h2>
            <p className="text-zinc-600 leading-relaxed text-lg">
              En OPTICA, fusionamos la tradición óptica con la estética brutalista contemporánea. 
              Cada pieza es seleccionada no solo por su funcionalidad, sino por su capacidad de expresión. 
              Somos más que una tienda de lentes; somos curadores de tu perspectiva.
            </p>
          </section>

        </div>
      </main>

      {/* FOOTER COMPLETO RESPONSIVE */}
      <footer id="contacto" className="bg-black text-white pt-20 pb-10 border-t border-zinc-800 relative z-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-center md:text-left">
          <div className="col-span-1 md:col-span-1 flex flex-col items-center md:items-start">
            <div className="w-12 h-12 bg-white text-black flex items-center justify-center font-bold text-2xl tracking-tighter mb-6">O</div>
            <p className="text-zinc-500 text-sm max-w-xs leading-relaxed mb-6">
              Ingeniería óptica y diseño crudo. Buenos Aires, Argentina.
            </p>
            <div className="flex gap-4 justify-center md:justify-start">
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-white hover:text-black transition-colors"><Instagram size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-white hover:text-black transition-colors"><Facebook size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-white hover:text-black transition-colors"><Twitter size={18} /></a>
            </div>
          </div>
          
          <div>
            <h5 className="font-bold text-xs uppercase tracking-widest mb-8 text-white">Contacto</h5>
            <ul className="space-y-4 text-sm text-zinc-500 font-medium flex flex-col items-center md:items-start">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="shrink-0" />
                <span>Av. Santa Fe 1234, Palermo,<br/>Buenos Aires, Argentina</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} />
                <span>+54 9 11 1234-5678</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} />
                <span>contacto@optica.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-xs uppercase tracking-widest mb-8 text-white">Horarios</h5>
            <ul className="space-y-4 text-sm text-zinc-500 font-medium flex flex-col items-center md:items-start">
              <li className="flex items-center gap-3">
                <Clock size={18} />
                <span>Lun - Vie: 10:00 - 20:00</span>
              </li>
              <li className="md:pl-8">Sábados: 10:00 - 18:00</li>
              <li className="md:pl-8">Domingos: Cerrado</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-xs uppercase tracking-widest mb-8 text-white">Legal</h5>
            <ul className="space-y-4 text-sm text-zinc-500 font-medium flex flex-col items-center md:items-start">
              <li><a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Política de Privacidad</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cambios y Devoluciones</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Libro de Quejas</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-zinc-900 text-center md:text-left flex flex-col md:flex-row justify-between items-center">
          <p className="text-zinc-600 text-xs uppercase tracking-wider">© 2025 OPTICA. Todos los derechos reservados.</p>
          <p className="text-zinc-700 text-[10px] mt-2 md:mt-0 uppercase tracking-wider">Designed by Erick Dev</p>
        </div>
      </footer>

      <FloatingTotalButton 
        total={cartTotal} 
        count={cart.length} 
        onClick={() => setIsCartOpen(true)} 
      />

      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onAddToCart={addToCart} 
        />
      )}

      {isCartOpen && (
        <CartDrawer 
          cart={cart} 
          total={cartTotal}
          step={checkoutStep}
          setStep={setCheckoutStep}
          orderData={orderData}
          setOrderData={setOrderData}
          onClose={() => setIsCartOpen(false)}
          onRemove={removeFromCart}
          onCheckout={handleCheckout}
        />
      )}

      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
}

const ProductDetailModal = ({ product, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState(product.colors[0]);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const handleImageClick = (e) => {
    if (isZoomed) {
      setIsZoomed(false);
    } else {
      setIsZoomed(true);
      updateZoomPos(e);
    }
  };

  const updateZoomPos = (e) => {
    if (!isZoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleMouseMove = (e) => {
    if (isZoomed) {
      updateZoomPos(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white w-full max-w-6xl h-[90vh] md:rounded-none shadow-2xl overflow-hidden flex flex-col md:flex-row animate-fade-in-up">
        
        <div className="h-[40%] md:h-full md:w-2/3 bg-white relative flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-zinc-100">
          <div 
            className={`w-full h-full flex items-center justify-center relative overflow-hidden ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
            onClick={handleImageClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setIsZoomed(false)}
          >
            <img 
              src={product.image} 
              alt={product.name} 
              className={`max-w-[90%] max-h-[90%] object-contain transition-transform duration-200 ease-out origin-center mix-blend-multiply`}
              style={{ 
                transform: isZoomed ? `scale(2)` : `scale(1)`,
                transformOrigin: isZoomed ? `${zoomPos.x}% ${zoomPos.y}%` : 'center'
              }}
            />
            
            {!isZoomed && (
               <div className="absolute bottom-6 right-6 flex items-center gap-2 text-black text-xs font-bold uppercase tracking-widest bg-white border border-black px-4 py-2 pointer-events-none">
                 <ZoomIn size={14} /> Click para Zoom
               </div>
            )}
          </div>

          <button onClick={onClose} className="absolute top-4 left-4 bg-white p-2 md:hidden z-10 shadow-md">
            <ArrowLeft size={20} />
          </button>
        </div>

        <div className="h-[60%] md:h-full md:w-1/3 bg-white relative flex flex-col">
          <div className="hidden md:flex justify-end p-4 absolute top-0 right-0 z-20">
             <button onClick={onClose} className="p-2 hover:bg-zinc-100 transition-colors"><X size={24} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            <div className="mb-8 mt-2 md:mt-8">
              <span className="text-zinc-400 font-bold tracking-[0.2em] text-[10px] uppercase mb-2 block">Colección {product.category}</span>
              <h2 className="text-2xl md:text-3xl font-bold text-black mb-4 leading-tight uppercase">{product.name}</h2>
              <p className="text-zinc-600 leading-relaxed text-sm">{product.description}</p>
            </div>

            <div className="space-y-8">
              <div>
                <span className="text-[10px] font-bold uppercase text-black mb-3 block tracking-widest">Color</span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(c => (
                    <button 
                      key={c}
                      onClick={() => setColor(c)}
                      className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all border ${color === c ? 'border-black bg-black text-white' : 'border-zinc-200 text-zinc-500 hover:border-black hover:text-black'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                 <span className="text-[10px] font-bold uppercase text-black mb-3 block tracking-widest">Cantidad</span>
                 <div className="inline-flex items-center border border-zinc-200 p-1">
                   <button onClick={() => setQuantity(Math.max(1, quantity-1))} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 transition-colors"><Minus size={14} /></button>
                   <span className="w-10 text-center font-bold text-sm">{quantity}</span>
                   <button onClick={() => setQuantity(quantity+1)} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 transition-colors"><Plus size={14} /></button>
                 </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 border-t border-zinc-100 bg-white mt-auto z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
             <div className="flex items-end justify-between mb-4">
               <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Total</span>
               <span className="text-3xl font-bold text-black font-serif">${product.price * quantity}</span>
             </div>
             <button 
               onClick={() => onAddToCart(product, { color, quantity })}
               className="w-full bg-black text-white py-4 font-bold text-xs uppercase tracking-[0.15em] hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 group"
             >
               Agregar <ShoppingBag size={16} className="group-hover:-translate-y-1 transition-transform" />
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

const CartDrawer = ({ cart, total, step, setStep, orderData, setOrderData, onClose, onRemove, onCheckout }) => {
  const isDelivery = orderData.deliveryType === 'delivery';
  
  return (
  <div className="fixed inset-0 z-50 flex justify-end">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
    <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left border-l border-zinc-100">
      
      <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-bold text-black uppercase tracking-widest">Carrito</h2>
          <p className="text-xs text-zinc-400 font-bold mt-1 uppercase">{cart.length} items</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-zinc-100 transition-colors"><X size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-white">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-300 space-y-6">
            <ShoppingBag size={48} strokeWidth={1} />
            <p className="font-medium text-zinc-400 uppercase text-xs tracking-widest">Tu carrito está vacío</p>
            <button onClick={onClose} className="text-black font-bold border-b border-black pb-1 text-xs uppercase tracking-widest hover:text-zinc-600 hover:border-zinc-600 transition-colors">Volver al shop</button>
          </div>
        ) : (
          <>
            {step === 0 && (
               <div className="space-y-6">
                 {cart.map((item) => (
                   <div key={item.cartId} className="flex gap-5">
                     <div className="w-20 h-24 bg-zinc-50 overflow-hidden flex-shrink-0 border border-zinc-100">
                       <img src={item.image} className="w-full h-full object-cover mix-blend-multiply" />
                     </div>
                     <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                       <div>
                         <div className="flex justify-between items-start mb-1">
                           <h4 className="font-bold text-sm uppercase tracking-tight truncate pr-2">{item.name}</h4>
                           <button onClick={() => onRemove(item.cartId)} className="text-zinc-300 hover:text-black transition-colors"><X size={16} /></button>
                         </div>
                         <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{item.selectedColor}</p>
                       </div>
                       <div className="flex justify-between items-center mt-2">
                         <span className="text-xs border border-zinc-200 px-2 py-1 font-bold text-zinc-600">x{item.quantity}</span>
                         <span className="font-bold text-black text-lg font-serif">${item.price * item.quantity}</span>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            )}

            {step === 1 && (
              <div className="space-y-8 animate-fade-in-up">
                <div className="border-b border-zinc-100 pb-8">
                  <h3 className="font-bold text-xs mb-4 uppercase tracking-widest">Entrega</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setOrderData({ ...orderData, deliveryType: 'pickup' })}
                      className={`p-4 border text-xs font-bold uppercase tracking-wider flex flex-col items-center gap-3 transition-all ${!isDelivery ? 'border-black bg-black text-white' : 'border-zinc-200 text-zinc-400 hover:border-black hover:text-black'}`}
                    >
                      <Store size={20} /> Retiro
                    </button>
                    <button 
                      onClick={() => setOrderData({ ...orderData, deliveryType: 'delivery' })}
                      className={`p-4 border text-xs font-bold uppercase tracking-wider flex flex-col items-center gap-3 transition-all ${isDelivery ? 'border-black bg-black text-white' : 'border-zinc-200 text-zinc-400 hover:border-black hover:text-black'}`}
                    >
                      <MapPin size={20} /> Envío
                    </button>
                  </div>
                </div>

                <div className="space-y-5">
                  <h3 className="font-bold text-xs uppercase tracking-widest">Tus Datos</h3>
                  <input type="text" placeholder="NOMBRE COMPLETO" className="w-full p-4 border border-zinc-200 bg-white focus:border-black outline-none text-sm font-medium placeholder:text-zinc-300 transition-colors" value={orderData.name} onChange={e => setOrderData({...orderData, name: e.target.value})} />
                  <input type="tel" placeholder="TELÉFONO" className="w-full p-4 border border-zinc-200 bg-white focus:border-black outline-none text-sm font-medium placeholder:text-zinc-300 transition-colors" value={orderData.phone} onChange={e => setOrderData({...orderData, phone: e.target.value})} />
                </div>

                {isDelivery && (
                  <div className="space-y-5 animate-fade-in-up">
                    <h3 className="font-bold text-xs uppercase tracking-widest">Dirección</h3>
                    <div className="grid grid-cols-3 gap-4">
                       <div className="col-span-2">
                         <input type="text" placeholder="CALLE" className="w-full p-4 border border-zinc-200 bg-white focus:border-black outline-none text-sm font-medium placeholder:text-zinc-300" value={orderData.street} onChange={e => setOrderData({...orderData, street: e.target.value})} />
                       </div>
                       <div className="col-span-1">
                         <input type="text" placeholder="NRO" className="w-full p-4 border border-zinc-200 bg-white focus:border-black outline-none text-sm font-medium placeholder:text-zinc-300" value={orderData.number} onChange={e => setOrderData({...orderData, number: e.target.value})} />
                       </div>
                    </div>
                    <input type="text" placeholder="LOCALIDAD / BARRIO" className="w-full p-4 border border-zinc-200 bg-white focus:border-black outline-none text-sm font-medium placeholder:text-zinc-300" value={orderData.locality} onChange={e => setOrderData({...orderData, locality: e.target.value})} />
                  </div>
                )}

                <div>
                   <textarea placeholder="NOTAS ADICIONALES..." className="w-full p-4 border border-zinc-200 bg-white focus:border-black outline-none text-sm font-medium placeholder:text-zinc-300" rows="2" value={orderData.notes} onChange={e => setOrderData({...orderData, notes: e.target.value})}></textarea>
                </div>

              </div>
            )}
          </>
        )}
      </div>

      {cart.length > 0 && (
        <div className="p-8 bg-white border-t border-zinc-100">
          <div className="flex justify-between mb-6 items-end">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Total</span>
            <span className="font-serif text-4xl font-bold text-black leading-none">${total}</span>
          </div>
          
          <div className="flex gap-4">
            {step > 0 && (
               <button onClick={() => setStep(prev => prev - 1)} className="px-6 border border-zinc-200 hover:border-black font-bold text-zinc-500 hover:text-black transition-colors uppercase text-xs tracking-wider">Atrás</button>
            )}
            <button 
              onClick={() => step === 0 ? setStep(1) : onCheckout()}
              className="flex-1 bg-black text-white py-5 font-bold uppercase tracking-[0.15em] text-xs hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 group"
            >
              {step === 0 ? 'Iniciar Compra' : 'Finalizar'} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};