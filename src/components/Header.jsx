import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail } from 'lucide-react';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

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
      </div>
    </header>
  );
};

export default Header;
