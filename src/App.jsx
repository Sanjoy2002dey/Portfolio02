import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Github, Linkedin, Mail, ExternalLink, Code2, Database,
  Server, Terminal, Youtube, MessageSquare, Brain, Monitor,
  Heart, Trophy, Award, ChevronRight, Calendar, MapPin, Zap, Star, Menu, X, Gamepad2, PawPrint
} from 'lucide-react';

/* ── detect mobile once ── */
const isMobile = () => window.innerWidth < 768;

/* ─────────────── TYPEWRITER ─────────────── */
const Typewriter = ({ words }) => {
  const [current, setCurrent] = useState('');
  const [wi, setWi] = useState(0);
  const [del, setDel] = useState(false);
  const [ci, setCi] = useState(0);
  useEffect(() => {
    const w = words[wi];
    const t = setTimeout(() => {
      if (!del) {
        if (ci < w.length) { setCurrent(w.slice(0, ci + 1)); setCi(ci + 1); }
        else setTimeout(() => setDel(true), 1800);
      } else {
        if (ci > 0) { setCurrent(w.slice(0, ci - 1)); setCi(ci - 1); }
        else { setDel(false); setWi((wi + 1) % words.length); }
      }
    }, del ? 45 : 130);
    return () => clearTimeout(t);
  }, [ci, del, wi, words]);
  return (
    <span style={{ background: 'linear-gradient(135deg,#00f5ff,#7b2ff7,#ff006e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
      {current}<span style={{ WebkitTextFillColor: '#00f5ff', animation: 'blink 1s infinite' }}>|</span>
    </span>
  );
};

/* ─────────────── PARTICLE CANVAS (optimised) ─────────────── */
const ParticleField = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId, lastTime = 0;
    /* fewer particles on small screens */
    const N = isMobile() ? 40 : 80;
    const LINK = isMobile() ? 80 : 110;
    const FPS = isMobile() ? 30 : 60;
    const interval = 1000 / FPS;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.4 + 0.4,
      color: ['#00f5ff', '#7b2ff7', '#ff006e', '#00ff88'][Math.floor(Math.random() * 4)],
      alpha: Math.random() * 0.5 + 0.2,
    }));

    const draw = (ts) => {
      animId = requestAnimationFrame(draw);
      if (ts - lastTime < interval) return;
      lastTime = ts;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();
      });
      /* skip line drawing on mobile for perf */
      if (!isMobile()) {
        for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,245,255,${0.07 * (1 - d / LINK)})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }
    };
    requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
};

/* ─────────────── FLOATING ORBS ─────────────── */
const FloatingOrbs = () => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
    {[
      { size: 500, top: '-8%', left: '-12%', color: '#7b2ff720', dur: '22s' },
      { size: 400, bottom: '-8%', right: '-8%', color: '#00f5ff18', dur: '28s' },
      { size: 280, top: '40%', right: '4%', color: '#ff006e12', dur: '19s' },
    ].map((o, i) => (
      <div key={i} style={{
        position: 'absolute', width: o.size, height: o.size,
        top: o.top, left: o.left, bottom: o.bottom, right: o.right,
        borderRadius: '50%',
        background: `radial-gradient(circle,${o.color},transparent 70%)`,
        filter: 'blur(50px)',
        animation: `floatOrb${i} ${o.dur} ease-in-out infinite alternate`,
        willChange: 'transform',
      }} />
    ))}
  </div>
);

/* ─────────────── 3D TILT (disabled on touch) ─────────────── */
const TiltCard = ({ children, className = '', glowColor = '#00f5ff', style: extraStyle = {} }) => {
  const ref = useRef(null);
  const rotRef = useRef({ x: 0, y: 0 });
  const hovRef = useRef(false);
  const rafRef = useRef(null);

  const applyTransform = useCallback(() => {
    if (!ref.current) return;
    const { x, y } = rotRef.current;
    const h = hovRef.current;
    ref.current.style.transform =
      `perspective(900px) rotateX(${x}deg) rotateY(${y}deg) scale3d(${h ? 1.025 : 1},${h ? 1.025 : 1},1)`;
    ref.current.style.filter = h ? `drop-shadow(0 0 18px ${glowColor}35)` : 'none';
  }, [glowColor]);

  const onMove = useCallback((e) => {
    if (!ref.current || isMobile()) return;
    const r = ref.current.getBoundingClientRect();
    rotRef.current = {
      x: ((e.clientY - r.top) / r.height - 0.5) * -12,
      y: ((e.clientX - r.left) / r.width - 0.5) * 12,
    };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(applyTransform);
  }, [applyTransform]);

  const onLeave = useCallback(() => {
    hovRef.current = false;
    rotRef.current = { x: 0, y: 0 };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(applyTransform);
  }, [applyTransform]);

  const onEnter = useCallback(() => { hovRef.current = true; }, []);

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={className}
      style={{
        transition: 'transform 0.35s cubic-bezier(0.23,1,0.32,1), filter 0.35s ease',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        ...extraStyle,
      }}
    >
      {children}
    </div>
  );
};

