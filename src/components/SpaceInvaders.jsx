import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, RotateCcw, Volume2, VolumeX } from 'lucide-react'

const WIDTH = 480
const HEIGHT = 620
const PLAYER_Y = 557
const INVADER = [
  ['00100100','00011000','01111110','11011011','11111111','10100101','00100100','01000010'],
  ['00011000','00111100','01111110','11011011','11111111','00100100','01011010','10100101'],
  ['00111100','01111110','11111111','11011011','11111111','00100100','01011010','10000001'],
]
const SHIP = ['000010000','000111000','001111100','011111110','111111111','111111111','110111011']
const SHIELD = ['111111111','111111111','111111111','111111111','111000111','110000011']
const STAR_COUNT = 72
const bound = (v,min,max) => Math.min(max,Math.max(min,v))

function sprite(ctx,bits,x,y,size,color) {
  ctx.fillStyle = color
  for(let row=0;row<bits.length;row++) for(let col=0;col<bits[row].length;col++)
    if(bits[row][col]==='1') ctx.fillRect(Math.round(x+col*size),Math.round(y+row*size),size,size)
}

function initial() {
  const aliens=[]
  for(let row=0;row<4;row++) for(let col=0;col<9;col++)
    aliens.push({row,col,x:47+col*43,y:92+row*39,alive:true})
  return {
    phase:'ready', score:0, lives:3, wave:1, playerX:WIDTH/2,
    enemies:aliens, direction:1, enemyClock:0, enemyShootClock:0,
    fireClock:0, shots:[], enemyShots:[], particles:[], last:0,
    stars:Array.from({length:STAR_COUNT},(_,i)=>({
      x:(i*173+41)%WIDTH,y:(i*283+19)%HEIGHT,size:i%6===0?2:1,speed:4+i%4*6,
    })),
    shields:[85,195,305,415].map(x=>({x,damage:0})),
  }
}
const label = 'font-mono text-[10px] tracking-[.17em]'
function Button({children,onClick,disabled=false}) {
  return <button type="button" disabled={disabled} onClick={onClick} className="arcade-control border border-[#607e83] bg-[#13242b] px-4 py-3 font-mono text-xs tracking-wide text-[#c2e5dc] transition-colors hover:border-[#a9e6d1] hover:bg-[#1b3740] active:bg-[#274c56] disabled:opacity-35">{children}</button>
}
export default function SpaceInvaders({onExit}) {
  const canvas = useRef(null)
  const state = useRef(initial())
  const controls = useRef({left:false,right:false,fire:false})
  const screenRef=useRef(null)
  const [screen,setScreen] = useState({phase:'ready',score:0,lives:3,wave:1})
  const [muted,setMuted] = useState(true)
  const audio=useRef(null)
  const audioTone=(freq=440,duration=.055,type='square')=>{
    if(muted)return
    try {
      const ctx=audio.current || new (window.AudioContext || window.webkitAudioContext)()
      audio.current=ctx
      if(ctx.state==='suspended')ctx.resume()
      const oscillator=ctx.createOscillator(),gain=ctx.createGain()
      oscillator.type=type;oscillator.frequency.setValueAtTime(freq,ctx.currentTime)
      gain.gain.setValueAtTime(.025,ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+duration)
      oscillator.connect(gain).connect(ctx.destination)
      oscillator.start();oscillator.stop(ctx.currentTime+duration)
    } catch { /* Audio is decorative. Gameplay remains available. */ }
  }
  const play =()=>{
    state.current=initial()
    state.current.phase='playing'
    setScreen({phase:'playing',score:0,lives:3,wave:1})
    controls.current={left:false,right:false,fire:false}
    screenRef.current?.focus()
  }
  useEffect(()=>{
    screenRef.current?.focus()
    const onKeyDown=e=>{
      if(['ArrowLeft','ArrowRight','ArrowUp',' ','a','A','d','D','w','W'].includes(e.key))e.preventDefault()
      if(e.key==='Escape'){onExit();return}
      if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')controls.current.left=true
      if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')controls.current.right=true
      if(e.key===' '||e.key==='ArrowUp'||e.key.toLowerCase()==='w')controls.current.fire=true
      if(e.key==='Enter'&&state.current.phase!=='playing')play()
    }
    const onKeyUp=e=>{
      if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')controls.current.left=false
      if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')controls.current.right=false
      if(e.key===' '||e.key==='ArrowUp'||e.key.toLowerCase()==='w')controls.current.fire=false
    }
    const onBlur=()=>{controls.current={left:false,right:false,fire:false}}
    window.addEventListener('keydown',onKeyDown)
    window.addEventListener('keyup',onKeyUp)
    window.addEventListener('blur',onBlur)
    return ()=>{
      window.removeEventListener('keydown',onKeyDown)
      window.removeEventListener('keyup',onKeyUp)
      window.removeEventListener('blur',onBlur)
      audio.current?.close?.()
    }
  },[onExit])

  useEffect(()=>{
    const element=canvas.current,ctx=element?.getContext('2d')
    if(!ctx)return
    let id=0
    const render=timestamp=>{
      const game=state.current
      const dt=game.last?Math.min((timestamp-game.last)/1000,.045):0
      game.last=timestamp
      if(game.phase==='playing'){
        const direction=Number(controls.current.right)-Number(controls.current.left)
        game.playerX=bound(game.playerX+direction*280*dt,21,WIDTH-21)
        game.fireClock-=dt
        if(controls.current.fire&&game.fireClock<=0){
          game.shots.push({x:game.playerX,y:PLAYER_Y-9})
          game.fireClock=.23
          audioTone(550,.035)
        }
        game.shots.forEach(b=>b.y-=480*dt)
        game.enemyShots.forEach(b=>b.y+=(210+game.wave*16)*dt)
        game.shots=game.shots.filter(b=>b.y>-16)
        game.enemyShots=game.enemyShots.filter(b=>b.y<HEIGHT+12)
        const alive=game.enemies.filter(e=>e.alive)
        game.enemyClock+=dt
        const interval=Math.max(.075,.48-game.wave*.036-(36-alive.length)*.006)
        if(game.enemyClock>=interval&&alive.length){
          game.enemyClock=0
          const left=Math.min(...alive.map(e=>e.x)),right=Math.max(...alive.map(e=>e.x))
          if((game.direction===1&&right>WIDTH-49)||(game.direction===-1&&left<26)){
            game.direction*=-1
            alive.forEach(e=>e.y+=16)
          } else alive.forEach(e=>e.x+=8*game.direction)
        }
        game.enemyShootClock+=dt
        if(game.enemyShootClock>Math.max(.35,1.25-game.wave*.08)&&alive.length){
          game.enemyShootClock=0
          const shoot=alive[Math.floor(Math.random()*alive.length)]
          game.enemyShots.push({x:shoot.x+14,y:shoot.y+21})
        }
        game.shots.forEach(b=>{
          if(b.hit)return
          for(const e of game.enemies){
            if(e.alive&&b.x>=e.x-3&&b.x<=e.x+31&&b.y>=e.y-3&&b.y<=e.y+27){
              e.alive=false;b.hit=true;game.score+=(4-e.row)*10
              for(let j=0;j<9;j++)game.particles.push({x:e.x+12,y:e.y+12,vx:(Math.random()-.5)*160,vy:(Math.random()-.5)*145,t:.35+Math.random()*.4})
              audioTone(170,.08);setScreen(v=>({...v,score:game.score}))
              break
            }
          }
        })
        game.shots=game.shots.filter(b=>!b.hit)
        for(const b of game.enemyShots)if(!b.hit&&Math.abs(b.x-game.playerX)<15&&Math.abs(b.y-PLAYER_Y)<12){
          b.hit=true;game.lives--;audioTone(90,.16)
          setScreen(v=>({...v,lives:game.lives}))
          if(game.lives<=0){game.phase='over';setScreen(v=>({...v,phase:'over'}))}
        }
        game.enemyShots=game.enemyShots.filter(b=>!b.hit)
        if(game.enemies.some(e=>e.alive&&e.y>PLAYER_Y-26)){
          game.phase='over';setScreen(v=>({...v,phase:'over'}))
        }
        if(!game.enemies.some(e=>e.alive)){
          game.wave++;const next=initial()
          game.enemies=next.enemies;game.direction=1;game.enemyClock=0;game.enemyShootClock=0
          game.shots=[];game.enemyShots=[]
          setScreen(v=>({...v,wave:game.wave}))
        }
      }
      game.stars.forEach(s=>{s.y+=s.speed*dt;if(s.y>HEIGHT)s.y=0})
      game.particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.t-=dt})
      game.particles=game.particles.filter(p=>p.t>0)
      ctx.fillStyle='#061019';ctx.fillRect(0,0,WIDTH,HEIGHT)
      ctx.strokeStyle='rgba(100,185,168,.06)';ctx.lineWidth=1
      for(let y=25;y<HEIGHT;y+=32){ctx.beginPath();ctx.moveTo(0,y+.5);ctx.lineTo(WIDTH,y+.5);ctx.stroke()}
      for(const star of game.stars){
        ctx.fillStyle=star.size===2?'rgba(181,229,216,.55)':'rgba(140,187,181,.25)'
        ctx.fillRect(Math.round(star.x),Math.round(star.y),star.size,star.size)
      }
      ctx.fillStyle='#8bd1b9';ctx.font='11px monospace'
      ctx.fillText('WAVE '+String(game.wave).padStart(2,'0'),20,29)
      ctx.textAlign='right';ctx.fillText('SCORE '+String(game.score).padStart(6,'0'),WIDTH-20,29);ctx.textAlign='left'
      for(const e of game.enemies)if(e.alive){
        const color=['#ea866e','#efb36f','#a9d3ac','#86bfc3'][e.row]
        sprite(ctx,INVADER[e.row%INVADER.length],e.x,e.y,3.25,color)
      }
      for(const shield of game.shields){
        const fade=.1+Math.min(.27,game.wave*.05)
        ctx.globalAlpha=game.phase==='playing'?.36:.15
        sprite(ctx,SHIELD,shield.x-14,PLAYER_Y-90,3.5,'#73b79c')
        ctx.globalAlpha=1
      }
      sprite(ctx,SHIP,game.playerX-14,PLAYER_Y-11,3.25,game.lives?'#b9e4d1':'#607c7e')
      ctx.fillStyle='#e5f8dd';game.shots.forEach(b=>ctx.fillRect(b.x-1,b.y,3,11))
      ctx.fillStyle='#f58d73';game.enemyShots.forEach(b=>ctx.fillRect(b.x-2,b.y,4,10))
      game.particles.forEach(p=>{ctx.fillStyle='#efae7d';ctx.globalAlpha=Math.min(1,p.t*2);ctx.fillRect(p.x,p.y,3,3)});ctx.globalAlpha=1
      ctx.strokeStyle='#567d78';ctx.beginPath();ctx.moveTo(0,HEIGHT-20);ctx.lineTo(WIDTH,HEIGHT-20);ctx.stroke()
      ctx.fillStyle='#658e8a';ctx.font='10px monospace';ctx.fillText('INDEX / ARCADE 001',16,HEIGHT-8)
      id=window.requestAnimationFrame(render)
    }
    id=window.requestAnimationFrame(render)
    return ()=>window.cancelAnimationFrame(id)
  },[muted])

  return <section className="arcade-root fixed inset-0 z-[260] flex flex-col overflow-y-auto bg-[#040a10] text-[#d2eee1]" role="dialog" aria-modal="true" aria-labelledby="arcade-title" ref={screenRef} tabIndex={-1}>
    <div className="arcade-scanlines pointer-events-none fixed inset-0 z-10" aria-hidden="true"/>
    <header className="relative z-20 flex items-center justify-between gap-3 border-b border-[#34505a] px-[5%] py-4">
      <div className="flex items-center gap-3"><span className="text-xl font-black tracking-[-.09em]">INDEX<span className="text-[#ea866e]">/</span></span><span className={label+' hidden text-[#8ca6a2] sm:block'}>CLASSIFIED / MINI ARCADE 001</span></div>
      <div className="flex items-center gap-2">
        <button onClick={()=>setMuted(v=>!v)} className="border border-[#526d70] p-2 text-[#b7d6cf]" aria-label={muted?'Enable game sounds':'Mute game sounds'}>{muted?<VolumeX size={17}/>:<Volume2 size={17}/>}</button>
        <Button onClick={onExit}><span className="flex items-center gap-2"><ArrowLeft size={14}/> EXIT GAME</span></Button>
      </div>
    </header>
    <div className="relative z-0 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center px-4 pb-5 pt-6 sm:pt-7">
      <div className="mb-4 w-full max-w-[480px]">
        <p className={label+' text-[#e68e79]'}>YOU FOUND THE BACKDOOR.</p>
        <h1 id="arcade-title" className="mt-1 text-[clamp(30px,6vw,54px)] font-black leading-none tracking-[-.085em]">THE LAST DEFENDER<span className="text-[#ea866e]">_</span></h1>
      </div>
      <div className="arcade-cabinet relative w-full max-w-[480px] overflow-hidden border border-[#54776f] bg-[#061019] shadow-[0_0_0_5px_#101f26,0_20px_75px_#0009]">
        <canvas ref={canvas} width={WIDTH} height={HEIGHT} className="block h-auto w-full" aria-label="Pixel arcade space shooter game with invaders, a player ship, bullets, score and lives"/>
        {screen.phase!=='playing'&&<div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#02070c]/85 px-6 text-center">
          <span className="mb-4 font-mono text-xs tracking-[.22em] text-[#e58c74]">{screen.phase==='over'?'CONNECTION LOST':'UNAUTHORIZED FUN DETECTED'}</span>
          <h2 className="text-[clamp(40px,10vw,72px)] font-black leading-[.86] tracking-[-.08em]">{screen.phase==='over'?'GAME':'READY'}<br/><span className="text-[#e58c74]">{screen.phase==='over'?'OVER':'PLAYER ONE?'}</span></h2>
          <p className="mt-7 max-w-xs font-mono text-xs leading-6 text-[#a5c7be]">{screen.phase==='over'?('FINAL SCORE / '+screen.score):'Defend the archive. Dodge incoming fire. Survive the next wave.'}</p>
          <Button onClick={play}><span className="flex items-center gap-2">{screen.phase==='over'?<RotateCcw size={15}/>:null}{screen.phase==='over'?'PLAY AGAIN':'START GAME'} <span>↗</span></span></Button>
        </div>}
      </div>
      <div className="mt-5 flex w-full max-w-[480px] items-center justify-between gap-2 font-mono text-xs text-[#a3c8bf]"><span>SCORE <strong className="text-[#e7f5e9]">{String(screen.score).padStart(6,'0')}</strong></span><span>WAVE {screen.wave}</span><span>LIVES {'♥'.repeat(Math.max(screen.lives,0))}</span></div>
      <div className="mt-5 flex w-full max-w-[480px] flex-col gap-3">
        <div className="flex items-center justify-between gap-3 sm:hidden">
          <button type="button" aria-label="Move left" className="arcade-touch-control" onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);controls.current.left=true}} onPointerUp={()=>controls.current.left=false} onPointerCancel={()=>controls.current.left=false}>◀</button>
          <button type="button" aria-label="Fire" className="arcade-touch-control arcade-fire" onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);controls.current.fire=true}} onPointerUp={()=>controls.current.fire=false} onPointerCancel={()=>controls.current.fire=false}>FIRE</button>
          <button type="button" aria-label="Move right" className="arcade-touch-control" onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);controls.current.right=true}} onPointerUp={()=>controls.current.right=false} onPointerCancel={()=>controls.current.right=false}>▶</button>
        </div>
        <p className={label+' text-center leading-5 text-[#698a87]'}>← → / A D TO MOVE &nbsp;·&nbsp; SPACE / W TO FIRE &nbsp;·&nbsp; ESC TO EXIT</p>
      </div>
    </div>
  </section>
}
