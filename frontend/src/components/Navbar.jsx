import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { MenuIcon, XIcon } from "lucide-react";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleNavClick = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
{/* Logo */}
<Link to="/" className="flex items-center gap-2 group">
  {/* استبدل الـ div بـ img */}
  <img 
    src="/vite.svg" 
    alt="Ai Nova" 
    className="w-8 h-8 rounded-lg transform group-hover:scale-110 transition-transform"
  />
  <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
  Ai Nova
  </span>
</Link>


          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-300 hover:text-cyan-400 transition-colors font-medium">
              Features
            </a>
            <button
              onClick={() => handleNavClick("/login")}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors font-medium"
            >
              Login
            </button>
            <button
              onClick={() => handleNavClick("/signup")}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105"
            >
              Sign Up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={toggleMenu} className="md:hidden text-cyan-400 hover:text-cyan-300 transition-colors">
            {isOpen ? <XIcon size={28} /> : <MenuIcon size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 animate-fade-in-down border-t border-slate-700/50">
            <a href="#features" className="block px-4 py-2 text-slate-300 hover:text-cyan-400 transition-colors">
              Features
            </a>
            <div className="px-4 py-2 space-y-2">
              <button
                onClick={() => handleNavClick("/login")}
                className="w-full px-4 py-2 text-slate-300 hover:text-white transition-colors font-medium border border-slate-700 rounded-lg"
              >
                Login
              </button>
              <button
                onClick={() => handleNavClick("/signup")}
                className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg font-medium transition-all"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
