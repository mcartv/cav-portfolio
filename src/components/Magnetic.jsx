import { useRef } from 'react'

/**
 * A small, pointer-only spring-like pull for interactive controls.
 * The wrapper owns the translation, so nested buttons/links retain their own transforms.
 */
export default function Magnetic({ children, className = '', strength = 0.2 }) {
  const element = useRef(null)
  const enabled = event =>
    event.pointerType === 'mouse' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const move = event => {
    if (!enabled(event) || !element.current) return
    const rect = element.current.getBoundingClientRect()
    const dx = event.clientX - (rect.left + rect.width / 2)
    const dy = event.clientY - (rect.top + rect.height / 2)
    element.current.style.setProperty('--magnetic-x', (dx * strength).toFixed(1) + 'px')
    element.current.style.setProperty('--magnetic-y', (dy * strength).toFixed(1) + 'px')
  }
  const reset = () => {
    element.current?.style.setProperty('--magnetic-x', '0px')
    element.current?.style.setProperty('--magnetic-y', '0px')
  }
  return (
    <span ref={element} className={'magnetic-target inline-flex ' + className}
      onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset}>
      {children}
    </span>
  )
}
