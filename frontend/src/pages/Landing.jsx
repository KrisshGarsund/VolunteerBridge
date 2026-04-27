/**
 * pages/Landing.jsx - Public Landing Page (Redesigned)
 *
 * Enhanced hero with animated gradient, 3 portal entry cards,
 * "How it Works" section, impact stats, testimonials, and CTA.
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Landing() {
    const { isLoggedIn, user } = useAuth();

    return (
        <div className="page animate-in">
            {/* Hero */}
            <section className="hero">
                <h1>Bridge the Gap Between<br />NGOs & Volunteers</h1>
                <p>
                    VolunteerBridge connects passionate volunteers with NGOs that need help.
                    Discover meaningful opportunities, make a real impact, and be part of a movement that changes lives.
                </p>
                {!isLoggedIn ? (
                    <div className="hero-buttons">
                        <Link to="/register/volunteer" className="btn btn-primary btn-lg">Get Started</Link>
                        <Link to="/login" className="btn btn-ghost btn-lg">Sign In</Link>
                    </div>
                ) : (
                    <Link to={`/${user?.role}`} className="btn btn-primary btn-lg">Go to Dashboard</Link>
                )}
            </section>

            {/* Impact Stats */}
            <section className="impact-stats">
                <div className="impact-stat animate-in stagger-1">
                    <div className="impact-value">500+</div>
                    <div className="impact-label">Volunteers Registered</div>
                </div>
                <div className="impact-stat animate-in stagger-2">
                    <div className="impact-value">120+</div>
                    <div className="impact-label">NGOs Onboarded</div>
                </div>
                <div className="impact-stat animate-in stagger-3">
                    <div className="impact-value">1,200+</div>
                    <div className="impact-label">Tasks Completed</div>
                </div>
                <div className="impact-stat animate-in stagger-4">
                    <div className="impact-value">50+</div>
                    <div className="impact-label">Cities Covered</div>
                </div>
            </section>

            {/* Portal Cards */}
            {!isLoggedIn && (
                <section className="portal-cards">
                    <Link to="/login" className="portal-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="portal-card-icon">⚡</div>
                        <h3 style={{ background: 'linear-gradient(135deg, #8B5CF6, #FF3D5A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Admin Portal
                        </h3>
                        <p>Platform command center. Manage users, verify NGOs, and view analytics across the entire platform.</p>
                        <span className="btn btn-outline btn-sm">Access Dashboard →</span>
                    </Link>

                    <Link to="/register/volunteer" className="portal-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="portal-card-icon">🌿</div>
                        <h3 style={{ background: 'linear-gradient(135deg, #06B6D4, #10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Volunteer Portal
                        </h3>
                        <p>Find opportunities, apply to help requests, and track your volunteer tasks in real-time.</p>
                        <span className="btn btn-outline btn-sm">Join Now →</span>
                    </Link>

                    <Link to="/register/ngo" className="portal-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="portal-card-icon">🏢</div>
                        <h3 style={{ background: 'linear-gradient(135deg, #6366F1, #F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            NGO Portal
                        </h3>
                        <p>Post help requests, review volunteer applicants, and manage your organisation's volunteer pipeline.</p>
                        <span className="btn btn-outline btn-sm">Register NGO →</span>
                    </Link>
                </section>
            )}

            {/* How It Works */}
            <section className="how-it-works" id="how-it-works">
                <div className="section-header">
                    <h2>How It Works</h2>
                    <p>Get started in three simple steps — whether you're a volunteer or an NGO.</p>
                </div>

                <div className="steps-grid">
                    <div className="step-card animate-in stagger-1">
                        <div className="step-number">01</div>
                        <div className="step-icon">📝</div>
                        <h3>Create an Account</h3>
                        <p>Sign up as a Volunteer to browse opportunities or as an NGO to post help requests. It takes less than a minute.</p>
                    </div>
                    <div className="step-card animate-in stagger-2">
                        <div className="step-number">02</div>
                        <div className="step-icon">🔍</div>
                        <h3>Discover & Connect</h3>
                        <p>Volunteers browse open requests filtered by skills and location. NGOs review applicant profiles and find the perfect match.</p>
                    </div>
                    <div className="step-card animate-in stagger-3">
                        <div className="step-number">03</div>
                        <div className="step-icon">🤝</div>
                        <h3>Make an Impact</h3>
                        <p>Once matched, volunteers and NGOs collaborate on tasks. Track progress, mark completions, and build your impact record.</p>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="features" id="features">
                <div className="feature-card">
                    <div className="feature-icon">🎯</div>
                    <h3>Skill-Based Matching</h3>
                    <p>Our platform matches volunteers to NGO requests based on skills, location, and availability — ensuring the right help reaches the right cause.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">🔒</div>
                    <h3>Verified NGOs</h3>
                    <p>Every NGO goes through an admin verification process, so volunteers can trust that they're contributing to legitimate organisations.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">📊</div>
                    <h3>Real-Time Analytics</h3>
                    <p>Admins get a bird's-eye view of platform health — user metrics, request pipelines, and completion rates — all in real-time.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">🏆</div>
                    <h3>Impact Tracking</h3>
                    <p>Volunteers can track tasks they've completed and build a verifiable record of social impact and community contributions.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">🌐</div>
                    <h3>Multi-Portal Design</h3>
                    <p>Three distinct portals — Admin, Volunteer, and NGO — each with its own tailored interface, features, and visual identity.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">⚡</div>
                    <h3>Urgency Levels</h3>
                    <p>NGOs can mark requests as low, medium, or high urgency — helping volunteers prioritize where help is needed most.</p>
                </div>
            </section>

            {/* Testimonials */}
            <section className="testimonials-section">
                <div className="section-header">
                    <h2>What People Say</h2>
                    <p>Hear from volunteers and NGOs who've used VolunteerBridge.</p>
                </div>
                <div className="testimonials-grid">
                    <div className="testimonial-card animate-in stagger-1">
                        <div className="testimonial-quote">"VolunteerBridge made it incredibly easy to find meaningful volunteer work that matched my skills. I've completed 15 tasks in 3 months!"</div>
                        <div className="testimonial-author">
                            <div className="testimonial-avatar">🙋</div>
                            <div>
                                <div className="testimonial-name">Priya Sharma</div>
                                <div className="testimonial-role">Volunteer · Teaching & Coding</div>
                            </div>
                        </div>
                    </div>
                    <div className="testimonial-card animate-in stagger-2">
                        <div className="testimonial-quote">"As an NGO, we struggled to find reliable volunteers. VolunteerBridge's verification system and matching saved us weeks of coordination."</div>
                        <div className="testimonial-author">
                            <div className="testimonial-avatar">🏢</div>
                            <div>
                                <div className="testimonial-name">Helping Hands Foundation</div>
                                <div className="testimonial-role">Verified NGO · Education</div>
                            </div>
                        </div>
                    </div>
                    <div className="testimonial-card animate-in stagger-3">
                        <div className="testimonial-quote">"The admin dashboard gives me complete visibility into platform activity. Managing users and verifying NGOs has never been smoother."</div>
                        <div className="testimonial-author">
                            <div className="testimonial-avatar">⚡</div>
                            <div>
                                <div className="testimonial-name">Rahul Verma</div>
                                <div className="testimonial-role">Platform Admin</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            {!isLoggedIn && (
                <section className="cta-section">
                    <div className="cta-card">
                        <h2>Ready to Make a Difference?</h2>
                        <p>Join thousands of volunteers and NGOs already using VolunteerBridge to create positive change in their communities.</p>
                        <div className="hero-buttons">
                            <Link to="/register/volunteer" className="btn btn-primary btn-lg">🌿 Join as Volunteer</Link>
                            <Link to="/register/ngo" className="btn btn-accent btn-lg">🏢 Register Your NGO</Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
