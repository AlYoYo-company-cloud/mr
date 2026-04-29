import { useState, useEffect, useRef, useCallback } from 'react';

// ==================== TYPES ====================
interface Lesson {
  id: number;
  chapter: string;
  chapterNum: number;
  title: string;
  description: string;
  youtubeId: string;
  url: string;
  duration: string;
  icon: string;
  color: string;
  tags: string[];
  views: number;
}

interface Toast {
  id: number;
  message: string;
  icon: string;
  type: 'success' | 'info' | 'warning';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
  connections: number[];
}

// ==================== DATA ====================
const LESSONS: Lesson[] = [
  {
    id: 1,
    chapter: 'الفصل الأول',
    chapterNum: 1,
    title: 'مقدمة في الفيزياء النووية',
    description: 'ابدأ رحلتك في فهم البنية الأساسية للمادة وقوانين الطبيعة',
    youtubeId: 'nE2D7phXf6Q',
    url: 'https://youtu.be/nE2D7phXf6Q?si=GZpCH0Q-08rHaZGI',
    duration: '45:00',
    icon: '⚛️',
    color: 'from-blue-600 to-cyan-500',
    tags: ['فيزياء', 'مقدمة', 'أساسيات'],
    views: 1240,
  },
  {
    id: 2,
    chapter: 'الفصل الثاني',
    chapterNum: 2,
    title: 'الكهرومغناطيسية والمجالات',
    description: 'اكتشف عالم القوى الكهرومغناطيسية وتطبيقاتها في الحياة اليومية',
    youtubeId: 'hgUs7yZmW00',
    url: 'https://youtu.be/hgUs7yZmW00?si=VYbq_yPIhK7K6VEz',
    duration: '52:30',
    icon: '⚡',
    color: 'from-cyan-500 to-teal-500',
    tags: ['كهرومغناطيسية', 'مجالات', 'قوى'],
    views: 980,
  },
  {
    id: 3,
    chapter: 'الفصل الثالث',
    chapterNum: 3,
    title: 'الموجات والضوء والبصريات',
    description: 'استكشف طبيعة الضوء والموجات وظواهر الانعكاس والانكسار',
    youtubeId: 'cd0kiswwh-A',
    url: 'https://youtu.be/cd0kiswwh-A?si=fYAPe0dXUJnQkEzm',
    duration: '48:15',
    icon: '🌊',
    color: 'from-indigo-500 to-blue-600',
    tags: ['موجات', 'ضوء', 'بصريات'],
    views: 1100,
  },
  {
    id: 4,
    chapter: 'الفصل الرابع',
    chapterNum: 4,
    title: 'الديناميكا الحرارية',
    description: 'تعمق في فهم الحرارة والطاقة وقوانين الترموديناميكس',
    youtubeId: 'cEhkuWwFQLE',
    url: 'https://youtu.be/cEhkuWwFQLE?si=kG4c0pOv6UR36Auc',
    duration: '50:45',
    icon: '🔥',
    color: 'from-sky-500 to-cyan-600',
    tags: ['حرارة', 'طاقة', 'ترموديناميكس'],
    views: 870,
  },
];

const getYoutubeThumbnail = (id: string) =>
  `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

const getEmbedUrl = (id: string) =>
  `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;

