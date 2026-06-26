import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car, Home as HomeIcon, Building2, Shield, Briefcase,
  ArrowRight, Award, Clock, ThumbsUp, Headphones, BadgeCheck, Sparkles
} from 'lucide-react';
import Reveal from '../components/Reveal';

const services = [
  { id: 'auto', title: 'Auto Insurance', desc: 'Drive with confidence and comprehensive auto coverage tailored to you.', icon: Car, bg: 'var(--blue-100)', color: 'var(--blue-700)' },
  { id: 'home', title: 'Home Insurance', desc: 'Protect your home and everything inside it.', icon: HomeIcon, bg: 'var(--green-100)', color: 'var(--green-700)' },
  { id: 'renters', title: 'Renters Insurance', desc: 'Affordable protection for renters and their belongings.', icon: Building2, bg: '#f0e6fa', color: '#7c3aed' },
  { id: 'commercial', title: 'Commercial Insurance', desc: 'Safeguard your business with smart commercial policies.', icon: Briefcase, bg: '#fef3e2', color: '#d97706' },
  { id: 'cyber', title: 'Cyber Insurance', desc: 'Stay protected in the digital age with cyber coverage.', icon: Shield, bg: '#e0f7fa', color: '#0891b2' },
  { id: 'others', title: 'Other Coverage', desc: 'Custom insurance solutions, just ask us.', icon: Shield, bg: 'var(--slate-100)', color: 'var(--slate-500)' },
];

const slogans = [
  'Protection at the Best Price',
  'Low Rates. Better Coverage.',
  'Protect What Matters Most',
  'Your Future, Secured',
  'Trusted by Families Nationwide',
  'Peace of Mind Starts Here',
];

const stats = [
  { value: '100+', label: 'Happy Clients' },
  { value: 'DC, MD, VA, PA', label: 'Serving DC, Maryland, Virginia, Pennsylvania' },
  { value: '24h', label: 'Response Time' },
];

const whyUs = [
  { icon: Award, title: 'Licensed & Trusted', desc: 'Led by Md Ahmed, a Licensed Insurance Agent and DRLP with years of industry expertise.' },
  { icon: ThumbsUp, title: 'Competitive Rates', desc: 'We shop multiple carriers to find you the best coverage at the lowest possible rate.' },
  { icon: Headphones, title: 'Personal Service', desc: 'No call centers. Speak directly with your agent for fast, friendly support.' },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="fade-in">
      {/* Hero */}
      <section className="hero">
        <div className="hero-shapes">
          <div className="hero-shape hero-shape-1" />
          <div className="hero-shape hero-shape-2" />
          <div className="hero-shape hero-shape-3" />
        </div>
        <div className="container">
          <div className="hero-badge fade-in-up">
            <Sparkles size={16} />
            Licensed Insurance Agent &amp; DRLP
          </div>
          <h1 className="fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="blue">Low Rates.</span>{' '}
            <span className="green">Better Coverage.</span>
          </h1>
          <p className="hero-subtitle fade-in-up" style={{ animationDelay: '0.2s' }}>
            Protection at the best price. We provide trusted service and tailored insurance plans
            to protect what matters most. Get a free quote today and secure your future with confidence.
          </p>
          <div className="hero-cta fade-in-up" style={{ animationDelay: '0.3s' }}>
            <button className="btn btn-primary" onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}>
              Get a Free Quote <ArrowRight size={18} />
            </button>
            <a href="tel:3477619537" className="btn btn-outline">
              Call (347) 761-9537
            </a>
          </div>
        </div>
      </section>

      {/* Scrolling slogans */}
      <div className="slogan-strip">
        <div className="slogan-track">
          {[...slogans, ...slogans].map((s, i) => (
            <span key={i} className="slogan-item">
              <span className="slogan-dot" />
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="container">
        {/* Stats */}
        <section className="section">
          <div className="stats-grid">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 90} className="glass-panel stat-card card-hover">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* About */}
        <section className="section">
          <Reveal className="glass-panel about-section card-hover">
            <div>
              <span className="section-label">About Us</span>
              <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Your Trusted Insurance Partner</h2>
              <p style={{ fontSize: '1.05rem', marginBottom: '16px', color: 'var(--slate-700)' }}>
                Led by <strong>Md Ahmed</strong>, a Licensed Insurance Agent and DRLP, Low Rate Insurance is committed to providing our clients with the best coverage at the most competitive rates.
              </p>
              <p style={{ fontSize: '1.05rem', color: 'var(--slate-500)' }}>
                Our mission is to build trust through exceptional service, ensuring that you have the right financial protection against any unexpected events.
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'var(--green-100)', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--green-700)' }}>
                  <BadgeCheck size={16} /> Licensed Agent
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'var(--blue-100)', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--blue-700)' }}>
                  <Clock size={16} /> Fast Quotes
                </span>
              </div>
            </div>
            <div className="about-logo-wrap">
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Low Rate Insurance" />
            </div>
          </Reveal>
        </section>

        {/* Why Us */}
        <section className="section">
          <Reveal className="section-header">
            <span className="section-label">Why Choose Us</span>
            <h2>Insurance Made Simple</h2>
            <p>We make finding the right coverage easy, affordable, and stress-free.</p>
          </Reveal>
          <div className="why-grid">
            {whyUs.map((item, i) => (
              <Reveal key={item.title} delay={i * 100} className="glass-panel why-card card-hover">
                <div className="why-icon">
                  <item.icon size={28} color="var(--green-700)" />
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Services */}
        <section id="services" className="section">
          <Reveal className="section-header">
            <span className="section-label">Our Services</span>
            <h2>Select a Service for a Quote</h2>
            <p>Choose the coverage you need and get a personalized quote in minutes.</p>
          </Reveal>
          <div className="services-grid">
            {services.map((service, index) => (
              <Reveal
                key={service.id}
                delay={index * 70}
                className="glass-panel service-card card-hover"
                onClick={() => navigate(`/quote/${service.id}`)}
              >
                <div className="service-icon" style={{ background: service.bg }}>
                  <service.icon size={32} color={service.color} />
                </div>
                <h3>{service.title}</h3>
                <p>{service.desc}</p>
                <span className="service-link">Get a quote <ArrowRight size={15} /></span>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="section" style={{ marginBottom: '60px' }}>
          <Reveal className="cta-banner">
            <div className="cta-glow" />
            <h2>Ready to Save on Insurance?</h2>
            <p>Get a free, no-obligation quote today. Your peace of mind is just a click away.</p>
            <button
              className="btn btn-secondary"
              onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
            >
              Start Your Quote <ArrowRight size={18} />
            </button>
          </Reveal>
        </section>
      </div>
    </div>
  );
};

export default Home;