/* ─────────────── SKILL CARD ─────────────── */
const SkillCard = ({ title, icon: Icon, skills, glowColor }) => (
  <TiltCard glowColor={glowColor} style={{ height: '100%' }}>
    <div style={{
      background: 'linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))',
      backdropFilter: 'blur(16px)', border: `1px solid ${glowColor}28`,
      borderRadius: 18, padding: '24px 20px', height: '100%', position: 'relative', overflow: 'hidden',
      boxShadow: `inset 0 1px 0 ${glowColor}18, 0 16px 50px rgba(0,0,0,0.35)`,
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${glowColor}50,transparent)` }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={{ padding: 9, borderRadius: 10, background: `${glowColor}14`, border: `1px solid ${glowColor}28`, color: glowColor, display: 'flex' }}>
          <Icon size={20} />
        </div>
        <h3 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 12, letterSpacing: 2, color: glowColor, textTransform: 'uppercase' }}>{title}</h3>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {skills.map((s, i) => (
          <span key={i} style={{
            fontSize: 12, padding: '5px 11px', borderRadius: 7,
            background: `${glowColor}08`, border: `1px solid ${glowColor}22`,
            color: '#b0bec5', fontFamily: "'Space Mono',monospace",
          }}>{s}</span>
        ))}
      </div>
    </div>
  </TiltCard>
);

/* ─────────────── PROJECT CARD ─────────────── */
const gcMap = { Youtube: '#ff006e', Brain: '#7b2ff7', MessageSquare: '#00ff88', Monitor: '#00f5ff', Gamepad2: '#ffcc00', PawPrint: '#ff6b9d' };
const ProjectCard = ({ project }) => {
  const gc = gcMap[project.icon.displayName || project.icon.name] || '#00f5ff';
  return (
    <TiltCard glowColor={gc} className={project.featured ? 'feat-card' : ''}>
      <div style={{
        background: 'linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.015))',
        backdropFilter: 'blur(16px)', border: `1px solid ${gc}22`,
        borderRadius: 18, overflow: 'hidden', position: 'relative',
        boxShadow: `0 20px 60px rgba(0,0,0,0.45), inset 0 1px 0 ${gc}18`,
        height: '100%',
      }}>
        <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${gc},transparent)` }} />
        <div style={{ padding: '28px 24px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div style={{ padding: 13, borderRadius: 14, background: `${gc}10`, border: `1px solid ${gc}28`, color: gc, boxShadow: `0 0 24px ${gc}18` }}>
              <project.icon size={24} />
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {project.live && (
                <a href={project.live} target="_blank" rel="noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10,
                    padding: '4px 10px', borderRadius: 6, background: `${gc}15`,
                    border: `1px solid ${gc}35`, color: gc, textDecoration: 'none',
                    fontFamily: "'Space Mono',monospace", letterSpacing: 1,
                    transition: 'all 0.2s', whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${gc}25`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${gc}15`; }}>
                  LIVE ↗
                </a>
              )}
              <a href={project.link} target="_blank" rel="noreferrer"
                style={{ color: '#6b7a8d', transition: 'color 0.2s', display: 'flex' }}
                onMouseEnter={e => e.currentTarget.style.color = gc}
                onMouseLeave={e => e.currentTarget.style.color = '#6b7a8d'}>
                <ExternalLink size={18} />
              </a>
            </div>
          </div>
          <h3 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 'clamp(14px,2vw,18px)', fontWeight: 700, color: '#fff', marginBottom: 10, letterSpacing: 0.5 }}>{project.title}</h3>
          <p style={{ color: '#8899aa', fontSize: 13, lineHeight: 1.8, marginBottom: 18 }}>{project.desc}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {project.tech.map((t, i) => (
              <span key={i} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 6, background: `${gc}0d`, border: `1px solid ${gc}28`, color: gc, fontFamily: "'Space Mono',monospace", letterSpacing: 0.5 }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </TiltCard>
  );
};

