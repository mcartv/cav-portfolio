import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Asterisk, Github, Menu, X } from 'lucide-react'
import { projects } from './data/projects'
import { profile } from './data/profile'
import { DragHandle, FilmWindow, CertificatesWindow } from './components/ArchiveWindows'
import ArcadeHub from './components/ArcadeHub'

const skills = [
  { number: '01', category: 'FRONTEND', items: 'React, JavaScript, HTML, CSS' },
  { number: '02', category: 'BACKEND', items: 'Node.js, Express, Python' },
  { number: '03', category: 'DATABASES', items: 'PostgreSQL, Supabase, MongoDB' },
  { number: '04', category: 'WORKFLOW', items: 'Git, GitHub, Vercel, Figma' },
]

function SectionLabel({ index, title, aside, dark = false }) {
  return (
    <div className={`section-label flex items-start justify-between gap-4 border-t pt-3 font-mono text-[10px] leading-relaxed tracking-wide sm:text-[11px] ${dark ? 'border-white/40' : 'border-ink'}`}>
      <span className="section-label-title"><span className="section-label-index">{index}</span> / {title}</span>
      <span className="text-right">{aside}</span>
    </div>
  )
}

function Navbar({ onFilmOpen }) {
  const [open, setOpen] = useState(false)
  const links = [['ABOUT', '#about'], ['WORK', '#work'], ['CONTACT', '#contact']]
  return (
    <header className="site-header relative z-50 flex items-center justify-between gap-4 border-b border-ink pl-[5%] pr-[calc(5%+38px)] py-4 sm:pr-[74px] sm:py-5">
      <a href="#home" aria-label="INDEX portfolio home" className="font-black text-3xl tracking-[-.11em]">INDEX<span className="text-signal">/</span></a>
      <span className="hidden font-mono text-[10px] tracking-wider lg:block">CREATIVE DEVELOPER — PORTFOLIO 2026</span>
      <button className="md:hidden p-2" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? <X size={23} /> : <Menu size={23} />}
      </button>
      <nav aria-label="Main navigation" className={`${open ? 'flex' : 'hidden'} absolute top-full left-0 right-0 flex-col gap-5 border-b border-ink bg-paper px-[5%] py-7 font-mono text-xs md:static md:flex md:flex-row md:items-center md:gap-5 md:border-0 md:bg-transparent md:p-0`}>
        {links.map(([name, href]) => <a key={name} href={href} className="transition-colors hover:text-signal focus-visible:text-signal" onClick={() => setOpen(false)}>{name}</a>)}
      </nav>
      <DragHandle kind="film" onOpen={() => { setOpen(false); onFilmOpen() }} className="film-edge-position"/>
    </header>
  )
}

const PLANE_PIXELS = [
  '000000010000000',
  '000000111000000',
  '000000111000000',
  '000000111000000',
  '000011111110000',
  '011111111111110',
  '111111111111111',
  '001111111111100',
  '000000111000000',
  '000001111100000',
  '000011111110000',
  '000001111100000',
]
function PixelPlane({onClick,count}) {
  return <button type="button" onClick={onClick} className="pixel-plane group relative inline-flex h-10 w-10 shrink-0 items-center justify-center opacity-40 transition-opacity duration-300 hover:opacity-100 focus-visible:opacity-100 sm:h-11 sm:w-11" aria-label="A tiny pixel aircraft. Try tapping it repeatedly." title="A curious little aircraft">
    <svg width="27" height="27" viewBox="0 0 15 12" aria-hidden="true" shapeRendering="crispEdges" className="pixel-plane-art" fill="currentColor">
      {PLANE_PIXELS.flatMap((row,y)=>[...row].map((pixel,x)=>pixel==='1'?<rect key={y+'-'+x} x={x} y={y} width="1" height="1"/>:null))}
    </svg>
    {count>1&&<span className="plane-activation absolute -bottom-1 right-0 font-mono text-[8px] text-signal">{count}/5</span>}
  </button>
}

