import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Asterisk, Github, Menu, X } from 'lucide-react'
import { projects } from './data/projects'

const skills = [
  { number: '01', category: 'FRONTEND', items: 'React, JavaScript, HTML, CSS' },
  { number: '02', category: 'BACKEND', items: 'Node.js, Express, Python' },
  { number: '03', category: 'DATABASES', items: 'PostgreSQL, Supabase, MongoDB' },
  { number: '04', category: 'WORKFLOW', items: 'Git, GitHub, Vercel, Figma' },
]

function SectionLabel({ index, title, aside, dark = false }) {
  return (
    <div className={`section-label flex items-start justify-between gap-4 border-t pt-3 font-mono text-[10px] leading-relaxed tracking-wide sm:text-[11px] ${dark ? 'border-white/40' : 'border-ink'}`}>
      <span>{index} / {title}</span>
      <span className="text-right">{aside}</span>
    </div>
  )
}

function Navbar() {
  const [open, setOpen] = useState(false)
  const links = [['ABOUT', '#about'], ['WORK', '#work'], ['FILM', '#film'], ['CONTACT', '#contact']]
  return (
    <header className="site-header relative z-50 flex items-center justify-between gap-4 border-b border-ink px-[5%] py-4 sm:py-5">
      <a href="#home" aria-label="INDEX portfolio home" className="font-black text-3xl tracking-[-.11em]">INDEX<span className="text-signal">/</span></a>
      <span className="hidden font-mono text-[10px] tracking-wider lg:block">CREATIVE DEVELOPER — PORTFOLIO 2026</span>
      <button className="md:hidden p-2" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? <X size={23} /> : <Menu size={23} />}
      </button>
      <nav aria-label="Main navigation" className={`${open ? 'flex' : 'hidden'} absolute top-full left-0 right-0 flex-col gap-5 border-b border-ink bg-paper px-[5%] py-7 font-mono text-xs md:static md:flex md:flex-row md:gap-7 md:border-0 md:bg-transparent md:p-0`}>
        {links.map(([name, href]) => <a key={name} href={href} className="transition-colors hover:text-signal focus-visible:text-signal" onClick={() => setOpen(false)}>{name}</a>)}
      </nav>
    </header>
  )
}

function Hero() {
  return (
    <section id="home" className="page-gutter hero flex min-h-[min(820px,calc(100svh-70px))] flex-col justify-between py-8">
      <div className="flex justify-between gap-4 font-mono text-[9px] tracking-wider sm:text-[11px]"><span>[ PORTFOLIO — VOL. 001 ]</span><span className="text-right">DESIGN × TECHNOLOGY × STORYTELLING</span></div>
      <div className="hero-headline my-16" aria-label="Crafting digital things that matter">
        <h1>CRAFTING</h1>
        <h1>DIGITAL <em>THINGS.</em></h1>
        <h1>THAT <span className="outline-word">MATTER.</span></h1>
      </div>
      <div>
        <div className="flex items-end justify-between gap-5">
          <div className="max-w-sm"><span className="font-mono text-[11px] text-signal">HELLO, I'M A CREATIVE DEVELOPER.</span><p className="mt-3 text-sm leading-relaxed sm:text-lg">Building considered digital experiences and exploring stories through a different lens.</p></div>
          <a href="#work" aria-label="Explore selected work" className="circle-link shrink-0"><ArrowDown strokeWidth={1.5} size={30}/></a>
        </div>
        <div className="mt-10 flex justify-between gap-4 border-t border-ink pt-3 font-mono text-[9px] sm:text-[11px]"><span>CURATED DIGITAL ARCHIVE</span><span>SCROLL TO EXPLORE ↓</span></div>
      </div>
    </section>
  )
}

function About() {
  return (
    <section id="about" className="page-gutter bg-stonewash py-10 md:py-20">
      <SectionLabel index="01" title="THE PERSON BEHIND THE SCREEN" aside="ABOUT ME ↘"/>
      <div className="grid gap-10 pt-16 md:grid-cols-[1fr_2.1fr]">
        <Asterisk size={95} strokeWidth={1.2} className="text-signal"/>
        <div>
          <h2 className="editorial-heading text-[clamp(38px,6.6vw,93px)]">TECHNICAL<br/>BY TRAINING.<br/><span className="text-signal">CREATIVE<br className="hidden md:block"/> BY NATURE.</span></h2>
          <p className="mt-8 max-w-xl text-base leading-[1.8]">I work at the intersection of functional technology and thoughtful visual design. I enjoy building practical software, exploring unfamiliar interfaces, and finding ways to tell meaningful stories.</p>
          <div className="mt-8 flex flex-wrap gap-2">{['FRONTEND', 'BACKEND', 'DATABASES', 'VISUAL STORYTELLING'].map(item => <span key={item} className="border border-ink px-3 py-2 font-mono text-[10px]">{item}</span>)}</div>
        </div>
      </div>
    </section>
  )
}

