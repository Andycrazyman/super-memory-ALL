(() => {
  const button = document.getElementById('exportProfessorSite');
  if (!button) return;
  const weeks = [
    ['Week 1','Start here','Set up your workspace and goals.'],['Week 2','Foundations','Build the core skills and vocabulary.'],['Week 3','Practice','Keep your existing work and strengthen the basics.'],['Week 4','Connect, change, explain','JavaScript, connections, and your 3D page.'],['Week 5','Explore','Apply the ideas to your own subject.'],['Week 6','Build','Create and test a useful feature.'],['Week 7','Refine','Review what works and improve it.'],['Week 8','Checkpoint','Organize your work and record progress.'],['Week 9','Research','Gather and organize supporting material.'],['Week 10','Create','Turn your research into a working project.'],['Week 11','Test','Try controlled changes and document results.'],['Week 12','Explain','Make your work understandable to visitors.'],['Week 13','Design','Improve structure, layout, and navigation.'],['Week 14','Connect','Link related pages and resources.'],['Week 15','Review','Check details and correct problems.'],['Week 16','Polish','Improve accessibility and responsive layout.'],['Week 17','Share','Prepare the complete published folder.'],['Week 18','Feedback','Use observations to make corrections.'],['Week 19','Final checks','Test links, pages, layout, and interactions.'],['Week 20','Finish','Complete your final review and publish.']
  ];
  const esc = v => String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const nl = v => esc(v).replace(/\n/g,'<br>');
  function getWeek(i) {
    const d = {description:'',whatDid:'',learned:'',problems:'',nextSteps:'',html:'',checklist:[],resources:[],images:[],notes:[]};
    try { Object.assign(d, JSON.parse(localStorage.getItem(`studyHubWeek${i}`) || '{}') || {}); } catch {}
    let chalk = '';
    try {
      const c = JSON.parse(localStorage.getItem(`studyHubWeek${i}-chalk`) || '{}');
      if (c && (c.strokes?.length || c.texts?.length)) {
        const canvas=document.createElement('canvas'); canvas.width=1400; canvas.height=700; const x=canvas.getContext('2d');
        x.fillStyle='#111'; x.fillRect(0,0,1400,700); x.lineCap='round'; x.lineJoin='round';
        for(const st of c.strokes||[]){x.strokeStyle=st.tool==='eraser'?'#111':'#f4f1de';x.lineWidth=(st.size||4)*1.5;x.beginPath();(st.points||[]).forEach((pt,k)=>k?x.lineTo(pt.x*1400,pt.y*700):x.moveTo(pt.x*1400,pt.y*700));x.stroke();}
        for(const tx of c.texts||[]){x.fillStyle='#f4f1de';x.font='32px cursive';x.fillText(tx.text,tx.x*1400,tx.y*700);}
        chalk=canvas.toDataURL('image/png');
      }
    } catch {}
    return {...d,chalk};
  }
  function render() {
    let html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Study Hub — Professor Review</title><style>body{font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:1100px;margin:auto;padding:32px;background:#eef1f5;color:#172033;line-height:1.6}header{background:#111827;color:white;padding:28px;border-radius:20px;margin-bottom:24px}section.week{background:white;border:1px solid #d8dde6;border-radius:18px;padding:26px;margin:22px 0;box-shadow:0 8px 24px rgba(0,0,0,.05)}h1{margin:0;font-size:40px}h2{margin-top:0}h3{margin-bottom:6px}.meta{color:#657084}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}.box{background:#f7f8fa;border-radius:12px;padding:14px}.code{white-space:pre-wrap;background:#111827;color:#e5e7eb;padding:16px;border-radius:12px;overflow:auto}.preview{width:100%;min-height:300px;border:1px solid #d8dde6;border-radius:12px}.images{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}.images img{width:100%;max-height:320px;object-fit:contain;background:#eee;border-radius:10px}.chalk{width:100%;background:#111;border-radius:12px}.check{padding-left:20px}.resource{margin:6px 0}.empty{color:#8791a3;font-style:italic}</style></head><body><header><p>STUDY HUB · PROFESSOR REVIEW</p><h1>20-Week Portfolio</h1><p>Self-contained review copy. This file can be opened directly in a browser without Node, a server, or AI.</p></header>`;
    weeks.forEach((w,idx)=>{
      const d=getWeek(idx+1); const hasText=d.description||d.whatDid||d.learned||d.problems||d.nextSteps; const hasAny=hasText||d.html||d.images?.length||d.resources?.length||d.checklist?.length||d.chalk;
      html += `<section class="week"><p class="meta">${esc(w[0])}</p><h2>${esc(w[1])}</h2><p class="meta">${esc(w[2])}</p>`;
      if (!hasAny) html += '<p class="empty">No student content has been entered for this week yet.</p>';
      if(hasText) html += `<div class="grid"><div class="box"><h3>Overview</h3><p>${nl(d.description)}</p></div><div class="box"><h3>What I did</h3><p>${nl(d.whatDid)}</p></div><div class="box"><h3>What I learned</h3><p>${nl(d.learned)}</p></div><div class="box"><h3>Problems & fixes</h3><p>${nl(d.problems)}</p></div><div class="box"><h3>Next steps</h3><p>${nl(d.nextSteps)}</p></div></div>`;
      if(d.html) html += `<h3>HTML work</h3><pre class="code">${esc(d.html)}</pre><iframe class="preview" sandbox="allow-scripts" srcdoc="${esc('<!doctype html><html><body style=&quot;font-family:system-ui;padding:24px&quot;>'+d.html+'</body></html>')}"></iframe>`;
      if(d.images?.length) html += `<h3>Evidence</h3><div class="images">${d.images.map(x=>`<figure><img src="${x.src}" alt="${esc(x.alt)}"><figcaption>${esc(x.alt)}</figcaption></figure>`).join('')}</div>`;
      if(d.resources?.length) html += `<h3>Resources</h3><ul>${d.resources.map(x=>`<li class="resource"><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.name)}</a></li>`).join('')}</ul>`;
      if(d.checklist?.length) html += `<h3>Checklist</h3><ul>${d.checklist.map(x=>`<li class="check">${x.done?'☑':'☐'} ${esc(x.text)}</li>`).join('')}</ul>`;
      if(d.chalk) html += `<h3>Chalkboard</h3><img class="chalk" src="${d.chalk}" alt="Saved chalkboard">`;
      html += '</section>';
    });
    return html + '</body></html>';
  }
  button.addEventListener('click', () => {
    const blob = new Blob([render()], {type:'text/html'});
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='study-hub-professor-site.html'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
})();
