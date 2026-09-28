import React, { useState, useEffect } from 'react';
import './index.css';
import logo from './assets/logo.jpg';
import { translations } from './translations';
import AdminPanel from './AdminPanel';
import API_BASE from './apiConfig';
import { ChatGptIcon, ClaudeIcon, GeminiIcon } from './AiIcons';

function App() {
  const [lang, setLang] = useState('en');
  const [modalTitle, setModalTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPromo, setShowPromo] = useState(false);
  const [hasClosedPromo, setHasClosedPromo] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasClosedPromo) {
        if (window.scrollY > 400) {
          setShowPromo(true);
        } else {
          setShowPromo(false);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasClosedPromo]);

  const [isMuted, setIsMuted] = useState(true);
  
  // CMS State
  const [view, setView] = useState('public');
  const [packages, setPackages] = useState([]);
  const [whatsappNum, setWhatsappNum] = useState('37493964458');
  
  // Lead Capture State
  const [hasEnquired, setHasEnquired] = useState(false);
  const [activePackage, setActivePackage] = useState(null);
  
  useEffect(() => {
    // Check if user has already submitted an enquiry
    if (localStorage.getItem('hasEnquired') === 'true') {
        setHasEnquired(true);
    }
    
    // Fetch dynamic public data
    const fetchPublicData = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/public-data`);
            const data = await res.json();
            setPackages(data.packages || []);
            setWhatsappNum(data.whatsapp || '37493964458');
        } catch(e) {
            console.error('Failed to load public data', e);
        }
    };
    fetchPublicData();
  }, [view]); // Refetch if view changes (e.g. leaving admin)

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const t = translations[lang];

  // Modified openModal to handle Lead Capture Logic
  const openModal = (serviceName, pkgData = null) => {
    // If it's a package and they already enquired, show details instead of form
    if (pkgData && hasEnquired) {
        setActivePackage(pkgData);
        setModalTitle(`Details: ${serviceName}`);
        setIsModalOpen(true);
        return;
    }
    
    // Otherwise open standard form
    setActivePackage(null);
    setModalTitle(t.modal.details + ': ' + serviceName);
    setIsModalOpen(true);
  };

  const handleModalClick = (e) => {
    if (e.target.id === 'inquiryModal') {
      closeModal();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const submitForm = async (event) => {
    event.preventDefault();
    
    const elements = event.target.elements;
    const name = elements.fullName ? elements.fullName.value : '';
    const email = elements.email ? elements.email.value : '';
    const phone = elements.phone ? elements.phone.value : '';
    const details = elements.details ? elements.details.value : '';
    const service = modalTitle.replace('Details / Message: ', '');
    
    // SECRET ADMIN ACCESS: Name="Admin", Email="Admin1380", Phone="1380"
    const cleanName = (name || '').trim().toLowerCase();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phone || '').trim();
    
    if (cleanName === 'admin' && (cleanEmail === 'admin1380' || cleanEmail === 'admin@1380') && cleanPhone === '1380') {
        setView('admin');
        closeModal();
        return;
    }
    
    try {
        await fetch(`${API_BASE}/api/enquiry`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ service, name, email, phone, details })
        });
        
        // Lead captured successfully!
        localStorage.setItem('hasEnquired', 'true');
        setHasEnquired(true);
        
        alert('Your enquiry has been submitted, our executive will contact you!');
        closeModal();
    } catch (e) {
        console.error(e);
        alert('There was an error submitting your request. Please try again.');
    }
  };

  // If view is admin, render the Admin Panel
  if (view === 'admin') {
      return <AdminPanel onLogout={() => setView('public')} />;
  }

  return (
    <>
      <nav className="navbar">
          <div className="container nav-container">
              <div className="nav-brand">
              <a href="#" className="logo">
                  <img src={logo} alt="Sunday Infinity Logo" className="navbar-logo-img" />
              </a>
              <div className="nav-contact-info">
                  <div><a href="https://maps.app.goo.gl/SVpfctihMVLyiPDH7?g_st=aw" target="_blank" rel="noopener noreferrer" style={{color: 'inherit', textDecoration: 'none'}}><i className="fa-solid fa-location-dot"></i> Yerevan, Center, Baghramyan Avenue Station</a></div>
                  <div><i className="fa-solid fa-phone"></i> +374 93 964458 | +374 99 64458</div>
                  <div><i className="fa-solid fa-envelope"></i> info@sundayinfinity.com</div>
              </div>
          </div>
              
              <ul className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
                  <li><a href="#home" onClick={() => setIsMobileMenuOpen(false)}>{t.nav.home}</a></li>
                  <li><a href="#services" onClick={() => setIsMobileMenuOpen(false)}>{t.nav.services}</a></li>
                  <li><a href="#packages" onClick={() => setIsMobileMenuOpen(false)}>{t.nav.packages}</a></li>
                  <li><a href="#jobs" onClick={() => setIsMobileMenuOpen(false)}>{t.nav.jobs}</a></li>
                  <li><a href="#faq" onClick={() => setIsMobileMenuOpen(false)}>{t.nav.faq}</a></li>
                  <li><a href="#contact" onClick={() => setIsMobileMenuOpen(false)}>{t.nav.contact}</a></li>
              </ul>
              <div className="nav-controls" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                      <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
                  </div>
                  <select className="lang-select" value={lang} onChange={(e) => setLang(e.target.value)}>
                      <option value="en">EN</option>
                      <option value="ru">RU</option>
                      <option value="am">AM</option>
                  </select>
              </div>
          </div>
      </nav>

      <section id="home" className="hero">
          <video autoPlay loop muted playsInline className="hero-video">
              <source src="/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="hero-overlay"></div>
          <div className="container hero-content animate-fade-in-up">
              <h1>EXPLORE THE WORLD WITH <br/><span style={{color: 'var(--primary-gold)'}}>SUNDAY INFINITY</span></h1>
              <p>{t.hero.subtitle}</p>
          </div>
          
      </section>

      <section id="services" className="section-padding bg-light">
          <div className="container">
              <div className="section-header">
                  <h2>{t.services.title}</h2>
                  <p>{t.services.subtitle}</p>
              </div>
              <div className="services-grid">
                  <div className="service-card" style={{ padding: 0, overflow: 'hidden', border: 'none', borderRadius: '12px', background: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                      <img src="/places/global-tours.jpg" alt="Global Tours" style={{ width: "100%", height: "220px", objectFit: "cover" }} />
                      <div className="service-card-content" style={{ padding: '30px 20px', textAlign: 'center' }}>
                          <h3 style={{ fontSize: '1.4rem', color: '#0A0F1C', marginBottom: '15px' }}>{t.services.tours || 'Global Tours'}</h3>
                          <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '0.95rem' }}>{t.services.toursDesc || 'Unforgettable journeys across Armenia, Georgia, Europe and beyond.'}</p>
                      </div>
                  </div>
                  <div className="service-card" style={{ padding: 0, overflow: 'hidden', border: 'none', borderRadius: '12px', background: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                      <img src="/places/visa-support.jpg" alt="Visa Support" style={{ width: "100%", height: "220px", objectFit: "cover" }} />
                      <div className="service-card-content" style={{ padding: '30px 20px', textAlign: 'center' }}>
                          <h3 style={{ fontSize: '1.4rem', color: '#0A0F1C', marginBottom: '15px' }}>{t.services.visa || 'Visa Support'}</h3>
                          <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '0.95rem' }}>{t.services.visaDesc || 'Expert guidance for tourist, work, and student visas worldwide.'}</p>
                      </div>
                  </div>
                  <div className="service-card" style={{ padding: 0, overflow: 'hidden', border: 'none', borderRadius: '12px', background: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                      <img src="/places/job-placement.jpg" alt="Job Placement" style={{ width: "100%", height: "220px", objectFit: "cover" }} />
                      <div className="service-card-content" style={{ padding: '30px 20px', textAlign: 'center' }}>
                          <h3 style={{ fontSize: '1.4rem', color: '#0A0F1C', marginBottom: '15px' }}>{t.services.jobs || 'Job Placement'}</h3>
                          <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '0.95rem' }}>{t.services.jobsDesc || 'Connecting talent with international career opportunities.'}</p>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      <section id="packages" className="section-padding bg-light">
          <div className="container">
              <div className="section-header" style={{ marginBottom: '50px' }}>
                  <span style={{ color: '#F5A623', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem', display: 'block', marginBottom: '8px' }}>CURATED ITINERARIES</span>
                  <h2 style={{ fontSize: '2.5rem', color: '#0A0F1C', letterSpacing: '1px' }}>{t.packages.title}</h2>
                  <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto' }}>{t.packages.subtitle}</p>
              </div>
              
              {packages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', color: '#64748b' }}>
                      <i className="fa-solid fa-compass" style={{ fontSize: '2.5rem', color: '#F5A623', marginBottom: '15px' }}></i>
                      <p style={{ fontSize: '1.1rem' }}>No packages published yet. Add your first package in the Admin Panel!</p>
                  </div>
              ) : (
                  <div className="packages-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '30px', alignItems: 'stretch' }}>
                      {packages.map(pkg => (
                          <div className="package-card" key={pkg.id} style={{
                              background: '#ffffff',
                              borderRadius: '16px',
                              overflow: 'hidden',
                              border: '1px solid rgba(11, 27, 61, 0.08)',
                              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
                              transition: 'all 0.35s ease',
                              display: 'flex',
                              flexDirection: 'column',
                              position: 'relative'
                          }}>
                              {/* Card Image Container with Hover Zoom & Floating Location Badge */}
                              <div style={{ position: 'relative', height: '230px', overflow: 'hidden', backgroundColor: '#e2e8f0' }}>
                                  <img 
                                      src={pkg.img} 
                                      alt={pkg.title} 
                                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }} 
                                      
                                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.06)'; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                                  />
                                  <div style={{
                                      position: 'absolute',
                                      top: '16px',
                                      left: '16px',
                                      background: 'rgba(10, 15, 28, 0.75)',
                                      backdropFilter: 'blur(8px)',
                                      color: '#ffffff',
                                      padding: '6px 14px',
                                      borderRadius: '30px',
                                      fontSize: '0.8rem',
                                      fontWeight: '600',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                  }}>
                                      <i className="fa-solid fa-location-dot" style={{ color: '#F5A623' }}></i>
                                      <span>{pkg.location}</span>
                                  </div>
                              </div>

                              {/* Card Body */}
                              <div style={{ padding: '28px 24px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                  <h3 style={{ fontSize: '1.35rem', color: '#0A0F1C', marginBottom: '16px', fontWeight: '700', lineHeight: '1.3' }}>
                                      {pkg.title}
                                  </h3>
                                  
                                  {/* Feature Pills */}
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                                      {(pkg.features || '').split(',').map((f, i) => f.trim() ? (
                                          <span key={i} style={{
                                              background: '#F8FAFC',
                                              border: '1px solid #E2E8F0',
                                              borderRadius: '20px',
                                              padding: '5px 12px',
                                              fontSize: '0.8rem',
                                              color: '#475569',
                                              fontWeight: '500',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '6px'
                                          }}>
                                              <i className="fa-solid fa-check" style={{ color: '#F5A623', fontSize: '0.75rem' }}></i>
                                              {f.trim()}
                                          </span>
                                      ) : null)}
                                  </div>

                                  {/* Action CTA Button */}
                                  <button 
                                      className="btn"
                                      onClick={() => openModal(pkg.title, pkg)}
                                      style={{
                                          marginTop: 'auto',
                                          width: '100%',
                                          padding: '13px 20px',
                                          background: '#0A0F1C',
                                          color: '#ffffff',
                                          borderRadius: '10px',
                                          fontSize: '0.9rem',
                                          fontWeight: '600',
                                          letterSpacing: '0.5px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          gap: '8px',
                                          border: 'none',
                                          cursor: 'pointer',
                                          transition: 'all 0.3s ease',
                                          boxShadow: '0 4px 14px rgba(10, 15, 28, 0.12)'
                                      }}
                                      onMouseEnter={(e) => {
                                          e.currentTarget.style.background = '#F5A623';
                                          e.currentTarget.style.color = '#0A0F1C';
                                          e.currentTarget.style.transform = 'translateY(-2px)';
                                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 166, 35, 0.3)';
                                      }}
                                      onMouseLeave={(e) => {
                                          e.currentTarget.style.background = '#0A0F1C';
                                          e.currentTarget.style.color = '#ffffff';
                                          e.currentTarget.style.transform = 'translateY(0)';
                                          e.currentTarget.style.boxShadow = '0 4px 14px rgba(10, 15, 28, 0.12)';
                                      }}
                                  >
                                      <span>{hasEnquired ? "VIEW FULL ITINERARY" : "EXPLORE PACKAGE"}</span>
                                      <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.85rem' }}></i>
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </section>

      <section id="visa" className="section-padding bg-light">
          <div className="container">
              <div className="split-section animate-fade-in-up">
                  <div className="info-box" id="visa-box" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      <img src="/places/visa-support.jpg" alt="Visa" style={{ width: "100%", height: "200px", objectFit: "cover", borderBottom: "3px solid #F59E0B" }} />
                      <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <h3><i className="fa-solid fa-passport"></i> {t.split.visaTitle}</h3>
                          <ul className="feature-list" style={{ flex: 1 }}>
                              <li><i className="fa-solid fa-check-circle"></i> {t.split.visaFeature1}</li>
                              <li><i className="fa-solid fa-check-circle"></i> {t.split.visaFeature2}</li>
                              <li><i className="fa-solid fa-check-circle"></i> {t.split.visaFeature3}</li>
                          </ul>
                          <button className="btn btn-gold" style={{ width: '100%', marginTop: 'auto' }} onClick={() => openModal('Visa Assistance')}>{t.split.applyVisa}</button>
                      </div>
                  </div>
                  <div className="info-box" id="jobs" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      <img src="/places/job-placement.jpg" alt="Jobs" style={{ width: "100%", height: "200px", objectFit: "cover", borderBottom: "3px solid #0A0F1C" }} />
                      <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <h3><i className="fa-solid fa-briefcase"></i> {t.split.jobTitle}</h3>
                          <ul className="feature-list" style={{ flex: 1 }}>
                              <li><i className="fa-solid fa-check-circle"></i> {t.split.jobFeature1}</li>
                              <li><i className="fa-solid fa-check-circle"></i> {t.split.jobFeature2}</li>
                              <li><i className="fa-solid fa-check-circle"></i> {t.split.jobFeature3}</li>
                          </ul>
                          <button className="btn" style={{ background: '#0A0F1C', color: '#fff', width: '100%', marginTop: 'auto' }} onClick={() => openModal('International Jobs')}>{t.split.submitCv}</button>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      <section id="faq" className="section-padding" style={{background: '#F8F9FA'}}>
          <div className="container">
              <div className="section-header">
                  <h2>{t.faq.title}</h2>
                  <p>{t.faq.subtitle}</p>
              </div>
              
              <div className="faq-layout">
                  {/* Left Side: Animated Itinerary Steps */}
                  <div className="faq-animated-box">
                      <div className="step-item" style={{ animationDelay: '0.2s' }}>
                          <div className="step-icon bg-blue"><i className="fa-solid fa-plane-arrival"></i></div>
                          <div className="step-content">
                              <span className="step-day">Step 1</span>
                              <span className="step-title">Contact & Consultation</span>
                          </div>
                      </div>
                      <div className="step-item" style={{ animationDelay: '0.6s' }}>
                          <div className="step-icon bg-green"><i className="fa-solid fa-file-signature"></i></div>
                          <div className="step-content">
                              <span className="step-day">Step 2</span>
                              <span className="step-title">Visa & Documentation</span>
                          </div>
                      </div>
                      <div className="step-item" style={{ animationDelay: '1.0s' }}>
                          <div className="step-icon bg-red"><i className="fa-solid fa-map-location-dot"></i></div>
                          <div className="step-content">
                              <span className="step-day">Step 3</span>
                              <span className="step-title">Customized Itinerary</span>
                          </div>
                      </div>
                      <div className="step-item" style={{ animationDelay: '1.4s' }}>
                          <div className="step-icon bg-yellow"><i className="fa-solid fa-suitcase-rolling"></i></div>
                          <div className="step-content">
                              <span className="step-day">Step 4</span>
                              <span className="step-title">Enjoy Your Trip!</span>
                          </div>
                      </div>
                      
                      <div className="step-icons-row">
                          <i className="fa-solid fa-plane" style={{ animationDelay: '1.8s' }}></i>
                          <i className="fa-solid fa-hotel" style={{ animationDelay: '2.0s' }}></i>
                          <i className="fa-solid fa-camera" style={{ animationDelay: '2.2s' }}></i>
                          <i className="fa-solid fa-utensils" style={{ animationDelay: '2.4s' }}></i>
                      </div>
                  </div>
                  
                  {/* Right Side: Accordion */}
                  <div className="faq-accordion">
                      {[1, 2, 3].map((num) => (
                          <div key={num} className={`faq-item-modern ${activeFaq === num ? 'active' : ''}`} onClick={() => toggleFaq(num)}>
                              <div className="faq-question-modern">
                                  <span>{t.faq[`q${num}`]}</span>
                                  <i className={`fa-solid ${activeFaq === num ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                              </div>
                              <div className="faq-answer-modern">
                                  <p>{t.faq[`a${num}`]}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </section>

      <section id="testimonials" className="section-padding bg-light" style={{overflow: 'hidden'}}>
          <div className="container">
              <div className="section-header">
                  <h2>{t.testimonials.title || 'WHAT OUR CLIENTS SAY'}</h2>
                  <p>{t.testimonials.subtitle || 'Real stories from real travelers'}</p>
              </div>
          </div>
          <div className="testimonial-marquee-wrapper">
              <div className="testimonial-marquee">
                  {[1,2,3,4,5,6].map((i) => (
                      <div className="testimonial-card" key={i} style={{ minWidth: '350px', background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', margin: '0 15px' }}>
                          <div className="stars" style={{ color: '#F59E0B', marginBottom: '15px' }}>
                              <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                          </div>
                          <p style={{ fontStyle: 'italic', color: '#475569', marginBottom: '20px', lineHeight: '1.7' }}>{t.testimonial?.text || '"Sunday Infinity made our trip absolutely seamless. The visa process was quick, and the tour guides were incredibly knowledgeable. Highly recommended!"'}</p>
                          <div className="testimonial-author" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                              <img src={"https://i.pravatar.cc/150?img=" + (i+10)} alt="User" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                              <div>
                                  <h4 style={{ color: '#0A0F1C', fontSize: '1rem', marginBottom: '3px' }}>{t.testimonial?.author || 'Alex Mitchell'}</h4>
                                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{t.testimonial?.role || 'Solo Traveler'}</p>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      <section id="gallery" className="section-padding" style={{ backgroundColor: '#ffffff', position: 'relative', zIndex: 10 }}>
          <div className="container">
              <div className="section-header">
                  <span style={{ color: '#F5A623', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem', display: 'block', marginBottom: '8px' }}>WHAT WE OFFER</span>
                  <h2 style={{ fontSize: '2.5rem', color: '#0A0F1C', letterSpacing: '1px' }}>Discover Our Offerings</h2>
                  <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto' }}>Explore our curated selection of tours, visa assistance, and international job opportunities.</p>
              </div>
              <div className="gallery-grid">
                  {[1, 2, 3, 4, 5, 6, 7].map(num => (
                      <div key={num} className="gallery-item">
                          <img src={`/gallery/gallery-img${num}.jpg`} alt={`Journey highlight ${num}`} loading="lazy" />
                          <div className="gallery-overlay">
                              <i className="fa-brands fa-instagram"></i>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      <section id="social-showcase" className="section-padding" style={{ background: '#0A0F1C', color: '#ffffff', position: 'relative', overflow: 'hidden' }}>
          {/* Subtle background glow circles */}
          <div style={{ position: 'absolute', top: '-100px', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
          <div style={{ position: 'absolute', bottom: '-100px', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(24,119,242,0.08) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
              <div className="section-header" style={{ marginBottom: '40px', textAlign: 'center' }}>
                  <span style={{ color: '#F5A623', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem', display: 'block', marginBottom: '10px' }}>
                      FOLLOW OUR JOURNEYS
                  </span>
                  <h2 style={{ fontSize: '2.5rem', color: '#ffffff', letterSpacing: '1px', marginBottom: '12px' }}>
                      INSTAGRAM &amp; FACEBOOK
                  </h2>
                  <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto 25px' }}>
                      Catch our daily travel reels, client visa success stories, and real-time glimpses from destinations worldwide!
                  </p>

                  {/* Dual Social Action Buttons */}
                  <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <a 
                          href="https://www.instagram.com/sundayinfinity01" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '12px 26px',
                              borderRadius: '50px',
                              background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                              color: '#ffffff',
                              fontWeight: '600',
                              fontSize: '0.92rem',
                              textDecoration: 'none',
                              boxShadow: '0 8px 20px rgba(220, 39, 67, 0.3)',
                              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(220, 39, 67, 0.45)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(220, 39, 67, 0.3)'; }}
                      >
                          <i className="fa-brands fa-instagram" style={{ fontSize: '1.2rem' }}></i>
                          <span>Follow on Instagram</span>
                      </a>

                      <a 
                          href="https://www.facebook.com/share/16ERoWPbVtx/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '12px 26px',
                              borderRadius: '50px',
                              background: '#1877F2',
                              color: '#ffffff',
                              fontWeight: '600',
                              fontSize: '0.92rem',
                              textDecoration: 'none',
                              boxShadow: '0 8px 20px rgba(24, 119, 242, 0.3)',
                              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(24, 119, 242, 0.45)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(24, 119, 242, 0.3)'; }}
                      >
                          <i className="fa-brands fa-facebook-f" style={{ fontSize: '1.1rem' }}></i>
                          <span>Follow on Facebook</span>
                      </a>
                  </div>
              </div>

              {/* Responsive Reel / Post Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '22px' }}>
                  {[
                      {
                          img: 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=800',
                          type: 'Reel',
                          platform: 'instagram',
                          caption: 'Exploring panoramic Caucasus ridges in Kazbegi! 🏔️🇬🇪',
                          link: 'https://www.instagram.com/sundayinfinity01',
                          views: '12.4K'
                      },
                      {
                          img: 'https://images.pexels.com/photos/2265876/pexels-photo-2265876.jpeg?auto=compress&cs=tinysrgb&w=800',
                          type: 'Post',
                          platform: 'facebook',
                          caption: 'Historic European cobblestone charm & custom itineraries ✨',
                          link: 'https://www.facebook.com/share/16ERoWPbVtx/',
                          views: '8.2K'
                      },
                      {
                          img: 'https://images.pexels.com/photos/1483053/pexels-photo-1483053.jpeg?auto=compress&cs=tinysrgb&w=800',
                          type: 'Reel',
                          platform: 'instagram',
                          caption: 'Snowcapped serenity at Gergeti Trinity Church ⛪❄️',
                          link: 'https://www.instagram.com/sundayinfinity01',
                          views: '15.1K'
                      },
                      {
                          img: 'https://images.pexels.com/photos/2070033/pexels-photo-2070033.jpeg?auto=compress&cs=tinysrgb&w=800',
                          type: 'Post',
                          platform: 'facebook',
                          caption: 'Luxury 5-star resort packages curated by Sunday Infinity 🌴',
                          link: 'https://www.facebook.com/share/16ERoWPbVtx/',
                          views: '6.9K'
                      },
                      {
                          img: 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=800',
                          type: 'Reel',
                          platform: 'instagram',
                          caption: 'Visa approved! Ready for takeoff with our travelers ✈️💼',
                          link: 'https://www.instagram.com/sundayinfinity01',
                          views: '22.8K'
                      },
                      {
                          img: 'https://images.pexels.com/photos/1450360/pexels-photo-1450360.jpeg?auto=compress&cs=tinysrgb&w=800',
                          type: 'Post',
                          platform: 'facebook',
                          caption: 'Unforgettable coastal escapes & romantic honeymoon getaways ❤️',
                          link: 'https://www.facebook.com/share/16ERoWPbVtx/',
                          views: '9.5K'
                      }
                  ].map((item, idx) => (
                      <a 
                          key={idx}
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                              position: 'relative',
                              height: '340px',
                              borderRadius: '16px',
                              overflow: 'hidden',
                              display: 'block',
                              textDecoration: 'none',
                              color: '#ffffff',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              transition: 'transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 0.4s ease'
                          }}
                          onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-8px)';
                              e.currentTarget.style.boxShadow = '0 20px 35px rgba(0,0,0,0.6)';
                              const img = e.currentTarget.querySelector('img');
                              if (img) img.style.transform = 'scale(1.08)';
                              const overlay = e.currentTarget.querySelector('.social-hover-overlay');
                              if (overlay) overlay.style.opacity = '1';
                          }}
                          onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.4)';
                              const img = e.currentTarget.querySelector('img');
                              if (img) img.style.transform = 'scale(1)';
                              const overlay = e.currentTarget.querySelector('.social-hover-overlay');
                              if (overlay) overlay.style.opacity = '0';
                          }}
                      >
                          {/* Image */}
                          <img 
                              src={item.img} 
                              alt="Social Story"
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s ease' }}
                          />

                          {/* Dark Vignette Gradient */}
                          <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)'
                          }}></div>

                          {/* Top Badges */}
                          <div style={{ position: 'absolute', top: '14px', left: '14px', right: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{
                                  background: item.platform === 'instagram' ? 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)' : '#1877F2',
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.9rem',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                              }}>
                                  <i className={`fa-brands fa-${item.platform === 'instagram' ? 'instagram' : 'facebook-f'}`}></i>
                              </span>

                              <span style={{
                                  background: 'rgba(0,0,0,0.6)',
                                  backdropFilter: 'blur(6px)',
                                  padding: '4px 10px',
                                  borderRadius: '20px',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  border: '1px solid rgba(255,255,255,0.15)'
                              }}>
                                  <i className={`fa-solid ${item.type === 'Reel' ? 'fa-play' : 'fa-image'}`} style={{ color: '#F5A623', fontSize: '0.7rem' }}></i>
                                  <span>{item.type}</span>
                              </span>
                          </div>

                          {/* Bottom Caption & Views */}
                          <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px' }}>
                              <p style={{ fontSize: '0.88rem', fontWeight: '500', lineHeight: '1.4', marginBottom: '8px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                                  {item.caption}
                              </p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#F5A623', fontWeight: '600' }}>
                                  <i className="fa-solid fa-fire"></i>
                                  <span>{item.views} views</span>
                              </div>
                          </div>

                          {/* Hover Overlay with Action Button */}
                          <div className="social-hover-overlay" style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              background: 'rgba(10, 15, 28, 0.65)',
                              backdropFilter: 'blur(4px)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '12px',
                              opacity: 0,
                              transition: 'opacity 0.3s ease'
                          }}>
                              <div style={{
                                  width: '54px',
                                  height: '54px',
                                  borderRadius: '50%',
                                  background: item.platform === 'instagram' ? 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)' : '#1877F2',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '1.4rem',
                                  boxShadow: '0 6px 20px rgba(0,0,0,0.4)'
                              }}>
                                  <i className={`fa-brands fa-${item.platform === 'instagram' ? 'instagram' : 'facebook-f'}`}></i>
                              </div>
                              <span style={{
                                  fontSize: '0.9rem',
                                  fontWeight: '700',
                                  textTransform: 'uppercase',
                                  letterSpacing: '1px',
                                  color: '#ffffff',
                                  background: 'rgba(255,255,255,0.15)',
                                  padding: '6px 16px',
                                  borderRadius: '20px',
                                  border: '1px solid rgba(255,255,255,0.2)'
                              }}>
                                  View on {item.platform === 'instagram' ? 'Instagram' : 'Facebook'} &rarr;
                              </span>
                          </div>
                      </a>
                  ))}
              </div>
          </div>
      </section>

      <footer id="contact">
          <div className="container">
              <div className="footer-grid-compact">
                  {/* Column 1: Brand & AI Integration */}
                  <div>
                      <h3 style={{ color: '#F59E0B', fontSize: '1.3rem', letterSpacing: '0.5px', marginBottom: '14px' }}>SUNDAY INFINITY</h3>
                      <p style={{ fontSize: '0.88rem', marginBottom: '14px', color: '#94a3b8', lineHeight: '1.6' }}>
                          Your trusted partner for worldwide travel, customized visas, and international job placements.
                      </p>
                      
                      <div className="footer-ai-box">
                          <div className="footer-ai-title">
                              <span>Ask AI How We Can Help</span>
                          </div>
                          <div className="footer-ai-row">
                              <a 
                                  href="https://chatgpt.com/?q=How+can+SUNDAY+INFINITY+TOURS+%26+TRAVELS+help+me+plan+my+trip+and+visas%3F" 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="ai-icon-badge chatgpt" 
                                  title="Ask ChatGPT"
                              >
                                  <ChatGptIcon size={18} color="#10A37F" />
                              </a>
                              <a 
                                  href="https://claude.ai/new?q=How+can+SUNDAY+INFINITY+TOURS+%26+TRAVELS+help+me+plan+my+trip+and+visas%3F" 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="ai-icon-badge claude" 
                                  title="Ask Claude"
                              >
                                  <ClaudeIcon size={18} color="#D97757" />
                              </a>
                              <a 
                                  href="https://gemini.google.com/app?q=How+can+SUNDAY+INFINITY+TOURS+%26+TRAVELS+help+me+plan+my+trip+and+visas%3F" 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="ai-icon-badge gemini" 
                                  title="Ask Gemini"
                              >
                                  <GeminiIcon size={18} color="#4E82EE" />
                              </a>
                          </div>
                      </div>
                  </div>

                  {/* Column 2: Quick Links */}
                  <div>
                      <h4 className="footer-col-head">{t.footer.quickLinks}</h4>
                      <ul className="footer-list">
                          <li><a href="#home">{t.nav.home}</a></li>
                          <li><a href="#services">{t.nav.services}</a></li>
                          <li><a href="#packages">{t.nav.packages}</a></li>
                          <li><a href="#visa">{t.nav.visa}</a></li>
                          <li><a href="#jobs">{t.nav.jobs}</a></li>
                          <li><a href="#faq">{t.faq.title}</a></li>
                      </ul>
                  </div>

                  {/* Column 3: Destinations & Services */}
                  <div>
                      <h4 className="footer-col-head">Destinations</h4>
                      <ul className="footer-list">
                          <li><a href="#packages">Armenia Tours</a></li>
                          <li><a href="#packages">Taste of Georgia</a></li>
                          <li><a href="#packages">European Highlights</a></li>
                          <li><a href="#visa">Visa Processing</a></li>
                          <li><a href="#jobs">Job Placement</a></li>
                      </ul>
                  </div>

                  {/* Column 4: Contact & Office */}
                  <div>
                      <h4 className="footer-col-head">{t.footer.contact}</h4>
                      <div className="footer-contact-item">
                          <i className="fa-solid fa-location-dot"></i>
                          <a href="https://maps.app.goo.gl/SVpfctihMVLyiPDH7?g_st=aw" target="_blank" rel="noopener noreferrer" style={{color: 'inherit', textDecoration: 'none'}}><span>Yerevan, Center, Baghramyan Avenue Station</span></a>
                      </div>
                      <div className="footer-contact-item">
                          <i className="fa-solid fa-phone"></i>
                          <div>
                              <a href="tel:+37493964458" style={{ color: 'inherit', textDecoration: 'none' }}>+374 93 964458</a><br />
                              <a href="tel:+3749964458" style={{ color: 'inherit', textDecoration: 'none' }}>+374 99 64458</a>
                          </div>
                      </div>
                      <div className="footer-contact-item">
                          <i className="fa-solid fa-envelope"></i>
                          <a href="mailto:info@sundayinfinity.com" style={{ color: 'inherit', textDecoration: 'none' }}>info@sundayinfinity.com</a>
                      </div>
                      
                      <div className="footer-social-row">
                          <a href="https://www.facebook.com/share/16ERoWPbVtx/" target="_blank" rel="noopener noreferrer" className="footer-social-btn" title="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
                          <a href="https://www.instagram.com/sundayinfinity01" target="_blank" rel="noopener noreferrer" className="footer-social-btn" title="Instagram"><i className="fa-brands fa-instagram"></i></a>
                          <a href="#!" className="footer-social-btn" title="LinkedIn"><i className="fa-brands fa-linkedin-in"></i></a>
                      </div>
                  </div>
              </div>

              {/* Bottom Copyright */}
              <div className="footer-bottom-bar" style={{ justifyContent: 'center', textAlign: 'center' }}>
                  <div>{t.footer.rights}</div>
              </div>
          </div>
      </footer>

      {/* WhatsApp Button using Dynamic Settings Number */}
      <a href="#" onClick={(e) => { e.preventDefault(); window.open('https://wa.me/' + whatsappNum, '_blank', 'noopener,noreferrer'); }} className="whatsapp-float">
          <i className="fa-brands fa-whatsapp"></i>
      </a>

      {/* MODAL */}
      <div id="inquiryModal" className="modal" style={{ display: isModalOpen ? "flex" : "none" }} onClick={handleModalClick}>
          <div className="modal-content" style={{ padding: '25px 30px', maxWidth: activePackage ? '700px' : '450px', width: '90%' }}>
              <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                  <img src={logo} alt="Sunday Infinity Logo" style={{ height: '40px', borderRadius: '4px' }} />
              </div>
              <span className="close-modal" onClick={closeModal}>&times;</span>
              <h3 style={{marginBottom: '15px', color: 'var(--navy-blue)', fontSize: '1.3rem', textAlign: 'center'}} id="modalTitle">{modalTitle}</h3>
              
              {/* IF ACTIVE PACKAGE (Content Unlocked), Show Details instead of Form */}
              {activePackage ? (
                  <div className="unlocked-content">
                      <img src={activePackage.img} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '20px' }} />
                      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #F59E0B' }}>
                          <h4 style={{ marginBottom: '10px', fontSize: '1.1rem' }}>Full Itinerary / Details</h4>
                          <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', color: '#333' }}>{activePackage.details}</p>
                      </div>
                      <button onClick={closeModal} className="btn btn-gold" style={{ width: '100%', marginTop: '20px' }}>Close</button>
                  </div>
              ) : (
                  /* STANDARD FORM (Lead Capture) */
                  <form onSubmit={submitForm}>
                      <div className="form-group" style={{marginBottom: '10px'}}>
                          <label>{t.modal.name}</label>
                          <input type="text" name="fullName" required placeholder={t.modal.namePlaceholder} />
                      </div>
                      <div className="form-group" style={{marginBottom: '10px'}}>
                          <label>{t.modal.email}</label>
                          <input type="text" name="email" required placeholder={t.modal.emailPlaceholder} />
                      </div>
                      <div className="form-group" style={{marginBottom: '10px'}}>
                          <label>{t.modal.phone}</label>
                          <input type="tel" name="phone" required placeholder={t.modal.phonePlaceholder} />
                      </div>
                      <div className="form-group" style={{marginBottom: '10px'}}>
                          <label>{t.modal.details}</label>
                          <textarea name="details" rows="3" placeholder={t.modal.reqPlaceholder}></textarea>
                      </div>
                      <button type="submit" className="btn btn-gold" style={{width: '100%'}}>{t.modal.submit}</button>
                  </form>
              )}
          </div>
      </div>

      {showPromo && (
          <div className="promo-widget">
              <button className="promo-close" onClick={() => { setShowPromo(false); setHasClosedPromo(true); }} aria-label="Close promo video">
                  <i className="fa-solid fa-xmark"></i>
              </button>
              <button className="promo-mute-btn" onClick={() => setIsMuted(!isMuted)} aria-label="Toggle mute">
                  <i className={`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
              </button>
              <video autoPlay loop muted={isMuted} playsInline className="promo-video-element">
                  <source src="/promo-video.mp4" type="video/mp4" />
              </video>
          </div>
      )}
    </>
  );
}

export default App;
