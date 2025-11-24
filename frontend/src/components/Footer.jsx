function Footer() {
    const currentYear = new Date().getFullYear();
  
    return (
      <footer className="bg-slate-900 border-t border-slate-700/50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-400 text-sm">
            © {currentYear} Ai Nova. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }
  
  export default Footer;
  