function Hero({onPlaneClick,planeCount}) {
  return (
    <section id="home" className="page-gutter hero relative isolate flex min-h-[min(820px,calc(100svh-70px))] flex-col justify-between overflow-hidden py-8">
      <div className="hero-architectural pointer-events-none absolute inset-0 -z-10" aria-hidden="true"><span className="hero-architectural-ring"/><span className="hero-architectural-cross">+</span><span className="hero-architectural-index">DESIGN ARCHIVE / 001</span></div>
      <div className="flex justify-between gap-4 font-mono text-[9px] tracking-wider sm:text-[11px]"><span>[ PORTFOLIO — VOL. 001 ]</span><span className="text-right">DESIGN × TECHNOLOGY × STORYTELLING</span></div>
      <div className="hero-headline relative my-16" aria-label="Crafting digital things that matter">
        <h1>CRAFTING</h1>
        <h1>DIGITAL <em>THINGS.</em></h1>
        <h1>THAT <span className="outline-word">MATTER.</span></h1>
        <div className="hero-seal pointer-events-none absolute -bottom-12 right-1 hidden h-28 w-28 items-center justify-center rounded-full border border-ink/40 bg-paper/80 sm:flex lg:-bottom-16 lg:right-10 lg:h-36 lg:w-36" aria-hidden="true"><span className="hero-seal-orbit"/><span className="relative text-center font-mono text-[9px] leading-[1.75] tracking-[.16em]">CRAFT<br/>IN<br/>MOTION <span className="text-signal">✳</span></span></div>
      </div>
      <div>
        <div className="flex items-end justify-between gap-5">
          <div className="max-w-sm"><span className="hero-kicker font-mono text-[11px] text-signal"><span className="status-dot"/> HELLO, I'M A CREATIVE DEVELOPER.</span><p className="mt-3 text-sm leading-relaxed sm:text-lg">Building considered digital experiences and exploring stories through a different lens.</p></div>
          <a href="#work" aria-label="Explore selected work" className="circle-link shrink-0"><ArrowDown strokeWidth={1.5} size={30}/></a>
        </div>
        <div className="mt-10 flex justify-between gap-4 border-t border-ink pt-3 font-mono text-[9px] sm:text-[11px]"><span>CURATED DIGITAL ARCHIVE</span><span className="flex items-center gap-3">SCROLL TO EXPLORE <span className="scroll-cue">↓</span><PixelPlane onClick={onPlaneClick} count={planeCount}/></span></div>
      </div>
    </section>
  )
}

