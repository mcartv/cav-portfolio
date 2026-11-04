import { useEffect, useRef } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Clapperboard, Grip, X } from 'lucide-react'
import { profile } from '../data/profile'

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
      <div className="drawer-scrim" onClick={onClose} aria-hidden="true" />
      <section ref={panelRef} inert={!open ? true : undefined} role="dialog" aria-modal="true" aria-labelledby="film-window-title"
        className="drawer-surface film-window flex h-full w-full flex-col bg-[#080809] text-[#f1f0ec]">
        <PanelHeader eyebrow="02 / THE OTHER PRACTICE" title="THE CINEMA ARCHIVE" onClose={onClose} />
        <div className="film-window-content relative flex flex-1 flex-col justify-center overflow-y-auto px-[7%] py-14 sm:px-[10%]">
          <div className="film-grid pointer-events-none absolute inset-0 opacity-20" aria-hidden="true" />
          <div className="relative max-w-5xl">
            <div className="mb-8 flex items-center gap-3 font-mono text-[10px] tracking-[.25em] text-[#ff443f]"><Clapperboard size={18} /> [ ACCESS / NOT QUITE YET ]</div>
            <div className="film-glitch mb-7 font-black leading-[.86] tracking-[-.085em] text-[#fa423b]" id="film-window-title">NOT EVERY<br />FRAME IS<br /><span className="font-serif font-normal italic">READY.</span></div>
            <p className="max-w-xl border-l-2 border-[#fa423b] pl-5 text-base leading-[1.8] text-[#e3e0dc] sm:text-xl">Some stories deserve the right light, the right moment, and a little more time before they're shown.</p>
            <p className="mt-8 font-mono text-xs tracking-wide text-[#fa423b]">THE FILM ARCHIVE IS STILL IN DEVELOPMENT_</p>
            <div className="mt-12 border-t border-white/30 pt-7"><p className="font-serif text-2xl italic sm:text-4xl">How did you get in here anyway?</p>
              <button type="button" onClick={onClose} className="mt-6 inline-flex items-center gap-3 bg-[#fa423b] px-6 py-4 font-mono text-xs font-semibold text-[#100b0a] transition-transform hover:-translate-y-1">TAKE ME BACK TO IT <ArrowRight size={17} /></button>
            </div>
          </div>
        </div>
        <div className="flex justify-between gap-3 border-t border-white/25 px-5 py-4 font-mono text-[9px] text-white/50 sm:px-9"><span>FILM / VOL. 00</span><span>END OF PREVIEW — FOR NOW</span></div>
      </section>
    </div>
  )
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
          <p className="mt-5 max-w-md text-sm leading-7">Courses, seminars, workshops and certificates collected along the way. The records below are editable placeholders until verified credentials are added.</p>
          <div className="japandi-divider my-8" aria-hidden="true"><span className="japandi-mark">◯</span></div>
          <div className="space-y-4">
            {profile.learning.map((entry, i) => (
              <article className="certificate-entry border border-[#aaa596] bg-[#f8f6f0] p-5 sm:p-7" key={i}>
                <div className="flex items-start justify-between gap-3 font-mono text-[10px] text-[#77766c]"><span>{String(i + 1).padStart(2, '0')} / {entry.label}</span><span>{entry.date}</span></div>
                <h3 className="mt-6 text-xl font-bold tracking-tight sm:text-2xl">{entry.title}</h3>

                {entry.image && (
                  <a
                    href={entry.url || entry.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${entry.title} certificate`}
                    className="mt-5 block overflow-hidden border border-[#aaa596] bg-white"
                  >
                    <img
                      src={entry.image}
                      alt={`Certificate: ${entry.title}`}
                      className="h-auto w-full object-contain transition-transform duration-500 hover:scale-[1.02]"
                      loading="lazy"
                    />
                  </a>
                )}
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
