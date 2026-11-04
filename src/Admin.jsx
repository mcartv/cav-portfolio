import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Github, ImagePlus, Loader2, Plus, Save, Trash2 } from 'lucide-react'

const endpoint = action => '/api/admin?action=' + action
async function request(action, options) {
  const res = await fetch(endpoint(action), {credentials:'same-origin',cache:'no-store',...options})
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}
const blankCertificate = () => ({label:'COURSE / CERTIFICATE',title:'',issuer:'',date:'',image:'',url:'',placeholder:false})
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
  async function save(name) {
    setBusy('saving');setMessage('');setError('')
    try {
      const current=documents[name]
      const result=await request('save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,sha:current.sha,data:current.data})})
      setDocuments(old=>({...old,[name]:{...old[name],sha:result.sha}}))
      setMessage('Saved to GitHub. Vercel will rebuild if automatic deployment is enabled.')
    } catch(err){setError(err.message)}
    finally{setBusy('')}
  }
  async function upload(index,file) {
    if (!file) return
    if (file.size > 1900000){setError('Please compress the image below 1.9 MB.');return}
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
      update('profile',data=>({...data,learning:data.learning.map((item,i)=>i===index?{...item,image:result.url,url:item.url||result.url,placeholder:false}:item)}))
      setMessage('Image uploaded to GitHub. Save Certificates below to publish the new image reference.')
    } catch(err){setError(err.message)}
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
      <nav aria-label="Editor sections" className="mt-10 flex flex-wrap gap-2">{[['profile','PROFILE'],['certificates','CERTIFICATES'],['projects','PROJECTS']].map(([id,label])=><button key={id} onClick={()=>{setActive(id);setError('');setMessage('')}} className={button+(active===id?' bg-[#191919] text-[#f3f1ea]':'')}>{label}</button>)}</nav>
      {error&&<div role="alert" className="mt-6 border-l-4 border-[#d1422e] bg-[#fae4de] p-4 text-sm">{error}</div>}
      {message&&<div role="status" className="mt-6 border-l-4 border-[#728367] bg-[#e0e7d8] p-4 text-sm">{message}</div>}
      {(!profile||!projects)&&<button className={button+' mt-8'} onClick={load}>RETRY LOADING CONTENT</button>}
      {profile&&projects&&<section className="mt-9 max-w-4xl space-y-7">
        {active==='profile'&&<>
          <div className="grid gap-4 sm:grid-cols-2">{[['displayName','NAME'],['headline','HEADLINE'],['location','LOCATION'],['linkedinUrl','LINKEDIN URL'],['githubUrl','GITHUB URL'],['photoUrl','PROFILE IMAGE PATH'],['resumeUrl','RESUME URL']].map(([key,label])=><Field key={key} label={label} value={profile[key]} onChange={value=>patchProfile(key,value)}/>)}</div>
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
            <div className="grid gap-4 sm:grid-cols-2"><Field label="CATEGORY" value={item.label} onChange={v=>patchList('learning',i,'label',v)}/><Field label="DATE" value={item.date} onChange={v=>patchList('learning',i,'date',v)}/><Field label="CERTIFICATE TITLE" value={item.title} onChange={v=>patchList('learning',i,'title',v)}/><Field label="ISSUER" value={item.issuer} onChange={v=>patchList('learning',i,'issuer',v)}/><Field label="IMAGE URL/PATH" value={item.image} onChange={v=>patchList('learning',i,'image',v)}/><Field label="DOCUMENT LINK" value={item.url} onChange={v=>patchList('learning',i,'url',v)}/></div>
            {item.image&&<img className="mt-5 max-h-72 w-full border border-[#c5c0b5] bg-white object-contain" src={item.image} alt={item.title||'Certificate preview'}/>}
            <label className="mt-5 inline-flex cursor-pointer items-center gap-2 border border-[#191919] px-4 py-3 font-mono text-[11px]"><ImagePlus size={16}/> {busy==='upload'?'UPLOADING…':'UPLOAD IMAGE'}<input type="file" className="sr-only" accept="image/png,image/jpeg,image/webp" disabled={!!busy} onChange={e=>{upload(i,e.target.files?.[0]);e.target.value=''}}/></label>
          </article>)}
          <button className={button} onClick={()=>patchProfile('learning',[...profile.learning,blankCertificate()])}><Plus size={16}/> ADD CERTIFICATE</button>
        </>}
        {active==='projects'&&<>
          <h2 className="text-2xl font-black tracking-tight">SELECTED PROJECTS</h2>
          {projects.map((project,i)=><article key={i} className="border border-[#aaa596] bg-[#f8f6f0] p-5 sm:p-7">
            <p className="mb-5 font-mono text-[10px]">PROJECT {project.id} / {project.slug}</p>
            <div className="grid gap-4 sm:grid-cols-2">{[['id','CARD NUMBER'],['slug','SLUG'],['title','TITLE'],['type','CATEGORY'],['year','YEAR'],['mark','MARK'],['description','SHORT DESCRIPTION'],['link','GITHUB URL'],['live','LIVE URL'],['color','CARD COLOR'],['light','LIGHT COLOR']].map(([field,label])=><Field key={field} label={label} value={project[field]} onChange={v=>patchProject(i,field,v)}/>)}</div>
            <div className="mt-4 space-y-4"><Field label="CASE STUDY SUMMARY" multiline value={project.summary} onChange={v=>patchProject(i,'summary',v)}/><Field label="TECH STACK (COMMA SEPARATED)" value={project.stack.join(', ')} onChange={v=>patchProject(i,'stack',v.split(',').map(x=>x.trim()).filter(Boolean))}/></div>
          </article>)}
          <p className="font-mono text-xs text-[#77766c]">Project ordering and the coming-soon card are maintained here. Add/remove cards manually in projects.json for now.</p>
        </>}
        <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-[#191919] bg-[#f3f1ea]/95 py-5 backdrop-blur-sm">
          <p className="font-mono text-[10px] text-[#77766c]">SAVING COMMITS TO MAIN BRANCH</p>
          <button className={button+' bg-[#191919] text-[#f3f1ea]'} onClick={()=>save(active==='projects'?'projects':'profile')} disabled={!!busy}>
            {busy?<Loader2 size={16} className="animate-spin"/>:<Save size={16}/>} SAVE {active==='profile'?'PROFILE':active==='certificates'?'CERTIFICATES':'PROJECTS'}
          </button>
        </div>
      </section>}
      <a href="/" className="my-10 inline-flex items-center gap-2 font-mono text-[11px]"><ArrowLeft size={14}/> BACK TO WEBSITE <ArrowUpRight size={14}/></a>
    </div>
  </main>
}