function About({ onCertificatesOpen }) {
  return (
    <section id="about" className="page-gutter bg-stonewash py-10 md:py-20">
      <SectionLabel index="01" title="THE PERSON BEHIND THE SCREEN" aside="ABOUT / CURRICULUM VITAE"/>
      <div className="mt-10 flex items-center justify-between gap-4 border-b border-ink/25 pb-5">
        <span className="font-mono text-[10px] tracking-widest text-ink/60">THE HUMAN BEHIND THE CODE</span>
        <DragHandle kind="certificates" onOpen={onCertificatesOpen}/>
      </div>
      <div className="grid gap-8 pt-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:gap-14">
        <div>
          <figure className="profile-portrait mb-9 w-full max-w-[360px]">
            <div className="profile-image-surface relative aspect-square overflow-hidden border border-ink/70 bg-[#dcded2]">
              {profile.photoUrl ? <img src={profile.photoUrl} alt="Profile portrait" className="h-full w-full object-cover" loading="lazy"/> : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#7c8876]">
                  <svg viewBox="0 0 200 200" className="w-1/2" role="img" aria-label="Abstract portrait placeholder"><circle cx="100" cy="68" r="35" fill="currentColor"/><path d="M34 180c0-46 26-70 66-70s66 24 66 70" fill="currentColor"/><circle cx="100" cy="100" r="91" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 7"/></svg>
                  <span className="font-mono text-[10px] tracking-[.18em]">YOUR PHOTO HERE</span>
                </div>
              )}
              <span className="absolute right-3 top-3 font-mono text-[10px] text-ink/50">1:1</span>
              <span className="absolute bottom-3 left-3 font-mono text-[9px] text-ink/50">FIG. 01 / PORTRAIT</span>
            </div>
            <figcaption className="mt-2 font-mono text-[9px] tracking-widest text-ink/50">PERSONAL ARCHIVE / IMAGE 001</figcaption>
          </figure>
          <span className="font-mono text-[11px] text-ink/60">INTRODUCING / {profile.location.toUpperCase()}</span>
          <h2 className="editorial-heading mt-4 text-[clamp(45px,6vw,88px)]">MORE THAN<br/>JUST <span className="font-serif font-normal italic text-signal">code.</span></h2>
          <p className="mt-6 max-w-sm text-base leading-[1.8]">{profile.introduction}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="inline-flex items-center gap-2 border-b border-ink pb-2 font-mono text-[11px] hover:text-signal" href={profile.githubUrl} target="_blank" rel="noopener noreferrer"><Github size={16}/> GITHUB <ArrowUpRight size={13}/></a>
            {profile.linkedinUrl ? <a className="inline-flex items-center gap-2 border-b border-ink pb-2 font-mono text-[11px] hover:text-signal" href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">LINKEDIN <ArrowUpRight size={13}/></a> : <span className="border-b border-dashed border-ink/40 pb-2 font-mono text-[11px] text-ink/50" title="Set linkedinUrl in src/data/profile.js">LINKEDIN — ADD PROFILE URL</span>}
            {profile.resumeUrl && <a className="inline-flex items-center gap-2 border-b border-ink pb-2 font-mono text-[11px] hover:text-signal" href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">RESUME PDF <ArrowUpRight size={13}/></a>}
          </div>
        </div>
        <div className="space-y-8">
          <div className="border-t border-ink pt-4"><span className="font-mono text-[10px] tracking-widest text-ink/60">00 / PROFILE</span><h3 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">{profile.displayName}</h3><p className="mt-1 text-sm">{profile.headline}</p></div>
          <div className="border-t border-ink pt-4"><span className="font-mono text-[10px] tracking-widest text-ink/60">01 / WHAT I DO</span><div className="mt-5 grid gap-3 sm:grid-cols-2">{profile.focus.map((focus,i) => <div className="flex gap-3 border-b border-ink/20 pb-3 text-sm" key={focus}><span className="font-mono text-[10px] text-ink/50">0{i+1}</span><span>{focus}</span></div>)}</div></div>
          <div className="border-t border-ink pt-4"><span className="font-mono text-[10px] tracking-widest text-ink/60">02 / EDUCATION</span>{profile.education.map((entry,i) => <div key={i} className="mt-5 flex justify-between gap-5"><div><h4 className="font-semibold">{entry.title}</h4><p className="mt-1 text-sm text-ink/65">{entry.detail}</p></div>{entry.placeholder && <span className="shrink-0 self-start font-mono text-[9px] text-ink/45">TO UPDATE</span>}</div>)}</div>
          <div className="border-t border-ink pt-4"><span className="font-mono text-[10px] tracking-widest text-ink/60">03 / EXPERIENCE</span>{profile.experience.map((entry,i) => <div key={i} className="mt-5 flex justify-between gap-5"><div><h4 className="font-semibold">{entry.title}</h4><p className="mt-1 text-sm text-ink/65">{entry.detail}</p></div>{entry.placeholder && <span className="shrink-0 self-start font-mono text-[9px] text-ink/45">TO UPDATE</span>}</div>)}</div>
          <button onClick={onCertificatesOpen} className="group flex w-full items-center justify-between border border-ink px-5 py-4 text-left font-mono text-[11px] transition-colors hover:bg-ink hover:text-paper"><span>VIEW COURSES & CERTIFICATES</span><ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1"/></button>
        </div>
      </div>
    </section>
  )
}

function ProjectArtwork({ project }) {
  return (
    <div className="artwork project-artwork relative grid min-h-0 flex-1 place-items-center overflow-hidden" style={{ backgroundColor: project.color }}>
      <div className="artwork-grid pointer-events-none absolute inset-0" aria-hidden="true"/><div className="artwork-sheen pointer-events-none absolute inset-0" aria-hidden="true"/>
      <div className="art-orbit absolute inset-[12%] rounded-full border border-ink/20"/>
      <div className="art-orbit absolute inset-[23%] rounded-full border border-dashed border-ink/30"/>
      <div className="art-window relative flex h-[65%] w-[73%] rotate-[-7deg] flex-col border border-ink bg-[#faf9f3] p-3 shadow-[12px_13px_0px_#00000017]">
        <div className="flex gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-ink"/><i className="h-1.5 w-1.5 rounded-full bg-ink/40"/><i className="h-1.5 w-1.5 rounded-full bg-ink/20"/></div>
        <div className="my-auto"><div className="text-[clamp(25px,4vw,47px)] font-black leading-none tracking-[-.09em]">{project.mark}<span className="text-signal">.</span></div><div className="mt-2 h-1.5 w-4/5 bg-ink/25"/><div className="mt-2 h-1.5 w-1/2 bg-ink/15"/></div>
        <div className="font-mono text-[8px] tracking-wide">{project.slug.toUpperCase()}</div>
      </div>
      <span className="absolute bottom-3 right-3 font-mono text-[9px]">ARCHIVE / {project.id}</span>
      <span className="artwork-coordinate absolute left-3 top-3 font-mono text-[8px] tracking-widest" aria-hidden="true">N° {project.id} — INDEX</span>
    </div>
  )
}

// Stylized interface previews are original mockups, not screenshots of the real applications.
function InterfacePreview({ project }) {
  const isSong = project.slug === 'song-painter'
  const isBudget = project.slug === 'budget-tracker'
  const title = isSong ? 'Visual studio' : isBudget ? 'Budget overview' : 'Scholar overview'
  const tabs = isSong ? ['MY MUSIC', 'PAINTING', 'EXPORT'] : isBudget ? ['TRANSACTIONS', 'SUMMARY', 'THEME'] : ['SCHOLARS', 'PAYOUTS', 'REPORTS']
  const figures = isSong ? ['01', '65%', '03'] : isBudget ? ['₱12k', '₱8k', '₱4k'] : ['128', '24', '16']
  const labels = isSong ? ['TRACK', 'INTENSITY', 'PALETTES'] : isBudget ? ['INCOME', 'EXPENSE', 'BALANCE'] : ['SCHOLARS', 'REQUESTS', 'REPORTS']
  return (
    <div className="ui-preview overflow-hidden border border-ink/20 bg-[#f8f9f6] shadow-[0_24px_60px_#00000018]" aria-label={'Conceptual interface preview for ' + project.title}>
      <div className="flex items-center justify-between border-b border-ink/15 bg-[#e9e9e3] px-3 py-2 sm:px-5">
        <div className="flex gap-1.5"><i className="h-2 w-2 rounded-full bg-[#ef7868]"/><i className="h-2 w-2 rounded-full bg-[#e2bb63]"/><i className="h-2 w-2 rounded-full bg-[#81ad8c]"/></div>
        <span className="font-mono text-[9px] tracking-wider">PREVIEW / {project.slug.toUpperCase()}</span>
        <span className="text-[11px]">↗</span>
      </div>
      <div className="grid min-h-[240px] grid-cols-[60px_1fr] sm:min-h-[340px] sm:grid-cols-[138px_1fr]">
        <aside className="border-r border-ink/10 p-2 sm:p-4" style={{backgroundColor:project.light}}>
          <div className="text-lg font-black tracking-tighter sm:text-xl">{project.mark}<span className="text-signal">/</span></div>
          <div className="mt-9 space-y-4">{tabs.map((tab,i) => <div key={tab} className={'flex items-center gap-2 font-mono text-[7px] sm:text-[10px] ' + (i===0?'font-bold':'opacity-50')}><span className="h-2 w-2 border border-ink/50"/><span className="hidden sm:block">{tab}</span></div>)}</div>
        </aside>
        <div className="min-w-0 p-3 sm:p-6">
          <div className="flex items-center justify-between gap-3"><div><p className="font-mono text-[8px] tracking-wider text-ink/50">DASHBOARD / OVERVIEW</p><h4 className="mt-1 text-lg font-extrabold tracking-tight sm:text-3xl">{title}</h4></div><div className="hidden h-9 w-9 items-center justify-center rounded-full border border-ink/20 sm:flex">↗</div></div>
          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">{figures.map((value,i) => <div key={labels[i]} className="border border-ink/15 bg-white/80 p-2 sm:p-4"><p className="font-mono text-[7px] text-ink/60 sm:text-[9px]">{labels[i]}</p><strong className="mt-2 block text-xl tracking-tight sm:text-3xl">{value}</strong></div>)}</div>
          <div className="mt-3 grid grid-cols-[1.4fr_1fr] gap-2 sm:mt-4 sm:gap-3"><div className="border border-ink/15 bg-white/80 p-3 sm:p-4"><p className="font-mono text-[8px]">ACTIVITY / OVERVIEW</p><div className="mt-5 flex h-20 items-end gap-[7%] sm:h-28">{[42,70,53,86,66,92,74].map((n,i) => <div key={i} className="flex-1" style={{height:n+'%',backgroundColor:i===5?'#f34d31':project.color}}/>)}</div></div><div className="border border-ink/15 bg-white/80 p-3 sm:p-4"><p className="font-mono text-[8px]">STATUS</p><div className="mx-auto mt-5 grid h-16 w-16 place-items-center rounded-full border-[7px] border-ink/15 border-t-signal text-xs font-extrabold sm:h-24 sm:w-24">78%</div></div></div>
        </div>
      </div>
    </div>
  )
}

function ProjectModal({ selection, onClose }) {
  const project = selection?.project
  const sourceRect = selection?.rect
  const closeRef = useRef(null)
  const [phase, setPhase] = useState('flip')
  const reducedMotion = useRef(false)

  useEffect(() => {
    if (!project) return undefined
    const oldOverflow = document.body.style.overflow
    const previous = document.activeElement
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.body.style.overflow = 'hidden'
    setPhase(reducedMotion.current ? 'expanded' : 'flip')
    const animation = reducedMotion.current ? 0 : 720
    const timer = window.setTimeout(() => setPhase('expanded'), animation)
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), animation + 35)
    const onKey = e => {
      if (e.key === 'Escape') onClose()
      if (e.key !== 'Tab') return
      const root = document.querySelector('[data-project-modal]')
      if (!root) { e.preventDefault(); return }
      const nodes = [...root.querySelectorAll('a[href],button:not([disabled])')]
      if (!nodes.length) { e.preventDefault(); return }
      if (e.shiftKey && document.activeElement === nodes[0]) { e.preventDefault(); nodes[nodes.length-1].focus() }
      else if (!e.shiftKey && document.activeElement === nodes[nodes.length-1]) { e.preventDefault(); nodes[0].focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = oldOverflow
      previous?.focus?.()
    }
  }, [project, onClose])

  if (!project) return null
  const centerX = sourceRect ? sourceRect.left + sourceRect.width / 2 : window.innerWidth / 2
  const centerY = sourceRect ? sourceRect.top + sourceRect.height / 2 : window.innerHeight / 2
  const originStyle = {
    '--source-offset-x': (centerX - window.innerWidth / 2) + 'px',
    '--source-offset-y': (centerY - window.innerHeight / 2) + 'px',
  }
  return (
    <div style={originStyle} className={'project-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 sm:p-8 ' + (phase === 'expanded' ? 'overlay-expanded' : 'overlay-flip')} onPointerDown={e => { if (e.target === e.currentTarget) onClose() }}>
      {phase === 'flip' ? (
        <div className="flip-stage" aria-hidden="true" style={sourceRect ? {
          left: sourceRect.left,
          top: sourceRect.top,
          width: sourceRect.width,
          height: sourceRect.height,
        } : { left: '50%', top: '50%', width: 280, height: 340, transform: 'translate(-50%, -50%)' }}>
          <div className="flip-object">
            <div className="flip-face flip-front">
              <div className="flex justify-between gap-2 font-mono text-[8px] sm:text-[10px]"><span>{project.id} / {project.type}</span><span>{project.year}</span></div>
              <ProjectArtwork project={project}/>
              <div className="flex items-center justify-between gap-2"><strong className="text-base font-extrabold tracking-tight sm:text-xl">{project.title}</strong><ArrowUpRight size={17}/></div>
            </div>
            <div className="flip-face flip-back">
              <div className="font-mono text-xs">PROJECT FILE / {project.id}</div>
              <div className="text-4xl font-black tracking-tighter">BEHIND<br/>THE BUILD<span className="text-signal">.</span></div>
              <div className="font-mono text-xs">OPENING CASE STUDY ↗</div>
            </div>
          </div>
        </div>
      ) : (
        <section data-project-modal role="dialog" aria-modal="true" aria-labelledby="project-modal-title" className="expanded-project relative max-h-[94dvh] w-full max-w-5xl overflow-y-auto bg-paper p-4 shadow-2xl sm:p-8 lg:p-10">
          <div className="flex items-center justify-between border-b border-ink pb-3 font-mono text-[10px] sm:text-xs"><span>PROJECT FILE / {project.id} — CASE STUDY</span><button ref={closeRef} onClick={onClose} aria-label="Close project details" className="p-2 hover:text-signal"><X/></button></div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-signal"><span>{project.type}</span><span>{project.year} / INTERFACE EXCERPT</span></div>
          <h2 id="project-modal-title" className="editorial-heading my-5 text-[clamp(45px,8vw,105px)]">{project.title}<span className="text-signal">.</span></h2>
          <InterfacePreview project={project}/>
          <p className="mt-2 font-mono text-[9px] uppercase tracking-wide text-ink/60">Illustrative UI mockup — not an actual project screenshot</p>
          <div className="mt-7 grid gap-6 md:grid-cols-[1.3fr_1fr]"><div><p className="font-mono text-[10px] text-signal">THE CONCEPT</p><p className="mt-2 max-w-xl text-sm leading-relaxed sm:text-base">{project.summary}</p></div><div><p className="font-mono text-[10px] text-signal">TECHNOLOGIES</p><div className="mt-3 flex flex-wrap gap-2">{project.stack.map(t => <span className="border border-ink px-3 py-2 font-mono text-[10px]" key={t}>{t}</span>)}</div></div></div>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">{project.link && <a className="inline-flex items-center gap-2 border-b border-ink pb-1 font-mono text-xs hover:text-signal" href={project.link} target="_blank" rel="noopener noreferrer"><Github size={15}/> VIEW GITHUB REPOSITORY <ArrowUpRight size={15}/></a>}{project.live && <a className="inline-flex items-center gap-2 border-b border-ink pb-1 font-mono text-xs hover:text-signal" href={project.live} target="_blank" rel="noopener noreferrer">LIVE APPLICATION <ArrowUpRight size={15}/></a>}</div>
        </section>
      )}
    </div>
  )
}

