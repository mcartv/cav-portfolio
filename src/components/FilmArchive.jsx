import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Aperture, Film, Maximize2, Pause, Play } from 'lucide-react'
import { profile } from '../data/profile'

const entries = () => Array.isArray(profile.films) ? profile.films.filter(f => f && f.title && f.placeholder !== true) : []
const tone = {red:'#f25b4f',cream:'#e8e1d4',muted:'#aaa6a0'}

function FilmFrame({film,active,serial=1,onClick}) {
  const [broken,setBroken]=useState(false)
  useEffect(()=>setBroken(false),[film?.poster])
  return <button type="button" aria-label={film?'View film '+film.title:'Explore visual archive'} onClick={onClick} className={'cinema-frame group relative block w-full overflow-hidden border border-white/20 text-left '+(active?'is-selected':'')}>
    <div className="cinema-frame-visual relative aspect-[16/10] overflow-hidden bg-[#242426]">
      {film?.poster&&!broken?<img src={film.poster} onError={()=>setBroken(true)} alt={film.title+' film still'} className="absolute inset-0 h-full w-full object-cover" loading="lazy"/>:
        <div className="cinema-abstract absolute inset-0" aria-hidden="true"><span className="cinema-abstract-horizon"/><span className="cinema-abstract-orb"/><span className="cinema-abstract-shadow"/></div>}
      <div className="cinema-filmgrain absolute inset-0" aria-hidden="true"/>
      <span className="absolute left-4 top-4 z-10 font-mono text-[9px] tracking-[.2em] text-white/75">CAV / {String(serial).padStart(3,'0')}</span>
      <span className="absolute right-4 top-4 z-10 h-2 w-2 rounded-full bg-[#f25b4f] shadow-[0_0_16px_#f25b4f80]" aria-hidden="true"/>
      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 to-transparent px-4 pb-4 pt-10"><span className="font-mono text-[9px] uppercase tracking-[.18em] text-white/65">{film?.format||'UNRELEASED / A STUDY IN PROGRESS'}</span><p className="mt-1 text-xl font-black uppercase tracking-[-.055em] text-white sm:text-2xl">{film?.title||'A FRAME YET TO BE FILLED'}<span className="text-[#f25b4f]">.</span></p></div>
    </div>
  </button>
}

export default function FilmArchive({open,onClose}) {
  const films=entries()
  const [index,setIndex]=useState(0)
  const [view,setView]=useState('reel')
  const [playing,setPlaying]=useState(true)
  const [lightbox,setLightbox]=useState(false)
  const [imageFailed,setImageFailed]=useState(false)
  const stageRef=useRef(null)
  const current=films[Math.min(index,films.length-1)]
  useEffect(()=>{if(!open){setLightbox(false);setView('reel');setIndex(0);setPlaying(true)}},[open])
  useEffect(()=>setImageFailed(false),[current?.poster])
  useEffect(()=>{
    if(!open)return undefined
    const onKey=e=>{
      if(lightbox){if(e.key==='Escape'){e.stopImmediatePropagation?.();setLightbox(false);return} }
      if(e.key==='ArrowLeft'&&films.length>1){e.preventDefault();setIndex(i=>(i-1+films.length)%films.length)}
      if(e.key==='ArrowRight'&&films.length>1){e.preventDefault();setIndex(i=>(i+1)%films.length)}
    }
    document.addEventListener('keydown',onKey,true)
    return()=>document.removeEventListener('keydown',onKey,true)
  },[open,lightbox,films.length])
  const change=delta=>setIndex(i=>(i+delta+films.length)%films.length)
  return <div className={'cinema-archive relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#0d0d0e] text-[#eee8de] '+(playing?'cinema-playing':'cinema-paused')} ref={stageRef}>
    <div className="cinema-filmgrain pointer-events-none absolute inset-0 z-[1]" aria-hidden="true"/>
    <div className="cinema-iris pointer-events-none absolute inset-0 z-[15]" aria-hidden="true"/>
    <div className="cinema-reading relative z-[2] mx-auto w-full max-w-[1600px] px-[5%] pb-10 pt-8 sm:px-[7%] sm:pt-12">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-white/20 pb-4 font-mono text-[10px] tracking-[.15em] text-white/55">
        <span className="flex items-center gap-2"><span className="cinema-rec-dot"/> THE OTHER PRACTICE / FILM ARCHIVE</span>
        <div className="flex items-center gap-3"><span>PRIVATE INDEX / VOL. 00</span><button type="button" onClick={()=>setPlaying(v=>!v)} className="inline-flex items-center gap-1 border border-white/25 px-2.5 py-1.5 text-white/70 transition-colors hover:bg-white/10" aria-label={playing?'Pause ambient archive motion':'Resume ambient archive motion'}>{playing?<Pause size={12}/>:<Play size={12}/>} {playing?'MOTION ON':'MOTION OFF'}</button></div>
      </div>
      <div className="cinema-hero grid items-end gap-9 border-b border-white/20 pb-9 lg:grid-cols-[1.2fr_.8fr] lg:gap-12">
        <div>
          <div className="cinema-reveal cinema-reveal-1 mb-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[.23em] text-[#f25b4f]"><Aperture size={19} strokeWidth={1.2}/> CRAFT / MOTION / STORY</div>
          <h2 id="film-window-title" className="cinema-headline cinema-reveal cinema-reveal-2 max-w-[900px] text-[clamp(56px,9vw,152px)] font-black uppercase leading-[.78] tracking-[-.085em]">BEYOND<br/><span className="text-[#f25b4f]">THE</span> CODE<span className="text-[#f25b4f]">.</span></h2>
        </div>
        <div className="cinema-reveal cinema-reveal-3 max-w-md lg:pb-2">
          <p className="font-serif text-[clamp(22px,2.6vw,37px)] italic leading-[1.22] text-[#e8e1d4]">Some stories are written in light, not syntax.</p>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/55">A personal space for moving images, composition and visual storytelling. A second creative practice—still taking shape.</p>
          <div className="mt-7 flex items-center gap-3 font-mono text-[10px] tracking-[.18em] text-white/45"><span className="h-px w-12 bg-[#f25b4f]"/> INDEPENDENT VISUAL ARCHIVE</div>
        </div>
      </div>

      <div className="cinema-reveal cinema-reveal-4 mt-9 flex flex-wrap items-center justify-between gap-4 border-b border-white/20 pb-4">
        <div className="flex gap-6 font-mono text-[10px] tracking-[.15em]">
          <button type="button" onClick={()=>setView('reel')} className={'cinema-view-tab pb-2 '+(view==='reel'?'is-active':'')}>01 / THE REEL</button>
          <button type="button" onClick={()=>setView('notes')} className={'cinema-view-tab pb-2 '+(view==='notes'?'is-active':'')}>02 / THE PROCESS</button>
        </div>
        <span className="font-mono text-[10px] text-white/45">{String(films.length).padStart(2,'0')} / RELEASED FRAMES</span>
      </div>

      {view==='reel' ? <div className="cinema-reel-content cinema-reveal cinema-reveal-5 mt-7">
        {current ? <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)] xl:gap-10">
          <div className="relative">
            <FilmFrame film={current} active onClick={()=>current.poster&&setLightbox(true)} serial={index+1}/>
            <div className="mt-4 flex items-center justify-between gap-3 font-mono text-[10px] text-white/55"><span>FRAME {String(index+1).padStart(2,'0')} / {String(films.length).padStart(2,'0')}</span><div className="flex gap-2"><button onClick={()=>change(-1)} aria-label="Previous film" className="cinema-arrow"><ArrowLeft size={18}/></button><button onClick={()=>change(1)} aria-label="Next film" className="cinema-arrow"><ArrowRight size={18}/></button></div></div>
          </div>
          <div className="flex flex-col justify-between border-l border-white/15 pl-5 sm:pl-8">
            <div><p className="font-mono text-[10px] tracking-[.22em] text-[#f25b4f]">FEATURED WORK / {String(index+1).padStart(3,'0')}</p><h3 className="mt-5 text-[clamp(35px,4.5vw,72px)] font-black uppercase leading-[.93] tracking-[-.075em]">{current.title}<span className="text-[#f25b4f]">.</span></h3><p className="mt-4 font-mono text-[11px] tracking-wider text-white/45">{[current.year,current.format,current.role].filter(Boolean).join('  /  ')}</p><p className="mt-8 whitespace-pre-line text-sm leading-8 text-white/65">{current.description||'A work in moving images.'}</p></div>
            <div className="mt-9 flex flex-wrap items-center gap-4">{current.link&&<a href={current.link} target="_blank" rel="noopener noreferrer" className="cinema-link inline-flex items-center gap-3 border-b border-[#f25b4f] pb-2 font-mono text-[11px] text-[#f5d8d1]">VIEW THE FILM <ArrowUpRight size={17}/></a>}{current.poster&&<button onClick={()=>setLightbox(true)} className="cinema-link inline-flex items-center gap-2 border-b border-white/30 pb-2 font-mono text-[11px] text-white/65">VIEW FRAME <Maximize2 size={15}/></button>}</div>
          </div>
        </div> : <div className="cinema-empty grid gap-7 lg:grid-cols-[1.35fr_.65fr] lg:gap-10">
          <FilmFrame serial={0} onClick={()=>setView('notes')}/>
          <div className="flex flex-col justify-center border-l border-white/15 pl-6 sm:pl-8"><span className="font-mono text-[10px] tracking-[.23em] text-[#f25b4f]">ARCHIVE STATUS / NOT YET RELEASED</span><h3 className="mt-5 text-[clamp(36px,5vw,66px)] font-black uppercase leading-[.92] tracking-[-.07em]">THE FIRST<br/>FRAME IS<br/><span className="font-serif font-normal italic text-[#f25b4f]">coming.</span></h3><p className="mt-6 max-w-sm text-sm leading-7 text-white/55">There are no published films in this archive yet. Rather than invent credits, this space is reserved for real projects, stills and stories.</p><span className="mt-8 font-mono text-[10px] tracking-widest text-white/35">REEL 00 / A WORK IN PROGRESS</span></div>
        </div>}
        {films.length>1&&<div className="cinema-filmstrip mt-10 flex gap-3 overflow-x-auto pb-3">{films.map((film,i)=><button key={film.title+'-'+i} onClick={()=>setIndex(i)} className={'cinema-filmstrip-item relative w-[180px] shrink-0 border p-2 text-left '+(index===i?'border-[#f25b4f]':'border-white/20')} aria-label={'Select '+film.title}><div className="h-20 overflow-hidden bg-[#242426]">{film.poster?<img src={film.poster} alt="" className="h-full w-full object-cover"/>:<div className="cinema-abstract h-full w-full"/>}</div><span className="mt-2 block truncate font-mono text-[10px] text-white/70">{String(i+1).padStart(2,'0')} / {film.title}</span></button>)}</div>}
      </div> : <div className="cinema-process cinema-reveal cinema-reveal-5 grid gap-9 py-12 lg:grid-cols-[.8fr_1.2fr]">
        <div className="cinema-process-glyph flex min-h-[260px] items-center justify-center border border-white/20 bg-[#171719]"><div className="cinema-process-lens"><Aperture size={75} strokeWidth={.7}/></div></div>
        <div className="flex flex-col justify-center"><p className="font-mono text-[10px] tracking-[.2em] text-[#f25b4f]">PROCESS NOTES / 001</p><h3 className="mt-5 text-[clamp(35px,5vw,72px)] font-black uppercase leading-[.95] tracking-[-.07em]">OBSERVE.<br/>COMPOSE.<br/><span className="text-[#f25b4f]">REPEAT.</span></h3><p className="mt-7 max-w-lg text-sm leading-8 text-white/60">A place to explore framing, pacing, visual rhythm and the craft behind moving images. Actual film projects and production notes can be added through the Content Studio as they become ready.</p></div>
      </div>}

      <footer className="cinema-footer mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/20 pt-6 font-mono text-[9px] tracking-[.17em] text-white/45"><span>INDEX / CINEMA DIVISION</span><span>EVERY FRAME / AN INTENTIONAL CHOICE</span><button onClick={onClose} className="inline-flex items-center gap-2 text-white/70 transition-colors hover:text-[#f25b4f]">RETURN TO THE INDEX <ArrowRight size={14}/></button></footer>
    </div>
    {lightbox&&current?.poster&&<div className="cinema-lightbox fixed inset-0 z-[30] flex flex-col bg-[#030304]/95 p-5" role="dialog" aria-modal="true" aria-label={'Film still: '+current.title}><div className="flex justify-between gap-3 border-b border-white/20 pb-3 font-mono text-xs"><span>FRAME / {current.title}</span><button onClick={()=>setLightbox(false)} className="border border-white/30 px-4 py-2 hover:bg-white/15">CLOSE ×</button></div><div className="flex min-h-0 flex-1 items-center justify-center"><img src={current.poster} onError={()=>setImageFailed(true)} alt={current.title+' film poster'} className="max-h-full max-w-full object-contain"/>{imageFailed&&<p>FRAME UNAVAILABLE</p>}</div></div>}
  </div>
}