// ==================== LOCAL STORAGE HELPERS ====================
const LS = {
  get: (key: string, fallback: any = null) => {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  set: (key: string, value: any) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
};

// ==================== PARTICLE CANVAS ====================
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particles = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const colors = ['rgba(6,182,212,', 'rgba(14,165,233,', 'rgba(56,189,248,', 'rgba(129,140,248,'];

    const initParticles = () => {
      const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 14000));
      particles.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        connections: [],
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const ps = particles.current;

      // Draw connections
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x;
          const dy = ps[i].y - ps[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.25;
            ctx.beginPath();
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.strokeStyle = `rgba(6,182,212,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Mouse repel
      ps.forEach(p => {
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const force = (100 - dist) / 100;
          p.vx += (dx / dist) * force * 0.3;
          p.vy += (dy / dist) * force * 0.3;
        }

        // Clamp velocity
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 1.5) { p.vx *= 1.5 / speed; p.vy *= 1.5 / speed; }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.opacity})`;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.opacity * 0.15})`;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="particle-canvas"
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    />
  );
}

// ==================== TOAST SYSTEM ====================
function ToastContainer({ toasts, remove }: { toasts: Toast[]; remove: (id: number) => void }) {
  return (
    <div className="toast-container" style={{ zIndex: 99999 }}>
      {toasts.map(t => (
        <div key={t.id} className="toast" onClick={() => remove(t.id)}>
          <span style={{ fontSize: 18 }}>{t.icon}</span>
          <span style={{ flex: 1 }}>{t.message}</span>
          <button
            onClick={() => remove(t.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 16, padding: 0 }}
          >✕</button>
        </div>
      ))}
    </div>
  );
}

// ==================== NAVBAR ====================
function Navbar({ activeSection, setActiveSection, favCount }: {
  activeSection: string;
  setActiveSection: (s: string) => void;
  favCount: number;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'الرئيسية', icon: '🏠' },
    { id: 'lessons', label: 'الدروس', icon: '📚' },
    { id: 'dashboard', label: 'لوحتي', icon: '📊' },
    { id: 'favorites', label: 'المفضلة', icon: '❤️', count: favCount },
  ];

  return (
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
        padding: scrolled ? '12px 0' : '20px 0',
        background: scrolled ? 'rgba(2,6,23,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(14,165,233,0.15)' : 'none',
        transition: 'all 0.4s ease',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setActiveSection('home')}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, boxShadow: '0 0 20px rgba(6,182,212,0.4)',
          }}>⚛️</div>
          <div>
            <div style={{ fontFamily: 'Cairo', fontWeight: 800, fontSize: 16, color: '#f1f5f9', lineHeight: 1.1 }}>أ. رامي فوزي</div>
            <div style={{ fontFamily: 'Cairo', fontSize: 11, color: '#06b6d4', fontWeight: 500 }}>فيزياء • الثالث الثانوي</div>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
              style={{
                background: 'none', border: 'none',
                padding: '8px 16px', borderRadius: 8,
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                position: 'relative', display: 'flex', alignItems: 'center', gap: 6,
                color: activeSection === item.id ? '#06b6d4' : '#94a3b8',
                transition: 'color 0.3s ease',
              }}
            >
              <span>{item.icon}</span>
              <span style={{ fontFamily: 'Cairo' }}>{item.label}</span>
              {item.count ? (
                <span style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white', fontSize: 10, fontWeight: 700,
                  padding: '1px 6px', borderRadius: 100,
                  minWidth: 18, textAlign: 'center',
                }}>{item.count}</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Social Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a href="https://www.youtube.com" target="_blank" rel="noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 8,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171', textDecoration: 'none', fontSize: 13,
              fontFamily: 'Cairo', fontWeight: 600, transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
            <span className="hide-sm">يوتيوب</span>
          </a>

          {/* Mobile menu */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)',
              color: '#06b6d4', padding: '8px', borderRadius: 8,
              cursor: 'pointer', fontSize: 18, display: 'none',
            }}
          >☰</button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: 'rgba(2,6,23,0.98)', backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(14,165,233,0.15)',
          padding: '16px 24px',
        }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveSection(item.id); setMenuOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                background: 'none', border: 'none', color: activeSection === item.id ? '#06b6d4' : '#94a3b8',
                padding: '12px 0', fontSize: 15, fontFamily: 'Cairo', fontWeight: 600,
                cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)',
                textAlign: 'right',
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.count ? (
                <span style={{
                  background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                  color: 'white', fontSize: 10, padding: '1px 6px',
                  borderRadius: 100, fontWeight: 700,
                }}>{item.count}</span>
              ) : null}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @media(max-width:768px){
          .desktop-nav{display:none!important;}
          .mobile-menu-btn{display:flex!important;}
          .hide-sm{display:none;}
        }
      `}</style>
    </nav>
  );
}

