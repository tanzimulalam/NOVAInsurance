import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, LogIn, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`glass-panel site-header${scrolled ? ' scrolled' : ''}`}>
      <Link to="/" className="header-brand">
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Low Rate Insurance, Protection at the Best Price" />
      </Link>

      <div className="header-contact">
        <a href="tel:3477619537" className="phone">
          <Phone size={15} />
          (347) 761-9537
        </a>
        <a href="mailto:md.ahmed@lowrateprotection.com" className="email">
          <Mail size={15} />
          md.ahmed@lowrateprotection.com
        </a>
        <Link to="/lookup" className="btn btn-outline btn-sm header-login" title="Find your existing submission">
          <Search size={15} />
          <span className="header-btn-long">Existing Customer Search</span>
          <span className="header-btn-short">Search</span>
        </Link>
        <Link
          to={isAuthenticated ? '/portal' : '/login'}
          className="btn btn-outline btn-sm header-login"
          title={isAuthenticated ? 'Management Portal' : 'Agent Login'}
        >
          <LogIn size={15} />
          <span className="header-btn-long">{isAuthenticated ? 'Portal' : 'Agent Login'}</span>
          <span className="header-btn-short">{isAuthenticated ? 'Portal' : 'Login'}</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