function Work() {
  const [active, setActive] = useState(0)
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState(false)
  const toastTimer = useRef(null)
  const touchStart = useRef(null)
  const closeProject = useCallback(() => setSelected(null), [])
  const openProject = useCallback((project, element) => {
    if (project.placeholder) {
      window.clearTimeout(toastTimer.current)
      setToast(true)
      toastTimer.current = window.setTimeout(() => setToast(false), 3500)
      return
    }
    const rect = element?.getBoundingClientRect()
    setSelected({
      project,
      rect: rect ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height } : null,
    })
  }, [])
  useEffect(() => () => window.clearTimeout(toastTimer.current), [])
  const live = projects[active]
  const move = delta => setActive(current => (current + delta + projects.length) % projects.length)
  const onKey = e => { if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1) } if (e.key === 'ArrowRight') { e.preventDefault(); move(1) } }
  return (
    <section id="work" className="page-gutter work-section relative overflow-hidden py-12 md:py-20">
      <SectionLabel index="02" title="SELECTED PROJECTS" aside={`DEVELOPMENT ARCHIVE [ ${String(projects.length).padStart(2,'0')} ]`}/>
      <div className="japandi-divider mt-7" aria-hidden="true"><span className="japandi-mark">◯</span></div>
      <div className="mt-10 flex items-end justify-between gap-4"><h2 className="editorial-heading text-[clamp(70px,11vw,160px)]">SELECTED<br/><em className="text-signal">WORK.</em></h2><p className="mb-3 hidden max-w-44 font-mono text-[11px] leading-relaxed md:block">AN INTERACTIVE COLLECTION OF THINGS I'VE BUILT & EXPLORED.</p></div>
      <div className="carousel-stage relative mx-auto mt-8 h-[310px] max-w-6xl touch-pan-y outline-offset-4 sm:h-[420px]" role="region" aria-roledescription="carousel" aria-label="Selected development projects" tabIndex={0} onKeyDown={onKey} onPointerDown={e => { touchStart.current = e.clientX }} onPointerUp={e => { if (touchStart.current !== null) { const dx = e.clientX - touchStart.current; if (Math.abs(dx) > 45) move(dx < 0 ? 1 : -1) } touchStart.current = null }} onPointerCancel={() => { touchStart.current = null }}>
        {projects.map((project, i) => {
          let offset = i - active
          if (offset > projects.length / 2) offset -= projects.length
          if (offset < -projects.length / 2) offset += projects.length
          const distance = Math.abs(offset)
          return <button key={project.id} type="button" className="project-card absolute left-1/2 top-3 flex h-[285px] w-[220px] flex-col gap-2 border border-ink bg-[#faf9f4] p-2 text-left shadow-xl sm:top-5 sm:h-[370px] sm:w-[320px] sm:p-3" style={{ '--offset':offset, '--abs':distance, zIndex:20-distance, visibility:selected?.project.id === project.id ? 'hidden' : 'visible', opacity:distance > 1 ? 0.24 : 1, pointerEvents:selected || distance > 1 ? 'none':'auto', filter:distance > 0 ? 'saturate(.75)' : 'none'}} onClick={e => { if (active === i) openProject(project, e.currentTarget); else setActive(i) }} aria-label={active === i ? `Open ${project.title} project details` : `Select ${project.title} project`} aria-current={active===i ? 'true':undefined}>
            <div className="flex justify-between gap-2 font-mono text-[8px] sm:text-[10px]"><span>{project.id} / {project.type}</span><span>{project.year}</span></div>
            {project.placeholder ? <div className="coming-soon-art relative grid min-h-0 flex-1 place-items-center overflow-hidden" style={{backgroundColor:project.color}}><div className="enso-ring" aria-hidden="true"/><div className="relative text-center"><div className="font-serif text-5xl italic tracking-tighter sm:text-6xl">still</div><div className="mt-1 font-mono text-[9px] tracking-[.23em]">IN THE MAKING</div></div></div> : <ProjectArtwork project={project}/>}
            <div className="flex items-center justify-between gap-2"><strong className="text-base font-extrabold tracking-tight sm:text-xl">{project.title}</strong>{project.placeholder ? <span className="font-mono text-[10px]">SOON ↗</span> : <Github size={17} strokeWidth={1.4}/>}</div>
          </button>
        })}
      </div>
      <div className="mx-auto mt-5 flex max-w-3xl items-center justify-between gap-3">
        <button className="circle-link shrink-0" onClick={() => move(-1)} aria-label="Previous project"><ArrowLeft strokeWidth={1.4}/></button>
        <div className="project-caption min-w-0 text-center" aria-live="polite" aria-atomic="true"><div className="font-mono text-[10px] text-signal">{live.id} / {String(projects.length).padStart(2,'0')}</div><h3 className="mt-2 truncate text-xl font-extrabold tracking-[-.05em] sm:text-3xl">{live.title}</h3><p className="mt-2 max-w-md text-xs text-ink/70 sm:text-sm">{live.description}</p><button className="mt-3 inline-flex items-center gap-1 border-b border-ink font-mono text-[10px] hover:text-signal" onClick={() => openProject(live, document.querySelector('.project-card[aria-current="true"]'))}>EXPLORE PROJECT <ArrowUpRight size={13}/></button></div>
        <button className="circle-link shrink-0" onClick={() => move(1)} aria-label="Next project"><ArrowRight strokeWidth={1.4}/></button>
      </div>
      <div className="mt-12 flex justify-between gap-4 border-t border-ink pt-3 font-mono text-[9px] sm:text-[11px]"><span>← ARROWS / SWIPE TO ROTATE →</span><span className="text-right">GITHUB REPOSITORIES / CURATED PREVIEWS</span></div>
      <ProjectModal selection={selected} onClose={closeProject}/>
      {toast && <div role="status" aria-live="polite" className="archive-toast fixed bottom-6 left-1/2 z-[130] flex w-[min(90vw,420px)] -translate-x-1/2 items-center justify-between gap-5 border border-ink bg-[#f1eee5] px-5 py-4 shadow-[9px_9px_0_#19191922]"><div><div className="font-mono text-[9px] tracking-widest text-ink/55">ARCHIVE / 004</div><p className="mt-1 font-medium">great things come to those who wait.</p></div><button onClick={() => setToast(false)} aria-label="Dismiss notification" className="shrink-0 rounded-full p-2 hover:bg-ink/10"><X size={17}/></button></div>}
    </section>
  )
}