function ProjectArtwork({ project }) {
  return (
    <div className="artwork relative grid min-h-0 flex-1 place-items-center overflow-hidden" style={{ backgroundColor: project.color }}>
      <div className="art-orbit absolute inset-[12%] rounded-full border border-ink/20"/>
      <div className="art-orbit absolute inset-[23%] rounded-full border border-dashed border-ink/30"/>
      <div className="art-window relative flex h-[65%] w-[73%] rotate-[-7deg] flex-col border border-ink bg-[#faf9f3] p-3 shadow-[12px_13px_0px_#00000017]">
        <div className="flex gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-ink"/><i className="h-1.5 w-1.5 rounded-full bg-ink/40"/><i className="h-1.5 w-1.5 rounded-full bg-ink/20"/></div>
        <div className="my-auto"><div className="text-[clamp(25px,4vw,47px)] font-black leading-none tracking-[-.09em]">{project.mark}<span className="text-signal">.</span></div><div className="mt-2 h-1.5 w-4/5 bg-ink/25"/><div className="mt-2 h-1.5 w-1/2 bg-ink/15"/></div>
        <div className="font-mono text-[8px] tracking-wide">{project.slug.toUpperCase()}</div>
      </div>
      <span className="absolute bottom-3 right-3 font-mono text-[9px]">ARCHIVE / {project.id}</span>
    </div>
  )
}

function ProjectModal({ project, onClose }) {
  const closeRef = useRef(null)
  useEffect(() => {
    if (!project) return undefined
    const previous = document.activeElement
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = e => { if (e.key === 'Escape') onClose(); if (e.key === 'Tab') { const nodes = [...document.querySelectorAll('[data-project-modal] a,[data-project-modal] button')]; const first = nodes[0]; const last = nodes[nodes.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() } } }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = oldOverflow; window.removeEventListener('keydown', onKey); previous?.focus?.() }
  }, [project, onClose])
  if (!project) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 sm:p-8" onPointerDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <section data-project-modal role="dialog" aria-modal="true" aria-labelledby="project-modal-title" className="max-h-[92vh] w-full max-w-3xl overflow-y-auto bg-paper p-6 shadow-2xl sm:p-10">
        <div className="flex items-center justify-between border-b border-ink pb-3 font-mono text-[11px]"><span>PROJECT FILE / {project.id}</span><button ref={closeRef} onClick={onClose} aria-label="Close project details" className="p-2 hover:text-signal"><X/></button></div>
        <div className="mt-7 font-mono text-[11px] text-signal">{project.type} — {project.year}</div>
        <h2 id="project-modal-title" className="editorial-heading mt-3 text-[clamp(42px,8vw,92px)]">{project.title}</h2>
        <div className="my-7 flex min-h-52 items-center justify-center border border-ink p-6" style={{background:project.color}}><span className="text-[clamp(100px,20vw,200px)] font-black leading-none tracking-[-.1em]">{project.mark}<span className="text-signal">.</span></span></div>
        <p className="max-w-xl text-base leading-relaxed">{project.summary}</p>
        <div className="mt-6 flex flex-wrap gap-2">{project.stack.map(t => <span className="border border-ink px-3 py-2 font-mono text-[10px]" key={t}>{t}</span>)}</div>
        {project.link ? <a className="mt-8 inline-flex items-center gap-2 border-b border-ink pb-1 font-mono text-xs hover:text-signal" href={project.link} target="_blank" rel="noopener noreferrer">VIEW REPOSITORY <ArrowUpRight size={15}/></a> : <p className="mt-7 font-mono text-xs text-ink/65">DETAILED CASE STUDY COMING SOON.</p>}
      </section>
    </div>
  )
}