// ==================== HERO SECTION ====================
function HeroSection({ onStart, onWatch }: { onStart: () => void; onWatch: () => void }) {
  return (
    <section className="hero-section" style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="hero-bg" />

      {/* Animated Rings */}
      {[200, 320, 440, 560].map((size, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: size, height: size,
            borderRadius: '50%',
            border: `1px solid rgba(6,182,212,${0.15 - i * 0.02})`,
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: `${i % 2 === 0 ? 'spin-slow' : 'spin-reverse'} ${20 + i * 8}s linear infinite`,
          }}
        >
          <div style={{
            position: 'absolute',
            width: 8, height: 8,
            background: i % 2 === 0 ? '#06b6d4' : '#0ea5e9',
            borderRadius: '50%',
            top: -4, left: '50%',
            transform: 'translateX(-50%)',
            boxShadow: `0 0 15px ${i % 2 === 0 ? '#06b6d4' : '#0ea5e9'}`,
          }} />
        </div>
      ))}

      {/* Floating Atoms */}
      {['⚛️', '🔬', '⚡', '🌊', '💡', '🔭'].map((emoji, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            fontSize: 20 + Math.random() * 10,
            opacity: 0.15,
            top: `${15 + Math.random() * 70}%`,
            left: `${5 + Math.random() * 90}%`,
            animation: `float ${5 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.8}s`,
            filter: 'blur(0.5px)',
          }}
        >{emoji}</div>
      ))}

      {/* Main Content */}
      <div style={{
        position: 'relative', zIndex: 10,
        textAlign: 'center', padding: '120px 24px 80px',
        maxWidth: 900, margin: '0 auto',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)',
          borderRadius: 100, padding: '6px 20px', marginBottom: 32,
          animation: 'fadeInDown 0.7s ease forwards',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4', display: 'inline-block', animation: 'pulse-glow 2s infinite' }} />
          <span style={{ fontFamily: 'Cairo', fontSize: 13, color: '#22d3ee', fontWeight: 600 }}>
            منصة تعليمية مجانية • الثالث الثانوي
          </span>
        </div>

        {/* Teacher Name */}
        <h1 style={{
          fontFamily: 'Cairo', fontWeight: 900,
          fontSize: 'clamp(2.5rem, 8vw, 5rem)',
          lineHeight: 1.1, marginBottom: 16,
          animation: 'fadeInUp 0.8s ease 0.2s both',
          color: '#f1f5f9',
        }}>
          أستاذ{' '}
          <span className="gradient-text" style={{ display: 'inline-block' }}>
            رامي فوزي
          </span>
        </h1>

        {/* Subject Title */}
        <div style={{
          fontFamily: 'Cairo', fontSize: 'clamp(1rem, 3vw, 1.4rem)',
          color: '#94a3b8', fontWeight: 500, marginBottom: 24,
          animation: 'fadeInUp 0.8s ease 0.35s both',
        }}>
          مدرس الفيزياء — الصف الثالث الثانوي
        </div>

        {/* Tagline */}
        <div style={{
          fontFamily: 'Cairo', fontSize: 'clamp(1.3rem, 4vw, 2rem)',
          fontWeight: 700, marginBottom: 48,
          animation: 'fadeInUp 0.8s ease 0.5s both',
        }}>
          <span className="neon-text" style={{ color: '#06b6d4' }}>
            "أتقن الفيزياء خطوة بخطوة"
          </span>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 48, marginBottom: 48,
          flexWrap: 'wrap',
          animation: 'fadeInUp 0.8s ease 0.65s both',
        }}>
          {[
            { num: '4', label: 'فصول دراسية', icon: '📚' },
            { num: '+4K', label: 'مشاهدة', icon: '👁️' },
            { num: '100%', label: 'مجاناً', icon: '🎁' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Cairo', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 900, color: '#38bdf8' }}>
                {s.icon} {s.num}
              </div>
              <div style={{ fontFamily: 'Cairo', fontSize: 13, color: '#64748b', fontWeight: 500, marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap',
          animation: 'fadeInUp 0.8s ease 0.8s both',
        }}>
          <button
            className="btn-primary"
            onClick={onStart}
            style={{ padding: '14px 36px', borderRadius: 50, fontSize: 16, fontWeight: 700 }}
          >
            🚀 ابدأ التعلم الآن
          </button>
          <button
            className="btn-secondary"
            onClick={onWatch}
            style={{ padding: '14px 36px', borderRadius: 50, fontSize: 16 }}
          >
            ▶️ شاهد أول درس
          </button>
        </div>

        {/* Scroll hint */}
        <div style={{
          marginTop: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          animation: 'fadeInUp 0.8s ease 1s both',
          opacity: 0.5,
        }}>
          <div style={{ fontFamily: 'Cairo', fontSize: 12, color: '#475569' }}>اسحب للأسفل</div>
          <div style={{
            width: 24, height: 40, border: '2px solid rgba(6,182,212,0.3)',
            borderRadius: 12, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 4,
          }}>
            <div style={{
              width: 4, height: 8, background: '#06b6d4', borderRadius: 2,
              animation: 'float 2s ease-in-out infinite',
            }} />
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="rgba(15,23,42,0.8)" />
        </svg>
      </div>
    </section>
  );
}

// ==================== VIDEO CARD ====================
function VideoCard({
  lesson, onPlay, isFavorite, onToggleFav, isWatched, watchProgress,
}: {
  lesson: Lesson;
  onPlay: (l: Lesson) => void;
  isFavorite: boolean;
  onToggleFav: (id: number) => void;
  isWatched: boolean;
  watchProgress: number;
}) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="glass-card shine-effect"
      style={{ borderRadius: 16, overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onPlay(lesson)}
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
        {!imgError ? (
          <img
            src={getYoutubeThumbnail(lesson.youtubeId)}
            alt={lesson.title}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.5s ease',
              transform: hovered ? 'scale(1.08)' : 'scale(1)',
            }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`thumb-gradient bg-gradient-to-br ${lesson.color}`} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
            {lesson.icon}
          </div>
        )}

        {/* Overlay gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(180deg, ${hovered ? 'rgba(2,6,23,0.3)' : 'transparent'} 0%, rgba(2,6,23,0.85) 100%)`,
          transition: 'all 0.3s ease',
        }} />

        {/* Play Button */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: `translate(-50%, -50%) scale(${hovered ? 1 : 0.7})`,
          opacity: hovered ? 1 : 0,
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          width: 60, height: 60, borderRadius: '50%',
          background: 'rgba(6,182,212,0.9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 30px rgba(6,182,212,0.6)',
          fontSize: 24,
        }}>▶</div>

        {/* Duration Badge */}
        <div style={{
          position: 'absolute', bottom: 10, left: 10,
          background: 'rgba(2,6,23,0.85)', borderRadius: 6,
          padding: '3px 8px', fontSize: 11, fontFamily: 'Cairo',
          color: '#e2e8f0', fontWeight: 600,
        }}>{lesson.duration}</div>

        {/* Watched indicator */}
        {isWatched && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: 'rgba(34,197,94,0.9)', borderRadius: 6,
            padding: '3px 8px', fontSize: 11, fontFamily: 'Cairo',
            color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
          }}>✓ شاهدت</div>
        )}

        {/* Chapter badge */}
        <div style={{
          position: 'absolute', top: 10, left: 10,
          background: 'rgba(2,6,23,0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: 6, padding: '3px 10px',
          fontSize: 11, fontFamily: 'Cairo', color: '#22d3ee',
          fontWeight: 700, border: '1px solid rgba(6,182,212,0.3)',
        }}>{lesson.chapter}</div>
      </div>

      {/* Progress bar */}
      {watchProgress > 0 && (
        <div className="progress-bar" style={{ margin: '0', borderRadius: 0 }}>
          <div className="progress-fill" style={{ width: `${watchProgress}%` }} />
        </div>
      )}

      {/* Card Content */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>{lesson.icon}</span>
              <h3 style={{ fontFamily: 'Cairo', fontWeight: 700, fontSize: 15, color: '#f1f5f9', lineHeight: 1.3, margin: 0 }}>
                {lesson.title}
              </h3>
            </div>
            <p style={{ fontFamily: 'Cairo', fontSize: 12, color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              {lesson.description}
            </p>
          </div>

          {/* Favorite button */}
          <button
            className={`fav-btn ${isFavorite ? 'active' : ''}`}
            onClick={e => { e.stopPropagation(); onToggleFav(lesson.id); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 20, padding: 4, color: isFavorite ? '#ef4444' : '#475569',
              filter: isFavorite ? 'drop-shadow(0 0 6px rgba(239,68,68,0.6))' : 'none',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              flexShrink: 0,
            }}
            aria-label="إضافة للمفضلة"
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>

        {/* Tags + Views */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {lesson.tags.slice(0, 2).map(tag => (
              <span key={tag} className="badge badge-cyan" style={{ fontSize: 10 }}>#{tag}</span>
            ))}
          </div>
          <div style={{ fontFamily: 'Cairo', fontSize: 11, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
            👁️ {(lesson.views + Math.floor(Math.random() * 100)).toLocaleString('ar-EG')}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== VIDEO MODAL ====================
function VideoModal({
  lesson, lessons, onClose, onNext, onPrev, onLessonChange, favorites, onToggleFav, watchedIds, onMarkWatched,
}: {
  lesson: Lesson;
  lessons: Lesson[];
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onLessonChange: (l: Lesson) => void;
  favorites: number[];
  onToggleFav: (id: number) => void;
  watchedIds: number[];
  onMarkWatched: (id: number) => void;
}) {
  const currentIndex = lessons.findIndex(l => l.id === lesson.id);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNext();
      if (e.key === 'ArrowRight') onPrev();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    // Mark watched after 10s
    const timer = setTimeout(() => onMarkWatched(lesson.id), 10000);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      clearTimeout(timer);
    };
  }, [lesson.id]);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content glass-card" style={{ borderRadius: 20, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(14,165,233,0.15)',
          background: 'rgba(2,6,23,0.5)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>{lesson.icon}</span>
            <div>
              <div style={{ fontFamily: 'Cairo', fontWeight: 700, fontSize: 15, color: '#f1f5f9' }}>
                {lesson.title}
              </div>
              <div style={{ fontFamily: 'Cairo', fontSize: 12, color: '#06b6d4' }}>
                {lesson.chapter} • {lesson.duration}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => onToggleFav(lesson.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 20, padding: 6,
                color: favorites.includes(lesson.id) ? '#ef4444' : '#475569',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {favorites.includes(lesson.id) ? '❤️' : '🤍'}
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#f87171', borderRadius: 8, padding: '6px 12px',
                cursor: 'pointer', fontFamily: 'Cairo', fontSize: 14, fontWeight: 600,
              }}
            >✕ إغلاق</button>
          </div>
        </div>

        {/* Main layout */}
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {/* Video Player */}
          <div style={{ flex: 1, minWidth: 300 }}>
            <iframe
              src={getEmbedUrl(lesson.youtubeId)}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="youtube-embed"
              style={{ width: '100%', aspectRatio: '16/9', border: 'none', display: 'block' }}
            />

            {/* Video info */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(14,165,233,0.1)' }}>
              <p style={{ fontFamily: 'Cairo', fontSize: 13, color: '#64748b', margin: 0, marginBottom: 12 }}>
                {lesson.description}
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {lesson.tags.map(tag => (
                  <span key={tag} className="badge badge-blue">#{tag}</span>
                ))}
              </div>

              {/* Navigation */}
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button
                  onClick={onPrev}
                  disabled={currentIndex === 0}
                  className="btn-secondary"
                  style={{
                    flex: 1, padding: '10px', borderRadius: 10, fontSize: 13,
                    opacity: currentIndex === 0 ? 0.4 : 1,
                  }}
                >◀ الدرس السابق</button>
                <button
                  onClick={onNext}
                  disabled={currentIndex === lessons.length - 1}
                  className="btn-primary"
                  style={{
                    flex: 1, padding: '10px', borderRadius: 10, fontSize: 13,
                    opacity: currentIndex === lessons.length - 1 ? 0.4 : 1,
                  }}
                >الدرس التالي ▶</button>
              </div>
            </div>
          </div>

          {/* Sidebar Playlist */}
          <div style={{
            width: 280, borderRight: '1px solid rgba(14,165,233,0.1)',
            background: 'rgba(2,6,23,0.4)', overflowY: 'auto', maxHeight: 520,
          }}>
            <div style={{
              padding: '14px 16px', borderBottom: '1px solid rgba(14,165,233,0.1)',
              fontFamily: 'Cairo', fontWeight: 700, fontSize: 14, color: '#06b6d4',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              📋 قائمة الدروس
              <span style={{
                background: 'rgba(6,182,212,0.15)', color: '#22d3ee',
                padding: '2px 8px', borderRadius: 100, fontSize: 11,
              }}>{lessons.length}</span>
            </div>

            {lessons.map((l, idx) => (
              <div
                key={l.id}
                className={`playlist-item ${l.id === lesson.id ? 'active' : ''}`}
                onClick={() => onLessonChange(l)}
                style={{
                  padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: l.id === lesson.id
                    ? 'linear-gradient(135deg,#0ea5e9,#06b6d4)'
                    : 'rgba(30,41,59,0.8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontFamily: 'Cairo', fontWeight: 700,
                  color: l.id === lesson.id ? 'white' : '#64748b',
                  flexShrink: 0,
                }}>
                  {l.id === lesson.id ? (
                    <div className="playing-bars">
                      <span /><span /><span /><span />
                    </div>
                  ) : idx + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'Cairo', fontSize: 12, fontWeight: 600,
                    color: l.id === lesson.id ? '#22d3ee' : '#cbd5e1',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{l.title}</div>
                  <div style={{ fontFamily: 'Cairo', fontSize: 10, color: '#475569' }}>
                    {l.chapter} • {l.duration}
                    {watchedIds.includes(l.id) && <span style={{ color: '#22c55e', marginRight: 6 }}>✓</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== SEARCH & FILTER ====================
function SearchFilter({
  search, setSearch, activeFilter, setActiveFilter,
}: {
  search: string;
  setSearch: (s: string) => void;
  activeFilter: string;
  setActiveFilter: (f: string) => void;
}) {
  const filters = ['الكل', ...LESSONS.map(l => l.chapter)];

  return (
    <div style={{ marginBottom: 32 }}>
      {/* Search Bar */}
      <div style={{ position: 'relative', maxWidth: 500, margin: '0 auto 20px' }}>
        <span style={{
          position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
          fontSize: 18, color: '#475569', pointerEvents: 'none', zIndex: 1,
        }}>🔍</span>
        <input
          className="search-input"
          type="text"
          placeholder="ابحث عن درس..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '12px 48px 12px 16px',
            borderRadius: 50, fontSize: 15, direction: 'rtl',
          }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: '#64748b', cursor: 'pointer',
              fontSize: 16, padding: 4,
            }}
          >✕</button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button
            key={f}
            className={`filter-tab ${activeFilter === f ? 'active' : ''}`}
            onClick={() => setActiveFilter(f)}
          >{f}</button>
        ))}
      </div>
    </div>
  );
}

// ==================== LESSONS SECTION ====================
function LessonsSection({
  onPlay, favorites, onToggleFav, watchedIds, watchProgress,
}: {
  onPlay: (l: Lesson) => void;
  favorites: number[];
  onToggleFav: (id: number) => void;
  watchedIds: number[];
  watchProgress: Record<number, number>;
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('الكل');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const filtered = LESSONS.filter(l => {
    const matchSearch = !search || l.title.includes(search) || l.chapter.includes(search) || l.tags.some(t => t.includes(search));
    const matchFilter = filter === 'الكل' || l.chapter === filter;
    return matchSearch && matchFilter;
  });

  return (
    <section id="lessons" style={{ padding: '80px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="badge badge-cyan" style={{ marginBottom: 16 }}>📚 المحتوى التعليمي</div>
          <h2 className="section-title gradient-text" style={{ marginBottom: 12 }}>
            دروس الفيزياء
          </h2>
          <p style={{ fontFamily: 'Cairo', color: '#64748b', fontSize: 15, maxWidth: 500, margin: '0 auto' }}>
            جميع الدروس موثقة بالفيديو مع شرح مفصل لكل وحدة دراسية
          </p>
          <div className="section-divider" style={{ maxWidth: 200, margin: '24px auto 0' }} />
        </div>

        <SearchFilter search={search} setSearch={setSearch} activeFilter={filter} setActiveFilter={setFilter} />

        {loading ? (
          <div className="lessons-grid">
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ borderRadius: 16, overflow: 'hidden' }}>
                <div className="skeleton" style={{ aspectRatio: '16/9' }} />
                <div style={{ padding: 16, background: 'rgba(15,23,42,0.6)' }}>
                  <div className="skeleton" style={{ height: 18, marginBottom: 10, width: '80%' }} />
                  <div className="skeleton" style={{ height: 12, width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#475569' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontFamily: 'Cairo', fontSize: 16 }}>لا توجد نتائج للبحث</div>
          </div>
        ) : (
          <div className="lessons-grid">
            {filtered.map(lesson => (
              <VideoCard
                key={lesson.id}
                lesson={lesson}
                onPlay={onPlay}
                isFavorite={favorites.includes(lesson.id)}
                onToggleFav={onToggleFav}
                isWatched={watchedIds.includes(lesson.id)}
                watchProgress={watchProgress[lesson.id] || 0}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ==================== DASHBOARD SECTION ====================
function DashboardSection({
  watchedIds, favorites, viewCounts, onPlay,
}: {
  watchedIds: number[];
  favorites: number[];
  viewCounts: Record<number, number>;
  onPlay: (l: Lesson) => void;
}) {
  const watched = LESSONS.filter(l => watchedIds.includes(l.id));
  const favLessons = LESSONS.filter(l => favorites.includes(l.id));
  const mostViewed = [...LESSONS].sort((a, b) => (viewCounts[b.id] || 0) - (viewCounts[a.id] || 0)).slice(0, 3);
  const lastWatched = watched[watched.length - 1];

  // AI Recommendation: recommend lessons NOT watched yet
  const recommended = LESSONS.filter(l => !watchedIds.includes(l.id)).slice(0, 2);

  const stats = [
    { label: 'دروس شاهدتها', value: watched.length, total: LESSONS.length, icon: '✅', color: '#22c55e' },
    { label: 'المفضلة', value: favLessons.length, total: LESSONS.length, icon: '❤️', color: '#ef4444' },
    { label: 'نسبة الإنجاز', value: `${Math.round((watched.length / LESSONS.length) * 100)}%`, icon: '🏆', color: '#fbbf24' },
    { label: 'إجمالي الدروس', value: LESSONS.length, icon: '📚', color: '#06b6d4' },
  ];

  return (
    <section id="dashboard" style={{ padding: '80px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="badge badge-blue" style={{ marginBottom: 16 }}>📊 لوحة المتابعة</div>
          <h2 className="section-title gradient-text" style={{ marginBottom: 12 }}>تقدمك الدراسي</h2>
          <div className="section-divider" style={{ maxWidth: 200, margin: '24px auto 0' }} />
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ fontSize: 36, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 32, color: s.color, lineHeight: 1 }}>
                {s.value}
              </div>
              {typeof s.total === 'number' && (
                <div style={{ marginTop: 8 }}>
                  <div className="progress-bar" style={{ margin: '0 auto', maxWidth: 80 }}>
                    <div className="progress-fill" style={{ width: `${(Number(s.value) / s.total) * 100}%` }} />
                  </div>
                </div>
              )}
              <div style={{ fontFamily: 'Cairo', fontSize: 13, color: '#64748b', marginTop: 8 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {/* Continue Watching */}
          <div className="glass-card" style={{ padding: 24, borderRadius: 16 }}>
            <h3 style={{ fontFamily: 'Cairo', fontWeight: 700, fontSize: 16, color: '#06b6d4', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              ▶️ تابع المشاهدة
            </h3>
            {lastWatched ? (
              <div
                onClick={() => onPlay(lastWatched)}
                style={{ cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center' }}
              >
                <div style={{
                  width: 60, height: 45, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                  background: 'rgba(30,41,59,0.8)',
                }}>
                  <img src={getYoutubeThumbnail(lastWatched.youtubeId)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Cairo', fontWeight: 600, fontSize: 14, color: '#e2e8f0' }}>{lastWatched.title}</div>
                  <div style={{ fontFamily: 'Cairo', fontSize: 12, color: '#64748b', marginTop: 4 }}>{lastWatched.chapter}</div>
                </div>
                <div style={{ color: '#06b6d4', fontSize: 20 }}>▶</div>
              </div>
            ) : (
              <div style={{ fontFamily: 'Cairo', fontSize: 13, color: '#475569', textAlign: 'center', padding: '20px 0' }}>
                😴 لم تشاهد أي درس بعد
              </div>
            )}
          </div>

          {/* Most Viewed */}
          <div className="glass-card" style={{ padding: 24, borderRadius: 16 }}>
            <h3 style={{ fontFamily: 'Cairo', fontWeight: 700, fontSize: 16, color: '#06b6d4', marginBottom: 16 }}>
              🔥 الأكثر مشاهدة
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mostViewed.map((l, i) => (
                <div
                  key={l.id}
                  onClick={() => onPlay(l)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: i === 0 ? 'linear-gradient(135deg,#fbbf24,#f59e0b)' : i === 1 ? 'linear-gradient(135deg,#94a3b8,#64748b)' : 'linear-gradient(135deg,#b45309,#92400e)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, color: 'white', fontFamily: 'Cairo',
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Cairo', fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{l.title}</div>
                    <div style={{ fontFamily: 'Cairo', fontSize: 11, color: '#475569' }}>
                      {((viewCounts[l.id] || 0) + l.views).toLocaleString('ar-EG')} مشاهدة
                    </div>
                  </div>
                  <span style={{ fontSize: 16 }}>{l.icon}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="glass-card" style={{ padding: 24, borderRadius: 16, gridColumn: 'span 1' }}>
            <h3 style={{ fontFamily: 'Cairo', fontWeight: 700, fontSize: 16, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: 'linear-gradient(135deg,#818cf8,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                🤖 توصيات ذكية
              </span>
            </h3>
            <div className="ai-tag" style={{ marginBottom: 16 }}>مدعوم بالذكاء الاصطناعي</div>

            {recommended.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recommended.map(l => (
                  <div
                    key={l.id}
                    onClick={() => onPlay(l)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                      padding: '10px', borderRadius: 10,
                      background: 'rgba(14,165,233,0.05)',
                      border: '1px solid rgba(14,165,233,0.1)',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(14,165,233,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(14,165,233,0.05)')}
                  >
                    <span style={{ fontSize: 24 }}>{l.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Cairo', fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{l.title}</div>
                      <div style={{ fontFamily: 'Cairo', fontSize: 10, color: '#475569', marginTop: 2 }}>
                        لأنك لم تشاهده بعد 💡
                      </div>
                    </div>
                    <span style={{ color: '#06b6d4', fontSize: 16 }}>←</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontFamily: 'Cairo', fontSize: 13, color: '#22c55e', textAlign: 'center', padding: '20px 0' }}>
                🎉 أحسنت! شاهدت جميع الدروس
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ==================== FAVORITES SECTION ====================
function FavoritesSection({ favorites, onToggleFav, onPlay, watchedIds, watchProgress }: {
  favorites: number[];
  onToggleFav: (id: number) => void;
  onPlay: (l: Lesson) => void;
  watchedIds: number[];
  watchProgress: Record<number, number>;
}) {
  const favLessons = LESSONS.filter(l => favorites.includes(l.id));

  return (
    <section id="favorites" style={{ padding: '80px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="badge" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', marginBottom: 16 }}>
            ❤️ المفضلة
          </div>
          <h2 className="section-title" style={{ marginBottom: 12 }}>
            <span style={{ background: 'linear-gradient(135deg,#f87171,#ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              دروسك المفضلة
            </span>
          </h2>
          <div className="section-divider" style={{ maxWidth: 200, margin: '24px auto 0' }} />
        </div>

        {favLessons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 20, filter: 'grayscale(0.3)' }}>🤍</div>
            <div style={{ fontFamily: 'Cairo', fontSize: 18, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
              لا توجد دروس مفضلة بعد
            </div>
            <div style={{ fontFamily: 'Cairo', fontSize: 14, color: '#334155' }}>
              اضغط على أيقونة القلب في بطاقة الدرس لإضافته
            </div>
          </div>
        ) : (
          <div className="lessons-grid">
            {favLessons.map(lesson => (
              <VideoCard
                key={lesson.id}
                lesson={lesson}
                onPlay={onPlay}
                isFavorite={true}
                onToggleFav={onToggleFav}
                isWatched={watchedIds.includes(lesson.id)}
                watchProgress={watchProgress[lesson.id] || 0}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ==================== FOOTER ====================
function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(14,165,233,0.1)',
      padding: '48px 24px 32px',
      background: 'rgba(2,6,23,0.8)',
      position: 'relative',
      zIndex: 1,
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'linear-gradient(135deg,#0ea5e9,#06b6d4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, boxShadow: '0 0 20px rgba(6,182,212,0.3)',
              }}>⚛️</div>
              <div>
                <div style={{ fontFamily: 'Cairo', fontWeight: 800, fontSize: 16, color: '#f1f5f9' }}>أ. رامي فوزي</div>
                <div style={{ fontFamily: 'Cairo', fontSize: 12, color: '#06b6d4' }}>مدرس الفيزياء</div>
              </div>
            </div>
            <p style={{ fontFamily: 'Cairo', fontSize: 13, color: '#475569', lineHeight: 1.7 }}>
              منصة تعليمية متخصصة في الفيزياء للصف الثالث الثانوي. نهدف إلى تبسيط المفاهيم الصعبة بأسلوب ممتع ومبتكر.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ fontFamily: 'Cairo', fontWeight: 700, fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>روابط سريعة</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['الرئيسية', 'الدروس', 'لوحتي', 'المفضلة'].map(l => (
                <a key={l} href="#" style={{ fontFamily: 'Cairo', fontSize: 13, color: '#475569', textDecoration: 'none', transition: 'color 0.2s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#06b6d4')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
                >{l}</a>
              ))}
            </div>
          </div>

          {/* Chapters */}
          <div>
            <h4 style={{ fontFamily: 'Cairo', fontWeight: 700, fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>الفصول الدراسية</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {LESSONS.map(l => (
                <span key={l.id} style={{ fontFamily: 'Cairo', fontSize: 13, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{l.icon}</span> {l.chapter}
                </span>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 style={{ fontFamily: 'Cairo', fontWeight: 700, fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>تواصل معنا</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href="https://www.youtube.com" target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📺</div>
                <span style={{ fontFamily: 'Cairo', fontSize: 13, color: '#475569' }}>قناة يوتيوب</span>
              </a>
              <a href="https://t.me" target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✈️</div>
                <span style={{ fontFamily: 'Cairo', fontSize: 13, color: '#475569' }}>مجموعة تيليغرام</span>
              </a>
              <a href="https://wa.me" target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>💬</div>
                <span style={{ fontFamily: 'Cairo', fontSize: 13, color: '#475569' }}>واتساب</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          borderTop: '1px solid rgba(14,165,233,0.1)',
          paddingTop: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ fontFamily: 'Cairo', fontSize: 12, color: '#334155' }}>
            © 2025 منصة أ. رامي فوزي للفيزياء. جميع الحقوق محفوظة.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="badge badge-cyan">فيزياء</span>
            <span className="badge badge-blue">الثالث الثانوي</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ==================== MAIN APP ====================
export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [favorites, setFavorites] = useState<number[]>(() => LS.get('fav_ids', []));
  const [watchedIds, setWatchedIds] = useState<number[]>(() => LS.get('watched_ids', []));
  const [viewCounts, setViewCounts] = useState<Record<number, number>>(() => LS.get('view_counts', {}));
  const [watchProgress] = useState<Record<number, number>>(() => LS.get('watch_progress', {}));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  // Persist to LS
  useEffect(() => { LS.set('fav_ids', favorites); }, [favorites]);
  useEffect(() => { LS.set('watched_ids', watchedIds); }, [watchedIds]);
  useEffect(() => { LS.set('view_counts', viewCounts); }, [viewCounts]);

  const addToast = useCallback((message: string, icon: string, type: Toast['type'] = 'info') => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, icon, type }]);
    setTimeout(() => removeToast(id), 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handlePlay = useCallback((lesson: Lesson) => {
    setCurrentLesson(lesson);
    setViewCounts(prev => ({ ...prev, [lesson.id]: (prev[lesson.id] || 0) + 1 }));
    LS.set('last_watched', lesson.id);
    addToast(`جاري تشغيل: ${lesson.title}`, '▶️', 'info');
  }, [addToast]);

  const handleToggleFav = useCallback((id: number) => {
    setFavorites(prev => {
      const isFav = prev.includes(id);
      const lesson = LESSONS.find(l => l.id === id);
      if (isFav) {
        addToast('تم الحذف من المفضلة', '💔', 'info');
        return prev.filter(f => f !== id);
      } else {
        addToast(`أُضيف "${lesson?.chapter}" للمفضلة`, '❤️', 'success');
        return [...prev, id];
      }
    });
  }, [addToast]);

  const handleMarkWatched = useCallback((id: number) => {
    setWatchedIds(prev => {
      if (prev.includes(id)) return prev;
      const lesson = LESSONS.find(l => l.id === id);
      addToast(`اكتملت مشاهدة: ${lesson?.title}`, '✅', 'success');
      return [...prev, id];
    });
  }, [addToast]);

  const closeModal = () => setCurrentLesson(null);

  const handleNext = () => {
    if (!currentLesson) return;
    const idx = LESSONS.findIndex(l => l.id === currentLesson.id);
    if (idx < LESSONS.length - 1) handlePlay(LESSONS[idx + 1]);
  };

  const handlePrev = () => {
    if (!currentLesson) return;
    const idx = LESSONS.findIndex(l => l.id === currentLesson.id);
    if (idx > 0) handlePlay(LESSONS[idx - 1]);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#020617', position: 'relative', direction: 'rtl' }}>
      {/* Particle Background */}
      <ParticleCanvas />

      {/* Cursor Glow */}
      <div
        className="cursor-glow"
        id="cursor-glow"
        style={{ position: 'fixed', pointerEvents: 'none', zIndex: 0, display: 'none' }}
      />

      {/* Navbar */}
      <Navbar
        activeSection={activeSection}
        setActiveSection={(s) => { setActiveSection(s); setTimeout(() => { const el = document.getElementById(s); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 100); }}
        favCount={favorites.length}
      />

      {/* Main Content */}
      <main style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero */}
        <div id="home">
          <HeroSection
            onStart={() => { setActiveSection('lessons'); setTimeout(() => document.getElementById('lessons')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
            onWatch={() => handlePlay(LESSONS[0])}
          />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.3), transparent)', margin: '0 auto', maxWidth: 800 }} />

        {/* Lessons */}
        <div id="lessons">
          <LessonsSection
            onPlay={handlePlay}
            favorites={favorites}
            onToggleFav={handleToggleFav}
            watchedIds={watchedIds}
            watchProgress={watchProgress}
          />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.2), transparent)', margin: '0 48px' }} />

        {/* Dashboard */}
        <div id="dashboard">
          <DashboardSection
            watchedIds={watchedIds}
            favorites={favorites}
            viewCounts={viewCounts}
            onPlay={handlePlay}
          />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.2), transparent)', margin: '0 48px' }} />

        {/* Favorites */}
        <div id="favorites">
          <FavoritesSection
            favorites={favorites}
            onToggleFav={handleToggleFav}
            onPlay={handlePlay}
            watchedIds={watchedIds}
            watchProgress={watchProgress}
          />
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Video Modal */}
      {currentLesson && (
        <VideoModal
          lesson={currentLesson}
          lessons={LESSONS}
          onClose={closeModal}
          onNext={handleNext}
          onPrev={handlePrev}
          onLessonChange={handlePlay}
          favorites={favorites}
          onToggleFav={handleToggleFav}
          watchedIds={watchedIds}
          onMarkWatched={handleMarkWatched}
        />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} remove={removeToast} />

      {/* Global cursor glow script */}
      <style>{`
        @media(hover:hover){
          #cursor-glow { display:block!important; }
        }
      `}</style>
    </div>
  );
}
