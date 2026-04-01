import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = ['Home', 'Demo', 'Architecture'];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-black/70 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between pointer-events-auto">
        <Link to="/" className="font-display uppercase tracking-widest text-xl font-medium text-white">
          Autonoma
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => {
            const path = item === 'Home' ? '/' : `/${item.toLowerCase()}`;
            const isActive = location.pathname === path;
            return (
              <Link 
                key={item} 
                to={path} 
                className={`font-mono text-[11px] uppercase transition-colors ${isActive ? 'text-brand-orange' : 'text-white/50 hover:text-white'}`}
              >
                {item}
              </Link>
            );
          })}
        </div>

        <div className="hidden md:block">
          <button className="bg-white text-black font-mono text-[11px] uppercase px-6 py-2.5 rounded-full hover:bg-white/90 transition-colors font-bold">
            Get Started
          </button>
        </div>

        <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-black/95 backdrop-blur-lg border-b border-white/10 p-6 flex flex-col space-y-6 pointer-events-auto">
          {navItems.map((item) => {
            const path = item === 'Home' ? '/' : `/${item.toLowerCase()}`;
            const isActive = location.pathname === path;
            return (
              <Link 
                key={item} 
                to={path} 
                onClick={() => setMobileOpen(false)} 
                className={`font-mono text-xs uppercase transition-colors ${isActive ? 'text-brand-orange' : 'text-white/70 hover:text-white'}`}
              >
                {item}
              </Link>
            );
          })}
          <button className="bg-white text-black font-mono text-xs uppercase px-6 py-3 rounded-full font-bold w-full">
            Get Started
          </button>
        </div>
      )}
    </motion.nav>
  );
}