function Work() {
  const [active, setActive] = useState(0)
  const [selected, setSelected] = useState(null)
  const touchStart = useRef(null)
  const live = projects[active]
  const move = delta => setActive(current => (current + delta + projects.length) % projects.length)
  const onKey = e => { if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1) } if (e.key === 'ArrowRight') { e.preventDefault(); move(1) } }
  return (
    <section id="work" className="page-gutter overflow-hidden py-12 md:py-20">
      <SectionLabel index="02" title="SELECTED PROJECTS" aside={`DEVELOPMENT ARCHIVE [ ${String(projects.length).padStart(2,'0')} ]`}/>
      <div className="mt-10 flex items-end justify-between gap-4"><h2 className="editorial-heading text-[clamp(70px,11vw,160px)]">SELECTED<br/><em className="text-signal">WORK.</em></h2><p className="mb-3 hidden max-w-44 font-mono text-[11px] leading-relaxed md:block">AN INTERACTIVE COLLECTION OF THINGS I'VE BUILT & EXPLORED.</p></div>
      <div className="carousel-stage relative mx-auto mt-8 h-[310px] max-w-6xl touch-pan-y outline-offset-4 sm:h-[420px]" role="region" aria-roledescription="carousel" aria-label="Selected development projects" tabIndex={0} onKeyDown={onKey} onPointerDown={e => { touchStart.current = e.clientX }} onPointerUp={e => { if (touchStart.current !== null) { const dx = e.clientX - touchStart.current; if (Math.abs(dx) > 45) move(dx < 0 ? 1 : -1) } touchStart.current = null }} onPointerCancel={() => { touchStart.current = null }}>
        {projects.map((project, i) => {
          let offset = i - active
          if (offset > projects.length / 2) offset -= projects.length
          if (offset < -projects.length / 2) offset += projects.length
          const distance = Math.abs(offset)
          return <button key={project.id} type="button" className="project-card absolute left-1/2 top-3 flex h-[285px] w-[220px] -translate-x-1/2 flex-col gap-2 border border-ink bg-[#faf9f4] p-2 text-left shadow-xl sm:top-5 sm:h-[370px] sm:w-[320px] sm:p-3" style={{ '--offset':offset, '--abs':distance, zIndex:20-distance, opacity:distance > 1 ? 0.24 : 1, pointerEvents:distance > 1 ? 'none':'auto', filter:distance > 0 ? 'saturate(.75)' : 'none'}} onClick={() => { if (active === i) setSelected(project); else setActive(i) }} aria-label={active === i ? `Open ${project.title} project details` : `Select ${project.title} project`} aria-current={active===i ? 'true':undefined}>
            <div className="flex justify-between gap-2 font-mono text-[8px] sm:text-[10px]"><span>{project.id} / {project.type}</span><span>{project.year}</span></div>
            <ProjectArtwork project={project}/>
            <div className="flex items-center justify-between gap-2"><strong className="text-base font-extrabold tracking-tight sm:text-xl">{project.title}</strong><ArrowUpRight size={17} strokeWidth={1.4}/></div>
          </button>
        })}
      </div>
      <div className="mx-auto mt-5 flex max-w-3xl items-center justify-between gap-3">
        <button className="circle-link shrink-0" onClick={() => move(-1)} aria-label="Previous project"><ArrowLeft strokeWidth={1.4}/></button>
        <div className="min-w-0 text-center" aria-live="polite" aria-atomic="true"><div className="font-mono text-[10px] text-signal">{live.id} / {String(projects.length).padStart(2,'0')}</div><h3 className="mt-2 truncate text-xl font-extrabold tracking-[-.05em] sm:text-3xl">{live.title}</h3><p className="mt-2 max-w-md text-xs text-ink/70 sm:text-sm">{live.description}</p><button className="mt-3 inline-flex items-center gap-1 border-b border-ink font-mono text-[10px] hover:text-signal" onClick={() => setSelected(live)}>EXPLORE PROJECT <ArrowUpRight size={13}/></button></div>
        <button className="circle-link shrink-0" onClick={() => move(1)} aria-label="Next project"><ArrowRight strokeWidth={1.4}/></button>
      </div>
      <div className="mt-12 flex justify-between gap-4 border-t border-ink pt-3 font-mono text-[9px] sm:text-[11px]"><span>← ARROWS / SWIPE TO ROTATE →</span><span className="text-right">PROJECT IMAGES: PLACEHOLDERS</span></div>
      <ProjectModal project={selected} onClose={() => setSelected(null)}/>
    </section>
  )
}