/* ─────────────── ACHIEVEMENT ITEM ─────────────── */
const AchItem = ({ title, subtitle, date, link, icon: Icon, glow }) => (
  <a href={link} target="_blank" rel="noreferrer" style={{ display: 'block', textDecoration: 'none' }}>
    <TiltCard glowColor={glow}>
      <div style={{
        display: 'flex', gap: 14, padding: '18px 20px',
        background: 'linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))',
        backdropFilter: 'blur(16px)', border: `1px solid ${glow}22`,
        borderRadius: 14, position: 'relative', overflow: 'hidden',
        boxShadow: `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 ${glow}12`,
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${glow}45,transparent)` }} />
        <div style={{ padding: 11, borderRadius: 11, background: `${glow}10`, border: `1px solid ${glow}28`, color: glow, flexShrink: 0, height: 'fit-content', boxShadow: `0 0 16px ${glow}18` }}>
          <Icon size={18} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ color: '#fff', fontFamily: "'Orbitron',sans-serif", fontSize: 12, fontWeight: 600, marginBottom: 5, letterSpacing: 0.5 }}>{title}</h4>
          <p style={{ color: '#7a8b9a', fontSize: 12, lineHeight: 1.7, marginBottom: 6 }}>{subtitle}</p>
          {date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: glow, fontSize: 10, fontFamily: "'Space Mono',monospace" }}>
              <Calendar size={10} />{date}
            </div>
          )}
        </div>
        <ChevronRight size={15} style={{ color: glow, flexShrink: 0, marginTop: 4 }} />
      </div>
    </TiltCard>
  </a>
);

/* ─────────────── STAT BOX ─────────────── */
const StatBox = ({ value, label, glow }) => (
  <TiltCard glowColor={glow}>
    <div style={{
      padding: '18px 12px', borderRadius: 14, textAlign: 'center',
      background: 'linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.015))',
      backdropFilter: 'blur(16px)', border: `1px solid ${glow}28`,
      boxShadow: `0 0 24px ${glow}12, inset 0 1px 0 ${glow}18`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 0%,${glow}0d,transparent 70%)` }} />
      <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 'clamp(20px,4vw,28px)', fontWeight: 900, color: glow, marginBottom: 4, textShadow: `0 0 16px ${glow}` }}>{value}</div>
      <div style={{ fontSize: 10, color: '#7a8b9a', letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'Space Mono',monospace" }}>{label}</div>
    </div>
  </TiltCard>
);

/* ─────────────── SECTION HEAD ─────────────── */
const SectionHead = ({ badge, h1, h2, sub }) => (
  <div style={{ textAlign: 'center', marginBottom: 56 }}>
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 14, padding: '5px 14px', borderRadius: 100, background: 'rgba(0,245,255,0.07)', border: '1px solid rgba(0,245,255,0.18)' }}>
      <Zap size={11} color="#00f5ff" />
      <span style={{ fontSize: 10, color: '#00f5ff', fontFamily: "'Space Mono',monospace", letterSpacing: 3, textTransform: 'uppercase' }}>{badge}</span>
    </div>
    <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 'clamp(24px,5vw,46px)', fontWeight: 900, color: '#fff', marginBottom: 10, lineHeight: 1.2 }}>
      <span style={{ background: 'linear-gradient(135deg,#00f5ff,#7b2ff7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{h1}</span>
      {h2 && <span> {h2}</span>}
    </h2>
    {sub && <p style={{ color: '#6b7a8d', fontSize: 15, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>{sub}</p>}
  </div>
);

/* ═══════════════ MAIN APP ═══════════════ */
export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('about');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 55);
      const sections = ['about', 'skills', 'projects', 'achievements'];
      const scrollPos = window.scrollY + window.innerHeight / 3;
      let current = 'about';
      sections.forEach(s => {
        const el = document.getElementById(s);
        if (el && scrollPos >= el.offsetTop) current = s;
      });
      setActiveNav(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on mount
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'achievements', label: 'Achievements' },
  ];

  const projects = [
    { title: "Sanjoy_Tube", desc: "Full-stack MERN video streaming platform with robust authentication, video management, and cloud integration for scalable media delivery.", tech: ["MERN Stack", "Redux", "Cloudinary", "JWT"], link: "https://github.com/Sanjoy2002dey/Sanjoy_Tube", icon: Youtube, featured: true },
    { title: "Paws Lover", desc: "Modern pet adoption platform where users can browse pets with details like breed, age, temperament, health and adoption fees. Beautifully designed responsive UI.", tech: ["React", "Tailwind CSS", "Vite", "Vercel"], link: "https://github.com/Sanjoy2002dey/pawsLover", live: "https://paws-lover.vercel.app/", icon: PawPrint, featured: false },
    { title: "Sanjoy Arcade", desc: "Lightning-fast React game hub featuring multiple mini-games including Rock-Paper-Scissors and Snake. Premium UI with smooth animations and modular game components.", tech: ["React", "Vite", "Tailwind CSS", "Vercel"], link: "https://github.com/Sanjoy2002dey/Sanjoy-Arcade", live: "https://sanjoy-arcade.vercel.app/", icon: Gamepad2, featured: false },
    { title: "Gemini Clone", desc: "AI-powered conversational interface replicating Google's Gemini experience with optimized performance and modern React architecture.", tech: ["React.js", "Gemini API", "Vite"], link: "https://github.com/Sanjoy2002dey/Gemini-Clone", icon: Brain, featured: false },
    { title: "Real-Time Chat App", desc: "Enterprise-grade Java chat system with multi-client support, socket programming, and intuitive Swing-based user interface.", tech: ["Java", "Socket.io", "Java Swing"], link: "https://github.com/Sanjoy2002dey/Java-Project", icon: MessageSquare, featured: false },
    { title: "Dynamic Quiz Platform", desc: "Interactive web-based quiz application featuring real-time scoring, dynamic question rendering, and responsive design patterns.", tech: ["JavaScript", "HTML5", "CSS3"], link: "https://github.com/Sanjoy2002dey/Quiz-App", icon: Monitor, featured: false },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        html { scroll-behavior:smooth; }
        body { background:#050a14; overflow-x:hidden; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-track { background:#050a14; }
        ::-webkit-scrollbar-thumb { background:linear-gradient(180deg,#00f5ff,#7b2ff7); border-radius:4px; }

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes floatOrb0 { from{transform:translate(0,0)} to{transform:translate(50px,35px)} }
        @keyframes floatOrb1 { from{transform:translate(0,0)} to{transform:translate(-40px,25px)} }
        @keyframes floatOrb2 { from{transform:translate(0,0)} to{transform:translate(25px,-40px)} }
        @keyframes floatBadge { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes ping { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(2.2);opacity:0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideRight { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes menuSlide { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }

        .hero-txt { animation: fadeUp 0.9s ease 0.1s both; }
        .hero-img { animation: slideRight 0.9s ease 0.3s both; }
        .nav-ul a { position:relative; }
        .nav-ul a::after { content:''; position:absolute; bottom:-4px; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,#00f5ff,transparent); transform:scaleX(0); transition:transform 0.3s; }
        .nav-ul a.active::after, .nav-ul a:hover::after { transform:scaleX(1); }

        /* responsive grid helpers */
        .skills-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
        .projects-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:20px; }
        .ach-grid { display:grid; grid-template-columns:1fr 1fr; gap:28px; }
        .stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; max-width:440px; }
        .hero-wrap { display:flex; align-items:center; gap:64px; min-height:100vh; padding-top:90px; }
        .feat-card { grid-column: span 2; }

        /* ── Tablet ≤ 1024px ── */
        @media(max-width:1024px){
          .skills-grid { grid-template-columns:repeat(2,1fr); }
          .hero-wrap { gap:40px; }
          .hero-img-box { max-width:340px !important; }
        }
        /* ── Mobile ≤ 768px ── */
        @media(max-width:768px){
          .hero-wrap { flex-direction:column; padding-top:100px; gap:32px; min-height:auto; padding-bottom:40px; }
          .hero-txt { order:2; text-align:center; }
          .hero-img { order:1; }
          .hero-img-box { max-width:280px !important; }
          .hero-btns { justify-content:center !important; }
          .stats-grid { max-width:100% !important; grid-template-columns:repeat(3,1fr); }
          .skills-grid { grid-template-columns:1fr 1fr; gap:14px; }
          .projects-grid { grid-template-columns:1fr; }
          .feat-card { grid-column:span 1; }
          .ach-grid { grid-template-columns:1fr; gap:20px; }
          .section-pad { padding:60px 0 !important; }
          .nav-desktop { display:none !important; }
          .nav-mobile-btn { display:flex !important; }
        }
        /* ── Small Mobile ≤ 480px ── */
        @media(max-width:480px){
          .skills-grid { grid-template-columns:1fr; }
          .stats-grid { grid-template-columns:repeat(3,1fr); gap:10px; }
          .hero-img-box { max-width:240px !important; }
        }

        .nav-mobile-btn { display:none; }
        .mobile-menu { display:none; }
        @media(max-width:768px){
          .mobile-menu { display:block; animation:menuSlide 0.25s ease both; }
        }

        .btn-glow:hover { transform:translateY(-2px); }
        .social-btn:hover { transform:translateY(-2px); }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#050a14', color: '#fff', fontFamily: "'Syne',sans-serif", overflowX: 'hidden' }}>

        <ParticleField />
        <FloatingOrbs />

        {/* perspective grid floor — hidden on mobile */}
        <div className="grid-floor" style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, height: '30vh',
          backgroundImage: 'linear-gradient(rgba(0,245,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,0.05) 1px,transparent 1px)',
          backgroundSize: '56px 56px',
          transform: 'perspective(500px) rotateX(55deg)',
          transformOrigin: 'bottom center',
          pointerEvents: 'none', zIndex: 1, opacity: 0.35,
        }} />

        {/* ── NAV ── */}
        <nav style={{
          position: 'fixed', top: 0, width: '100%', zIndex: 200,
          background: scrolled ? 'rgba(5,10,20,0.96)' : 'transparent',
          backdropFilter: scrolled ? 'blur(18px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(0,245,255,0.1)' : 'none',
          transition: 'background 0.3s, backdrop-filter 0.3s',
        }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 20px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Logo */}
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 'clamp(16px,3vw,20px)', fontWeight: 900, letterSpacing: 2, flexShrink: 0 }}>
              <span style={{ color: '#fff' }}>SANJOY</span>
              <span style={{ color: '#00f5ff', textShadow: '0 0 16px #00f5ff' }}>.</span>
              <span style={{ color: '#7b2ff7', textShadow: '0 0 16px #7b2ff7' }}>DEY</span>
            </div>

            {/* Desktop links */}
            <div className="nav-ul nav-desktop" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
              {navLinks.map(l => (
                <a key={l.id} href={`#${l.id}`} className={activeNav === l.id ? 'active' : ''}
                  style={{ color: activeNav === l.id ? '#00f5ff' : '#6b7a8d', fontSize: 12, fontFamily: "'Space Mono',monospace", letterSpacing: 2, textDecoration: 'none', textTransform: 'uppercase', transition: 'color 0.2s' }}>
                  {l.label}
                </a>
              ))}
            </div>

            {/* Hamburger */}
            <button className="nav-mobile-btn" onClick={() => setMenuOpen(o => !o)}
              style={{ background: 'none', border: '1px solid rgba(0,245,255,0.25)', borderRadius: 8, padding: 8, color: '#00f5ff', cursor: 'pointer', display: 'none', alignItems: 'center' }}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="mobile-menu" style={{
              background: 'rgba(5,10,20,0.98)', backdropFilter: 'blur(20px)',
              borderTop: '1px solid rgba(0,245,255,0.1)', padding: '16px 20px 20px',
            }}>
              {navLinks.map(l => (
                <a key={l.id} href={`#${l.id}`} onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block', padding: '12px 0', color: activeNav === l.id ? '#00f5ff' : '#8899aa',
                    fontFamily: "'Space Mono',monospace", fontSize: 13, letterSpacing: 2,
                    textDecoration: 'none', textTransform: 'uppercase',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}>{l.label}</a>
              ))}
            </div>
          )}
        </nav>

        {/* ── MAIN ── */}
        <main style={{ maxWidth: 1240, margin: '0 auto', padding: '0 20px 60px', position: 'relative', zIndex: 10 }}>

          {/* ── HERO ── */}
          <section id="about">
            <div className="hero-wrap">

              {/* Text */}
              <div className="hero-txt" style={{ flex: 1 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '7px 18px', borderRadius: 100, background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)', marginBottom: 24, animation: 'floatBadge 3s ease-in-out infinite' }}>
                  <span style={{ position: 'relative', width: 8, height: 8, flexShrink: 0 }}>
                    <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#00ff88', animation: 'ping 1.5s infinite' }} />
                    <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#00ff88' }} />
                  </span>
                  <span style={{ fontSize: 11, color: '#00ff88', fontFamily: "'Space Mono',monospace", letterSpacing: 2 }}>AVAILABLE FOR OPPORTUNITIES</span>
                </div>

                <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 'clamp(30px,5.5vw,64px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 18 }}>
                  <span style={{ color: '#8899aa', fontSize: '0.55em', display: 'block', marginBottom: 6, letterSpacing: 4, fontWeight: 400 }}>Hello, I'm</span>
                  <Typewriter words={['Sanjoy Dey', 'MERN Dev', 'Problem Solver']} />
                </h1>

                <p style={{ fontSize: 'clamp(14px,1.6vw,16px)', color: '#7a8b9a', lineHeight: 1.9, maxWidth: 500, marginBottom: 32 }}>
                  <span style={{ color: '#fff', fontWeight: 600 }}>MERN Stack Developer</span> specializing in building scalable, high-performance web applications. Transforming complex problems into{' '}
                  <span style={{ color: '#00f5ff' }}>elegant digital solutions</span>.
                </p>

                <div className="hero-btns" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 40 }}>
                  {[
                    { href: "https://github.com/Sanjoy2002dey", label: 'GITHUB', icon: Github, bg: 'linear-gradient(135deg,#00f5ff,#0088ff)', color: '#000', shadow: 'rgba(0,245,255,0.25)' },
                    { href: "https://www.linkedin.com/in/sanjoy-dey-713b67228/", label: 'LINKEDIN', icon: Linkedin, bg: 'linear-gradient(135deg,#7b2ff7,#ff006e)', color: '#fff', shadow: 'rgba(123,47,247,0.25)' },
                    { href: "https://mail.google.com/mail/?view=cm&fs=1&to=Sanjoy.sanjoydey@gmail.com", label: 'CONTACT', icon: Mail, bg: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', shadow: 'transparent' },
                  ].map(({ href, label, icon: I, bg, color, border, shadow }) => (
                    <a key={label} href={href} target="_blank" rel="noreferrer" className="btn-glow"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: 'clamp(10px,2vw,13px) clamp(18px,3vw,26px)',
                        borderRadius: 11, background: bg, color, fontWeight: 700,
                        fontSize: 'clamp(11px,1.4vw,13px)', textDecoration: 'none',
                        fontFamily: "'Space Mono',monospace", letterSpacing: 1,
                        border: border || 'none',
                        boxShadow: `0 8px 28px ${shadow}`,
                        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                        whiteSpace: 'nowrap',
                      }}>
                      <I size={16} /> {label}
                    </a>
                  ))}
                </div>

                <div className="stats-grid">
                  <StatBox value="5★" label="HackerRank" glow="#00f5ff" />
                  <StatBox value="100+" label="DSA Solved" glow="#7b2ff7" />
                  <StatBox value="6+" label="Projects" glow="#ff006e" />
                </div>
              </div>

              {/* Profile card */}
              <div className="hero-img" style={{ flexShrink: 0 }}>
                <TiltCard glowColor="#00f5ff">
                  <div className="hero-img-box" style={{
                    width: '100%', maxWidth: 380,
                    borderRadius: 22, overflow: 'hidden', position: 'relative',
                    background: 'linear-gradient(135deg,#0d1b2a,#050a14)',
                    border: '1px solid rgba(0,245,255,0.18)',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 50px rgba(0,245,255,0.08)',
                  }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#7b2ff7,#00f5ff,#ff006e,#00ff88,#7b2ff7)', backgroundSize: '200%', animation: 'shimmer 3s linear infinite' }} />
                    <img src="photo.jpg" alt="Sanjoy Dey" style={{ width: '100%', height: 'clamp(300px,45vw,460px)', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(5,10,20,0.95) 0%,rgba(5,10,20,0.2) 55%,transparent 100%)' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 22px' }}>
                      <h3 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 'clamp(18px,3vw,24px)', fontWeight: 900, color: '#fff', marginBottom: 7 }}>Sanjoy Dey</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#00f5ff', marginBottom: 8 }}>
                        <Code2 size={14} />
                        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, letterSpacing: 1 }}>MERN STACK DEVELOPER</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#5a6b7a', fontSize: 12 }}>
                        <MapPin size={12} /><span>Open to Remote & Relocation</span>
                      </div>
                    </div>
                    <div style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, border: '2px solid rgba(0,245,255,0.28)', borderRadius: 3, borderLeft: 'none', borderBottom: 'none' }} />
                    <div style={{ position: 'absolute', top: 14, left: 14, width: 32, height: 32, border: '2px solid rgba(123,47,247,0.28)', borderRadius: 3, borderRight: 'none', borderBottom: 'none' }} />
                  </div>
                </TiltCard>
              </div>
            </div>
          </section>

          {/* ── SKILLS ── */}
          <section id="skills" className="section-pad" style={{ padding: '90px 0' }}>
            <SectionHead badge="Technical Arsenal" h1="Technical" h2="Expertise" sub="Comprehensive skill set across modern web development technologies" />
            <div className="skills-grid">
              <SkillCard title="Frontend" icon={Monitor} glowColor="#00f5ff" skills={["React.js", "HTML5", "CSS3", "Tailwind CSS", "Bootstrap", "Responsive Design"]} />
              <SkillCard title="Backend" icon={Server} glowColor="#00ff88" skills={["Node.js", "Express.js", "RESTful APIs", "JSON", "JWT Auth"]} />
              <SkillCard title="Languages" icon={Terminal} glowColor="#ffcc00" skills={["JavaScript", "Java", "C Programming"]} />
              <SkillCard title="Database & Tools" icon={Database} glowColor="#7b2ff7" skills={["MongoDB", "MySQL", "Git/GitHub", "VS Code", "IntelliJ IDEA"]} />
            </div>
          </section>

          {/* ── PROJECTS ── */}
          <section id="projects" className="section-pad" style={{ padding: '90px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 52, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 14, padding: '5px 14px', borderRadius: 100, background: 'rgba(255,0,110,0.07)', border: '1px solid rgba(255,0,110,0.18)' }}>
                  <Zap size={11} color="#ff006e" />
                  <span style={{ fontSize: 10, color: '#ff006e', fontFamily: "'Space Mono',monospace", letterSpacing: 3, textTransform: 'uppercase' }}>Build Portfolio</span>
                </div>
                <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 'clamp(22px,4vw,44px)', fontWeight: 900, color: '#fff', marginBottom: 6 }}>
                  <span style={{ background: 'linear-gradient(135deg,#ff006e,#7b2ff7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Featured</span> Projects
                </h2>
                <p style={{ color: '#6b7a8d', fontSize: 14 }}>Building scalable solutions with modern technologies</p>
              </div>
              <a href="https://github.com/Sanjoy2002dey" target="_blank" rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#00f5ff', textDecoration: 'none', fontFamily: "'Space Mono',monospace", fontSize: 11, letterSpacing: 1 }}>
                VIEW ALL <ChevronRight size={14} />
              </a>
            </div>
            <div className="projects-grid">
              {projects.map((p, i) => <ProjectCard key={i} project={p} />)}
            </div>
          </section>

          {/* ── ACHIEVEMENTS ── */}
          <section id="achievements" className="section-pad" style={{ padding: '90px 0' }}>
            <SectionHead badge="Milestones" h1="Achievements &" h2="Experience" sub="Competitions, certifications and community involvement" />
            <div className="ach-grid">

              {/* Competitions */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                  <Trophy size={20} color="#ffcc00" />
                  <h3 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 13, color: '#fff', letterSpacing: 2 }}>COMPETITIONS</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <AchItem title="Hack4Bengal Participation" subtitle="One of Bengal's largest hackathons — innovative problem-solving and collaborative development." date="2024" icon={Code2} glow="#ff9900"
                    link="https://www.linkedin.com/posts/sanjoy-dey-713b67228_hack4bengal-github-redbull-activity-7213495395077742592-phC6" />
                  <AchItem title="Smart India Hackathon" subtitle="Successfully completed internal round with certificate of participation for innovative solution development." date="2023" icon={Award} glow="#0099ff"
                    link="https://www.linkedin.com/posts/sanjoy-dey-713b67228_internal-hackathon-certificate-activity-7114603724504780800-KAh-" />
                </div>
              </div>

              {/* Certifications + Community */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                  <Star size={20} color="#00f5ff" />
                  <h3 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 13, color: '#fff', letterSpacing: 2 }}>CERTIFICATIONS</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                  {/* Datacom */}
                  <a href="https://www.theforage.com/completion-certificates/gCW7Xki5Y3vNpBmnn/L3NcyCoAjLno9d3T9_gCW7Xki5Y3vNpBmnn_69b14c9d86bcbe7ef04e8e6b_1773233827349_completion_certificate.pdf"
                    target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                    <TiltCard glowColor="#00ff88">
                      <div style={{
                        padding: '20px', borderRadius: 14,
                        background: 'linear-gradient(135deg,rgba(0,255,136,0.07),rgba(0,255,136,0.02))',
                        backdropFilter: 'blur(16px)', border: '1px solid rgba(0,255,136,0.22)',
                        position: 'relative', overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(0,255,136,0.12)',
                      }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#00ff88,transparent)' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <div style={{ padding: 10, borderRadius: 10, background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.28)', color: '#00ff88', flexShrink: 0, boxShadow: '0 0 16px rgba(0,255,136,0.18)' }}>
                              <Award size={18} />
                            </div>
                            <div>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 9px', borderRadius: 100, background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.2)', marginBottom: 6 }}>
                                <span style={{ fontSize: 9, color: '#00ff88', fontFamily: "'Space Mono',monospace", letterSpacing: 2 }}>CERTIFICATE OF COMPLETION</span>
                              </div>
                              <h4 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 3 }}>Software Dev Job Simulation</h4>
                              <p style={{ color: '#00ff88', fontSize: 11, fontFamily: "'Space Mono',monospace", letterSpacing: 1 }}>Datacom — Forage</p>
                            </div>
                          </div>
                          <ExternalLink size={14} color="#00ff88" style={{ flexShrink: 0 }} />
                        </div>
                        <p style={{ color: '#7a8b9a', fontSize: 12, lineHeight: 1.7, marginBottom: 12 }}>
                          Reviewed Cinema Finder web app · Fixed bugs · Suggested UX improvements. Experience in <span style={{ color: '#00ff88' }}>JavaScript, React, debugging</span> & UX review.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {['JavaScript', 'React', 'UX'].map(t => (
                              <span key={t} style={{ fontSize: 10, padding: '3px 9px', borderRadius: 5, background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', color: '#00ff88', fontFamily: "'Space Mono',monospace" }}>{t}</span>
                            ))}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#4a5b6a', fontSize: 10, fontFamily: "'Space Mono',monospace" }}>
                            <Calendar size={10} />March 2026
                          </div>
                        </div>
                      </div>
                    </TiltCard>
                  </a>

                  {/* Community */}
                  <TiltCard glowColor="#ff006e">
                    <div style={{
                      padding: '20px', borderRadius: 14,
                      background: 'linear-gradient(135deg,rgba(255,0,110,0.07),rgba(255,0,110,0.02))',
                      border: '1px solid rgba(255,0,110,0.22)', position: 'relative', overflow: 'hidden',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#ff006e,transparent)' }} />
                      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ padding: 10, borderRadius: 10, background: 'rgba(255,0,110,0.1)', border: '1px solid rgba(255,0,110,0.28)', color: '#ff006e', boxShadow: '0 0 16px rgba(255,0,110,0.18)', flexShrink: 0 }}>
                          <Heart size={18} />
                        </div>
                        <div>
                          <h4 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 12, color: '#fff', fontWeight: 700, marginBottom: 4 }}>Community Volunteer</h4>
                          <p style={{ color: '#7a8b9a', fontSize: 12, lineHeight: 1.7 }}>Active contributor to tech community events, fostering collaboration and knowledge sharing.</p>
                        </div>
                      </div>
                      <a href="https://www.linkedin.com/posts/sanjoy-dey-713b67228_hey-connections-i-am-very-excited-to-activity-7092899698423853056-hROy"
                        target="_blank" rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#ff006e', textDecoration: 'none', fontFamily: "'Space Mono',monospace", letterSpacing: 1 }}>
                        VIEW POST <ChevronRight size={13} />
                      </a>
                    </div>
                  </TiltCard>
                </div>
              </div>
            </div>
          </section>

          {/* ── FOOTER ── */}
          <footer style={{ borderTop: '1px solid rgba(0,245,255,0.08)', paddingTop: 56, paddingBottom: 36, textAlign: 'center', marginTop: 20 }}>
            <h3 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 'clamp(18px,3vw,30px)', fontWeight: 900, color: '#fff', marginBottom: 8 }}>
              Let's Build Something{' '}
              <span style={{ background: 'linear-gradient(135deg,#00f5ff,#7b2ff7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Amazing</span>
            </h3>
            <p style={{ color: '#5a6b7a', fontSize: 13, fontFamily: "'Space Mono',monospace", letterSpacing: 1, marginBottom: 28 }}>Open to full-time opportunities and freelance projects</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 28 }}>
              {[
                { href: "https://github.com/Sanjoy2002dey", icon: Github, glow: '#fff' },
                { href: "https://www.linkedin.com/in/sanjoy-dey-713b67228/", icon: Linkedin, glow: '#0077b5' },
                { href: "https://mail.google.com/mail/?view=cm&fs=1&to=Sanjoy.sanjoydey@gmail.com", icon: Mail, glow: '#ff006e' },
              ].map(({ href, icon: I, glow }, i) => (
                <a key={i} href={href} target="_blank" rel="noreferrer" className="social-btn"
                  style={{ padding: 13, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#8899aa', textDecoration: 'none', display: 'flex', transition: 'all 0.25s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${glow}12`; e.currentTarget.style.borderColor = `${glow}35`; e.currentTarget.style.color = glow; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#8899aa'; }}>
                  <I size={20} />
                </a>
              ))}
            </div>
            <p style={{ color: '#3a4b5a', fontSize: 11, fontFamily: "'Space Mono',monospace", letterSpacing: 1 }}>
              © SANJOY DEY · DESIGNED & DEVELOPED WITH PRECISION
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}