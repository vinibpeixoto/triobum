/* triobum — interações nativas. Todo conteúdo vem do JSON da página renderizada. */
(() => {
  'use strict';
  let controller;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scrollBehavior = () => motion.matches ? 'instant' : 'smooth';
  const format = (template, values) => template.replace(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g, (_, key) => String(values[key] ?? ''));
  const byId = id => document.getElementById(id);
  const optionFor = (fields, fieldId, optionId) => fields.find(field => field.fieldId === fieldId)?.options.find(option => option.id === optionId);
  const externalLink = (prompts, pageUrl, body) => {
    const url = new URL(prompts.provider.baseUrl);
    url.searchParams.set(prompts.provider.queryParameter, `${body}\n\n${format(prompts.editorialContext, {pageUrl})}`);
    return url.toString();
  };
  function mount(state) {
    controller?.abort();
    controller = new AbortController();
    const signal = controller.signal;
    const listen = (el, type, handler, options={}) => el?.addEventListener(type, handler, {...options, signal});
    const {components={}, theme, prompts, site} = state;

    const discover = components.discover;
    if (discover && byId('wizard-step-1')) {
      const fields = discover.steps.flatMap(step => step.fields);
      const fieldDefs = [theme.coreConcept, ...theme.additionalAttributes];
      const labels = Object.fromEntries(fieldDefs.map(def => [def.id, def.name.toLowerCase()]));
      const answers = Object.fromEntries(fields.map(field => [field.fieldId, null]));
      const feedback = byId('wizard-feedback');
      const recommendation = byId('recommendation');
      const steps = [...document.querySelectorAll('.wizard-step')];
      const progress = [...document.querySelectorAll('.wizard-progress span')];
      const counter = byId('wizard-counter');
      const clearRecommendation = () => {
        recommendation.hidden = true;
        byId('recommendation-title').textContent = '';
        byId('recommendation-reason').textContent = '';
        byId('profile-ai-link').href = prompts.provider.baseUrl;
      };
      function selectStep(stepNo) {
        clearRecommendation();
        steps.forEach((el,index) => { el.hidden = index !== stepNo - 1; });
        progress.forEach((bar,index) => bar.classList.toggle('is-current',index===stepNo-1));
        counter.textContent = format(discover.stage.counterFormat,{currentPadded:String(stepNo).padStart(2,'0'),totalPadded:String(steps.length).padStart(2,'0')});
        feedback.textContent = format(discover.messages.stepAnnouncement,{current:stepNo,total:steps.length});
        steps[stepNo-1].querySelector('h3')?.focus({preventScroll:true});
        if(stepNo>1) steps[stepNo-1].scrollIntoView({behavior:scrollBehavior(),block:'center'});
      }
      document.querySelectorAll('[data-question]').forEach(group => {
        const buttons=[...group.querySelectorAll('button[data-value]')];
        buttons[0] && (buttons[0].tabIndex=0);
        function select(choice){
          for(const button of buttons){const selected=button===choice;button.setAttribute('aria-checked',String(selected));button.tabIndex=selected?0:-1;}
          answers[group.dataset.question]=choice.dataset.value;
          feedback.textContent='';clearRecommendation();
        }
        listen(group,'click',event=>{const choice=event.target.closest('button[data-value]');if(choice&&group.contains(choice))select(choice);});
        listen(group,'keydown',event=>{
          if(!['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'].includes(event.key))return;
          event.preventDefault();
          const current=buttons.indexOf(document.activeElement);
          const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:
            (current+(['ArrowLeft','ArrowUp'].includes(event.key)?-1:1)+buttons.length)%buttons.length;
          select(buttons[next]);buttons[next].focus();
        });
      });
      const missing=ids=>ids.filter(id=>!answers[id]).map(id=>labels[id]||id);
      document.querySelectorAll('[data-wizard-next]').forEach(button=>listen(button,'click',()=>{
        const stepNo=Number(button.dataset.wizardNext);
        const omitted=missing(discover.steps[stepNo-1].fields.map(field=>field.fieldId));
        if(omitted.length){feedback.textContent=format(discover.messages.missingFirstStep,{missingFields:omitted.join(discover.messages.firstStepJoiner)});return;}
        selectStep(stepNo+1);
      }));
      document.querySelectorAll('[data-wizard-back]').forEach(button=>listen(button,'click',()=>selectStep(Number(button.dataset.wizardBack)-1)));
      listen(byId('wizard-submit'),'click',()=>{
        const omitted=missing(fields.map(field=>field.fieldId));
        if(omitted.length){feedback.textContent=format(discover.messages.missingAnswers,{missingFields:omitted.join(discover.messages.otherStepsJoiner)});return;}
        const recommendationData=discover.recommendation;
        const matched=recommendationData.rules.find(rule=>rule.all.every(condition=>
          (!Object.hasOwn(condition,'equals')||answers[condition.fieldId]===condition.equals)&&
          (!Object.hasOwn(condition,'notEquals')||answers[condition.fieldId]!==condition.notEquals)));
        const model=matched?.modelId||recommendationData.defaultModelId;
        const values={};
        for(const [name,binding] of Object.entries(recommendationData.reasonBindings)){
          const choiceId=answers[binding.fieldId], option=optionFor(fields,binding.fieldId,choiceId);
          if(binding.values)values[name]=binding.values[choiceId];
          else if(binding.messages)values[name]=choiceId===binding.unselectedOptionId?binding.messages.unselected:
            format(binding.messages.selected,{[binding.valueVariable]:option[binding.valueProperty]||option.label});
          else values[name]=option[binding.optionProperty];
          if(binding.transform==='lowercase')values[name]=values[name].toLowerCase();
        }
        const reason=format(recommendationData.reasons[model],values);
        byId('recommendation-title').textContent=recommendationData.titles[model];
        byId('recommendation-reason').textContent=reason;
        const profile=prompts.dynamicPrompts['discover.profile'];
        const answerLines=profile.fieldIds.map(id=>format(profile.answerLines[id],{label:optionFor(fields,id,answers[id]).label}));
        const text=[format(profile.intro,{pageUrl:site.pageUrl}),...answerLines,profile.shoppingInstruction,profile.outro].join('\n');
        byId('profile-ai-link').href=externalLink(prompts,site.pageUrl,text);
        recommendation.hidden=false;
        byId('recommendation-title').focus({preventScroll:true});
        recommendation.scrollIntoView({behavior:scrollBehavior(),block:'center'});
      });
    }

    const choose = components.choose;
    if (choose && byId('product-track')) {
      const cards=[...document.querySelectorAll('.product-card')];
      const categories=[...document.querySelectorAll('.category')];
      const track=byId('product-track');
      let active=0,timer,programmaticTimer,programmaticScroll=false;
      const setActive=(index,scroll=true)=>{
        active=(index+cards.length)%cards.length;
        const card=cards[active];
        if(scroll){
          programmaticScroll=true;
          clearTimeout(programmaticTimer);
          programmaticTimer=setTimeout(()=>{programmaticScroll=false;},1000);
          track.scrollTo({left:card.offsetLeft-cards[0].offsetLeft,behavior:scrollBehavior()});
        }
        cards.forEach((item,i)=>item.setAttribute('aria-current',String(i===active)));
        categories.forEach(button=>{const selected=button.dataset.category===card.dataset.category;button.classList.toggle('is-active',selected);button.setAttribute('aria-pressed',String(selected));});
        byId('carousel-status').textContent=format(choose.carouselStatusFormat,{current:active+1,total:cards.length});
      };
      categories.forEach(button=>listen(button,'click',()=>setActive(cards.findIndex(card=>card.dataset.category===button.dataset.category))));
      listen(byId('carousel-prev'),'click',()=>setActive(active-1));
      listen(byId('carousel-next'),'click',()=>setActive(active+1));
      const manualScroll=()=>{programmaticScroll=false;clearTimeout(programmaticTimer);};
      listen(track,'pointerdown',manualScroll);
      listen(track,'wheel',manualScroll,{passive:true});
      listen(track,'keydown',manualScroll);
      listen(track,'scroll',()=>{if(programmaticScroll)return;clearTimeout(timer);timer=setTimeout(()=>{
        const max=track.scrollWidth-track.clientWidth;
        const index=max>0&&track.scrollLeft>=max-3?cards.length-1:
          cards.reduce((nearest,card,i)=>Math.abs(card.offsetLeft-cards[0].offsetLeft-track.scrollLeft)<Math.abs(cards[nearest].offsetLeft-cards[0].offsetLeft-track.scrollLeft)?i:nearest,0);
        setActive(index,false);
      },90);});
      listen(window,'triobum:before-navigate',()=>{clearTimeout(timer);clearTimeout(programmaticTimer);});
    }

    const daily = components.daily_drop;
    if (daily && document.querySelector('.stories')) {
      const stories=[...document.querySelectorAll('.story')], track=document.querySelector('.stories');
      let active=0,timer;
      const setActive=(index,scroll=true)=>{
        active=(index+stories.length)%stories.length;
        if(scroll)track.scrollTo({left:stories[active].offsetLeft-stories[0].offsetLeft,behavior:scrollBehavior()});
        byId('story-count').textContent=format(daily.storyCounterFormat,{current:active+1,total:stories.length});
        stories.forEach((story,i)=>story.setAttribute('aria-current',String(i===active)));
      };
      listen(byId('story-prev'),'click',()=>setActive(active-1));
      listen(byId('story-next'),'click',()=>setActive(active+1));
      listen(track,'scroll',()=>{clearTimeout(timer);timer=setTimeout(()=>{
        const index=stories.reduce((nearest,story,i)=>Math.abs(story.offsetLeft-stories[0].offsetLeft-track.scrollLeft)<Math.abs(stories[nearest].offsetLeft-stories[0].offsetLeft-track.scrollLeft)?i:nearest,0);
        setActive(index,false);
      },90);});
      listen(window,'triobum:before-navigate',()=>clearTimeout(timer));
    }

    const comparison = components.compare;
    if(comparison && byId('compare')){
      const section=byId('compare'),products=section.querySelector('.compare-products'),progress=section.querySelector('.compare-mobile-progress'),navigation=section.querySelector('.compare-mobile-navigation');
      let step=1;
      section.classList.add('is-enhanced');progress.hidden=false;navigation.hidden=false;
      const description=byId('compare-step-description');
      const comparisonTarget=byId(comparison.moreProducts.resultLink.targetId);
      const moreProducts=byId('compare-products-more'),moreProductsCaption=byId('compare-products-caption'),moreProductsStatus=byId('compare-products-status');
      let currentIds=[...comparison.productIds];
      const appScript=[...document.querySelectorAll('script[src]')].find(item=>item.src && /\/script\.js(?:\?|$)/.test(item.src));
      const base=appScript && new URL('.',appScript.src);
      function loadLocalCatalog(){
        // Browsers block fetch(file://...) for JSON, but allow a local external script.
        // The build generates this sidecar from the same products.json; no extra product is in HTML.
        return new Promise((resolve,reject)=>{
          const script=document.createElement('script');
          const url=new URL(comparison.catalogScriptPath,base);
          url.searchParams.set('v',comparison.catalogRevision);
          script.src=url.href;
          script.onload=()=>{
            const data=window.TriobumCatalogs?.[theme.id];
            script.remove();
            if(data)resolve(data);
            else reject(new Error('Catálogo local vazio'));
          };
          script.onerror=()=>{script.remove();reject(new Error('Catálogo local indisponível'));};
          document.head.append(script);
        });
      }
      function renderPair(pair){
        const cards=[...products.querySelectorAll('.compare-product')];
        const summaryCards=[...section.querySelectorAll('.compare-summary > div')];
        const rows=[...section.querySelectorAll('.comparison-row')];
        pair.forEach((product,index)=>{
          const card=cards[index], nickname=product.nickname;
          card.dataset.model=product.slug;
          card.querySelector('h3').textContent=product.name;
          card.querySelector('p').textContent=product.concept;
          const image=card.querySelector('img');
          image.src=new URL(product.image.src,base).href;
          image.alt=product.image.alt;
          const swatches=card.querySelector('.swatches');
          swatches.setAttribute('aria-label',format(comparison.productAction.colorsLabelFormat,{nickname}));
          swatches.replaceChildren(...product.appearance.colors.map(color=>{
            const swatch=document.createElement('span');swatch.style.setProperty('--swatch',color);return swatch;
          }));
          const link=card.querySelector('.link-arrow');
          const label=format(comparison.productAction.labelFormat,{nickname});
          link.dataset.topic=product.comparePromptId;
          link.href=externalLink(prompts,site.pageUrl,prompts.topicPrompts[product.comparePromptId]);
          link.setAttribute('aria-label',format(prompts.provider.accessibleLabelFormat,{label}));
          const icon=document.createElement('span');
          icon.textContent=comparison.productAction.icon;
          icon.setAttribute('aria-hidden','true');
          link.replaceChildren(document.createTextNode(`${label} `),icon);

          rows.forEach((row,rowIndex)=>{
            const detail=row.querySelectorAll('.compare-detail')[index];
            const text=product.comparison[comparison.attributes[rowIndex].id];
            detail.dataset.model=product.slug;
            detail.style.backgroundColor=product.appearance.comparisonBackground;
            detail.querySelector('.sr-only').textContent=`${product.name}:`;
            const caption=detail.querySelector('.detail-model-label');
            caption.textContent=nickname;caption.style.color=product.appearance.labelColor;
            detail.querySelector('h4').textContent=text.headline;
            detail.querySelector('p').textContent=text.description;
          });
          const summary=summaryCards[index];
          summary.dataset.model=product.slug;
          summary.style.backgroundColor=product.appearance.comparisonBackground;
          const title=summary.querySelector('.summary-name');
          title.textContent=nickname;title.style.color=product.appearance.labelColor;
          const headline=summary.querySelector('h3');
          headline.textContent=product.summary.headline;headline.style.color=product.appearance.labelColor;
          summary.querySelector('p').textContent=product.summary.description;
        });
        section.querySelector('.comparison-list').setAttribute('aria-label',format(comparison.accessibleLabelFormat,{
          firstProduct:pair[0].name,secondProduct:pair[1].name
        }));
        const overview=prompts.dynamicPrompts['compare.pair'];
        const context={firstProduct:pair[0].name,firstConcept:pair[0].concept,firstSummary:pair[0].summary.headline,
          secondProduct:pair[1].name,secondConcept:pair[1].concept,secondSummary:pair[1].summary.headline};
        const comparisonLink=section.querySelector('.compare-more');
        comparisonLink.dataset.topic='compare.pair';
        comparisonLink.href=externalLink(prompts,site.pageUrl,
          `${format(overview.intro,context)}\n${overview.instruction}`);
        currentIds=pair.map(product=>product.id);
      }
      if(moreProducts && moreProductsCaption && moreProductsStatus && base) listen(moreProducts,'click',async()=>{
        moreProducts.disabled=true;
        moreProductsStatus.hidden=false;
        moreProductsStatus.textContent=comparison.moreProducts.loadingMessage;
        try{
          let catalog;
          if(base.protocol==='file:') catalog=await loadLocalCatalog();
          else {
            const url=new URL(comparison.catalogPath,base);
            url.searchParams.set('v',comparison.catalogRevision);
            const response=await fetch(url,{cache:'no-store',signal});
            if(!response.ok)throw new Error('Catálogo indisponível');
            catalog=await response.json();
          }
          if(catalog.themeId!==theme.id || !Array.isArray(catalog.products))throw new Error('Catálogo inválido');
          const ready=catalog.products.filter(product=>product.status==='ready' && product.themeId===theme.id);
          if(new Set(ready.map(product=>product.id)).size!==ready.length || ready.some(product=>
            !product.name || !product.nickname || !product.concept || !product.image?.src?.startsWith('assets/') ||
            !Array.isArray(product.appearance?.colors) || !product.appearance?.comparisonBackground ||
            !product.appearance?.labelColor || !prompts.topicPrompts[product.comparePromptId] ||
            !comparison.attributes.every(attribute=>product.comparison?.[attribute.id]?.headline &&
              product.comparison[attribute.id].description) || !product.summary?.headline || !product.summary?.description
          ))throw new Error('Catálogo incompleto');
          const pair=window.TriobumPairing.chooseOtherPair(ready,currentIds);
          if(!pair){moreProductsStatus.textContent=comparison.moreProducts.emptyMessage;return;}
          renderPair(pair);
          show(1);
          const names={firstProduct:pair[0].name,secondProduct:pair[1].name};
          const messageParts=comparison.moreProducts.successMessageFormat
            .split(/(\{firstProduct\}|\{secondProduct\})/g)
            .filter(Boolean)
            .map(part=>{
              const name=names[part.slice(1,-1)];
              if(!name || !/^\{(?:firstProduct|secondProduct)\}$/.test(part))return document.createTextNode(part);
              const strong=document.createElement('strong');
              strong.textContent=name;
              return strong;
            });
          moreProductsCaption.replaceChildren(...messageParts);
          moreProductsStatus.textContent='';
          moreProductsStatus.hidden=true;
        }catch{
          if(!signal.aborted)moreProductsStatus.textContent=comparison.moreProducts.errorMessage;
        }finally{
          moreProducts.disabled=false;
        }
      });
      function show(next,moveFocus=false){
        step=Math.min(comparison.mobileSteps.length,Math.max(1,next));
        section.dataset.step=String(step);
        const label=format(comparison.mobileNavigation.counterFormat,{currentPadded:String(step).padStart(2,'0'),totalPadded:String(comparison.mobileSteps.length).padStart(2,'0')});
        byId('compare-step-count').textContent=label;byId('compare-nav-counter').textContent=label;
        description.textContent=comparison.mobileSteps[step-1].description;
        progress.querySelectorAll('i').forEach((bar,index)=>bar.classList.toggle('active',index===step-1));
        byId('compare-back').hidden=step===1;byId('compare-next').hidden=step===comparison.mobileSteps.length;
        if(moveFocus){
          comparisonTarget.focus({preventScroll:true});
          comparisonTarget.scrollIntoView({behavior:scrollBehavior(),block:'start'});
        }
      }
      listen(byId('compare-back'),'click',()=>show(step-1,true));
      listen(byId('compare-next'),'click',()=>show(step+1,true));
      show(1);
    }

    const explore=components.explore;
    if(explore && byId('explore')){
      const section=byId('explore'),list=byId('places-list');
      function render(filterId){
        const filter=explore.filters.find(item=>item.id===filterId);
        if(!filter)return;
        section.dataset.activeFilter=filter.id;
        const map=section.querySelector('.map-panel');
        map.querySelectorAll('.map-marker').forEach(marker=>marker.remove());
        filter.markers.forEach((_,index)=>{
          const marker=document.createElement('span');
          marker.className=`map-marker marker-${index+1}`;
          marker.setAttribute('aria-hidden','true');
          map.append(marker);
        });
        byId('places-title').textContent=filter.title;
        byId('places-description').textContent=filter.description;
        document.querySelectorAll('[data-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===filter.id)));
        const prompt=prompts.dynamicPrompts['places.search'];
        list.replaceChildren(...filter.items.map(place=>{
          const item=document.createElement('li');
          const strong=document.createElement('strong');strong.textContent=place.title;
          const location=document.createElement('span');location.textContent=place.location;
          const link=document.createElement('a');
          link.textContent=`${explore.placesPanel.itemAction.label} ${explore.placesPanel.itemAction.icon}`;
          link.setAttribute('aria-label',format(explore.placesPanel.itemAction.accessibleLabelFormat,{title:place.title}));
          link.href=externalLink(prompts,site.pageUrl,[format(prompt.intro,{
            category:prompt.categories[filter.id],location:place.location,name:place.title,description:place.description
          }),prompt.verification,prompt.context].join('\n'));
          link.target='_blank';link.rel='noopener noreferrer';
          item.append(strong,location,link);return item;
        }));
      }
      document.querySelectorAll('[data-filter]').forEach(button=>listen(button,'click',()=>render(button.dataset.filter)));
      render(explore.initialFilterId);
    }
  }
  window.TriobumApp={mount};
  const inline=document.getElementById('triobum-page-data');
  if(inline)mount(JSON.parse(inline.textContent));
})();
