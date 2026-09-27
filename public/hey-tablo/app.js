const state = { episodes: [], segments: [], results: [], active: 0, excluded: new Set(), turn: 0, original: '' };
const aliases = {
  '累': ['tired','low energy','comfort','company'], '疲惫': ['tired','comfort'], '陪伴': ['company','comfort','lonely'],
  '孤独': ['lonely','company','comfort'], '失恋': ['heartbreak','grief','comfort'], '难过': ['sad','comfort'],
  '焦虑': ['anxious','anxiety','reflection'], '工作': ['career','work','reflection'], '迷茫': ['confused','starting over','perspective'],
  '时间': ['time perception','aging','nostalgia'], '搞笑': ['funny','witty','comedy','energy'], '开心': ['funny','hope','energy'],
  '鬼': ['ghost','paranormal','supernatural'], '创作': ['creative','creator','music'], '追星': ['fandom','fan','k-pop']
};
const feedbackTerms = { too_preachy: '轻松 陪伴 不要建议', not_funny_enough: '搞笑 witty energy', too_heavy: '轻松 comfort low energy', not_relevant: '换个方向 surprise' };
const $ = (selector) => document.querySelector(selector);

Promise.all([fetch('./episodes.json').then(r => r.json()), fetch('./segments.json').then(r => r.json())])
  .then(([episodes, segments]) => {
    state.episodes = episodes; state.segments = segments;
    $('#episode-count').textContent = episodes.length;
    $('#segment-count').textContent = segments.length;
    $('#verified-count').textContent = segments.filter(item => item.sourceVerified).length;
  }).catch(() => showError('节目数据加载失败，请刷新后重试。'));

document.querySelectorAll('[data-prompt]').forEach(button => button.addEventListener('click', () => {
  $('#listener-prompt').value = button.dataset.prompt; updateCount(); $('#listener-prompt').focus();
}));
$('#listener-prompt').addEventListener('input', updateCount);
$('#listener-prompt').addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); $('#composer').requestSubmit(); }
});
$('#composer').addEventListener('submit', event => {
  event.preventDefault(); const message = $('#listener-prompt').value.trim();
  if (message.length < 2 || !state.segments.length) return;
  state.original = message; state.excluded.clear(); state.turn = 1; recommend(message);
});

