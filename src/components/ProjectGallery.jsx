import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Expand, X, Image as ImageIcon } from 'lucide-react'

// The archive shows only images explicitly supplied by the portfolio owner.
export default function ProjectGallery({project, fallback}) {
  const images = Array.isArray(project.screenshots) ? project.screenshots.filter(item => item && typeof item.src === 'string' && item.src.trim()) : []
  const [active,setActive] = useState(0)
  const [lightbox,setLightbox] = useState(false)
  const [failed,setFailed] = useState({})
  useEffect(()=>{setActive(0);setLightbox(false);setFailed({})},[project.slug])
  useEffect(()=>{
    if(!lightbox)return undefined
    const handle = e => {
      if(e.key==='Escape'){e.stopPropagation();setLightbox(false)}
      if(e.key==='ArrowLeft'){e.preventDefault();setActive(i=>(i-1+images.length)%images.length)}
      if(e.key==='ArrowRight'){e.preventDefault();setActive(i=>(i+1)%images.length)}
    }
    window.addEventListener('keydown',handle,true)
    return ()=>window.removeEventListener('keydown',handle,true)
  },[lightbox,images.length])
  if (!images.length) return <div className="project-gallery-empty">
    {fallback}
    <div className="mt-2 flex items-center justify-between gap-3 border-t border-ink/20 pt-3 font-mono text-[9px] uppercase tracking-[.08em] text-ink/60"><span>Design concept / illustrative mockup</span><span>Authentic screenshots coming soon</span></div>
  </div>
  const item=images[Math.min(active,images.length-1)]
  const move = delta => setActive(i=>(i+delta+images.length)%images.length)
  return <div className="project-gallery">
    <div className="project-gallery-screen relative overflow-hidden border border-ink/30 bg-[#e7e6dd]">
      {failed[item.src] ? <div className="flex min-h-[260px] flex-col items-center justify-center gap-2 text-ink/65"><ImageIcon size={32}/><span className="font-mono text-xs">SCREENSHOT UNAVAILABLE</span></div> :
        <button type="button" className="group block w-full cursor-zoom-in" onClick={()=>setLightbox(true)} aria-label={'Enlarge screenshot: '+(item.caption||project.title)}>
          <img src={item.src} alt={item.alt||item.caption||project.title+' project screenshot'} onError={()=>setFailed(v=>({...v,[item.src]:true}))} loading="lazy" className="block max-h-[490px] min-h-[220px] w-full object-contain transition-transform duration-700 group-hover:scale-[1.02]"/>
          <span className="absolute bottom-3 right-3 flex items-center gap-2 border border-ink/30 bg-paper/95 px-3 py-2 font-mono text-[10px] opacity-90 transition-opacity group-hover:opacity-100"><Expand size={13}/> EXPAND IMAGE</span>
        </button>}
      <span className="absolute left-3 top-3 bg-paper/95 px-3 py-2 font-mono text-[10px]">FIG. {String(active+1).padStart(2,'0')} / {String(images.length).padStart(2,'0')}</span>
    </div>
    <div className="mt-3 flex items-center justify-between gap-4">
      <div className="min-w-0"><p className="font-mono text-[10px] uppercase tracking-wider text-signal">{item.label||'PROJECT INTERFACE'}</p><p className="mt-1 truncate text-sm text-ink/75">{item.caption||'Project screenshot'}</p></div>
      {images.length>1&&<div className="flex shrink-0 gap-2">
        <button type="button" onClick={()=>move(-1)} className="gallery-arrow" aria-label="Previous screenshot"><ArrowLeft size={16}/></button>
        <button type="button" onClick={()=>move(1)} className="gallery-arrow" aria-label="Next screenshot"><ArrowRight size={16}/></button>
      </div>}
    </div>
    {images.length>1&&<div className="project-gallery-thumbs mt-4 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Choose a project screenshot">
      {images.map((photo,i)=><button key={photo.src+'-'+i} type="button" onClick={()=>setActive(i)} aria-label={'Show screenshot '+(i+1)+': '+(photo.caption||project.title)} aria-pressed={i===active} className={'gallery-thumb relative h-[65px] w-[96px] shrink-0 overflow-hidden border bg-[#e7e6dd] '+(i===active?'border-signal':'border-ink/25 opacity-65 hover:opacity-100')}>
        <img src={photo.src} alt="" loading="lazy" className="h-full w-full object-cover"/>
        <span className="absolute bottom-0 left-0 bg-paper/90 px-1.5 font-mono text-[9px]">{String(i+1).padStart(2,'0')}</span>
      </button>)}
    </div>}
    {lightbox&&<div role="dialog" aria-modal="true" aria-label="Expanded project screenshot" className="project-lightbox fixed inset-0 z-[300] flex flex-col bg-[#101313]/95 p-3 text-[#f4f1e8] sm:p-6" onPointerDown={e=>{if(e.target===e.currentTarget)setLightbox(false)}}>
      <div className="flex items-center justify-between gap-3 border-b border-white/30 pb-3 font-mono text-[10px]"><span>{project.title.toUpperCase()} / FRAME {String(active+1).padStart(2,'0')}</span><button type="button" onClick={()=>setLightbox(false)} className="flex items-center gap-2 border border-white/40 px-3 py-2 hover:bg-white/15">CLOSE <X size={17}/></button></div>
      <div className="flex min-h-0 flex-1 items-center justify-center gap-2 py-4">
        {images.length>1&&<button type="button" onClick={()=>move(-1)} aria-label="Previous screenshot" className="shrink-0 border border-white/35 p-2 hover:bg-white/15"><ArrowLeft/></button>}
        <img src={item.src} alt={item.alt||item.caption||project.title} className="max-h-full min-w-0 max-w-full object-contain"/>
        {images.length>1&&<button type="button" onClick={()=>move(1)} aria-label="Next screenshot" className="shrink-0 border border-white/35 p-2 hover:bg-white/15"><ArrowRight/></button>}
      </div>
      <div className="text-center font-mono text-[10px] tracking-wider text-white/70">{item.caption||'PROJECT SCREENSHOT'} / {active+1} OF {images.length}</div>
    </div>}
  </div>
}
