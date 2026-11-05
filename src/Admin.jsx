import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowUpRight, CheckCircle2, Github, ImagePlus, Loader2, Plus, Save, Trash2, X, AlertCircle, MoveUp, MoveDown } from 'lucide-react'

const endpoint = action => '/api/admin?action=' + action
async function request(action, options) {
  const res = await fetch(endpoint(action), {credentials:'same-origin',cache:'no-store',...options})
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}
const blankCertificate = () => ({label:'COURSE',title:'',issuer:'',date:'',image:'',url:'',placeholder:false})
const blankFilm = () => ({title:'',year:String(new Date().getFullYear()),format:'SHORT FILM',role:'',description:'',poster:'',link:''})
const filmFormats = ['SHORT FILM','DOCUMENTARY','MUSIC VIDEO','MOTION STUDY','EXPERIMENTAL','VIDEO ESSAY','OTHER']
const certificateCategories = ['COURSE','SEMINAR','CERTIFICATE']
const projectCategories = ['FULL-STACK / MOBILE','FULL-STACK / WEB','FRONTEND / WEB','BACKEND / API','AUDIO / CREATIVE CODING','PERSONAL FINANCE / WEB','MOBILE APPLICATION','UI / UX DESIGN','AUTOMATION / TOOLS','DATA / ANALYTICS','GAME DEVELOPMENT','OTHER']
const yearOptions = Array.from({length:16},(_,i)=>String(new Date().getFullYear()+1-i))
const projectNumber = index => String(index + 1).padStart(2,'0')
const newProject = () => ({id:'',slug:'new-project-'+Date.now().toString(36),title:'Untitled project',type:'FULL-STACK / WEB',year:String(new Date().getFullYear()),color:'#CAD8C4',light:'#EEF4EA',description:'',summary:'',stack:[],mark:'NP',link:'',live:'',challenge:'',solution:'',contribution:'',highlights:[],screenshots:[]})
const normalizeProjects = list => {
  const real = list.filter(p=>!p.placeholder && p.slug !== 'coming-soon')
  const placeholder = list.find(p=>p.placeholder || p.slug === 'coming-soon')
  return [...real.map((p,i)=>({...p,id:projectNumber(i),placeholder:false})),{...placeholder,id:projectNumber(real.length),slug:'coming-soon',placeholder:true}]
}
const normalizeLegacyCategory = value => value === 'COURSE / CERTIFICATE' ? 'COURSE' : value === 'CERTIFICATION' ? 'CERTIFICATE' : value
function SelectField({label,value,options,onChange}) {
  return <label className="block min-w-0"><span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-[#696960]">{label}</span><select className={inputClass} value={value||''} onChange={e=>onChange(e.target.value)}>{!options.includes(value)&&value&&<option value={value}>{value}</option>}{options.map(o=><option value={o} key={o}>{o}</option>)}</select></label>
}
function DateField({label,value,onChange}) {
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(value||'')
  return <label className="block min-w-0"><span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-[#696960]">{label}</span><input type="date" className={inputClass} value={valid?value:''} onChange={e=>onChange(e.target.value)}/>{value&&!valid&&<span className="mt-1 block text-[10px] text-[#9b533d]">Previous date: {value}. Select a date to replace it.</span>}</label>
}
function ColorField({label,value,onChange}) {
  const valid = /^#[0-9a-fA-F]{6}$/.test(value||'')
  return <label className="block min-w-0"><span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-[#696960]">{label}</span><div className="flex gap-2"><input type="color" aria-label={label+' color picker'} className="h-[43px] w-14 shrink-0 cursor-pointer border border-[#b7b3a8] bg-[#fbfaf6] p-1" value={valid?value:'#CAD8C4'} onChange={e=>onChange(e.target.value.toUpperCase())}/><input aria-label={label+' hex code'} className={inputClass+' font-mono'} value={value||''} maxLength={7} placeholder="#CAD8C4" onChange={e=>onChange(e.target.value.toUpperCase())}/></div>{!valid&&<span className="mt-1 block text-[10px] text-[#a33b2c]">Use a six-digit hex code (for example #CAD8C4).</span>}</label>
}
const inputClass = 'w-full min-w-0 border border-[#b7b3a8] bg-[#fbfaf6] px-3 py-2.5 text-sm text-[#191919] outline-offset-2 focus:outline-[#e95436]'
function Field({label,value,onChange,multiline=false,placeholder=''}) {
  return <label className="block min-w-0"><span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-[#696960]">{label}</span>
    {multiline ? <textarea rows={4} className={inputClass + ' resize-y'} value={value ?? ''} placeholder={placeholder} onChange={e=>onChange(e.target.value)}/> : <input className={inputClass} value={value ?? ''} placeholder={placeholder} onChange={e=>onChange(e.target.value)}/>}
  </label>
}
export default function Admin() {
  const [auth,setAuth] = useState('loading')
  const [documents,setDocuments] = useState({profile:null,projects:null})
  const [active,setActive] = useState('profile')
  const [busy,setBusy] = useState('')
  const [message,setMessage] = useState('')
  const [error,setError] = useState('')
  const [toast,setToast] = useState(null)
  const toastTimeout = useRef(null)
  const notify = (type,text) => {setToast({type,text});window.clearTimeout(toastTimeout.current);toastTimeout.current=window.setTimeout(()=>setToast(null),4500)}
  useEffect(()=>()=>window.clearTimeout(toastTimeout.current),[])
  async function load() {
    setBusy('loading')
    setError('')
    try {
      const results = await Promise.all(['profile','projects'].map(name=>request('content&name='+name)))
      setDocuments({profile:results[0],projects:results[1]})
      setMessage('')
    } catch (err) { setError(err.message) }
    finally { setBusy('') }
  }
  useEffect(()=>{
    let live=true
    request('status').then(()=>{
      if (!live) return
      setAuth('ready')
      return Promise.all(['profile','projects'].map(name=>request('content&name='+name))).then(([profile,projects])=>{
        if (live) setDocuments({profile,projects})
      })
    }).catch(err=>{
      if (!live) return
      setAuth(err.message.includes('not configured')?'setup':'login')
      setError(err.message)
    })
    return ()=>{ live=false }
  },[])
  const profile = documents.profile?.data
  const projects = documents.projects?.data
  const update = (name,transform) => setDocuments(old=>({
    ...old,[name]:{...old[name],data:transform(old[name].data)}
  }))
  const patchProfile = (key,value) => update('profile',data=>({...data,[key]:value}))
  const patchList = (key,index,field,value) => update('profile',data=>({
    ...data,[key]:data[key].map((item,i)=>i===index?{...item,[field]:value}:item)
  }))
  const patchProject = (index,key,value) => update('projects',list=>list.map((item,i)=>i===index?{...item,[key]:value}:item))
  const patchFilm = (index,key,value) => update('profile',data=>({...data,films:(data.films||[]).map((item,i)=>i===index?{...item,[key]:value}:item)}))
  async function save(name) {
    setBusy('saving');setMessage('');setError('')
    try {
      const current=documents[name]
      const data=name==='projects'?normalizeProjects(current.data):current.data
      if(name==='projects'&&data.some(p=>!/^#[0-9a-fA-F]{6}$/.test(p.color)||!/^#[0-9a-fA-F]{6}$/.test(p.light))) throw new Error('Enter valid six-digit hex colors before saving.')
      const result=await request('save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,sha:current.sha,data})})
      setDocuments(old=>({...old,[name]:{...old[name],data,sha:result.sha}}))
      notify('success','Saved to GitHub! Your portfolio will update after Vercel redeploys.')
    } catch(err){setError(err.message);notify('error',err.message)}
    finally{setBusy('')}
  }
  async function upload(index,file) {
    if (!file) return
    if (file.size > 1900000){setError('Please compress the image below 1.9 MB.');notify('error','Please compress the image below 1.9 MB.');return}
    setBusy('upload');setError('');setMessage('')
    try {
      const base64=await new Promise((resolve,reject)=>{
        const reader=new FileReader()
        reader.onload=()=>resolve(String(reader.result).split(',')[1])
        reader.onerror=()=>reject(new Error('Could not read image'))
        reader.readAsDataURL(file)
      })
      const result=await request('upload',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({name:file.name,content:base64})})
      update('profile',data=>({...data,learning:data.learning.map((item,i)=>i===index?{...item,image:result.url,url:(!item.url || item.url.startsWith('/certificates/'))?result.url:item.url,placeholder:false}:item)}))
      notify('success','Image uploaded. Remember to save Certificates to publish it.')
    } catch(err){setError(err.message);notify('error',err.message)}
    finally{setBusy('')}
  }
  const patchScreenshot = (projectIndex,index,key,value) => update('projects',list=>list.map((project,i)=>i===projectIndex?{...project,screenshots:(project.screenshots||[]).map((photo,j)=>j===index?{...photo,[key]:value}:photo)}:project))
  const changeScreenshots = (projectIndex,transform) => update('projects',list=>list.map((project,i)=>i===projectIndex?{...project,screenshots:transform(project.screenshots||[])}:project))
  async function uploadProjectImage(index,file) {
    if(!file)return
    if(file.size>1900000){notify('error','Compress screenshots to less than 1.9 MB.');return}
    setBusy('upload-project');setError('')
    try {
      const base64=await new Promise((resolve,reject)=>{
        const reader=new FileReader()
        reader.onload=()=>resolve(String(reader.result).split(',')[1])
        reader.onerror=()=>reject(new Error('Could not read image'))
        reader.readAsDataURL(file)
      })
      const result=await request('upload',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:file.name,content:base64,kind:'project'})})
      changeScreenshots(index,shots=>[...shots,{src:result.url,caption:'',alt:'',label:'PROJECT INTERFACE'}])
      notify('success','Screenshot uploaded to GitHub. Add a caption and Save Projects to publish it.')
    }catch(err){setError(err.message);notify('error',err.message)}
    finally{setBusy('')}
  }
  async function uploadFilmImage(index,file) {
    if(!file)return
    if(file.size>1900000){notify('error','Compress film stills or posters to under 1.9 MB.');return}
    setBusy('upload-film');setError('')
    try {
      const base64=await new Promise((resolve,reject)=>{
        const reader=new FileReader()
        reader.onload=()=>resolve(String(reader.result).split(',')[1])
        reader.onerror=()=>reject(new Error('Could not read image'))
        reader.readAsDataURL(file)
      })
      const result=await request('upload',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:file.name,content:base64,kind:'film'})})
      patchFilm(index,'poster',result.url)
      notify('success','Film frame uploaded. Save Film Archive to publish the new image.')
    }catch(err){setError(err.message);notify('error',err.message)}
    finally{setBusy('')}
  }
  async function logout(){
    try { await request('logout',{method:'POST'}) } catch {}
    window.location.assign('/')
  }
  const button='inline-flex items-center justify-center gap-2 border border-[#191919] px-4 py-3 font-mono text-[11px] font-semibold transition-colors hover:bg-[#191919] hover:text-[#f3f1ea] disabled:opacity-40'
  if(auth==='loading') return <main className="grid min-h-screen place-items-center bg-[#f3f1ea] font-mono text-sm">CONNECTING TO EDITOR…</main>
  if(auth!=='ready') return <main className="flex min-h-screen items-center justify-center bg-[#eeeae1] px-5 text-[#191919]"><section className="w-full max-w-lg border border-[#191919] bg-[#f3f1ea] p-8 sm:p-12">
    <p className="font-mono text-[10px] tracking-[.25em] text-[#6f765f]">INDEX / OWNER ACCESS</p>
    <h1 className="mt-4 text-5xl font-black tracking-[-.08em]">CONTENT<br/>STUDIO<span className="text-[#f34d31]">.</span></h1>
    <p className="mt-6 text-sm leading-7">A private, GitHub-backed editor for your public portfolio. No database required.</p>
    {auth==='setup'?<p className="mt-5 border-l-2 border-[#f34d31] pl-4 text-sm">Set the four Vercel environment variables documented in <code>ADMIN_SETUP.md</code>, then redeploy.</p>:<a className={button+' mt-6'} href={endpoint('login')}><Github size={18}/> SIGN IN WITH GITHUB</a>}
    <a className="mt-8 flex items-center gap-2 font-mono text-[11px]" href="/"><ArrowLeft size={14}/> BACK TO PORTFOLIO</a>
  </section></main>
  return <main className="min-h-screen bg-[#f3f1ea] px-[5%] py-8 text-[#191919]">
    <header className="flex flex-wrap items-center justify-between gap-5 border-b border-[#191919] pb-5"><a href="/" className="text-2xl font-black tracking-[-.1em]">INDEX<span className="text-[#f34d31]">/</span></a>
      <div className="flex items-center gap-4"><span className="hidden font-mono text-[10px] text-[#77776f] sm:inline">GITHUB / mcartv</span><button className="font-mono text-[11px] underline" onClick={logout}>SIGN OUT</button></div></header>
    <div className="mx-auto max-w-6xl pt-12"><p className="font-mono text-[10px] tracking-widest text-[#7b7a6d]">OWNER-ONLY / GIT-BACKED CMS</p>
      <h1 className="mt-3 text-[clamp(43px,8vw,90px)] font-black leading-none tracking-[-.09em]">CONTENT STUDIO<span className="text-[#f34d31]">.</span></h1>
      <p className="mt-4 max-w-2xl text-sm leading-7">Edit locally in this panel, then save to create a GitHub commit. Images upload to your repository; changes become public after Vercel builds the commit.</p>
      <nav aria-label="Editor sections" className="mt-10 flex flex-wrap gap-2">{[['profile','PROFILE'],['certificates','CERTIFICATES'],['projects','PROJECTS'],['films','FILM ARCHIVE']].map(([id,label])=><button key={id} onClick={()=>{setActive(id);setError('');setMessage('')}} className={button+(active===id?' bg-[#191919] text-[#f3f1ea]':'')}>{label}</button>)}</nav>
      {error&&<div role="alert" className="mt-6 border-l-4 border-[#d1422e] bg-[#fae4de] p-4 text-sm">{error}</div>}
      {message&&<div role="status" className="mt-6 border-l-4 border-[#728367] bg-[#e0e7d8] p-4 text-sm">{message}</div>}
      {(!profile||!projects)&&<button className={button+' mt-8'} onClick={load}>RETRY LOADING CONTENT</button>}
      {profile&&projects&&<section className="mt-9 max-w-4xl space-y-7">
        {active==='profile'&&<>
          <div className="grid gap-4 sm:grid-cols-2">{[['displayName','NAME'],['headline','HEADLINE'],['location','LOCATION'],['email','CONTACT EMAIL'],['linkedinUrl','LINKEDIN URL'],['githubUrl','GITHUB URL'],['photoUrl','PROFILE IMAGE PATH'],['resumeUrl','RESUME URL']].map(([key,label])=><Field key={key} label={label} value={profile[key]} onChange={value=>patchProfile(key,value)}/>)}</div>
          <Field label="INTRODUCTION" multiline value={profile.introduction} onChange={value=>patchProfile('introduction',value)}/>
          <Field label="FOCUS AREAS (ONE PER LINE)" multiline value={profile.focus.join('\n')} onChange={value=>patchProfile('focus',value.split('\n').map(v=>v.trim()).filter(Boolean))}/>
          {['education','experience'].map(section=><div key={section} className="border-t border-[#b7b3a8] pt-5">
            <h2 className="mb-5 text-xl font-bold uppercase">{section}</h2>
            {profile[section].map((entry,i)=><div key={i} className="mb-4 grid gap-3 border border-[#c4c0b5] p-4 sm:grid-cols-2"><Field label="TITLE" value={entry.title} onChange={v=>patchList(section,i,'title',v)}/><Field label="DETAIL" value={entry.detail} onChange={v=>patchList(section,i,'detail',v)}/><button className="font-mono text-[10px] text-[#a33b2c] underline" onClick={()=>patchProfile(section,profile[section].filter((_,j)=>j!==i))}>REMOVE ENTRY</button></div>)}
            <button className={button} onClick={()=>patchProfile(section,[...profile[section],{title:'',detail:'',label:section.toUpperCase(),placeholder:false}])}><Plus size={15}/> ADD ENTRY</button>
          </div>)}
        </>}
        {active==='certificates'&&<>
          <h2 className="text-2xl font-black tracking-tight">COURSES, SEMINARS & CERTIFICATES</h2>
          <p className="text-sm text-[#77766c]">Upload a JPG/PNG/WebP under 1.9MB. Uploading creates an image commit; save this list afterward to display it publicly.</p>
          {profile.learning.map((item,i)=><article key={i} className="border border-[#aaa596] bg-[#f8f6f0] p-5 sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-3"><span className="font-mono text-xs">ENTRY {String(i+1).padStart(2,'0')}</span><button onClick={()=>patchProfile('learning',profile.learning.filter((_,j)=>j!==i))} className="flex items-center gap-1 font-mono text-[10px] text-[#9c3d30]"><Trash2 size={14}/> REMOVE</button></div>
            <div className="grid gap-4 sm:grid-cols-2"><SelectField label="CATEGORY" value={normalizeLegacyCategory(item.label)} options={certificateCategories} onChange={v=>patchList('learning',i,'label',v)}/><DateField label="DATE (MONTH / DAY / YEAR)" value={item.date} onChange={v=>patchList('learning',i,'date',v)}/><Field label="CERTIFICATE TITLE" value={item.title} onChange={v=>patchList('learning',i,'title',v)}/><Field label="ISSUER" value={item.issuer} onChange={v=>patchList('learning',i,'issuer',v)}/><Field label="IMAGE URL/PATH" value={item.image} onChange={v=>patchList('learning',i,'image',v)}/><Field label="DOCUMENT LINK" value={item.url} onChange={v=>patchList('learning',i,'url',v)}/></div>
            {item.image&&<img className="mt-5 max-h-72 w-full border border-[#c5c0b5] bg-white object-contain" src={item.image} alt={item.title||'Certificate preview'}/>}
            <label className="mt-5 inline-flex cursor-pointer items-center gap-2 border border-[#191919] px-4 py-3 font-mono text-[11px]"><ImagePlus size={16}/> {busy==='upload'?'UPLOADING…':'UPLOAD IMAGE'}<input type="file" className="sr-only" accept="image/png,image/jpeg,image/webp" disabled={!!busy} onChange={e=>{upload(i,e.target.files?.[0]);e.target.value=''}}/></label>
          </article>)}
          <button className={button} onClick={()=>patchProfile('learning',[...profile.learning,blankCertificate()])}><Plus size={16}/> ADD CERTIFICATE</button>
        </>}
        {active==='films'&&<>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="font-mono text-[10px] tracking-widest text-[#a84337]">THE OTHER PRACTICE / CINEMA DIVISION</p><h2 className="mt-2 text-3xl font-black tracking-[-.055em]">FILM ARCHIVE<span className="text-[#cc5849]">.</span></h2><p className="mt-3 max-w-2xl text-sm leading-7 text-[#6e6c65]">Only add films you actually want to publish. If this list is empty, the public archive shows an intentional coming-soon screen.</p></div>
            <button className={button} onClick={()=>patchProfile('films',[...(profile.films||[]),blankFilm()])}><Plus size={16}/> ADD FILM</button>
          </div>
          {!(profile.films||[]).length&&<div className="border border-dashed border-[#aaa596] bg-[#e9e6df] px-5 py-10 text-center"><p className="font-mono text-[11px] tracking-widest">REEL 00 / NO RELEASED FILMS</p><p className="mt-2 text-sm text-[#77766c]">The screening-room design is live, without invented films or production credits.</p></div>}
          {(profile.films||[]).map((film,i)=><article key={i} className="border border-[#aaa596] bg-[#f8f6f0] p-5 sm:p-7">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><span className="font-mono text-[11px] tracking-wider">FRAME {String(i+1).padStart(3,'0')}</span><div className="flex gap-2">
              <button disabled={i===0} className="border border-[#aaa596] p-2 disabled:opacity-25" aria-label="Move film earlier" onClick={()=>patchProfile('films',(profile.films||[]).map((v,j)=>j===i-1?profile.films[i]:j===i?profile.films[i-1]:v))}><MoveUp size={15}/></button>
              <button disabled={i===(profile.films||[]).length-1} className="border border-[#aaa596] p-2 disabled:opacity-25" aria-label="Move film later" onClick={()=>patchProfile('films',(profile.films||[]).map((v,j)=>j===i+1?profile.films[i]:j===i?profile.films[i+1]:v))}><MoveDown size={15}/></button>
              <button className="flex items-center gap-2 border border-[#bfa7a0] px-3 py-2 font-mono text-[10px] text-[#a33b2c]" onClick={()=>{if(window.confirm('Remove this film from the published archive?'))patchProfile('films',(profile.films||[]).filter((_,j)=>j!==i))}}><Trash2 size={14}/> REMOVE</button>
            </div></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="FILM TITLE" value={film.title} onChange={v=>patchFilm(i,'title',v)} placeholder="Your film title"/>
              <Field label="YEAR" value={film.year} onChange={v=>patchFilm(i,'year',v)}/>
              <SelectField label="FORMAT" value={film.format||'SHORT FILM'} options={filmFormats} onChange={v=>patchFilm(i,'format',v)}/>
              <Field label="YOUR ROLE / CREDIT" value={film.role} onChange={v=>patchFilm(i,'role',v)} placeholder="Only your actual production role"/>
              <Field label="VIDEO / FILM LINK" value={film.link} onChange={v=>patchFilm(i,'link',v)} placeholder="https://..."/>
              <Field label="POSTER IMAGE PATH" value={film.poster} onChange={v=>patchFilm(i,'poster',v)} placeholder="/films/example.webp"/>
            </div>
            <div className="mt-4"><Field label="DESCRIPTION / PROJECT NOTES" value={film.description} onChange={v=>patchFilm(i,'description',v)} multiline/></div>
            <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div className="flex min-h-[170px] items-center justify-center overflow-hidden border border-[#bcb7ae] bg-[#171719]">{film.poster?<img src={film.poster} alt={film.title||'Film frame'} className="max-h-[280px] w-full object-contain"/>:<span className="font-mono text-[10px] tracking-widest text-white/55">NO POSTER UPLOADED</span>}</div>
              <label className="inline-flex cursor-pointer items-center justify-center gap-2 border border-[#191919] px-4 py-3 font-mono text-[11px] hover:bg-[#191919] hover:text-white"><ImagePlus size={16}/>{busy==='upload-film'?'UPLOADING…':'UPLOAD STILL / POSTER'}<input type="file" className="sr-only" accept="image/png,image/jpeg,image/webp" disabled={!!busy} onChange={e=>{uploadFilmImage(i,e.target.files?.[0]);e.target.value=''}}/></label>
            </div>
          </article>)}
          <p className="text-xs leading-6 text-[#77766c]">Film images must be under 1.9 MB and will be stored publicly in GitHub. After uploading or editing a film, click Save Film Archive below.</p>
        </>}
        {active==='projects'&&<>
          <h2 className="text-2xl font-black tracking-tight">SELECTED PROJECTS</h2>
          {projects.filter(p=>!p.placeholder && p.slug!=='coming-soon').map((project,i)=><article key={project.slug+'-'+i} className="border border-[#aaa596] bg-[#f8f6f0] p-5 sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-3"><p className="font-mono text-[10px]">PROJECT {projectNumber(i)} / {project.slug}</p><button className="flex items-center gap-1 font-mono text-[10px] text-[#9c3d30]" onClick={()=>update('projects',list=>normalizeProjects(list.filter((p,j)=>j!==i)))}><Trash2 size={14}/> REMOVE</button></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="block"><span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-[#696960]">CARD NUMBER · AUTO</span><div className={inputClass+' bg-[#e5e3da] font-mono text-[#65645a]'}>{projectNumber(i)}</div></div>
              <Field label="SLUG" value={project.slug} onChange={v=>patchProject(i,'slug',v)}/>
              <Field label="TITLE" value={project.title} onChange={v=>patchProject(i,'title',v)}/>
              <SelectField label="CATEGORY" value={project.type} options={projectCategories} onChange={v=>patchProject(i,'type',v)}/>
              <SelectField label="YEAR" value={project.year} options={yearOptions} onChange={v=>patchProject(i,'year',v)}/>
              <Field label="MARK" value={project.mark} onChange={v=>patchProject(i,'mark',v)}/>
              <Field label="SHORT DESCRIPTION" value={project.description} onChange={v=>patchProject(i,'description',v)}/>
              <Field label="GITHUB URL" value={project.link} onChange={v=>patchProject(i,'link',v)}/>
              <Field label="LIVE URL" value={project.live} onChange={v=>patchProject(i,'live',v)}/>
              <ColorField label="CARD COLOR" value={project.color} onChange={v=>patchProject(i,'color',v)}/>
              <ColorField label="LIGHT COLOR" value={project.light} onChange={v=>patchProject(i,'light',v)}/>
            </div>
            <div className="mt-4 space-y-4"><Field label="CASE STUDY SUMMARY" multiline value={project.summary} onChange={v=>patchProject(i,'summary',v)}/><Field label="TECH STACK (COMMA SEPARATED)" value={project.stack.join(', ')} onChange={v=>patchProject(i,'stack',v.split(',').map(x=>x.trim()).filter(Boolean))}/></div>
            <div className="mt-7 border-t border-[#aaa596] pt-5">
              <h3 className="font-mono text-xs font-bold tracking-wider">CASE STUDY / BEHIND THE BUILD</h3>
              <p className="mt-2 text-xs leading-6 text-[#77766c]">Describe your actual work. Blank sections stay hidden on the public site.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="THE CHALLENGE" multiline value={project.challenge||''} onChange={v=>patchProject(i,'challenge',v)}/>
                <Field label="THE SOLUTION" multiline value={project.solution||''} onChange={v=>patchProject(i,'solution',v)}/>
                <Field label="MY CONTRIBUTION" multiline value={project.contribution||''} onChange={v=>patchProject(i,'contribution',v)}/>
                <Field label="KEY DETAILS (ONE PER LINE)" multiline value={(project.highlights||[]).join('\n')} onChange={v=>patchProject(i,'highlights',v.split('\n').map(x=>x.trim()).filter(Boolean))}/>
              </div>
            </div>
            <div className="mt-7 border-t border-[#aaa596] pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><h3 className="font-mono text-xs font-bold tracking-wider">PROJECT SCREENSHOTS / GALLERY</h3><p className="mt-2 text-xs text-[#77766c]">The first image serves as the gallery cover. Drag-free ordering uses the arrows below.</p></div>
                <label className="inline-flex cursor-pointer items-center gap-2 border border-[#191919] px-3 py-2.5 font-mono text-[10px] hover:bg-[#e9e6dc]"><ImagePlus size={15}/>{busy==='upload-project'?'UPLOADING…':'UPLOAD SCREENSHOT'}<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={!!busy||(project.screenshots||[]).length>=12} onChange={e=>{uploadProjectImage(i,e.target.files?.[0]);e.target.value=''}}/></label>
              </div>
              <p className="mt-2 text-[10px] text-[#77766c]">PNG, JPG, or WebP. Maximum 1.9 MB per image. Up to 12 images per project. Uploaded files are publicly accessible.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {(project.screenshots||[]).map((photo,j)=><div key={photo.src+'-'+j} className="border border-[#c0b9ac] bg-[#f3f0e8] p-3">
                  <div className="mb-2 flex items-center justify-between gap-2"><span className="font-mono text-[10px]">FRAME {String(j+1).padStart(2,'0')}{j===0?' / COVER':''}</span><div className="flex gap-1">
                    <button title="Move image left" aria-label="Move image earlier" disabled={j===0} className="border border-[#aaa596] p-1.5 disabled:opacity-30" onClick={()=>changeScreenshots(i,shots=>{const next=[...shots];[next[j-1],next[j]]=[next[j],next[j-1]];return next})}><MoveUp size={14}/></button>
                    <button title="Move image right" aria-label="Move image later" disabled={j===(project.screenshots||[]).length-1} className="border border-[#aaa596] p-1.5 disabled:opacity-30" onClick={()=>changeScreenshots(i,shots=>{const next=[...shots];[next[j+1],next[j]]=[next[j],next[j+1]];return next})}><MoveDown size={14}/></button>
                    <button aria-label="Remove screenshot" title="Remove screenshot from gallery" className="border border-[#bfa7a0] p-1.5 text-[#a33b2c]" onClick={()=>changeScreenshots(i,shots=>shots.filter((_,k)=>k!==j))}><Trash2 size={14}/></button>
                  </div></div>
                  <div className="flex min-h-[120px] items-center justify-center border border-[#c0b9ac] bg-[#e9e6de]"><img src={photo.src} alt={photo.alt||photo.caption||'Screenshot'} className="max-h-[200px] w-full object-contain" loading="lazy" onError={e=>{e.currentTarget.style.opacity='.3'}}/></div>
                  <div className="mt-3 space-y-3">
                    <Field label="CAPTION" value={photo.caption||''} onChange={v=>patchScreenshot(i,j,'caption',v)}/>
                    <Field label="ACCESSIBLE IMAGE DESCRIPTION" value={photo.alt||''} onChange={v=>patchScreenshot(i,j,'alt',v)}/>
                    <Field label="FRAME LABEL" value={photo.label||''} onChange={v=>patchScreenshot(i,j,'label',v)}/>
                  </div>
                </div>)}
              </div>
              {!(project.screenshots||[]).length&&<div className="mt-4 border border-dashed border-[#b4ab9b] px-4 py-8 text-center font-mono text-[10px] text-[#77766c]">NO IMAGES YET / THE PUBLIC MODAL SHOWS ITS CONCEPTUAL PREVIEW</div>}
              <p className="mt-3 text-[10px] text-[#77766c]">Click Save Projects after uploading or rearranging images. New image paths will load after Vercel finishes deploying the commit.</p>
            </div>
          </article>)}
          <button className={button} onClick={()=>update('projects',list=>normalizeProjects([...list.filter(p=>!p.placeholder && p.slug!=='coming-soon'),newProject(),...list.filter(p=>p.placeholder || p.slug==='coming-soon')]))}><Plus size={16}/> ADD PROJECT</button>
          <div className="border border-dashed border-[#a8a698] bg-[#e8e5dc] p-5 sm:p-7"><div className="flex items-center justify-between gap-3"><span className="font-mono text-[10px]">CARD {projectNumber(projects.length-1)} / FIXED PLACEHOLDER</span><span className="font-mono text-[10px] text-[#626557]">LOCKED</span></div><h3 className="mt-4 text-xl font-bold">More projects to come</h3><p className="mt-2 text-sm text-[#66665e]">This is a permanent closing card that signals new projects are in progress. It stays last, is not editable, and is automatically renumbered as your portfolio grows.</p></div>
        </>}
        <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-[#191919] bg-[#f3f1ea]/95 py-5 backdrop-blur-sm">
          <p className="font-mono text-[10px] text-[#77766c]">SAVING COMMITS TO MAIN BRANCH</p>
          <button className={button+' bg-[#191919] text-[#f3f1ea]'} onClick={()=>save(active==='projects'?'projects':'profile')} disabled={!!busy}>
            {busy?<Loader2 size={16} className="animate-spin"/>:<Save size={16}/>} SAVE {active==='profile'?'PROFILE':active==='certificates'?'CERTIFICATES':active==='films'?'FILM ARCHIVE':'PROJECTS'}
          </button>
        </div>
      </section>}
      <a href="/" className="my-10 inline-flex items-center gap-2 font-mono text-[11px]"><ArrowLeft size={14}/> BACK TO WEBSITE <ArrowUpRight size={14}/></a>
      {toast && <div role={toast.type==='error'?'alert':'status'} aria-live={toast.type==='error'?'assertive':'polite'} className="fixed bottom-5 right-4 z-[300] flex w-[min(390px,calc(100vw-32px))] items-start gap-3 border border-[#191919] bg-[#f8f6f0] p-4 shadow-[7px_7px_0_#19191930] sm:bottom-7 sm:right-7 sm:p-5">
        {toast.type==='error'?<AlertCircle size={22} className="shrink-0 text-[#bb4732]"/>:<CheckCircle2 size={22} className="shrink-0 text-[#687e5b]"/>}
        <div className="min-w-0 flex-1"><div className="font-mono text-[10px] tracking-wider text-[#72716a]">{toast.type==='error'?'SAVE FAILED':'CONTENT STUDIO / SAVED'}</div><p className="mt-1 text-sm leading-relaxed">{toast.text}</p></div>
        <button aria-label="Dismiss notification" onClick={()=>{window.clearTimeout(toastTimeout.current);setToast(null)}} className="shrink-0 p-1 hover:bg-[#e8e5dc]"><X size={17}/></button>
      </div>}
    </div>
  </main>
}