function updateCount() { $('#character-count').textContent = `${$('#listener-prompt').value.length} / 300`; }
function normalize(value) { return value.normalize('NFKC').toLowerCase().replace(/[_/|]+/g, ' ').replace(/\s+/g, ' ').trim(); }
function tokens(value) {
  const text = normalize(value); const latin = text.match(/[a-z0-9]+(?:[-'][a-z0-9]+)*/g) || [];
  const chinese = (text.match(/[\u3400-\u9fff]+/g) || []).flatMap(run => [...run, ...Array.from(run).slice(0,-1).map((c,i) => c + Array.from(run)[i+1])]);
  return [...new Set([...latin, ...chinese])].filter(item => item.length > 1);
}
function expandedQuery(message) {
  const extra = Object.entries(aliases).filter(([key]) => message.includes(key)).flatMap(([,values]) => values);
  return `${message} ${extra.join(' ')}`;
}
function recommend(message) {
  setLoading(true); hideError();
  setTimeout(() => {
    const queryTokens = tokens(expandedQuery(message));
    const scored = state.segments.filter(item => !state.excluded.has(item.id)).map(item => {
      const haystack = normalize([item.quote,item.meaningZh,item.noteZh,item.context,item.title,item.titleZh,...item.topics,...item.emotions,...item.desiredEffects,...item.toneTags].join(' '));
      let score = queryTokens.reduce((sum, token) => sum + (haystack.includes(token) ? (token.length > 3 ? 3 : 1.5) : 0), 0);
      if (item.sourceVerified) score += .75;
      return { ...item, score };
    }).sort((a,b) => b.score - a.score);
    const seen = new Set(); state.results = scored.filter(item => item.score > 0 && !seen.has(item.episode) && seen.add(item.episode)).slice(0,3);
    if (!state.results.length) state.results = scored.filter(item => !seen.has(item.episode) && seen.add(item.episode)).slice(0,3);
    state.results.forEach(item => state.excluded.add(item.id)); state.active = 0;
    renderResults(); setLoading(false);
  }, 420);
}
function renderResults() {
  $('#idle-stage').hidden = true; $('#hero').classList.add('hero-has-result'); $('#result-stage').hidden = false;
  $('#prompt-grid').hidden = true; $('.start-section').classList.add('start-section-result'); $('#section-kicker').textContent = 'ASK ANOTHER';
  $('#result-stage').innerHTML = `<div class="result-stage" role="status" aria-live="polite">
    <div class="result-stage-meta"><span>HEY TABLO 想与你分享</span><span id="active-result-count">1 / ${state.results.length}</span></div>
    <div class="waveform-shell"><div class="waveform-bars">${Array.from({length:64},(_,i)=>`<i class="${i<19?'is-played':''}" style="height:${12+((i*17+i*i*7)%56)}px"></i>`).join('')}</div><div class="waveform-line"></div>
      ${state.results.map((item,index)=>`<button class="slice-node ${index===0?'is-active':''}" data-slice="${index}" style="left:${[18,50,82][index]}%"><span>0${index+1}</span><b>EP.${item.episode}</b><small>${item.timestamp}</small></button>`).join('')}</div>
    <div id="slice-detail"></div></div>`;
  document.querySelectorAll('[data-slice]').forEach(button => button.addEventListener('click', () => { state.active=Number(button.dataset.slice); renderDetail(); }));
  renderDetail();
}
function renderDetail() {
  const item=state.results[state.active], episode=state.episodes.find(ep=>ep.episodeNumber===item.episode);
  const videoId=(episode?.youtubeUrl||'').match(/(?:v=|youtu\.be\/)([\w-]{6,})/)?.[1];
  const cover=videoId?`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`:'./hey-tablo-podcast-cover.jpg';
  document.querySelectorAll('[data-slice]').forEach((node,index)=>node.classList.toggle('is-active',index===state.active));
  const activePosition=[18,50,82][state.active]||50;
  document.querySelectorAll('.waveform-bars i').forEach((bar,index,bars)=>bar.classList.toggle('is-played',index/(bars.length-1)*100<=activePosition));
  $('#active-result-count').textContent=`${state.active+1} / ${state.results.length}`;
  $('#slice-detail').innerHTML=`<article class="slice-detail"><div class="slice-cover"><img src="${cover}" alt="EP.${item.episode} 封面" onerror="this.src='./hey-tablo-podcast-cover.jpg'"><span>EP.${item.episode}</span></div>
    <div class="slice-detail-body"><header><div><span class="slice-kicker">NOW SELECTED · EP.${item.episode} / ${item.timestamp}</span><h2>${item.title}</h2></div><span class="source-state ${item.sourceVerified?'is-verified':''}">${item.sourceVerified?'● SOURCE VERIFIED':'○ NEEDS REVIEW'}</span></header>
    <div class="slice-copy"><div class="slice-listen"><span class="slice-info-label">◉ 好听 · 本集内容</span><p class="episode-summary">${episode?.summaryZh||item.meaningZh}</p><q>${item.quote}</q><p class="slice-translation">${item.meaningZh}</p></div><div class="slice-why"><span>◌ 好玩 · 为什么推荐</span><small>${episode?.recommendationCopy||item.noteZh}</small></div></div>
    <footer><div class="episode-signals">${(episode?.toneTags||[]).slice(0,3).map(tag=>`<span>#${tag}</span>`).join('')}</div><a href="${item.sourceUrl}" target="_blank" rel="noreferrer">▶ 播放这一段</a></footer></div>
    <div class="feedback-bar"><span>不太对？告诉我哪里要改</span><div class="feedback-actions">${[['too_preachy','太说教'],['not_funny_enough','不够好笑'],['too_heavy','太沉重'],['not_relevant','换个方向']].map(([v,l])=>`<button data-feedback="${v}">${l}</button>`).join('')}</div></div></article>`;
  document.querySelectorAll('[data-feedback]').forEach(button=>button.addEventListener('click',()=>{state.turn+=1;recommend(`${state.original} ${feedbackTerms[button.dataset.feedback]}`)}));
}
function setLoading(loading) { $('#composer button[type=submit]').disabled=loading; $('#composer button[type=submit]').textContent=loading?'…':'↑'; $('#hero-description') && ($('#hero-description').textContent=loading?'正在穿过 500 段声音，寻找此刻最合适的三段。':'不需要知道节目名称。只说说你的状态、时间，或者不想听什么。'); }
function showError(message) { $('#agent-error').hidden=false; $('#agent-error').textContent=message; }
function hideError() { $('#agent-error').hidden=true; }
