import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Crosshair, Infinity as InfinityIcon, Shield, Sparkles } from 'lucide-react'
import SpaceInvaders from './SpaceInvaders'
import EndlessShooter from './EndlessShooter'

const MODES = [
  {id:'classic',number:'01',name:'CLASSIC INVASION',tag:'THE ORIGINAL',description:'Clear formations, survive incoming fire, and climb through increasingly difficult waves.',icon:Shield,accent:'#9fd1c1'},
  {id:'endless',number:'02',name:'ENDLESS SURVIVAL',tag:'THE NEW PROTOCOL',description:'Stay alive as enemies accelerate. Collect weapon upgrades and beat your personal high score.',icon:InfinityIcon,accent:'#f7a17c'},
]
export default function ArcadeHub({onExit}) {
  const [mode,setMode]=useState(null)
  useEffect(()=>{
    if(mode)return undefined
    const onKey=e=>{if(e.key==='Escape')onExit()}
    window.addEventListener('keydown',onKey)
    return ()=>window.removeEventListener('keydown',onKey)
  },[mode,onExit])
  if(mode==='classic')return <SpaceInvaders onExit={()=>setMode(null)}/>
  if(mode==='endless')return <EndlessShooter onExit={()=>setMode(null)}/>
  return <section className="arcade-root fixed inset-0 z-[260] overflow-y-auto bg-[#061019] px-[5%] py-7 text-[#d4ebe4]" role="dialog" aria-modal="true" aria-labelledby="arcade-menu-heading">
    <div className="arcade-scanlines pointer-events-none fixed inset-0" aria-hidden="true"/>
    <div className="relative mx-auto max-w-5xl">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#496960] pb-5">
        <span className="text-2xl font-black tracking-[-.1em]">INDEX<span className="text-[#f49a7e]">/</span><span className="ml-3 font-mono text-[10px] tracking-[.18em] text-[#9ebbb4]">SECRET ARCADE</span></span>
        <button className="arcade-mode-exit inline-flex items-center gap-2 border border-[#58756e] px-4 py-3 font-mono text-[10px] tracking-wider transition-colors hover:bg-[#193037]" onClick={onExit}><ArrowLeft size={15}/> BACK TO PORTFOLIO</button>
      </header>
      <div className="mt-14 max-w-3xl">
        <p className="mt-8 max-w-xl text-sm leading-7 text-[#9cb9b3]">You weren't supposed to find this. Since you're here, pick a protocol and see how long you can last.</p>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {MODES.map(({id,number,name,tag,description,icon:Icon,accent})=>
          <button type="button" key={id} onClick={()=>setMode(id)} className="arcade-mode-card group relative flex min-h-[260px] flex-col items-start justify-between overflow-hidden border border-[#42665e] bg-[#0b1b23] p-6 text-left transition-colors hover:border-[#a5cdb7] hover:bg-[#10252b] sm:p-8">
            <div className="relative z-10 flex w-full items-start justify-between"><span className="font-mono text-xs tracking-[.17em]" style={{color:accent}}>{number} / {tag}</span><Icon size={28} strokeWidth={1.25} style={{color:accent}}/></div>
            <div className="relative z-10 mt-12"><h2 className="text-[clamp(27px,3vw,40px)] font-black tracking-[-.065em]">{name}</h2><p className="mt-3 max-w-sm text-sm leading-6 text-[#92aca6]">{description}</p></div>
            <div className="relative z-10 mt-8 flex items-center gap-2 font-mono text-xs tracking-wider" style={{color:accent}}>ENTER MODE <ArrowRight size={17} className="transition-transform group-hover:translate-x-2"/></div>
            <Crosshair size={180} strokeWidth={.25} className="pointer-events-none absolute -bottom-14 -right-12 text-[#3c6561]/25 transition-transform duration-700 group-hover:rotate-45"/>
          </button>
        )}
      </div>
      <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-[#3b5a55] pt-4 font-mono text-[10px] tracking-widest text-[#7daba1]"><span>ARCADE / VOL. 002</span><span>NO DATABASE. NO LEADERBOARD. JUST YOUR HIGH SCORE.</span></div>
    </div>
  </section>
}
