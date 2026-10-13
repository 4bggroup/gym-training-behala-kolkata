/* FORM / purposeful studio motion. All core content works without this file. */
(() => {
 'use strict';
 const $ = (selector, root=document) => root.querySelector(selector);
 const $$ = (selector, root=document) => Array.from(root.querySelectorAll(selector));
 const systemPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
 const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)');
 const smallScreen=window.matchMedia('(max-width: 700px)');
 const motionButton=$('.motion-toggle');
 let motionEnabled=!systemPreference.matches;
 const running=new Set();
 const grid=$('.programme-grid');
 const cards=$$('.programme-card');
 const previous=$('.panel-prev'), next=$('.panel-next');
 const indicator=$('#programme-position');
 grid.id='programme-panels';
 previous.setAttribute('aria-controls',grid.id);
 next.setAttribute('aria-controls',grid.id);
 let focusedCard=cards.find(card=>card.classList.contains('is-spotlight'))||cards[0];
 function visibleCards(){return cards.filter(card=>!card.hidden);}
 function focusPanel(card,scroll=false){
  if(!card||card.hidden)return;
  focusedCard=card;
  cards.forEach(item=>item.classList.toggle('is-spotlight',item===card));
  const visible=visibleCards();
  const index=visible.indexOf(card);
  indicator.textContent=`${String(index+1).padStart(2,'0')} / ${String(visible.length).padStart(2,'0')}`;
  previous.disabled=next.disabled=visible.length<2;
  if(scroll&&smallScreen.matches&&typeof grid.scrollTo==='function'){
   grid.scrollTo({left:card.offsetLeft,behavior:motionEnabled?'smooth':'auto'});
  }
 }
 cards.forEach(card=>{
  card.addEventListener('pointerenter',()=>{if(finePointer.matches&&!smallScreen.matches)focusPanel(card);});
  card.addEventListener('focusin',()=>focusPanel(card));
 });
 previous.addEventListener('click',()=>{
  const visible=visibleCards(),i=Math.max(0,visible.indexOf(focusedCard));
  focusPanel(visible[(i-1+visible.length)%visible.length],true);
 });
 next.addEventListener('click',()=>{
  const visible=visibleCards(),i=Math.max(0,visible.indexOf(focusedCard));
  focusPanel(visible[(i+1)%visible.length],true);
 });
 $$('.filter').forEach(button=>button.addEventListener('click',()=>{
  const visible=visibleCards();focusPanel(visible.includes(focusedCard)?focusedCard:visible[0],true);
 }));
 let panelScrollQueued=false;
 grid.addEventListener('scroll',()=>{
  if(!smallScreen.matches||panelScrollQueued)return;
  panelScrollQueued=true;
  window.requestAnimationFrame(()=>{
   panelScrollQueued=false;
   const visible=visibleCards();
   const nearest=visible.reduce((best,card)=>!best||Math.abs(card.offsetLeft-grid.scrollLeft)<Math.abs(best.offsetLeft-grid.scrollLeft)?card:best,null);
   if(nearest)focusPanel(nearest);
  });
 },{passive:true});
 focusPanel(focusedCard);

 function setMotion(enabled){
  motionEnabled=!!enabled&&!systemPreference.matches;
  document.body.classList.toggle('motion-off',!motionEnabled);
  document.body.classList.toggle('motion-ready',motionEnabled);
  motionButton.setAttribute('aria-pressed',String(motionEnabled));
  motionButton.disabled=systemPreference.matches;
  motionButton.title=systemPreference.matches?'Your device preference disables decorative motion.':'';
  $('.motion-label').textContent=motionEnabled?'Motion on':'Motion off';
  motionButton.setAttribute('aria-label',motionEnabled?'Pause decorative motion':'Enable decorative motion');
  if(!motionEnabled){
   running.forEach(animation=>animation.cancel());running.clear();
   $('.hero-media').style.removeProperty('--hero-x');
   $('.hero-media').style.removeProperty('--hero-y');
   $('.hero-lane').style.removeProperty('--lane-shift');
   $('.footer-word').style.removeProperty('--footer-shift');
  }
 }
 motionButton.addEventListener('click',()=>setMotion(!motionEnabled));
 if(systemPreference.addEventListener)systemPreference.addEventListener('change',()=>setMotion(!systemPreference.matches));
 setMotion(motionEnabled);
 document.addEventListener('visibilitychange',()=>document.body.classList.toggle('tab-away',document.hidden));

 // The projected training floor follows movement inside the hero only.
 // It does not replace the pointer or disturb the rest of the page.
 const hero=$('.hero'),photo=$('.hero-media'),floor=$('.hero-lane');
 let heroFrame=0,heroPoint={x:0,y:0};
 hero.addEventListener('pointermove',event=>{
  if(!motionEnabled||!finePointer.matches||smallScreen.matches)return;
  const box=hero.getBoundingClientRect();
  heroPoint={x:(event.clientX-box.left)/box.width-.5,y:(event.clientY-box.top)/box.height-.5};
  if(heroFrame)return;
  heroFrame=window.requestAnimationFrame(()=>{
   heroFrame=0;
   photo.style.setProperty('--hero-x',`${(heroPoint.x*8).toFixed(2)}px`);
   photo.style.setProperty('--hero-y',`${(heroPoint.y*5).toFixed(2)}px`);
   floor.style.setProperty('--lane-shift',`${(heroPoint.x*20).toFixed(2)}px`);
  });
 },{passive:true});
 hero.addEventListener('pointerleave',()=>{
  photo.style.setProperty('--hero-x','0px');photo.style.setProperty('--hero-y','0px');floor.style.setProperty('--lane-shift','0px');
 });

 // A local studio-photo viewfinder indicates the existing enlarge action.
 $$('.studio-image').forEach(button=>{
  const finder=document.createElement('span');finder.className='photo-viewfinder';finder.textContent='+ VIEW';finder.setAttribute('aria-hidden','true');button.append(finder);
  button.addEventListener('pointermove',event=>{
   if(!motionEnabled||!finePointer.matches)return;
   const box=button.getBoundingClientRect();
   const x=Math.min(box.width-42,Math.max(42,event.clientX-box.left));
   const y=Math.min(box.height-42,Math.max(42,event.clientY-box.top));
   finder.style.setProperty('--finder-x',`${x}px`);finder.style.setProperty('--finder-y',`${y}px`);
  },{passive:true});
 });

 // Four-stop training route. Buttons remain the primary accessible control.
 const stepButtons=$$('.journey-step');
 const stage=$('#journey-panel');
 const journeyImage=$('#journey-image');
 const runway=$('.journey-runway');
 let lastStep=0;
 let changingTimer=0;
 function routeTo(index){
  runway.style.setProperty('--step-progress',String(index));
  runway.style.setProperty('--route-width',`${12.5+index*25}%`);
  $$('i',runway).forEach((dot,i)=>dot.classList.toggle('is-past',i<=index));
  if(!motionEnabled){lastStep=index;return;}
  stage.classList.remove('is-changing');
  void stage.offsetWidth;
  stage.classList.add('is-changing');
  window.clearTimeout(changingTimer);
  changingTimer=window.setTimeout(()=>stage.classList.remove('is-changing'),720);
  if(index!==lastStep&&typeof journeyImage.animate==='function'){
   const from=index>lastStep?'polygon(0 0,5% 0,0 100%,0 100%)':'polygon(95% 0,100% 0,100% 100%,100% 100%)';
   const animation=journeyImage.animate([
    {clipPath:from,transform:'scale(1.035)'},
    {clipPath:'polygon(0 0,100% 0,100% 100%,0 100%)',transform:'scale(1)'}
   ],{duration:650,easing:'cubic-bezier(.22,1,.36,1)'});
   running.add(animation);
   animation.onfinish=animation.oncancel=()=>running.delete(animation);
  }
  lastStep=index;
 }
 stepButtons.forEach((button,index)=>{
  button.addEventListener('click',()=>routeTo(index));
  button.addEventListener('keydown',event=>{
   if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)){
    const selected=stepButtons.findIndex(item=>item.getAttribute('aria-selected')==='true');
    routeTo(Math.max(0,selected));
   }
  });
 });
 runway.style.setProperty('--step-progress','0');
 $$('i',runway)[0]?.classList.add('is-past');

 if('IntersectionObserver'in window){
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    entry.target.classList.add('is-in-view');observer.unobserve(entry.target);
   });
  },{threshold:.14});
  $$('.about-photo,.recovery-photo').forEach(element=>observer.observe(element));
  // Warm the route photos only when a visitor approaches the journey section.
  const warm=new IntersectionObserver(entries=>{
   if(!entries.some(entry=>entry.isIntersecting))return;
   if(typeof window.Image==='function')['02-warm-up.webp','03-technique-coaching.webp','09-cable-row.webp'].forEach(name=>{const image=new window.Image();image.src=`assets/images/${name}`;});
   warm.disconnect();
  },{rootMargin:'250px'});
  warm.observe($('#journey'));
 }

 // Recovery graphic and FORM wordmark move in relation to their own sections.
 // No continuous animation loop runs while the page is idle.
 const reset=$('.recovery'),orbit=$('.reset-orbit'),footer=$('.site-footer'),word=$('.footer-word');
 let scrollFrame=0;
 function updateScene(){
  scrollFrame=0;if(!motionEnabled)return;
  const view=window.innerHeight;
  const resetBox=reset.getBoundingClientRect();
  if(resetBox.top<view&&resetBox.bottom>0){
   const progress=Math.max(0,Math.min(1,(view-resetBox.top)/(view+resetBox.height)));
   orbit.style.setProperty('--orbit-turn',`${(-20+progress*48).toFixed(2)}deg`);
  }
  if(!smallScreen.matches){
   const footerBox=footer.getBoundingClientRect();
   if(footerBox.top<view&&footerBox.bottom>0){
    const progress=Math.max(0,Math.min(1,(view-footerBox.top)/(view+footerBox.height)));
    word.style.setProperty('--footer-shift',`${(-15+progress*30).toFixed(2)}px`);
   }
  }
 }
 window.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=window.requestAnimationFrame(updateScene);},{passive:true});
 window.addEventListener('resize',()=>{focusPanel(focusedCard);updateScene();});
 updateScene();
})();
