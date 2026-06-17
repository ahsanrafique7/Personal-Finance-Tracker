import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';
import heroImage from '../assets/landing_hero.png';

const LandingPage = () => {
    const { user } = useAuth();

    // If user is already logged in, redirect to dashboard
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="landing-container">
            {/* Navbar */}
            <nav className="landing-nav">
                <div className="nav-content">
                    <div className="logo">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                        <span>PFT Cloud</span>
                    </div>
                    <div className="nav-links">
                        <a href="#features">Features</a>
                        <a href="#services">Cloud</a>
                        <a href="#about">About</a>
                        <a href="#contact">Contact</a>
                        <Link to="/login" className="btn-login">Login</Link>
                        <Link to="/register" className="btn-signup">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header id="hero" className="hero-section">
                <div className="hero-content">
                    <h1>Manage Your Wealth with <span className="text-gradient">Cloud Intelligence</span></h1>
                    <p>
                        The Personal Finance Tracker (PFT) leverages hybrid cloud technology to give you
                        real-time insights into your spending, savings, and financial growth.
                    </p>
                    <div className="hero-btns">
                        <Link to="/register" className="btn-primary">Start Tracking Free</Link>
                        <a href="#features" className="btn-secondary">Explore Features</a>
                    </div>
                </div>
                <div className="hero-image">
                    <div className="image-wrapper">
                        <img src={heroImage} alt="Financial Dashboard" />
                        <div className="glass-card shadow-1"></div>
                        <div className="glass-card shadow-2"></div>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="section-header">
                    <h2>Why Choose PFT Cloud?</h2>
                    <p>Everything you need to master your money, powered by cutting-edge architecture.</p>
                </div>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="icon-box info">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" /></svg>
                        </div>
                        <h3>Smart Analytics</h3>
                        <p>Visualise your expenses with dynamic charts and AI-driven spending patterns.</p>
                    </div>

                    <div className="feature-card">
                        <div className="icon-box success">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                        </div>
                        <h3>Financial Goals</h3>
                        <p>Set savings goals and track your progress with automated milestones.</p>
                    </div>

                    <div className="feature-card">
                        <div className="icon-box warning">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        </div>
                        <h3>Real-time Alerts</h3>
                        <p>Stay on top of your budget with instant notifications on overspending.</p>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="services-section">
                <div className="services-content">
                    <div className="section-header align-left">
                        <span className="badge">CLOUD ARCHITECTURE</span>
                        <h2>Rendered via Hybrid Cloud</h2>
                        <p>
                            Our infrastructure is built on the six essentials of cloud computing,
                            providing you with unmatched reliability and speed.
                        </p>
                    </div>
                    <ul className="services-list">
                        <li>
                            <div className="check-icon">✓</div>
                            <div>
                                <strong>Platform as a Service</strong>
                                <p>Built on MongoDB Atlas for seamless data management and scalability.</p>
                            </div>
                        </li>
                        <li>
                            <div className="check-icon">✓</div>
                            <div>
                                <strong>High Availability</strong>
                                <p>Global load balancers ensure your data is always accessible instantly.</p>
                            </div>
                        </li>
                        <li>
                            <div className="check-icon">✓</div>
                            <div>
                                <strong>Pay-as-you-go</strong>
                                <p>Optimized resource pooling keepscosts low while maintaining peak performance.</p>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="services-visual">
                    <div className="cloud-nodes">
                        <div className="node node-1">DB</div>
                        <div className="node node-2">API</div>
                        <div className="node node-3">CDN</div>
                        <div className="node node-4">APP</div>
                        <div className="connector"></div>
                    </div>
                </div>
            </section>

            {/* About Us Section */}
            <section id="about" className="about-section">
                <div className="container">
                    <div className="section-header">
                        <h2>About PFT</h2>
                        <p>Bridging the gap between personal finance and cloud innovation.</p>
                    </div>
                    <div className="about-content">
                        <p>
                            PFT was born out of a desire to make financial management as seamless as the technology that powers it.
                            By utilizing advanced cloud computing principles, we provide a platform that is not only secure and resilient
                            but also incredibly fast and accessible from anywhere in the world.
                        </p>
                        <p>
                            Our mission is to empower individuals with the tools they need to achieve financial freedom through
                            data-driven insights and state-of-the-art infrastructure.
                        </p>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="pricing-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Flexible Plans for Every Budget</h2>
                        <p>Choose the tier that fits your financial journey.</p>
                    </div>
                    <div className="pricing-grid">
                        <div className="pricing-card">
                            <div className="tier-badge">FREE</div>
                            <div className="price">$0<span>/mo</span></div>
                            <ul className="plan-features">
                                <li>✓ Up to 20 Transactions</li>
                                <li>✓ Basic Analytics</li>
                                <li>✓ 1 Financial Goal</li>
                                <li>✓ Cloud Sync</li>
                            </ul>
                            <Link to="/register?plan=free" className="btn-secondary">Get Started</Link>
                        </div>
                        <div className="pricing-card featured">
                            <div className="featured-label">RECOMMENDED</div>
                            <div className="tier-badge">PREMIUM</div>
                            <div className="price">$9<span>/mo</span></div>
                            <ul className="plan-features">
                                <li>✓ Up to 200 Transactions</li>
                                <li>✓ Advanced Analytics</li>
                                <li>✓ 10 Financial Goals</li>
                                <li>✓ Priority Support</li>
                            </ul>
                            <Link to="/register?plan=premium" className="btn-primary">Go Premium</Link>
                        </div>
                        <div className="pricing-card">
                            <div className="tier-badge">ENTERPRISE</div>
                            <div className="price">$29<span>/mo</span></div>
                            <ul className="plan-features">
                                <li>✓ Unlimited Transactions</li>
                                <li>✓ Custom Reports</li>
                                <li>✓ Unlimited Goals</li>
                                <li>✓ 24/7 Personal Advisor</li>
                            </ul>
                            <Link to="/register?plan=enterprise" className="btn-secondary">Contact Sales</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="contact-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Get in Touch</h2>
                        <p>Have questions? We're here to help you on your financial journey.</p>
                    </div>
                    <div className="contact-card">
                        <div className="contact-info">
                            <div className="contact-item">
                                <div className="icon">📧</div>
                                <div>
                                    <h4>Email Us</h4>
                                    <p>support@pftcloud.com</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                            <span>PFT Cloud</span>
                        </div>
                        <p>Empowering financial freedom through cloud intelligence.</p>
                    </div>
                    <div className="footer-links">
                        <div className="link-group">
                            <h4>Product</h4>
                            <a href="#features">Features</a>
                            <a href="#services">Services</a>
                            <a href="#about">About Us</a>
                            <Link to="/register">Sign Up</Link>
                        </div>
                        <div className="link-group">
                            <h4>Company</h4>
                            <a href="#about">Our Story</a>
                            <a href="#contact">Contact</a>
                            <a href="#">Privacy</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2024 PFT Personal Finance Tracker. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
