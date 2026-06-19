import React from 'react';
import { ShieldCheck, Heart, Star, Lock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="glass-panel site-footer">
      <div className="footer-content">
        <ShieldCheck size={36} color="var(--green-500)" style={{ margin: '0 auto 16px' }} />
        <p className="footer-quote">
          &ldquo;Insurance is essential because it provides financial protection against unexpected events and helps secure your future with confidence.&rdquo;
        </p>
        <div className="footer-divider" />
        <div className="footer-meta">
          <p>&copy; {new Date().getFullYear()} Low Rate Insurance. All rights reserved.</p>
          <p>www.lowrateinsurance.com &nbsp;|&nbsp; DRLP &nbsp;|&nbsp; Md Ahmed, Licensed Insurance Agent</p>
        </div>
        <div className="footer-slogans">
          <span className="footer-slogan"><Heart size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Protect What Matters</span>
          <span className="footer-slogan"><Star size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Trusted Coverage</span>
          <span className="footer-slogan"><Lock size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Peace of Mind</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
