const projects = [
  {number:'01',title:'SMaRT–PDM',category:'FULL STACK / MOBILE',year:'2026',description:'A scholarship management and community service platform.',background:'#d3decf',label:'SYSTEMS / 001'},
  {number:'02',title:'EcoLearn',category:'EDUCATIONAL TECH',year:'2025',description:'Making economics easier to explore and understand.',background:'#d6e1ea',label:'EDUCATION / 002'},
  {number:'03',title:'WeLeads',category:'WEB APPLICATION',year:'2025',description:'Project tracking and client engagement, streamlined.',background:'#efd9c4',label:'WEB / 003'},
  {number:'04',title:'Interface Lab',category:'UI EXPERIMENTS',year:'2026',description:'Small experiments in motion, typography, and interaction.',background:'#ddd4e7',label:'EXPERIMENTAL / 004'}
];
const deck=document.getElementById('carouselDeck');
const projectNumber=document.getElementById('projectNumber');
const projectTitle=document.getElementById('projectTitle');
const projectDescription=document.getElementById('projectDescription');
let active=0,dragStart=null;
function distance(index){let d=index-active;const half=projects.length/2;if(d>half)d-=projects.length;if(d<-half)d+=projects.length;return d}
projects.forEach((project,i)=>{
 const card=document.createElement('article');card.className='project-card';card.style.setProperty('--art',project.background);card.innerHTML=`<div class="card-top"><span>${project.number} / ${project.category}</span><span>${project.year}</span></div><div class="project-art" style="background:${project.background}"><div class="mock-window"><div class="mock-bar"><b></b><b></b><b></b></div><div class="mock-screen"><strong>${project.title}</strong><div class="bar"></div><div class="bar"></div><div class="screen-grid"><i></i><i></i><i></i></div></div></div><span class="art-label">${project.label}</span></div><div class="card-bottom"><strong>${project.title}</strong><span>VIEW CONCEPT ↗</span></div>`;
 card.addEventListener('click',()=>goTo(i));deck.appendChild(card);
});
function render(){[...deck.children].forEach((card,index)=>{const d=distance(index),abs=Math.abs(d);let x=d*245,z=abs===0?140:abs===1?-100:-360,rotate=-d*19,scale=abs===0?1:abs===1?.84:.65;card.style.transform=`translateX(${x}px) translateZ(${z}px) rotateY(${rotate}deg) scale(${scale})`;card.style.zIndex=String(5-abs);card.style.opacity=abs>1?.25:1;card.style.filter=abs>1?'grayscale(.7)':'none';card.setAttribute('aria-hidden',abs>1?'true':'false')});const p=projects[active];projectNumber.innerHTML=`${p.number} <span>/ 0${projects.length}</span>`;projectTitle.textContent=p.title;projectDescription.textContent=p.description}
function goTo(index){active=(index+projects.length)%projects.length;render()}
document.getElementById('prevProject').addEventListener('click',()=>goTo(active-1));document.getElementById('nextProject').addEventListener('click',()=>goTo(active+1));
document.getElementById('carousel').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();goTo(active-1)}if(e.key==='ArrowRight'){e.preventDefault();goTo(active+1)}});
const stage=document.getElementById('carousel');stage.addEventListener('pointerdown',e=>{dragStart=e.clientX});stage.addEventListener('pointerup',e=>{if(dragStart===null)return;const delta=e.clientX-dragStart;if(Math.abs(delta)>45)goTo(active+(delta<0?1:-1));dragStart=null});stage.addEventListener('pointercancel',()=>dragStart=null);
const mobileToggle=document.getElementById('menuToggle');const mobileNav=document.getElementById('mobileNav');mobileToggle.addEventListener('click',()=>{const open=mobileNav.classList.toggle('open');mobileToggle.setAttribute('aria-expanded',String(open))});mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobileNav.classList.remove('open');mobileToggle.setAttribute('aria-expanded','false')}));
const progress=document.getElementById('progress');let scheduled=false;addEventListener('scroll',()=>{if(!scheduled){requestAnimationFrame(()=>{const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=`${max>0?scrollY/max*100:0}%`;scheduled=false});scheduled=true}},{passive:true});render();