function Toolkit() {
  return <section id="tools" className="page-gutter bg-stonewash py-12 md:py-20"><SectionLabel index="03" title="SKILLS AND WORKFLOW" aside="THE TOOLKIT"/><div className="japandi-divider mt-7" aria-hidden="true"><span className="japandi-mark">◯</span></div><div className="mt-14 grid gap-10 md:grid-cols-2"><h2 className="editorial-heading text-[clamp(48px,7vw,110px)]">TOOLS OF<br/><span className="text-signal">THE TRADE.</span></h2><div>{skills.map(skill => <div key={skill.number} className="skill-row group grid grid-cols-[95px_1fr_20px] items-center gap-2 border-b border-ink py-5 first:border-t sm:grid-cols-[145px_1fr_20px]"><span className="font-mono text-[10px]">{skill.number} / {skill.category}</span><strong className="text-sm sm:text-base">{skill.items}</strong><ArrowUpRight size={16}/></div>)}</div></div></section>
}

function Contact() {
  return <footer id="contact" className="page-gutter bg-signal py-12 md:py-20"><SectionLabel index="05" title="OPEN FOR CONVERSATION" aside="THE NEXT CHAPTER ↗"/><p className="mt-16 font-mono text-xs leading-relaxed">HAVE AN IDEA? SOMETHING TO BUILD?<br/>OR JUST WANT TO SAY HELLO?</p><a className="contact-headline editorial-heading mt-5 block text-[clamp(68px,13.5vw,190px)]" href="mailto:hello@example.com">LET'S TALK ↗</a><div className="mt-12 flex flex-wrap items-center justify-between gap-5 border-t border-ink pt-5 font-mono text-[11px]"><a className="inline-flex items-center gap-1 hover:underline" href="https://github.com/mcartv" target="_blank" rel="noreferrer"><Github size={15}/> GITHUB ↗</a>{profile.linkedinUrl ? <a className="hover:underline" href={profile.linkedinUrl} target="_blank" rel="noreferrer">LINKEDIN ↗</a> : <span title="Set linkedinUrl in src/data/profile.js">LINKEDIN / PROFILE PENDING</span>}<a className="hover:underline" href="#home">BACK TO TOP ↑</a><span>INDEX/ © {new Date().getFullYear()}</span></div><p className="mt-7 font-mono text-[10px] text-ink/70">PRE-PUBLISH CHECKLIST: REPLACE SAMPLE CONTACT DETAILS, BIO, PROJECT DATA AND PROJECT IMAGERY.</p></footer>
}

