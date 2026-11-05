import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Clapperboard, Grip, X } from 'lucide-react'
import { profile } from '../data/profile'
import FilmArchive from './FilmArchive'

function usePanelFocus(open, onClose) {
  const panelRef = useRef(null)
  useEffect(() => {
    if (!open) return undefined
    const previous = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.querySelector('button,[href]')?.focus()
    const handleKeys = event => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab') return
      const elements = [...(panelRef.current?.querySelectorAll('button:not([disabled]),a[href]') || [])]
        .filter(el => !el.hasAttribute('hidden'))
      if (!elements.length) { event.preventDefault(); return }
      const first = elements[0], last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', handleKeys)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeys)
      previous?.focus?.()
    }
  }, [open, onClose])
  return panelRef
}

/** A visible handle can be clicked or dragged to the left to open a panel. */
export function DragHandle({ kind, onOpen, className = '' }) {
  const originX = useRef(null)
  const didDrag = useRef(false)
  const isFilm = kind === 'film'
  const onPointerDown = event => {
    if (event.button !== 0 && event.pointerType === 'mouse') return
    originX.current = event.clientX
    didDrag.current = false
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }
  const resetPull = element => element.style.removeProperty('--drag-pull')
  const onPointerMove = event => {
    if (originX.current === null) return
    const delta = Math.min(0, Math.max(-75, event.clientX - originX.current))
    event.currentTarget.style.setProperty('--drag-pull', delta + 'px')
  }
  const onPointerUp = event => {
    if (originX.current === null) return
    const delta = event.clientX - originX.current
    originX.current = null
    resetPull(event.currentTarget)
    if (delta < -45) { didDrag.current = true; onOpen() }
  }
  return (
    <button type="button" aria-label={isFilm ? 'Open filmmaking portfolio. Click or drag left.' : 'Open certificates archive. Click or drag left.'}
      title={isFilm ? 'An unusual detail. Try pulling it to the left.' : 'Pull left to browse certificates'}
      className={(isFilm ? 'drawer-handle film-secret-tab group inline-flex items-center justify-center border border-ink/65 bg-paper text-ink/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal ' : 'drawer-handle inline-flex items-center gap-2 border border-ink bg-paper px-3 py-2 font-mono text-[10px] tracking-wider shadow-[4px_4px_0_#1919191c] transition-colors hover:bg-ink hover:text-paper ') + className}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={event => { originX.current = null; resetPull(event.currentTarget) }}
      onClick={() => { if (didDrag.current) { didDrag.current = false; return } onOpen() }}>
      {isFilm ? <><span aria-hidden="true" className="secret-tab-lines"><i /><i /></span><ArrowLeft size={11} strokeWidth={1.3} className="secret-tab-arrow" /></> : <><Grip size={13} strokeWidth={1.5} /><span>CERTIFICATES</span><ArrowLeft size={14} /></>}
    </button>
  )
}

function PanelHeader({ eyebrow, title, onClose }) {
  const origin = useRef(null)
  return (
    <header className="drawer-panel-header flex cursor-grab items-center justify-between gap-4 border-b border-current/40 px-5 py-4 sm:px-9"
      onPointerDown={e => { origin.current = e.clientX }}
      onPointerUp={e => { if (origin.current !== null && e.clientX - origin.current > 65) onClose(); origin.current = null }}
      onPointerCancel={() => { origin.current = null }}>
      <div className="flex min-w-0 items-center gap-4"><span className="font-mono text-[10px] opacity-60">{eyebrow}</span><span className="hidden truncate font-mono text-[10px] sm:inline">{title}</span></div>
      <button type="button" onClick={onClose} className="inline-flex shrink-0 items-center gap-2 border border-current px-3 py-2 font-mono text-[10px] hover:opacity-60">CLOSE <X size={14} /></button>
    </header>
  )
}

export function FilmWindow({ open, onClose }) {
  const panelRef = usePanelFocus(open, onClose)
  return (
    <div className={'drawer-layer film-layer ' + (open ? 'is-open' : '')} aria-hidden={!open}>
      <div className="drawer-scrim" onClick={onClose} aria-hidden="true"/>
      <section ref={panelRef} inert={!open ? true : undefined} role="dialog" aria-modal="true" aria-labelledby="film-window-title"
        className="drawer-surface film-window flex h-full w-full flex-col overflow-hidden bg-[#0d0d0e] text-[#eee8de]">
        <PanelHeader eyebrow="02 / THE OTHER PRACTICE" title="THE CINEMA ARCHIVE" onClose={onClose}/>
        <FilmArchive open={open} onClose={onClose}/>
      </section>
    </div>
  )
}

function formatCertificateDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return value || 'DATE PENDING'
  const date = new Date(value + 'T12:00:00')
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-US', {month:'short',day:'2-digit',year:'numeric'}).format(date)
}

function CertificateVisual({ entry }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [entry.image])
  if (!entry.image || failed) return (
    <div className="certificate-placeholder mt-5 flex min-h-[170px] flex-col items-center justify-center gap-3 border border-[#aaa596] bg-[#eae7dd] px-5 py-10 text-center">
      <span aria-hidden="true" className="font-serif text-5xl italic text-[#828d7a]">✳</span>
      <span className="font-mono text-[10px] tracking-widest text-[#5b6257]">DOCUMENT PREVIEW UNAVAILABLE</span>
      <span className="max-w-[260px] text-xs leading-5 text-[#77766c]">The certificate image needs to be uploaded or replaced in Content Studio.</span>
    </div>
  )
  return <a href={entry.url || entry.image} target="_blank" rel="noopener noreferrer" aria-label={'View certificate: ' + entry.title} className="certificate-image-link mt-5 block overflow-hidden border border-[#aaa596] bg-white">
    <img src={entry.image} alt={'Certificate: ' + entry.title} onError={() => setFailed(true)} loading="lazy" className="mx-auto block h-auto max-h-[460px] w-full object-contain transition-transform duration-500 hover:scale-[1.025]"/>
  </a>
}

export function CertificatesWindow({ open, onClose }) {
  const panelRef = usePanelFocus(open, onClose)
  return (
    <div className={'drawer-layer certificate-layer ' + (open ? 'is-open' : '')} aria-hidden={!open}>
      <div className="drawer-scrim" onClick={onClose} aria-hidden="true" />
      <section ref={panelRef} inert={!open ? true : undefined} role="dialog" aria-modal="true" aria-labelledby="cert-window-title"
        className="drawer-surface certificate-window ml-auto flex h-full w-full max-w-[680px] flex-col bg-[#ede9df] text-ink shadow-[-20px_0_70px_#0002]">
        <PanelHeader eyebrow="ARCHIVE / 003" title="LEARNING & CREDENTIALS" onClose={onClose} />
        <div className="certificate-scroll flex-1 overflow-y-auto px-5 py-8 sm:px-10 sm:py-12">
          <div className="font-mono text-[10px] tracking-widest text-[#716f63]">A COLLECTION IN PROGRESS</div>
          <h2 id="cert-window-title" className="editorial-heading mt-3 text-[clamp(56px,8vw,96px)]">LIFELONG<br /><span className="font-serif font-normal italic text-[#6e7967]">learning.</span></h2>
          <p className="mt-5 max-w-md text-sm leading-7">A growing archive of courses, seminars, and certifications. Open any available image to inspect the full document.</p>
          <div className="japandi-divider my-8" aria-hidden="true"><span className="japandi-mark">◯</span></div>
          <div className="space-y-4">
            {profile.learning.map((entry, i) => (
              <article className="certificate-entry border border-[#aaa596] bg-[#f8f6f0] p-5 sm:p-7" key={i}>
                <div className="flex items-start justify-between gap-3 font-mono text-[10px] text-[#77766c]"><span>{String(i+1).padStart(2,'0')} / {entry.label}</span><span>{formatCertificateDate(entry.date)}</span></div>
                <CertificateVisual entry={entry}/>
                <h3 className="mt-6 text-xl font-bold tracking-tight sm:text-2xl">{entry.title}</h3>
                <p className="mt-2 text-sm text-[#66665f]">{entry.issuer}</p>
                {entry.url ? <a className="mt-6 inline-flex items-center gap-2 border-b border-ink pb-1 font-mono text-[10px]" href={entry.url} target="_blank" rel="noopener noreferrer">VIEW CERTIFICATE <ArrowUpRight size={14} /></a> : <div className="mt-6 font-mono text-[10px] text-[#8c877c]">DOCUMENT TO BE ADDED ↗</div>}
              </article>
            ))}
          </div>
          <div className="mt-10 border-t border-[#aaa596] pt-5 font-mono text-[10px] text-[#68665e]">SCROLL TO EXPLORE THE ARCHIVE ↑ / UPDATED AS I LEARN</div>
        </div>
      </section>
    </div>
  )
}