function Toolkit() {
  return <section id="tools" className="page-gutter bg-stonewash py-12 md:py-20"><SectionLabel index="03" title="SKILLS AND WORKFLOW" aside="THE TOOLKIT"/><div className="mt-14 grid gap-10 md:grid-cols-2"><h2 className="editorial-heading text-[clamp(48px,7vw,110px)]">TOOLS OF<br/><span className="text-signal">THE TRADE.</span></h2><div>{skills.map(skill => <div key={skill.number} className="grid grid-cols-[95px_1fr_20px] items-center gap-2 border-b border-ink py-5 first:border-t sm:grid-cols-[145px_1fr_20px]"><span className="font-mono text-[10px]">{skill.number} / {skill.category}</span><strong className="text-sm sm:text-base">{skill.items}</strong><ArrowUpRight size={16}/></div>)}</div></div></section>
}

function Film() {
  return <section id="film" className="page-gutter bg-[#171717] py-12 text-paper md:py-20"><SectionLabel index="04" title="THE OTHER SIDE" aside="● ARCHIVE OFFLINE" dark/><p className="mt-14 font-mono text-[11px] text-paper/60">DIRECTORY: /CREATIVE/FILM/</p><div className="error-code mt-4 font-black leading-none tracking-[-.13em]">404<span className="text-signal">_</span></div><h2 className="editorial-heading text-[clamp(55px,9vw,130px)]">NO FRAMES<br/>TO SHOW. <span className="text-signal">YET.</span></h2><p className="mt-8 text-sm leading-relaxed text-paper/70 sm:text-base">Some stories are still waiting to be told.<br/>The filmmaking archive hasn't been developed yet.</p><div className="mt-8 max-w-lg border border-white/40 p-5 font-mono text-[10px] sm:text-xs">{[['REQUEST','/archive/film'],['FILES FOUND','000'],['RESPONSE','AWAITING FIRST FRAME_']].map(([a,b]) => <div className="flex justify-between gap-5 py-2" key={a}><span className="text-paper/50">{a}</span><span className={a==='RESPONSE'?'text-signal':''}>{b}</span></div>)}</div><div className="mt-20 flex justify-between gap-4 border-t border-white/40 pt-3 font-mono text-[10px]"><span>◉ FILM REEL 00:00:00:00</span><span className="text-right">TO BE CONTINUED →</span></div></section>
}

function Contact() {
  return <footer id="contact" className="page-gutter bg-signal py-12 md:py-20"><SectionLabel index="05" title="OPEN FOR CONVERSATION" aside="THE NEXT CHAPTER ↗"/><p className="mt-16 font-mono text-xs leading-relaxed">HAVE AN IDEA? SOMETHING TO BUILD?<br/>OR JUST WANT TO SAY HELLO?</p><a className="editorial-heading mt-5 block text-[clamp(68px,13.5vw,190px)] transition-transform duration-300 hover:translate-x-2" href="mailto:hello@example.com">LET'S TALK ↗</a><div className="mt-12 flex flex-wrap items-center justify-between gap-5 border-t border-ink pt-5 font-mono text-[11px]"><a className="inline-flex items-center gap-1 hover:underline" href="https://github.com/mcartv" target="_blank" rel="noreferrer"><Github size={15}/> GITHUB ↗</a><a className="hover:underline" href="https://www.linkedin.com/" target="_blank" rel="noreferrer">LINKEDIN ↗</a><a className="hover:underline" href="#home">BACK TO TOP ↑</a><span>INDEX/ © {new Date().getFullYear()}</span></div><p className="mt-7 font-mono text-[10px] text-ink/70">PRE-PUBLISH CHECKLIST: REPLACE SAMPLE CONTACT DETAILS, BIO, PROJECT DATA AND PROJECT IMAGERY.</p></footer>
}

export default function App() {
  const [progress,setProgress] = useState(0)
  useEffect(() => {
    let raf = 0
    const update = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const range = document.documentElement.scrollHeight - window.innerHeight; setProgress(range > 0 ? Math.min(100, Math.max(0, window.scrollY / range * 100)) : 0) }) }
    update()
    window.addEventListener('scroll',update,{passive:true})
    window.addEventListener('resize',update)
    return () => {cancelAnimationFrame(raf);window.removeEventListener('scroll',update);window.removeEventListener('resize',update)}
  },[])
  return <><div aria-hidden="true" className="fixed left-0 top-0 z-[120] h-[3px] bg-signal" style={{width:`${progress}%`}}/><Navbar/><main><Hero/><About/><Work/><Toolkit/><Film/></main><Contact/></>
}