export default function App() {
  const [progress,setProgress] = useState(0)
  const [filmOpen,setFilmOpen] = useState(false)
  const [certificatesOpen,setCertificatesOpen] = useState(false)
  const [arcadePhase,setArcadePhase] = useState('idle')
  const [planeCount,setPlaneCount] = useState(0)
  const planeClicks = useRef(0)
  const easterTimer = useRef(null)
  const openFilm = useCallback(() => setFilmOpen(true), [])
  const closeFilm = useCallback(() => setFilmOpen(false), [])
  const openCertificates = useCallback(() => setCertificatesOpen(true), [])
  const closeCertificates = useCallback(() => setCertificatesOpen(false), [])
  const onPlaneClick = useCallback(() => {
    if(arcadePhase!=='idle')return
    window.clearTimeout(easterTimer.current)
    planeClicks.current += 1
    if(planeClicks.current>=5){
      planeClicks.current=0
      setPlaneCount(0)
      setArcadePhase('ejecting')
      return
    }
    setPlaneCount(planeClicks.current)
    easterTimer.current=window.setTimeout(()=>{planeClicks.current=0;setPlaneCount(0)},6000)
  },[arcadePhase])
  const exitArcade=useCallback(()=>setArcadePhase('returning'),[])
  useEffect(()=>()=>window.clearTimeout(easterTimer.current),[])
  useEffect(()=>{
    if(arcadePhase!=='returning')return undefined
    const timer=window.setTimeout(()=>setArcadePhase('idle'),780)
    return ()=>window.clearTimeout(timer)
  },[arcadePhase])
  useEffect(()=>{
    if(arcadePhase!=='ejecting')return undefined
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer=window.setTimeout(()=>setArcadePhase('playing'),reduced?40:1350)
    return ()=>window.clearTimeout(timer)
  },[arcadePhase])
  useEffect(()=>{
    if(arcadePhase==='idle')return undefined
    const before=document.body.style.overflow
    document.body.style.overflow='hidden'
    return ()=>{document.body.style.overflow=before}
  },[arcadePhase])
  useEffect(() => {
    let raf = 0
    const update = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const range = document.documentElement.scrollHeight - window.innerHeight; setProgress(range > 0 ? Math.min(100, Math.max(0, window.scrollY / range * 100)) : 0) }) }
    update()
    window.addEventListener('scroll',update,{passive:true})
    window.addEventListener('resize',update)
    return () => {cancelAnimationFrame(raf);window.removeEventListener('scroll',update);window.removeEventListener('resize',update)}
  },[])

  // Replay the section reveals in both directions. Each part moves upward when
  // reached while scrolling down and downward when reached while scrolling up.
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reducedMotion.matches || !('IntersectionObserver' in window)) return undefined

    const selectors = [
      '#about .section-label', '#about .grid',
      '#work .section-label', '#work > .mt-10',
      '#work .carousel-stage', '#work .controls',
      '#tools .section-label', '#tools .grid',
      '#contact .section-label', '#contact .editorial-heading',
    ]
    selectors.push('#contact > p')
    const elements = [...document.querySelectorAll(selectors.join(','))]
    let lastY = window.scrollY
    let direction = 1
    const onScroll = () => {
      const nextY = window.scrollY
      if (Math.abs(nextY - lastY) > 2) direction = nextY > lastY ? 1 : -1
      lastY = nextY
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) {
          target.style.setProperty('--reveal-y', direction > 0 ? '74px' : '-74px')
          target.classList.add('is-visible')
        } else {
          target.classList.remove('is-visible')
        }
      })
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 })

    elements.forEach(el => {
      el.classList.add('scroll-motion')
      observer.observe(el)
    })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      elements.forEach(el => {
        el.classList.remove('scroll-motion', 'is-visible')
        el.style.removeProperty('--reveal-y')
      })
    }
  }, [])

  return <>
    <div className={'portfolio-world '+(arcadePhase==='ejecting'||arcadePhase==='playing'?'is-ejecting':arcadePhase==='returning'?'is-returning':'')}>
      <div aria-hidden="true" className="fixed left-0 top-0 z-[120] h-[3px] bg-signal" style={{width:`${progress}%`}}/>
      <Navbar onFilmOpen={openFilm}/>
      <main><Hero onPlaneClick={onPlaneClick} planeCount={planeCount}/><About onCertificatesOpen={openCertificates}/><Work/><Toolkit/></main>
      <Contact/>
    </div>
    <FilmWindow open={filmOpen} onClose={closeFilm}/>
    <CertificatesWindow open={certificatesOpen} onClose={closeCertificates}/>
    {arcadePhase==='playing'&&<ArcadeHub onExit={exitArcade}/>}
  </>
}
