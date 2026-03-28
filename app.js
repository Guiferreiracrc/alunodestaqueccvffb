// =============================================
// ALUNO DESTAQUE ESCOLAR — by Guilherme Ferreira
// Main App JavaScript
// =============================================

const API = {
  escolas:         'tables/escolas',
  professoras:     'tables/professoras',
  turmas:          'tables/turmas',
  alunos:          'tables/alunos',
  historico:       'tables/historico_pontos',
  recompensas:     'tables/recompensas',
};

// ---- STATE ----
let state = {
  escolas: [], professoras: [], turmas: [], alunos: [],
  historico: [], recompensas: [],
  filtroEscolaAlunos: '', filtroTurmaAlunos: '', searchAluno: '',
  alunoSelecionado: null,
  currentPage: 'dashboard',
};

// ============================================================
// UTILS
// ============================================================
async function api(url, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (res.status === 204) return null;
  return res.json();
}

function fmt(ms) {
  if (!ms) return '—';
  return new Date(ms).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function showToast(msg, type = 'success') {
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const tc = document.querySelector('.toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ️'}</span><span class="toast-msg">${msg}</span>`;
  tc.appendChild(t);
  setTimeout(() => t.remove(), 3800);
}

function confetti() {
  const colors = ['#6C63FF','#FF6584','#43E97B','#FFD93D','#38B6FF','#F7971E','#a78bfa'];
  for (let i = 0; i < 60; i++) {
    const c = document.createElement('div');
    c.className = 'confetti-piece';
    c.style.cssText = `
      left:${Math.random()*100}vw;
      top:-10px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      width:${6+Math.random()*8}px;
      height:${6+Math.random()*8}px;
      animation-duration:${1.5+Math.random()*2}s;
      animation-delay:${Math.random()*0.5}s;
      border-radius:${Math.random()>0.5?'50%':'2px'};
    `;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 3500);
  }
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function loading(container, msg = 'Carregando...') {
  container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-light);font-weight:600;">${msg}<div class="spinner"></div></div>`;
}

// ============================================================
// LOAD ALL DATA
// ============================================================
async function loadAll() {
  const [esc, prof, tur, alu, hist, rec] = await Promise.all([
    api(`${API.escolas}?limit=200`),
    api(`${API.professoras}?limit=200`),
    api(`${API.turmas}?limit=200`),
    api(`${API.alunos}?limit=500`),
    api(`${API.historico}?limit=1000&sort=created_at`),
    api(`${API.recompensas}?limit=100`),
  ]);
  state.escolas     = esc?.data     || [];
  state.professoras = prof?.data    || [];
  state.turmas      = tur?.data     || [];
  state.alunos      = alu?.data     || [];
  state.historico   = hist?.data    || [];
  state.recompensas = rec?.data     || [];
}

// ============================================================
// NAVIGATION
// ============================================================
function navigateTo(page) {
  state.currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
  renderPage(page);
}

function renderPage(page) {
  switch(page) {
    case 'dashboard':    renderDashboard();   break;
    case 'escolas':      renderEscolas();     break;
    case 'turmas':       renderTurmas();      break;
    case 'alunos':       renderAlunos();      break;
    case 'recompensas':  renderRecompensas(); break;
    case 'ranking':      renderRanking();     break;
  }
}

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard() {
  // Stats
  document.getElementById('stat-escolas').textContent   = state.escolas.length;
  document.getElementById('stat-professoras').textContent = state.professoras.length;
  document.getElementById('stat-turmas').textContent    = state.turmas.length;
  document.getElementById('stat-alunos').textContent    = state.alunos.length;

  const totalPts = state.alunos.reduce((s, a) => s + (Number(a.pontos) || 0), 0);
  document.getElementById('stat-pontos').textContent = totalPts.toLocaleString('pt-BR');

  const trocas = state.historico.filter(h => h.tipo === 'gasto').length;
  document.getElementById('stat-trocas').textContent = trocas;

  // Top alunos
  const top = [...state.alunos].sort((a, b) => (Number(b.pontos)||0) - (Number(a.pontos)||0)).slice(0,5);
  const topEl = document.getElementById('top-alunos');
  if (top.length === 0) {
    topEl.innerHTML = `<div class="empty-state"><div class="empty-icon">🎓</div><p>Nenhum aluno cadastrado ainda</p></div>`;
    return;
  }
  topEl.innerHTML = top.map((a, i) => {
    const turma = state.turmas.find(t => t.id === a.turma_id);
    const escola = state.escolas.find(e => e.id === a.escola_id);
    const medals = ['🥇','🥈','🥉','4️⃣','5️⃣'];
    return `
      <div class="ranking-item" style="margin-bottom:10px;">
        <span class="rank-pos ${i===0?'first':i===1?'second':i===2?'third':''}">${medals[i]}</span>
        <span class="rank-avatar">${a.avatar||'🧑‍🎓'}</span>
        <div class="rank-info">
          <div class="rank-nome">${a.nome}</div>
          <div class="rank-meta">${turma?.nome||'—'} · ${escola?.nome||'—'}</div>
        </div>
        <span class="rank-pts">${(Number(a.pontos)||0).toLocaleString('pt-BR')} pts</span>
      </div>
    `;
  }).join('');

  // Atividade recente
  const recentEl = document.getElementById('atividade-recente');
  const recentes = [...state.historico].reverse().slice(0, 8);
  if (recentes.length === 0) {
    recentEl.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><p>Nenhuma atividade ainda</p></div>`;
    return;
  }
  recentEl.innerHTML = recentes.map(h => {
    const aluno = state.alunos.find(a => a.id === h.aluno_id);
    return `
      <div class="historico-item">
        <div class="hist-icon ${h.tipo}">${h.tipo==='ganho'?'⬆️':'⬇️'}</div>
        <div class="hist-info">
          <div class="hist-motivo">${aluno?.nome||'Aluno'} · ${h.motivo||'—'}</div>
          <div class="hist-data">${fmt(h.created_at)}</div>
        </div>
        <div class="hist-pts ${h.tipo}">${h.tipo==='ganho'?'+':'−'}${Math.abs(Number(h.pontos)||0)}</div>
      </div>
    `;
  }).join('');
}

// ============================================================
// ESCOLAS
// ============================================================
function renderEscolas() {
  // Preencher selects de escolas em todo o app
  populateEscolaSelects();

  const tbody = document.getElementById('tbody-escolas');
  if (state.escolas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-light);">Nenhuma escola cadastrada</td></tr>`;
    return;
  }
  tbody.innerHTML = state.escolas.map(e => {
    const profs = state.professoras.filter(p => p.escola_id === e.id).length;
    const turms = state.turmas.filter(t => t.escola_id === e.id).length;
    const aluns = state.alunos.filter(a => a.escola_id === e.id).length;
    return `
      <tr>
        <td><strong>${e.nome}</strong></td>
        <td>${e.cidade||'—'}</td>
        <td>
          <span class="badge badge-purple">${profs} prof.</span>
          <span class="badge badge-blue" style="margin-left:4px;">${turms} turmas</span>
          <span class="badge badge-green" style="margin-left:4px;">${aluns} alunos</span>
        </td>
        <td>
          <button class="btn-icon" onclick="editEscola('${e.id}')" title="Editar">✏️</button>
          <button class="btn-icon" onclick="delEscola('${e.id}')" title="Excluir" style="margin-left:4px;">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

async function saveEscola() {
  const nome = document.getElementById('esc-nome').value.trim();
  const cidade = document.getElementById('esc-cidade').value.trim();
  const editId = document.getElementById('esc-edit-id').value;
  if (!nome) { showToast('Digite o nome da escola', 'warning'); return; }
  try {
    if (editId) {
      await api(`${API.escolas}/${editId}`, 'PUT', { nome, cidade });
      showToast('Escola atualizada!');
    } else {
      await api(API.escolas, 'POST', { nome, cidade });
      showToast('Escola cadastrada! 🏫');
    }
    closeModal('modal-escola');
    await loadAll();
    renderEscolas();
    renderDashboard();
  } catch(err) { showToast('Erro ao salvar escola', 'error'); }
}

function editEscola(id) {
  const e = state.escolas.find(x => x.id === id);
  if (!e) return;
  document.getElementById('esc-nome').value = e.nome;
  document.getElementById('esc-cidade').value = e.cidade||'';
  document.getElementById('esc-edit-id').value = e.id;
  document.getElementById('modal-escola-title').textContent = 'Editar Escola';
  openModal('modal-escola');
}

async function delEscola(id) {
  if (!confirm('Excluir esta escola? Professoras e turmas associadas podem ficar sem vínculo.')) return;
  await api(`${API.escolas}/${id}`, 'DELETE');
  showToast('Escola excluída');
  await loadAll(); renderEscolas(); renderDashboard();
}

function abrirModalEscola() {
  document.getElementById('esc-nome').value = '';
  document.getElementById('esc-cidade').value = '';
  document.getElementById('esc-edit-id').value = '';
  document.getElementById('modal-escola-title').textContent = 'Nova Escola';
  openModal('modal-escola');
}

// ============================================================
// TURMAS (inclui professoras)
// ============================================================
function renderTurmas() {
  populateEscolaSelects();
  const tab = document.getElementById('turmas-tab-active');
  if (!tab) return;
  if (tab.dataset.tab === 'turmas') renderTurmasLista();
  else renderProfessorasLista();
}

function renderTurmasLista() {
  const tbody = document.getElementById('tbody-turmas');
  if (state.turmas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-light);">Nenhuma turma cadastrada</td></tr>`;
    return;
  }
  tbody.innerHTML = state.turmas.map(t => {
    const esc = state.escolas.find(e => e.id === t.escola_id);
    const prof = state.professoras.find(p => p.id === t.professora_id);
    const aluns = state.alunos.filter(a => a.turma_id === t.id).length;
    return `
      <tr>
        <td><strong>${t.nome}</strong></td>
        <td>${esc?.nome||'—'}</td>
        <td>${prof?.nome||'—'}</td>
        <td><span class="badge badge-green">${aluns} alunos</span></td>
        <td>
          <button class="btn-icon" onclick="editTurma('${t.id}')" title="Editar">✏️</button>
          <button class="btn-icon" onclick="delTurma('${t.id}')" title="Excluir" style="margin-left:4px;">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderProfessorasLista() {
  const tbody = document.getElementById('tbody-professoras');
  if (!tbody) return;
  if (state.professoras.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-light);">Nenhuma professora cadastrada</td></tr>`;
    return;
  }
  tbody.innerHTML = state.professoras.map(p => {
    const esc = state.escolas.find(e => e.id === p.escola_id);
    const turms = state.turmas.filter(t => t.professora_id === p.id).length;
    return `
      <tr>
        <td><strong>${p.nome}</strong></td>
        <td>${esc?.nome||'—'}</td>
        <td>${p.disciplina||'—'}</td>
        <td>
          <span class="badge badge-purple">${turms} turmas</span>
          <button class="btn-icon" onclick="editProfessora('${p.id}')" title="Editar" style="margin-left:8px;">✏️</button>
          <button class="btn-icon" onclick="delProfessora('${p.id}')" title="Excluir" style="margin-left:4px;">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

async function saveTurma() {
  const nome = document.getElementById('tur-nome').value.trim();
  const escola_id = document.getElementById('tur-escola').value;
  const professora_id = document.getElementById('tur-professora').value;
  const ano = document.getElementById('tur-ano').value.trim() || new Date().getFullYear().toString();
  const editId = document.getElementById('tur-edit-id').value;
  if (!nome || !escola_id) { showToast('Preencha nome e escola', 'warning'); return; }
  try {
    if (editId) {
      await api(`${API.turmas}/${editId}`, 'PUT', { nome, escola_id, professora_id, ano });
      showToast('Turma atualizada!');
    } else {
      await api(API.turmas, 'POST', { nome, escola_id, professora_id, ano });
      showToast('Turma cadastrada! 🏫');
    }
    closeModal('modal-turma');
    await loadAll(); renderTurmas(); renderDashboard();
  } catch(err) { showToast('Erro ao salvar turma', 'error'); }
}

function editTurma(id) {
  const t = state.turmas.find(x => x.id === id);
  if (!t) return;
  document.getElementById('tur-nome').value = t.nome;
  document.getElementById('tur-escola').value = t.escola_id||'';
  document.getElementById('tur-ano').value = t.ano||'';
  document.getElementById('tur-edit-id').value = t.id;
  populateProfessoraSelect(t.escola_id, t.professora_id);
  document.getElementById('modal-turma-title').textContent = 'Editar Turma';
  openModal('modal-turma');
}

async function delTurma(id) {
  if (!confirm('Excluir esta turma?')) return;
  await api(`${API.turmas}/${id}`, 'DELETE');
  showToast('Turma excluída');
  await loadAll(); renderTurmas(); renderDashboard();
}

function abrirModalTurma() {
  document.getElementById('tur-nome').value = '';
  document.getElementById('tur-escola').value = '';
  document.getElementById('tur-ano').value = new Date().getFullYear();
  document.getElementById('tur-edit-id').value = '';
  populateProfessoraSelect('', '');
  document.getElementById('modal-turma-title').textContent = 'Nova Turma';
  openModal('modal-turma');
}

async function saveProfessora() {
  const nome = document.getElementById('prof-nome').value.trim();
  const escola_id = document.getElementById('prof-escola').value;
  const disciplina = document.getElementById('prof-disciplina').value.trim();
  const editId = document.getElementById('prof-edit-id').value;
  if (!nome || !escola_id) { showToast('Preencha nome e escola', 'warning'); return; }
  try {
    if (editId) {
      await api(`${API.professoras}/${editId}`, 'PUT', { nome, escola_id, disciplina });
      showToast('Professora atualizada!');
    } else {
      await api(API.professoras, 'POST', { nome, escola_id, disciplina });
      showToast('Professora cadastrada! 👩‍🏫');
    }
    closeModal('modal-professora');
    await loadAll(); renderTurmas(); renderDashboard();
  } catch(err) { showToast('Erro ao salvar', 'error'); }
}

function editProfessora(id) {
  const p = state.professoras.find(x => x.id === id);
  if (!p) return;
  document.getElementById('prof-nome').value = p.nome;
  document.getElementById('prof-escola').value = p.escola_id||'';
  document.getElementById('prof-disciplina').value = p.disciplina||'';
  document.getElementById('prof-edit-id').value = p.id;
  document.getElementById('modal-prof-title').textContent = 'Editar Professora';
  openModal('modal-professora');
}

async function delProfessora(id) {
  if (!confirm('Excluir esta professora?')) return;
  await api(`${API.professoras}/${id}`, 'DELETE');
  showToast('Professora excluída');
  await loadAll(); renderTurmas(); renderDashboard();
}

function abrirModalProfessora() {
  ['prof-nome','prof-disciplina'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('prof-escola').value = '';
  document.getElementById('prof-edit-id').value = '';
  document.getElementById('modal-prof-title').textContent = 'Nova Professora';
  openModal('modal-professora');
}

// ============================================================
// ALUNOS
// ============================================================
const AVATARES = ['🧒','👦','👧','🧑','👨','👩','🧑‍🎓','👨‍🎓','👩‍🎓','😊','😎','🌟','🦄','🐱','🐶','🐸','🦁','🐯','🐻','🐼','🦊','🐙','🌈','⚽','🎸','🎨','🚀','🎮'];

function renderAlunos() {
  populateEscolaSelects();
  populateFiltroTurma();

  const grid = document.getElementById('alunos-grid');
  let alunos = [...state.alunos];

  if (state.filtroEscolaAlunos) alunos = alunos.filter(a => a.escola_id === state.filtroEscolaAlunos);
  if (state.filtroTurmaAlunos)  alunos = alunos.filter(a => a.turma_id === state.filtroTurmaAlunos);
  if (state.searchAluno) {
    const q = state.searchAluno.toLowerCase();
    alunos = alunos.filter(a => a.nome.toLowerCase().includes(q));
  }

  if (alunos.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon">👦</div><p>Nenhum aluno encontrado</p><span>Cadastre o primeiro aluno clicando no botão acima</span></div>`;
    return;
  }

  alunos.sort((a,b) => (Number(b.pontos)||0) - (Number(a.pontos)||0));

  grid.innerHTML = alunos.map(a => {
    const turma = state.turmas.find(t => t.id === a.turma_id);
    const escola = state.escolas.find(e => e.id === a.escola_id);
    return `
      <div class="aluno-card" onclick="abrirDetalheAluno('${a.id}')">
        <div class="aluno-avatar">${a.avatar||'🧑‍🎓'}</div>
        <div class="aluno-info">
          <div class="aluno-nome">${a.nome}</div>
          <div class="aluno-meta">${turma?.nome||'—'} · ${escola?.nome||'—'}</div>
        </div>
        <div class="aluno-pontos">
          <div class="pts-num">${(Number(a.pontos)||0).toLocaleString('pt-BR')}</div>
          <div class="pts-label">pontos</div>
        </div>
        <div class="aluno-actions" onclick="event.stopPropagation()">
          <button class="btn btn-success btn-sm" onclick="abrirModalPontos('${a.id}', 'ganho')" title="Adicionar pontos">+</button>
          <button class="btn btn-danger btn-sm" onclick="abrirModalPontos('${a.id}', 'subtrair')" title="Retirar pontos">−</button>
          <button class="btn-icon" onclick="editAluno('${a.id}')" title="Editar">✏️</button>
        </div>
      </div>
    `;
  }).join('');
}

async function saveAluno() {
  const nome = document.getElementById('alu-nome').value.trim();
  const escola_id = document.getElementById('alu-escola').value;
  const turma_id = document.getElementById('alu-turma').value;
  const avatar = document.getElementById('alu-avatar-val').value || '🧑‍🎓';
  const editId = document.getElementById('alu-edit-id').value;
  if (!nome || !escola_id) { showToast('Preencha nome e escola', 'warning'); return; }
  try {
    if (editId) {
      await api(`${API.alunos}/${editId}`, 'PATCH', { nome, escola_id, turma_id, avatar });
      showToast('Aluno atualizado!');
    } else {
      await api(API.alunos, 'POST', { nome, escola_id, turma_id, avatar, pontos: 0 });
      showToast('Aluno cadastrado! 🎉');
    }
    closeModal('modal-aluno');
    await loadAll(); renderAlunos(); renderDashboard();
  } catch(err) { showToast('Erro ao salvar aluno', 'error'); }
}

function editAluno(id) {
  const a = state.alunos.find(x => x.id === id);
  if (!a) return;
  document.getElementById('alu-nome').value = a.nome;
  document.getElementById('alu-escola').value = a.escola_id||'';
  document.getElementById('alu-edit-id').value = a.id;
  document.getElementById('alu-avatar-val').value = a.avatar||'🧑‍🎓';
  renderAvatarGrid(a.avatar||'🧑‍🎓');
  populateAlunoTurmaSelect(a.escola_id, a.turma_id);
  document.getElementById('modal-aluno-title').textContent = 'Editar Aluno';
  openModal('modal-aluno');
}

function abrirModalAluno() {
  document.getElementById('alu-nome').value = '';
  document.getElementById('alu-escola').value = '';
  document.getElementById('alu-edit-id').value = '';
  document.getElementById('alu-avatar-val').value = '🧑‍🎓';
  renderAvatarGrid('🧑‍🎓');
  populateAlunoTurmaSelect('', '');
  document.getElementById('modal-aluno-title').textContent = 'Novo Aluno';
  openModal('modal-aluno');
}

function renderAvatarGrid(selected) {
  const grid = document.getElementById('avatar-grid');
  grid.innerHTML = AVATARES.map(av => `
    <button type="button" class="btn-icon ${av===selected?'selected-avatar':''}" 
      style="font-size:1.5rem;padding:8px;${av===selected?'background:var(--primary);':''}"
      onclick="selectAvatar('${av}')">${av}</button>
  `).join('');
}

function selectAvatar(av) {
  document.getElementById('alu-avatar-val').value = av;
  renderAvatarGrid(av);
}

// ============================================================
// DETALHE DO ALUNO
// ============================================================
function abrirDetalheAluno(id) {
  const a = state.alunos.find(x => x.id === id);
  if (!a) return;
  state.alunoSelecionado = a;
  const turma = state.turmas.find(t => t.id === a.turma_id);
  const escola = state.escolas.find(e => e.id === a.escola_id);
  const prof = turma ? state.professoras.find(p => p.id === turma.professora_id) : null;

  document.getElementById('det-avatar').textContent = a.avatar||'🧑‍🎓';
  document.getElementById('det-nome').textContent = a.nome;
  document.getElementById('det-info').textContent = `${turma?.nome||'Sem turma'} · ${escola?.nome||'Sem escola'}`;
  document.getElementById('det-prof').textContent = prof ? `👩‍🏫 ${prof.nome}` : '—';
  document.getElementById('det-pontos').textContent = (Number(a.pontos)||0).toLocaleString('pt-BR');

  // Histórico do aluno
  const hist = state.historico.filter(h => h.aluno_id === a.id).reverse();
  const histEl = document.getElementById('det-historico');
  if (hist.length === 0) {
    histEl.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><p>Sem movimentações</p></div>`;
  } else {
    histEl.innerHTML = hist.slice(0,20).map(h => `
      <div class="historico-item">
        <div class="hist-icon ${h.tipo}">${h.tipo==='ganho'?'⬆️':'⬇️'}</div>
        <div class="hist-info">
          <div class="hist-motivo">${h.motivo||'—'}</div>
          <div class="hist-data">${fmt(h.created_at)}</div>
        </div>
        <div class="hist-pts ${h.tipo}">${h.tipo==='ganho'?'+':'−'}${Math.abs(Number(h.pontos)||0)}</div>
      </div>
    `).join('');
  }
  openModal('modal-detalhe');
}

// ============================================================
// PONTOS
// ============================================================
let ptsAcao = 'ganho';
let ptsSelecionado = 0;

function abrirModalPontos(alunoId, acao = 'ganho') {
  const a = state.alunos.find(x => x.id === alunoId);
  if (!a) return;
  state.alunoSelecionado = a;
  ptsAcao = acao === 'subtrair' ? 'gasto' : 'ganho';
  ptsSelecionado = 0;
  document.getElementById('pts-aluno-nome').textContent = a.nome;
  document.getElementById('pts-aluno-avatar').textContent = a.avatar||'🧑‍🎓';
  document.getElementById('pts-aluno-saldo').textContent = (Number(a.pontos)||0).toLocaleString('pt-BR');
  document.getElementById('pts-valor').value = '';
  document.getElementById('pts-motivo').value = '';
  document.querySelectorAll('.pts-action-btn').forEach(b => {
    b.classList.remove('selected-add','selected-sub');
    if (b.dataset.acao === ptsAcao) b.classList.add(ptsAcao==='ganho'?'selected-add':'selected-sub');
  });
  document.querySelectorAll('.quick-pt-btn').forEach(b => b.classList.remove('active'));
  openModal('modal-pontos');
}

function selecionarAcaoPts(acao) {
  ptsAcao = acao;
  document.querySelectorAll('.pts-action-btn').forEach(b => {
    b.classList.remove('selected-add','selected-sub');
    if (b.dataset.acao === acao) b.classList.add(acao==='ganho'?'selected-add':'selected-sub');
  });
}

function selecionarQtdPts(val) {
  document.getElementById('pts-valor').value = val;
  document.querySelectorAll('.quick-pt-btn').forEach(b => {
    b.classList.toggle('active', Number(b.dataset.val) === Number(val));
  });
}

async function salvarPontos() {
  const a = state.alunoSelecionado;
  if (!a) return;
  const pts = parseInt(document.getElementById('pts-valor').value) || 0;
  const motivo = document.getElementById('pts-motivo').value.trim() || (ptsAcao==='ganho' ? 'Pontos adicionados' : 'Pontos removidos');
  if (pts <= 0) { showToast('Digite uma quantidade válida de pontos', 'warning'); return; }

  const novoPts = ptsAcao === 'ganho'
    ? (Number(a.pontos)||0) + pts
    : Math.max(0, (Number(a.pontos)||0) - pts);

  try {
    await api(`${API.alunos}/${a.id}`, 'PATCH', { pontos: novoPts });
    await api(API.historico, 'POST', { aluno_id: a.id, pontos: pts, motivo, tipo: ptsAcao, data: Date.now() });
    showToast(ptsAcao==='ganho' ? `+${pts} pontos para ${a.nome}! ⭐` : `−${pts} pontos de ${a.nome}`, ptsAcao==='ganho'?'success':'warning');
    if (ptsAcao === 'ganho') confetti();
    closeModal('modal-pontos');
    await loadAll(); renderAlunos(); renderDashboard();
  } catch(err) { showToast('Erro ao salvar pontos', 'error'); }
}

// ============================================================
// RECOMPENSAS
// ============================================================
function renderRecompensas() {
  const grid = document.getElementById('recompensas-grid');
  const ativas = state.recompensas.filter(r => r.ativo !== false);
  if (ativas.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon">🎁</div><p>Nenhuma recompensa cadastrada</p></div>`;
    return;
  }
  grid.innerHTML = ativas.map(r => `
    <div class="recompensa-card">
      <span class="recompensa-emoji">${r.emoji||'🎁'}</span>
      <div class="recompensa-nome">${r.nome}</div>
      <div class="recompensa-desc">${r.descricao||''}</div>
      <div class="recompensa-pts">⭐ ${Number(r.pontos_necessarios).toLocaleString('pt-BR')} pts</div>
      <div style="margin-top:14px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
        <button class="btn btn-primary btn-sm" onclick="abrirResgatar('${r.id}')">🎉 Resgatar</button>
        <button class="btn btn-outline btn-sm" onclick="editRecompensa('${r.id}')">✏️ Editar</button>
      </div>
    </div>
  `).join('');

  // Tabela de resgates
  const resgates = state.historico.filter(h => h.tipo==='gasto').reverse().slice(0,20);
  const tbody = document.getElementById('tbody-resgates');
  if (resgates.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--text-light);">Nenhum resgate ainda</td></tr>`;
    return;
  }
  tbody.innerHTML = resgates.map(h => {
    const aluno = state.alunos.find(a => a.id === h.aluno_id);
    return `
      <tr>
        <td><strong>${aluno?.nome||'—'}</strong></td>
        <td>${h.motivo||'—'}</td>
        <td><span class="badge badge-orange">⭐ ${Math.abs(Number(h.pontos)||0)} pts</span></td>
        <td>${fmt(h.created_at)}</td>
      </tr>
    `;
  }).join('');
}

function abrirResgatar(recompensaId) {
  const r = state.recompensas.find(x => x.id === recompensaId);
  if (!r) return;
  document.getElementById('res-rec-nome').textContent = `${r.emoji||'🎁'} ${r.nome}`;
  document.getElementById('res-rec-pts').textContent = Number(r.pontos_necessarios).toLocaleString('pt-BR');
  document.getElementById('res-rec-id').value = r.id;
  document.getElementById('res-rec-pts-val').value = r.pontos_necessarios;

  // Populate alunos no select
  const sel = document.getElementById('res-aluno');
  sel.innerHTML = '<option value="">Selecione o aluno...</option>';
  [...state.alunos].sort((a,b)=>a.nome.localeCompare(b.nome)).forEach(a => {
    const opt = document.createElement('option');
    opt.value = a.id;
    opt.textContent = `${a.avatar||'🧑‍🎓'} ${a.nome} (${(Number(a.pontos)||0)} pts)`;
    sel.appendChild(opt);
  });
  openModal('modal-resgatar');
}

async function confirmarResgate() {
  const alunoId = document.getElementById('res-aluno').value;
  const recId = document.getElementById('res-rec-id').value;
  const ptsNec = parseInt(document.getElementById('res-rec-pts-val').value);
  if (!alunoId) { showToast('Selecione o aluno', 'warning'); return; }
  const a = state.alunos.find(x => x.id === alunoId);
  const r = state.recompensas.find(x => x.id === recId);
  if (!a || !r) return;
  if ((Number(a.pontos)||0) < ptsNec) {
    showToast(`${a.nome} não tem pontos suficientes! Necessário: ${ptsNec} pts`, 'error'); return;
  }
  const novoPts = (Number(a.pontos)||0) - ptsNec;
  try {
    await api(`${API.alunos}/${a.id}`, 'PATCH', { pontos: novoPts });
    await api(API.historico, 'POST', { aluno_id: a.id, pontos: ptsNec, motivo: `Resgate: ${r.nome}`, tipo: 'gasto', data: Date.now() });
    showToast(`🎉 ${a.nome} resgatou "${r.nome}"!`);
    confetti();
    closeModal('modal-resgatar');
    await loadAll(); renderRecompensas(); renderAlunos(); renderDashboard();
  } catch(err) { showToast('Erro ao resgatar', 'error'); }
}

function editRecompensa(id) {
  const r = state.recompensas.find(x => x.id === id);
  if (!r) return;
  document.getElementById('rec-nome').value = r.nome;
  document.getElementById('rec-desc').value = r.descricao||'';
  document.getElementById('rec-pts').value = r.pontos_necessarios;
  document.getElementById('rec-emoji').value = r.emoji||'🎁';
  document.getElementById('rec-edit-id').value = r.id;
  document.getElementById('modal-rec-title').textContent = 'Editar Recompensa';
  openModal('modal-recompensa');
}

function abrirModalRecompensa() {
  ['rec-nome','rec-desc','rec-pts'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('rec-emoji').value = '🎁';
  document.getElementById('rec-edit-id').value = '';
  document.getElementById('modal-rec-title').textContent = 'Nova Recompensa';
  openModal('modal-recompensa');
}

async function saveRecompensa() {
  const nome = document.getElementById('rec-nome').value.trim();
  const descricao = document.getElementById('rec-desc').value.trim();
  const pontos_necessarios = parseInt(document.getElementById('rec-pts').value)||0;
  const emoji = document.getElementById('rec-emoji').value.trim()||'🎁';
  const editId = document.getElementById('rec-edit-id').value;
  if (!nome || pontos_necessarios <= 0) { showToast('Preencha nome e pontos', 'warning'); return; }
  try {
    if (editId) {
      await api(`${API.recompensas}/${editId}`, 'PUT', { nome, descricao, pontos_necessarios, emoji, ativo: true });
      showToast('Recompensa atualizada!');
    } else {
      await api(API.recompensas, 'POST', { nome, descricao, pontos_necessarios, emoji, ativo: true });
      showToast('Recompensa criada! 🎁');
    }
    closeModal('modal-recompensa');
    await loadAll(); renderRecompensas();
  } catch(err) { showToast('Erro ao salvar', 'error'); }
}

// ============================================================
// RANKING
// ============================================================
function renderRanking() {
  let filtroEsc = document.getElementById('rank-escola')?.value || '';
  let filtroTur = document.getElementById('rank-turma')?.value || '';

  let alunos = [...state.alunos];
  if (filtroEsc) alunos = alunos.filter(a => a.escola_id === filtroEsc);
  if (filtroTur) alunos = alunos.filter(a => a.turma_id === filtroTur);
  alunos.sort((a,b) => (Number(b.pontos)||0) - (Number(a.pontos)||0));

  const el = document.getElementById('ranking-list');
  if (alunos.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">🏆</div><p>Nenhum aluno encontrado</p></div>`;
    return;
  }

  const medals = ['🥇','🥈','🥉'];
  el.innerHTML = alunos.map((a, i) => {
    const turma = state.turmas.find(t => t.id === a.turma_id);
    const escola = state.escolas.find(e => e.id === a.escola_id);
    const maxPts = Number(alunos[0].pontos)||1;
    const pct = Math.round(((Number(a.pontos)||0)/maxPts)*100);
    return `
      <div class="ranking-item" style="${i<3?'border-color:var(--warning);background:linear-gradient(135deg,rgba(255,217,61,0.06),white);':''}">
        <span class="rank-pos ${i===0?'first':i===1?'second':i===2?'third':''}">${medals[i]||`${i+1}`}</span>
        <span class="rank-avatar">${a.avatar||'🧑‍🎓'}</span>
        <div class="rank-info" style="flex:1;">
          <div class="rank-nome">${a.nome}</div>
          <div class="rank-meta">${turma?.nome||'—'} · ${escola?.nome||'—'}</div>
          <div class="progress-bar" style="max-width:200px;">
            <div class="progress-fill" style="width:${pct}%;"></div>
          </div>
        </div>
        <div style="text-align:right;">
          <div class="rank-pts">${(Number(a.pontos)||0).toLocaleString('pt-BR')}</div>
          <div style="font-size:0.72rem;color:var(--text-light);font-weight:600;">pontos</div>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================
// POPULATE SELECTS HELPERS
// ============================================================
function populateEscolaSelects() {
  const ids = ['filtro-escola-alunos','tur-escola','alu-escola','prof-escola','rank-escola'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const val = el.value;
    el.innerHTML = '<option value="">Todas as escolas</option>';
    state.escolas.forEach(e => {
      const o = document.createElement('option');
      o.value = e.id; o.textContent = e.nome;
      el.appendChild(o);
    });
    if (val) el.value = val;
  });
}

function populateFiltroTurma() {
  const sel = document.getElementById('filtro-turma-alunos');
  if (!sel) return;
  const val = sel.value;
  const escolaId = state.filtroEscolaAlunos;
  sel.innerHTML = '<option value="">Todas as turmas</option>';
  const turmas = escolaId ? state.turmas.filter(t => t.escola_id === escolaId) : state.turmas;
  turmas.forEach(t => {
    const o = document.createElement('option');
    o.value = t.id; o.textContent = t.nome;
    sel.appendChild(o);
  });
  if (val) sel.value = val;
}

function populateProfessoraSelect(escolaId, selectedId) {
  const sel = document.getElementById('tur-professora');
  if (!sel) return;
  sel.innerHTML = '<option value="">Sem professora</option>';
  const profs = escolaId ? state.professoras.filter(p => p.escola_id === escolaId) : state.professoras;
  profs.forEach(p => {
    const o = document.createElement('option');
    o.value = p.id; o.textContent = p.nome;
    sel.appendChild(o);
  });
  if (selectedId) sel.value = selectedId;
}

function populateAlunoTurmaSelect(escolaId, selectedId) {
  const sel = document.getElementById('alu-turma');
  if (!sel) return;
  sel.innerHTML = '<option value="">Sem turma</option>';
  const turmas = escolaId ? state.turmas.filter(t => t.escola_id === escolaId) : state.turmas;
  turmas.forEach(t => {
    const o = document.createElement('option');
    o.value = t.id; o.textContent = t.nome;
    sel.appendChild(o);
  });
  if (selectedId) sel.value = selectedId;
}

function populateRankTurma() {
  const escolaId = document.getElementById('rank-escola')?.value;
  const sel = document.getElementById('rank-turma');
  if (!sel) return;
  sel.innerHTML = '<option value="">Todas as turmas</option>';
  const turmas = escolaId ? state.turmas.filter(t => t.escola_id === escolaId) : state.turmas;
  turmas.forEach(t => {
    const o = document.createElement('option');
    o.value = t.id; o.textContent = t.nome;
    sel.appendChild(o);
  });
  renderRanking();
}

// ============================================================
// EVENT LISTENERS
// ============================================================
function initEvents() {
  // Nav
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
  });

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });

  // Filtros alunos
  document.getElementById('filtro-escola-alunos')?.addEventListener('change', e => {
    state.filtroEscolaAlunos = e.target.value;
    state.filtroTurmaAlunos = '';
    populateFiltroTurma();
    renderAlunos();
  });
  document.getElementById('filtro-turma-alunos')?.addEventListener('change', e => {
    state.filtroTurmaAlunos = e.target.value;
    renderAlunos();
  });
  document.getElementById('search-aluno')?.addEventListener('input', e => {
    state.searchAluno = e.target.value;
    renderAlunos();
  });

  // Turma escola → filtra professoras
  document.getElementById('tur-escola')?.addEventListener('change', e => {
    populateProfessoraSelect(e.target.value, '');
  });

  // Aluno escola → filtra turmas
  document.getElementById('alu-escola')?.addEventListener('change', e => {
    populateAlunoTurmaSelect(e.target.value, '');
  });

  // Pontos quick select
  document.querySelectorAll('.quick-pt-btn').forEach(btn => {
    btn.addEventListener('click', () => selecionarQtdPts(btn.dataset.val));
  });

  // Pontos tipo
  document.querySelectorAll('.pts-action-btn').forEach(btn => {
    btn.addEventListener('click', () => selecionarAcaoPts(btn.dataset.acao));
  });

  // Ranking filters
  document.getElementById('rank-escola')?.addEventListener('change', () => {
    populateRankTurma();
  });
  document.getElementById('rank-turma')?.addEventListener('change', () => renderRanking());

  // Tabs de turmas
  document.querySelectorAll('.turmas-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.turmas-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('turmas-tab-active').dataset.tab = btn.dataset.tab;
      document.querySelectorAll('.turmas-tab-content').forEach(c => c.style.display = 'none');
      document.getElementById(`tab-${btn.dataset.tab}`).style.display = 'block';
      if (btn.dataset.tab === 'turmas') renderTurmasLista();
      else renderProfessorasLista();
    });
  });
}

// ============================================================
// INIT
// ============================================================
async function init() {
  document.querySelector('.toast-container') || (() => {
    const tc = document.createElement('div');
    tc.className = 'toast-container';
    document.body.appendChild(tc);
  })();

  try {
    await loadAll();
    initEvents();
    populateEscolaSelects();
    navigateTo('dashboard');
  } catch(err) {
    console.error(err);
    showToast('Erro ao carregar dados', 'error');
  }
}

document.addEventListener('DOMContentLoaded', init);
