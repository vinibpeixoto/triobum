/* triobum — a navegação rápida é opcional; cada rota tem HTML completo acessível sem JS. */
(() => {
  'use strict';
  const script = [...document.scripts].find(item => item.src && /\/router\.js(?:\?|$)/.test(item.src));
  if (!script) return;
  const base = new URL('.', script.src);
  const localFile = base.protocol === 'file:';
  const manifestUrl = new URL('data/routes.json', base);
  let manifest;
  let activePathname = location.pathname;
  function syncScrollOffset(){
    const header=document.querySelector('header.site-header');
    if(header)document.documentElement.style.scrollPaddingTop=`${Math.ceil(header.getBoundingClientRect().height)+24}px`;
  }
  function scrollToAnchor(target){
    syncScrollOffset();
    const offset=parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)||0;
    const top=target.classList.contains('top-anchor')?0:
      Math.max(0,Math.round(target.getBoundingClientRect().top+window.scrollY-offset));
    // Interrompe a rolagem anterior antes de iniciar outra; cliques rápidos não competem.
    window.scrollTo({top:window.scrollY,behavior:'instant'});
    window.scrollTo({top,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  syncScrollOffset();
  window.addEventListener('resize',syncScrollOffset,{passive:true});
  async function routes(){
    // HTMLs locais já têm links navegáveis; fetch(file://) é bloqueado pelo browser.
    if(localFile)return [];
    if (!manifest) manifest = await fetch(manifestUrl).then(response => {
      if(!response.ok)throw new Error('Manifesto não disponível');
      return response.json();
    });
    return manifest.routes;
  }
  if(!localFile)routes().catch(()=>{ manifest=undefined; });
  function pageForUrl(items,url){
    return items.find(route => new URL(route.path.slice(1),base).pathname === url.pathname);
  }
  function syncHead(next){
    document.title=next.title;
    for(const selector of ['meta[name="description"]','meta[name="theme-color"]','meta[property^="og:"]','meta[name^="twitter:"]','link[rel="canonical"]','link[rel="icon"]']){
      document.head.querySelectorAll(selector).forEach(el=>el.remove());
      next.head.querySelectorAll(selector).forEach(el=>document.head.append(el.cloneNode(true)));
    }
    const existing=[...document.head.querySelectorAll('link[rel="stylesheet"]')];
    const requested=[...next.head.querySelectorAll('link[rel="stylesheet"]')];
    existing.forEach(el=>el.remove());
    requested.forEach(el=>document.head.append(el.cloneNode(true)));
  }
  async function navigate(url,push){
    const entry=pageForUrl(await routes(),url);
    if(!entry)return false;
    const response=await fetch(new URL(entry.payload,base));
    if(!response.ok)throw new Error('Página não disponível');
    const payload=await response.json();
    const next=new DOMParser().parseFromString(payload.html,'text/html');
    if(!next.querySelector('main')||!next.querySelector('header')||!next.querySelector('footer'))throw new Error('HTML de página incompleto');
    window.dispatchEvent(new Event('triobum:before-navigate'));
    // A nova URL precisa existir antes de inserir <link> e <img> com caminhos relativos.
    if(push)history.pushState({triobum:true},'',url.href);
    syncHead(next);
    for(const selector of ['.top-anchor','header.site-header','main','footer.site-footer']){
      document.querySelector(selector)?.replaceWith(next.querySelector(selector));
    }
    activePathname=url.pathname;
    syncScrollOffset();
    const inline=document.getElementById('triobum-page-data');
    inline.textContent=JSON.stringify({page:payload.page,theme:payload.theme,components:payload.components,prompts:payload.prompts,site:payload.site});
    window.TriobumApp?.mount(JSON.parse(inline.textContent));
    if(url.hash)document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView();
    else window.scrollTo({top:0,behavior:'instant'});
    const heading=document.querySelector('main h1, main h2');
    heading?.setAttribute('tabindex','-1');heading?.focus({preventScroll:true});
    return true;
  }
  document.addEventListener('click',async event=>{
    const link=event.target instanceof Element ? event.target.closest('a[href]') : null;
    if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.hasAttribute('download')||link.target&&link.target!=='_self')return;
    const url=new URL(link.href,location.href);
    if(url.origin!==location.origin)return;
    if(url.pathname===location.pathname){
      if(url.search!==location.search||!url.hash)return;
      let target;
      try{target=document.getElementById(decodeURIComponent(url.hash.slice(1)));}catch{return;}
      if(!target)return;
      event.preventDefault();
      if(url.href!==location.href)history.pushState({triobum:true},'',url.href);
      if(link.classList.contains('skip-link')){
        target.setAttribute('tabindex','-1');target.focus({preventScroll:true});
      }
      scrollToAnchor(target);
      return;
    }
    const entry=manifest && pageForUrl(manifest.routes,url);
    if(!entry)return;
    event.preventDefault();
    try{await navigate(url,true);}catch{location.assign(url.href);}
  });
  window.addEventListener('popstate',()=>{
    // Uma âncora também dispara popstate: o próprio browser já cuida da rolagem.
    if(location.pathname===activePathname)return;
    navigate(new URL(location.href),false).then(found=>{if(!found)location.reload();}).catch(()=>location.reload());
  });
})();
