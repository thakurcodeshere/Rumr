import React, { useState } from 'react';
import { 
  Sparkles, 
  Shield, 
  Lock, 
  Unlock, 
  Flame, 
  MessageSquare, 
  Zap, 
  ArrowRight, 
  Check, 
  MapPin, 
  Award, 
  X, 
  Mail, 
  Phone, 
  FileText, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { BrutalistButton } from '../components/ui/BrutalistButton';
import { BrutalistBadge } from '../components/ui/BrutalistBadge';

interface LandingWebsiteViewProps {
  onLaunchApp?: () => void;
}

export const LandingWebsiteView: React.FC<LandingWebsiteViewProps> = ({ onLaunchApp }) => {
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | 'license' | null>(null);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[#080808] text-[#e5e5e5] font-sans selection:bg-[#ccff00] selection:text-black overflow-x-hidden">
      
      {/* 1. TOP ANNOUNCEMENT TICKER */}
      <div className="bg-[#ccff00] text-black font-mono text-xs font-black py-1.5 px-4 border-b-2 border-black">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="bg-black text-[#ccff00] px-1.5 py-0.5 text-[10px] uppercase font-bold">V2.4.0</span>
            <span className="tracking-wider">3-LAYER PROGRESSIVE UNMASKING & LIVE AUDIO DEBATES NOW LIVE</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[11px]">
            <span>⚡ 142,800+ TOPIC TUNNELS ACTIVE</span>
            <a href="#downloads" className="underline hover:text-white transition-colors">GET MOBILE APP →</a>
          </div>
        </div>
      </div>

      {/* 2. STICKY NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#0c0c0c]/95 backdrop-blur-md border-b-2 border-[#262626]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#ccff00] border-2 border-white flex items-center justify-center font-serif font-black text-black text-lg shadow-[3px_3px_0px_#a855f7]">
              R
            </div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-black text-white tracking-wider">RUMR</span>
              <span className="font-mono text-[9px] bg-[#a855f7] text-black font-extrabold px-1.5 py-0.5 uppercase tracking-wider">
                TOPIC-FIRST
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-6 font-mono text-xs font-bold tracking-wider text-gray-300">
            <a href="#philosophy" className="hover:text-[#ccff00] transition-colors">PHILOSOPHY</a>
            <a href="#features" className="hover:text-[#ccff00] transition-colors">FEATURES</a>
            <a href="#how-it-works" className="hover:text-[#ccff00] transition-colors">HOW IT WORKS</a>
            <a href="#metrics" className="hover:text-[#ccff00] transition-colors">TELEMETRY</a>
            <a href="#reviews" className="hover:text-[#ccff00] transition-colors">REVIEWS</a>
            <a href="#dispatch" className="hover:text-[#ccff00] transition-colors">DISPATCH</a>
            <a href="#contact" className="hover:text-[#ccff00] transition-colors">CONTACT</a>
          </nav>

          <div className="flex items-center gap-2.5">
            {onLaunchApp && (
              <button 
                onClick={onLaunchApp}
                className="hidden sm:inline-flex items-center gap-1.5 font-mono text-xs font-bold bg-[#141414] border border-[#333] hover:border-[#ccff00] text-gray-200 px-3 py-2 transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
                ENTER APP TUNNEL
              </button>
            )}

            {onLaunchApp ? (
              <button onClick={onLaunchApp} className="inline-flex items-center gap-1.5 font-mono text-xs font-black bg-[#ccff00] text-black border-2 border-black px-3.5 py-2 shadow-[3px_3px_0px_#a855f7] hover:translate-x-0.5 hover:translate-y-0.5 transition-transform uppercase">OPEN WEB APP ⚡</button>
            ) : (
              <a href="https://rumr-sigma.vercel.app/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-mono text-xs font-black bg-[#ccff00] text-black border-2 border-black px-3.5 py-2 shadow-[3px_3px_0px_#a855f7] hover:translate-x-0.5 hover:translate-y-0.5 transition-transform uppercase">OPEN WEB APP ⚡</a>
            )}
          </div>

        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section id="philosophy" className="relative pt-12 pb-20 md:pt-20 md:pb-28 border-b-2 border-[#262626] bg-gradient-to-b from-[#0e0e0e] via-[#080808] to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 bg-[#1b1526] border border-[#a855f7] px-3 py-1 font-mono text-xs text-[#ddb7ff] font-bold tracking-widest uppercase">
                <span className="text-[#ccff00]">⚡</span> ANTI-SUPERFICIAL SOCIAL MESH
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-black text-white leading-[1.05] uppercase tracking-tight">
                Don't swipe on people.<br />
                <span className="text-[#ccff00] underline decoration-[#a855f7] decoration-4">Swipe on topics.</span>
              </h1>

              <p className="font-sans text-base sm:text-lg text-gray-300 max-w-2xl leading-relaxed">
                Dating and networking apps force you to judge staged photos. Rumr matches you strictly based on intellectual friction, shared curiosities, and unhinged takes—with complete anonymity until mutual consent.
              </p>

              {/* Browser Web App Badges */}
              <div id="downloads" className="pt-2 flex flex-wrap items-center gap-3">
                
                {/* Launch Web App */}
                {onLaunchApp ? (
                  <button 
                    onClick={onLaunchApp}
                    className="flex items-center gap-3 bg-[#ccff00] text-black border-2 border-black px-5 py-3 shadow-[4px_4px_0px_#a855f7] hover:bg-white hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-mono text-left"
                  >
                    <Zap className="w-5 h-5 fill-black" />
                    <div>
                      <span className="block text-[9px] font-black uppercase tracking-wider text-black/80">NO APP STORE REQUIRED</span>
                      <span className="block text-sm font-black uppercase tracking-tight">LAUNCH INSTANT WEB APP ⚡</span>
                    </div>
                  </button>
                ) : (
                  <a 
                    href="https://rumr-sigma.vercel.app/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 bg-[#ccff00] text-black border-2 border-black px-5 py-3 shadow-[4px_4px_0px_#a855f7] hover:bg-white hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-mono text-left"
                  >
                    <Zap className="w-5 h-5 fill-black" />
                    <div>
                      <span className="block text-[9px] font-black uppercase tracking-wider text-black/80">NO APP STORE REQUIRED</span>
                      <span className="block text-sm font-black uppercase tracking-tight">LAUNCH INSTANT WEB APP ⚡</span>
                    </div>
                  </a>
                )}

                {/* Mobile & Tablet Geolocation Badge */}
                <button 
                  onClick={() => alert('When accessing Rumr on mobile/tablet browsers (Safari/Chrome), tap Allow Location to activate city-level topic radar.')}
                  className="flex items-center gap-3 bg-[#141414] border-2 border-[#333] hover:border-[#ccff00] px-4 py-3 shadow-[4px_4px_0px_#ccff00] hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-mono text-left"
                >
                  <MapPin className="w-5 h-5 text-[#ccff00]" />
                  <div>
                    <span className="block text-[9px] text-gray-400 uppercase tracking-wider">MOBILE & TABLET BROWSER</span>
                    <span className="block text-xs font-bold text-white uppercase tracking-tight">📍 NATIVE GEOLOCATION RADAR</span>
                  </div>
                </button>

                {/* PWA Add to Home Screen */}
                <button 
                  onClick={() => alert('To install Rumr on Mobile/Tablet: Open in Safari/Chrome, tap Share/Menu, and select Add to Home Screen.')}
                  className="flex items-center gap-2 bg-[#181818] border border-[#333] hover:border-white text-gray-300 hover:text-white px-4 py-3 font-mono text-xs font-bold uppercase transition-colors"
                >
                  <span>📲 ADD TO HOME SCREEN (PWA)</span>
                </button>

              </div>

              <div className="flex items-center gap-3 pt-2 font-mono text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full bg-[#ccff00]" />
                <span>HARD CONSTRAINT: <strong className="text-white">Topics must be ≤ 3 words</strong></span>
                <span>•</span>
                <span className="text-[#ddb7ff]">Email & Location Verified</span>
              </div>

            </div>

            {/* Right Card Mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm bg-[#121212] border-4 border-[#262626] p-4 shadow-[8px_8px_0px_#a855f7] space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-[#222] pb-2 font-mono text-xs">
                  <span className="text-[#ccff00] font-bold">TOPIC DECK // GURGAON_NCR</span>
                  <span className="text-gray-400">#04 OF 20</span>
                </div>

                <div className="bg-[#181524] border-2 border-[#a855f7] p-5 space-y-4 shadow-[4px_4px_0px_#a855f7]">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] bg-black text-[#ccff00] px-2 py-0.5 border border-[#ccff00] font-bold">
                      88% RESONANCE
                    </span>
                    <span className="font-mono text-xs text-gray-400">2m ago</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="font-mono text-[10px] text-gray-400 uppercase">DEBATING TOPIC (≤ 3 WORDS):</div>
                    <h3 className="font-serif text-2xl font-black text-white">
                      "AI LAYOFFS REALITY"
                    </h3>
                  </div>

                  <p className="font-sans text-xs text-gray-300 leading-relaxed bg-black/50 p-3 border border-[#333]">
                    "Most people blaming AI for headcount cuts are ignoring margin compressions in cloud infra."
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#333] font-mono text-[10px] text-gray-400">
                    <span>🔒 IDENTITY: ENCRYPTED</span>
                    <span className="text-[#ccff00] font-bold">4 OVERLAPPING TOPICS</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button onClick={() => alert('Swipe Left registered in demo')} className="bg-[#1e1e1e] border-2 border-[#333] hover:border-red-500 text-gray-300 font-mono text-xs py-2.5 font-bold uppercase transition-all">
                    ✕ SKIP TOPIC
                  </button>
                  <button onClick={() => alert('Mutual Match Confirmed! Opening encrypted 1-on-1 tunnel.')} className="bg-[#ccff00] border-2 border-black text-black font-mono text-xs py-2.5 font-black uppercase shadow-[3px_3px_0px_#a855f7] transition-all">
                    ⚡ DISCUSS (LIKE)
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. LIVE NUMBERS & TELEMETRY */}
      <section id="metrics" className="bg-[#111111] border-b-2 border-[#262626] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 space-y-1">
            <span className="font-mono text-xs text-[#ccff00] uppercase font-bold tracking-widest">REAL-TIME PLATFORM TELEMETRY</span>
            <h2 className="font-serif text-3xl font-black text-white uppercase">Rumr By The Numbers</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-[#141414] border-2 border-[#262626] p-4 text-center space-y-1 shadow-[4px_4px_0px_#a855f7]">
              <div className="font-serif text-3xl md:text-4xl font-black text-white">142.8K</div>
              <div className="font-mono text-[10px] text-[#ccff00] uppercase font-bold">Active Topic Tunnels</div>
            </div>

            <div className="bg-[#141414] border-2 border-[#262626] p-4 text-center space-y-1 shadow-[4px_4px_0px_#ccff00]">
              <div className="font-serif text-3xl md:text-4xl font-black text-white">94.2%</div>
              <div className="font-mono text-[10px] text-[#a855f7] uppercase font-bold">Resonance Match Rate</div>
            </div>

            <div className="bg-[#141414] border-2 border-[#262626] p-4 text-center space-y-1 shadow-[4px_4px_0px_#fff]">
              <div className="font-serif text-3xl md:text-4xl font-black text-white">≤ 3</div>
              <div className="font-mono text-[10px] text-gray-300 uppercase font-bold">Words Per Topic Node</div>
            </div>

            <div className="bg-[#141414] border-2 border-[#262626] p-4 text-center space-y-1 shadow-[4px_4px_0px_#a855f7]">
              <div className="font-serif text-3xl md:text-4xl font-black text-white">0</div>
              <div className="font-mono text-[10px] text-red-400 uppercase font-bold">Facial Swipes Allowed</div>
            </div>

            <div className="col-span-2 md:col-span-1 bg-[#141414] border-2 border-[#262626] p-4 text-center space-y-1 shadow-[4px_4px_0px_#ccff00]">
              <div className="font-serif text-3xl md:text-4xl font-black text-white">100%</div>
              <div className="font-mono text-[10px] text-[#ccff00] uppercase font-bold">SHA-256 DPDP Privacy</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTRODUCED CORE FEATURES */}
      <section id="features" className="py-20 border-b-2 border-[#262626] bg-[#0c0c0c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div className="text-left max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-[#1a1726] border border-[#a855f7] px-2.5 py-0.5 font-mono text-[10px] text-[#ddb7ff] font-bold uppercase">
              ENGINEERING SPECIFICATIONS
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
              How Rumr Solves The Social Dilemma
            </h2>
            <p className="font-sans text-sm text-gray-400">
              Built from the ground up to eliminate algorithm fatigue, staged profile photos, and superficial algorithmic matching.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            

          </div>

        </div>
      </section>

      {/* 6. REVIEWS (PEOPLE OF RUMR) */}
      <section id="reviews" className="py-20 border-b-2 border-[#262626] bg-[#0e0e0e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="font-mono text-xs text-[#ccff00] uppercase font-bold tracking-widest">VERIFIED USER DISPATCH</span>
              <h2 className="font-serif text-3xl sm:text-5xl font-black text-white uppercase">People of Rumr</h2>
            </div>
            <div className="font-mono text-xs text-gray-400">
              ★ 4.9/5 RATING ACROSS 18,000+ ENCRYPTED SESSIONS
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-[#141414] border-2 border-[#262626] p-6 space-y-4 shadow-[4px_4px_0px_#a855f7] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-[#ccff00] font-mono text-xs">★★★★★</div>
                <p className="font-serif italic text-base text-gray-200 leading-relaxed">
                  "On Rumr, we argued about Kubernetes cost-scaling for 15 minutes before realizing we worked two blocks away. Real connection without staged photos."
                </p>
              </div>
              <div className="pt-3 border-t border-[#262626] font-mono text-xs">
                <strong className="text-white block">Aditya S.</strong>
                <span className="text-gray-500 text-[10px]">Staff Cloud Architect • Gurgaon</span>
              </div>
            </div>

            <div className="bg-[#141414] border-2 border-[#262626] p-6 space-y-4 shadow-[4px_4px_0px_#ccff00] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-[#ccff00] font-mono text-xs">★★★★★</div>
                <p className="font-serif italic text-base text-gray-200 leading-relaxed">
                  "The 3-word rule is genius. It completely kills creepy DMs and forces people to articulate actual intellectual viewpoints."
                </p>
              </div>
              <div className="pt-3 border-t border-[#262626] font-mono text-xs">
                <strong className="text-white block">Elena Rostova</strong>
                <span className="text-gray-500 text-[10px]">AI Safety Researcher • San Francisco</span>
              </div>
            </div>

            <div className="bg-[#141414] border-2 border-[#262626] p-6 space-y-4 shadow-[4px_4px_0px_#fff] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-[#ccff00] font-mono text-xs">★★★★★</div>
                <p className="font-serif italic text-base text-gray-200 leading-relaxed">
                  "I met my co-founder on Rumr after we both swiped right on the topic node 'Stealth AI Agents'. Zero awkward networking—pure intellectual friction."
                </p>
              </div>
              <div className="pt-3 border-t border-[#262626] font-mono text-xs">
                <strong className="text-white block">Karan M.</strong>
                <span className="text-gray-500 text-[10px]">Founder @ KernelMesh • Bengaluru</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. CONTACT US FORM */}
      <section id="contact" className="py-20 border-b-2 border-[#262626] bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-5 space-y-6">
              <span className="font-mono text-xs text-[#ccff00] uppercase font-bold tracking-widest">DIRECT COMM CHANNEL</span>
              <h2 className="font-serif text-3xl sm:text-5xl font-black text-white uppercase">Contact Rumr</h2>
              <p className="font-sans text-sm text-gray-300 leading-relaxed">
                Have questions regarding our cryptographic protocols, university partnerships, or vulnerability disclosures? Reach out directly.
              </p>

              <div className="space-y-4 font-mono text-xs">
                <div className="bg-[#121212] border border-[#262626] p-3 space-y-1">
                  <span className="text-gray-500 text-[10px] block uppercase">SECURITY & PGP DISCLOSURES:</span>
                  <strong className="text-[#ccff00]">security@rumr.network</strong>
                </div>

                <div className="bg-[#121212] border border-[#262626] p-3 space-y-1">
                  <span className="text-gray-500 text-[10px] block uppercase">GENERAL INQUIRIES:</span>
                  <strong className="text-white">intel@rumr.network</strong>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#121212] border-4 border-[#262626] p-6 sm:p-8 shadow-[8px_8px_0px_#a855f7]">
              {contactSubmitted ? (
                <div className="p-8 text-center space-y-3 font-mono">
                  <div className="w-12 h-12 bg-[#131d0e] border border-[#ccff00] text-[#ccff00] mx-auto flex items-center justify-center">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-2xl font-black text-white">TRANSMISSION SECURED</h3>
                  <p className="text-xs text-gray-400">Your message has been encrypted and routed to Rumr Security Operations.</p>
                  <button onClick={() => setContactSubmitted(false)} className="text-xs text-[#ccff00] underline font-bold">Transmit another message</button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setContactSubmitted(true); }} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 font-mono text-xs">
                      <label className="text-gray-400 block uppercase font-bold">Your Name / Alias</label>
                      <input type="text" required placeholder="e.g. Alex Cipher" className="w-full bg-[#080808] border-2 border-[#333] focus:border-[#ccff00] p-3 text-white outline-none font-mono text-xs" />
                    </div>

                    <div className="space-y-1.5 font-mono text-xs">
                      <label className="text-gray-400 block uppercase font-bold">Email or Handle</label>
                      <input type="email" required placeholder="name@domain.com" className="w-full bg-[#080808] border-2 border-[#333] focus:border-[#ccff00] p-3 text-white outline-none font-mono text-xs" />
                    </div>
                  </div>

                  <div className="space-y-1.5 font-mono text-xs">
                    <label className="text-gray-400 block uppercase font-bold">Subject / Inquiry Type</label>
                    <select className="w-full bg-[#080808] border-2 border-[#333] focus:border-[#ccff00] p-3 text-white outline-none font-mono text-xs">
                      <option>General Feedback / Feature Request</option>
                      <option>Security / Vulnerability Disclosure (PGP)</option>
                      <option>Press / Media & Research Query</option>
                      <option>Partnership & University Topic Guilds</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 font-mono text-xs">
                    <label className="text-gray-400 block uppercase font-bold">Message Content</label>
                    <textarea rows={4} required placeholder="Transmit your encrypted transmission..." className="w-full bg-[#080808] border-2 border-[#333] focus:border-[#ccff00] p-3 text-white outline-none font-mono text-xs resize-none" />
                  </div>

                  <button type="submit" className="w-full bg-[#ccff00] text-black font-mono text-xs font-black p-3.5 border-2 border-black shadow-[4px_4px_0px_#a855f7] hover:bg-white transition-colors uppercase tracking-wider">
                    ⚡ TRANSMIT ENCRYPTED MESSAGE
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 8. LEGAL & FOOTER */}
      <footer className="bg-black text-gray-400 py-16 border-t-2 border-[#262626]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-[#ccff00] border-2 border-white flex items-center justify-center font-serif font-black text-black text-base">
                  R
                </div>
                <span className="font-serif text-2xl font-black text-white tracking-wider">RUMR</span>
                <span className="font-mono text-[9px] bg-[#a855f7] text-black font-bold px-1.5 py-0.5 uppercase">
                  TOPIC-FIRST
                </span>
              </div>
              <p className="font-sans text-xs text-gray-400 max-w-sm leading-relaxed">
                The topic-first social mesh designed to eliminate algorithm fatigue and superficial dating swipes. Match on ideas, debate on chaos, unmask with mutual consent.
              </p>
              <div className="font-mono text-[10px] text-[#ccff00]">
                LONDON • GURGAON • SAN FRANCISCO • BENGALURU
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <h4 className="text-white font-bold uppercase tracking-wider">PLATFORM</h4>
              <ul className="space-y-2">
                <li><a href="#philosophy" className="hover:text-[#ccff00]">Core Philosophy</a></li>
                <li><a href="#features" className="hover:text-[#ccff00]">Features & AI Guard</a></li>
                <li><a href="#how-it-works" className="hover:text-[#ccff00]">How It Works</a></li>
                <li><a href="#metrics" className="hover:text-[#ccff00]">Live Telemetry</a></li>
              </ul>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <h4 className="text-white font-bold uppercase tracking-wider">SOCIAL CHANNELS</h4>
              <div className="flex flex-wrap gap-2.5 pt-1">
                <a href="https://x.com" target="_blank" rel="noreferrer" className="w-9 h-9 bg-[#141414] border border-[#333] hover:border-[#ccff00] flex items-center justify-center text-white hover:text-[#ccff00] transition-colors" title="X (Twitter)">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://github.com/thakurcodeshere/Rumr" target="_blank" rel="noreferrer" className="w-9 h-9 bg-[#141414] border border-[#333] hover:border-[#ccff00] flex items-center justify-center text-white hover:text-[#ccff00] transition-colors" title="GitHub">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                </a>
              </div>
            </div>
          </div>

          {/* Legal & Regulatory Framework Bar (At Bottom of Landing Page) */}
          <div className="pt-8 border-t-2 border-[#262626] flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs text-gray-400">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[#ccff00] font-bold uppercase">LEGAL & REGULATORY FRAMEWORK:</span>
              <span className="text-gray-300">Digital Personal Data Protection (DPDP) & IT Act Compliant</span>
            </div>

            <div className="flex items-center gap-3 text-gray-300">
              <button onClick={() => setActiveModal('terms')} className="hover:text-[#ccff00] underline">Terms & Conditions</button>
              <span>•</span>
              <button onClick={() => setActiveModal('privacy')} className="hover:text-[#ccff00] underline">Privacy Policy (DPDP)</button>
              <span>•</span>
              <button onClick={() => setActiveModal('license')} className="hover:text-[#ccff00] underline">Software Licenses</button>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1a1a1a] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-gray-500">
            <div>© 2026 Rumr Cryptographic Systems, Inc. All rights reserved.</div>
            <div className="flex items-center gap-4">
              {onLaunchApp && (
                <button onClick={onLaunchApp} className="text-[#ccff00] font-bold hover:underline">⚡ ENTER APP TUNNEL</button>
              )}
            </div>
          </div>

        </div>
      </footer>

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border-4 border-[#ccff00] max-w-lg w-full max-h-[80vh] flex flex-col p-6 shadow-[8px_8px_0px_#a855f7] space-y-4">
            <div className="flex justify-between items-center border-b border-[#333] pb-2">
              <h3 className="font-serif text-xl font-black text-white uppercase">
                {activeModal === 'terms' && 'TERMS & CONDITIONS'}
                {activeModal === 'privacy' && 'PRIVACY POLICY (DPDP)'}
                {activeModal === 'license' && 'OPEN SOURCE LICENSES'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white font-mono text-lg">✕</button>
            </div>
            <div className="overflow-y-auto space-y-3 font-sans text-xs text-gray-300 pr-2">
              {activeModal === 'terms' && (
                <>
                  <p><strong>1. Acceptance:</strong> By accessing Rumr, you agree to comply with our Topic-First protocol rules. Stalking, targeted defamation, and commercial bot spam are strictly prohibited.</p>
                  <p><strong>2. The ≤ 3-Word Hard Constraint:</strong> All created topic cards must strictly adhere to 3 words or fewer. Posts exceeding this constraint or containing personally identifiable information (PII) are rejected at the vector boundary.</p>
                  <p><strong>3. Mutual Unmasking:</strong> Both users must independently authorize identity layer unlocks.</p>
                </>
              )}
              {activeModal === 'privacy' && (
                <>
                  <p><strong>1. Zero-Knowledge Discovery:</strong> Your browsing telemetry and skipped topics are never stored on persistent storage with user-identifiable keys.</p>
                  <p><strong>2. Ephemeral Chat Expiry:</strong> 1-on-1 topic debate messages expire after 5 minutes.</p>
                  <p><strong>3. DPDP Compliance:</strong> Compliant with Digital Personal Data Protection Act 2023.</p>
                </>
              )}
              {activeModal === 'license' && (
                <p className="font-mono">MIT License • Copyright (c) 2026 Rumr Systems</p>
              )}
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full bg-[#ccff00] text-black font-mono text-xs font-bold py-2 uppercase">CLOSE</button>
          </div>
        </div>
      )}

    </div>
  );
};
