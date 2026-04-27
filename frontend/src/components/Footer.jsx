/**
 * components/Footer.jsx - Global Footer Component
 *
 * A premium footer shown on every page with branding,
 * quick links, contact info, and social presence.
 */

import { Link } from 'react-router-dom';

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="site-footer">
            <div className="footer-inner">
                {/* Brand Column */}
                <div className="footer-col footer-brand-col">
                    <div className="footer-brand">
                        <span className="footer-brand-icon">⚡</span>
                        VolunteerBridge
                    </div>
                    <p className="footer-tagline">
                        Connecting passionate volunteers with NGOs that need help.
                        One unified platform, three dedicated portals.
                    </p>
                    <div className="footer-social">
                        <a href="#" className="footer-social-icon" aria-label="Twitter">𝕏</a>
                        <a href="#" className="footer-social-icon" aria-label="LinkedIn">in</a>
                        <a href="#" className="footer-social-icon" aria-label="GitHub">⚙</a>
                        <a href="#" className="footer-social-icon" aria-label="Email">✉</a>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="footer-col">
                    <h4 className="footer-heading">Quick Links</h4>
                    <ul className="footer-links">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/login">Sign In</Link></li>
                        <li><Link to="/register/volunteer">Join as Volunteer</Link></li>
                        <li><Link to="/register/ngo">Register NGO</Link></li>
                    </ul>
                </div>

                {/* Portals */}
                <div className="footer-col">
                    <h4 className="footer-heading">Portals</h4>
                    <ul className="footer-links">
                        <li><Link to="/login">⚡ Admin Portal</Link></li>
                        <li><Link to="/register/volunteer">🌿 Volunteer Portal</Link></li>
                        <li><Link to="/register/ngo">🏢 NGO Portal</Link></li>
                    </ul>
                </div>

                {/* Contact & Info */}
                <div className="footer-col">
                    <h4 className="footer-heading">Get in Touch</h4>
                    <ul className="footer-links footer-contact">
                        <li>📧 support@volunteerbridge.org</li>
                        <li>📞 +91 98765 43210</li>
                        <li>📍 New Delhi, India</li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© {year} VolunteerBridge. All rights reserved.</p>
                <div className="footer-bottom-links">
                    <a href="#">Privacy Policy</a>
                    <span className="footer-divider">·</span>
                    <a href="#">Terms of Service</a>
                    <span className="footer-divider">·</span>
                    <a href="#">Cookie Policy</a>
                </div>
            </div>
        </footer>
    );
}
