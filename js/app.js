// ==========================================
// DADOS INICIAIS
// ==========================================
const INITIAL_MATERIALS = [];

const INITIAL_TEAMS = [
  "Equipe 01 - Campo",
  "Equipe 02 - Fusão",
  "Equipe 03 - Manutenção",
  "Técnico Carlos",
  "Técnico Marcos"
];

const INITIAL_LOGS = [];

// ==========================================
// STATE MANAGEMENT & LOCAL STORAGE
// ==========================================
const STORAGE_KEYS = {
  MATERIALS: 'estoque_ops_materials_v3',
  TEAMS: 'estoque_ops_teams_v3',
  LOGS: 'estoque_ops_logs_v3',
  THEME: 'estoque_ops_theme_v3'
};

let state = {
  materials: [],
  teams: [],
  logs: [],
  theme: 'dark'
};

function initApp() {
  try {
    const savedMaterials = localStorage.getItem(STORAGE_KEYS.MATERIALS);
    const savedTeams = localStorage.getItem(STORAGE_KEYS.TEAMS);
    const savedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);

    state.materials = savedMaterials ? JSON.parse(savedMaterials) : INITIAL_MATERIALS;
    state.teams = savedTeams ? JSON.parse(savedTeams) : INITIAL_TEAMS;
    state.logs = savedLogs ? JSON.parse(savedLogs) : INITIAL_LOGS;
    state.theme = savedTheme || 'dark';
  } catch (e) {
    console.warn('Usando dados padrões:', e);
    state.materials = INITIAL_MATERIALS;
    state.teams = INITIAL_TEAMS;
    state.logs = INITIAL_LOGS;
  }

  document.documentElement.setAttribute('data-theme', state.theme);
  updateThemeIcon();

  saveState();

  bindEventListeners();
  renderAllViews();
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(state.materials));
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(state.teams));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(state.logs));
  } catch (e) {
    console.error('Erro ao salvar state:', e);
  }
}

// ==========================================
// HELPERS
// ==========================================
function getMaterialStatus(qty, minStock) {
  if (qty <= 0) return { label: 'Esgotado', class: 'critical', percent: 0 };
  if (qty <= minStock) {
    const percent = Math.min(100, Math.round((qty / (minStock * 2)) * 100));
    return { label: 'Estoque Baixo', class: 'warning', percent };
  }
  return { label: 'Normal', class: 'normal', percent: 100 };
}

function formatDate(isoString) {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'error') icon = 'fa-circle-xmark';
  if (type === 'warning') icon = 'fa-triangle-exclamation';

  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function findMaterialByName(typedName) {
  if (!typedName) return null;
  const clean = typedName.trim().toLowerCase();
  return state.materials.find(m => m.name.toLowerCase() === clean || m.name.toLowerCase().includes(clean)) || null;
}

// ==========================================
// RENDERERS
// ==========================================
function renderAllViews() {
  renderDashboard();
  renderCatalog();
  populateDatalist();
  populateTeamDropdowns();
  renderTeamsTable();
  renderHistory();
  renderPDFReport();
}

function populateTeamDropdowns() {
  const select1 = document.getElementById('deduct-tech-select');
  const select2 = document.getElementById('modal-deduct-tech-select');

  const optionsHTML = `
    <option value="">Selecione a equipe...</option>
    ${state.teams.map(t => `<option value="${t}">${t}</option>`).join('')}
  `;

  if (select1) select1.innerHTML = optionsHTML;
  if (select2) select2.innerHTML = optionsHTML;
}

function renderTeamsTable() {
  const tbody = document.getElementById('teams-tbody');
  if (!tbody) return;

  if (state.teams.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 2rem;">Nenhuma equipe cadastrada. Clique em "Cadastrar Nova Equipe" para adicionar.</td></tr>`;
    return;
  }

  tbody.innerHTML = state.teams.map((team, index) => `
    <tr>
      <td><strong>#${index + 1}</strong></td>
      <td><strong>${team}</strong></td>
      <td><span class="status-badge normal"><i class="fa-solid fa-circle" style="font-size: 0.5rem;"></i> Ativa</span></td>
      <td style="text-align: right;">
        <button type="button" class="btn-card-action" onclick="window.appOpenEditTeamModal(${index})" style="display: inline-flex; margin-right: 0.4rem; padding: 0.4rem 0.75rem;">
          <i class="fa-solid fa-pen"></i> Editar
        </button>
        <button type="button" class="btn-card-action deduct" onclick="window.appDeleteTeam(${index})" style="display: inline-flex; padding: 0.4rem 0.75rem;">
          <i class="fa-solid fa-trash"></i> Excluir
        </button>
      </td>
    </tr>
  `).join('');
}

function renderDashboard() {
  const totalItems = state.materials.length;
  const warningItems = state.materials.filter(m => m.quantity > 0 && m.quantity <= m.minStock).length;
  const criticalItems = state.materials.filter(m => m.quantity <= 0).length;
  const totalWithdrawals = state.logs.filter(l => l.type === 'out').length;

  const elTotal = document.getElementById('kpi-total-items');
  const elWarn = document.getElementById('kpi-warning-items');
  const elCrit = document.getElementById('kpi-critical-items');
  const elWith = document.getElementById('kpi-total-withdrawals');

  if (elTotal) elTotal.textContent = totalItems;
  if (elWarn) elWarn.textContent = warningItems;
  if (elCrit) elCrit.textContent = criticalItems;
  if (elWith) elWith.textContent = totalWithdrawals;

  // Banner
  const alertBanner = document.getElementById('dashboard-alert-banner');
  const alertDetail = document.getElementById('alert-banner-detail');
  const navAlertCount = document.getElementById('nav-alert-count');
  const urgentCount = warningItems + criticalItems;

  if (alertBanner && alertDetail) {
    if (urgentCount > 0 && totalItems > 0) {
      alertBanner.style.display = 'flex';
      alertDetail.textContent = `Atenção: ${urgentCount} item(ns) estão com saldo crítico ou abaixo do mínimo!`;
      if (navAlertCount) {
        navAlertCount.style.display = 'inline-block';
        navAlertCount.textContent = urgentCount;
      }
    } else {
      alertBanner.style.display = 'none';
      if (navAlertCount) navAlertCount.style.display = 'none';
    }
  }

  // Warning Grid
  const warningGrid = document.getElementById('dashboard-warning-grid');
  if (warningGrid) {
    const urgentMaterials = state.materials.filter(m => m.quantity <= m.minStock);
    if (urgentMaterials.length === 0) {
      warningGrid.innerHTML = `
        <div style="grid-column: 1/-1; background: var(--bg-card); padding: 2rem; border-radius: var(--radius-md); text-align: center; color: var(--text-muted);">
          <i class="fa-solid fa-circle-check" style="font-size: 2rem; color: var(--status-normal); margin-bottom: 0.5rem;"></i>
          <p>${state.materials.length === 0 ? 'Nenhum material cadastrado no momento. Clique em "+ Novo Item" para cadastrar.' : 'Todos os materiais estão com estoque regular!'}</p>
        </div>
      `;
    } else {
      warningGrid.innerHTML = urgentMaterials.map(m => createMaterialCardHTML(m)).join('');
    }
  }

  // Recent Table
  const recentTbody = document.getElementById('dashboard-recent-tbody');
  if (recentTbody) {
    const recentLogs = state.logs.filter(l => l.type === 'out').slice(0, 5);
    if (recentLogs.length === 0) {
      recentTbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Nenhuma baixa registrada recentemente.</td></tr>`;
    } else {
      recentTbody.innerHTML = recentLogs.map(l => `
        <tr>
          <td>${formatDate(l.timestamp)}</td>
          <td><strong>${l.materialName}</strong></td>
          <td><span style="color: var(--status-critical); font-weight: 700;">-${l.quantity} ${l.unit}</span></td>
          <td>${l.technician}</td>
        </tr>
      `).join('');
    }
  }
}

function renderCatalog() {
  const catalogGrid = document.getElementById('catalog-grid');
  if (!catalogGrid) return;

  const searchQuery = (document.getElementById('catalog-search')?.value || '').toLowerCase();
  const categoryFilter = document.getElementById('catalog-category-filter')?.value || '';
  const statusFilter = document.getElementById('catalog-status-filter')?.value || '';

  const filtered = state.materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery);
    const matchesCategory = !categoryFilter || m.category === categoryFilter;
    const status = getMaterialStatus(m.quantity, m.minStock).class;
    const matchesStatus = !statusFilter || status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (filtered.length === 0) {
    catalogGrid.innerHTML = `
      <div style="grid-column: 1/-1; background: var(--bg-card); padding: 3rem; border-radius: var(--radius-md); text-align: center; color: var(--text-muted);">
        <i class="fa-solid fa-box-open" style="font-size: 2.5rem; margin-bottom: 1rem;"></i>
        <p>${state.materials.length === 0 ? 'O estoque está zerado! Clique em "+ Novo Item" no topo para cadastrar seus materiais.' : 'Nenhum material encontrado com os filtros selecionados.'}</p>
      </div>
    `;
    return;
  }

  catalogGrid.innerHTML = filtered.map(m => createMaterialCardHTML(m)).join('');
}

function createMaterialCardHTML(m) {
  const status = getMaterialStatus(m.quantity, m.minStock);
  const maxCap = m.totalCapacity || (m.minStock * 4);
  const progressPct = Math.min(100, Math.round((m.quantity / maxCap) * 100));

  return `
    <div class="material-card">
      <div class="card-top">
        <span class="material-category">${m.category || 'Geral'}</span>
        <span class="status-badge ${status.class}">
          <i class="fa-solid fa-circle" style="font-size: 0.5rem;"></i> ${status.label}
        </span>
      </div>

      <div class="material-name">${m.name}</div>

      <div class="material-qty-container">
        <span class="qty-number">${m.quantity}</span>
        <span class="qty-unit">${m.unit}</span>
        <span class="qty-min-info">Mín: <strong>${m.minStock}</strong></span>
      </div>

      <div class="stock-meter">
        <div class="stock-progress ${status.class}" style="width: ${progressPct}%;"></div>
      </div>

      <div class="card-actions">
        <button type="button" class="btn-card-action deduct" data-action="deduct" data-id="${m.id}">
          <i class="fa-solid fa-minus"></i> Baixar
        </button>
        <button type="button" class="btn-card-action add" data-action="add" data-id="${m.id}">
          <i class="fa-solid fa-plus"></i> Entrada
        </button>
      </div>
    </div>
  `;
}

function populateDatalist() {
  const datalist = document.getElementById('materials-datalist');
  if (!datalist) return;

  datalist.innerHTML = state.materials.map(m => 
    `<option value="${m.name}">${m.name} (Atual: ${m.quantity} ${m.unit})</option>`
  ).join('');
}

function renderHistory() {
  const tbody = document.getElementById('history-tbody');
  if (!tbody) return;

  const searchQuery = (document.getElementById('history-search')?.value || '').toLowerCase();
  const typeFilter = document.getElementById('history-type-filter')?.value || '';

  const filteredLogs = state.logs.filter(l => {
    const matchesSearch = l.materialName.toLowerCase().includes(searchQuery) ||
                          (l.technician || '').toLowerCase().includes(searchQuery);
    const matchesType = !typeFilter || l.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (filteredLogs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">Nenhum histórico registrado.</td></tr>`;
    return;
  }

  tbody.innerHTML = filteredLogs.map(l => `
    <tr>
      <td>${formatDate(l.timestamp)}</td>
      <td>
        <span class="type-pill ${l.type}">
          <i class="fa-solid ${l.type === 'out' ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
          ${l.type === 'out' ? 'SAÍDA' : 'ENTRADA'}
        </span>
      </td>
      <td><strong>${l.materialName}</strong></td>
      <td>
        <span style="font-weight: 700; color: ${l.type === 'out' ? 'var(--status-critical)' : 'var(--status-normal)'}">
          ${l.type === 'out' ? '-' : '+'}${l.quantity} ${l.unit}
        </span>
      </td>
      <td>${l.technician || '-'}</td>
    </tr>
  `).join('');
}

function renderPDFReport() {
  const dateEl = document.getElementById('pdf-emit-date');
  if (dateEl) dateEl.textContent = new Date().toLocaleString('pt-BR');

  // Section 1: Materiais em Estoque
  const invTbody = document.getElementById('pdf-inventory-tbody');
  if (invTbody) {
    if (state.materials.length === 0) {
      invTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #64748b;">Nenhum material cadastrado no estoque.</td></tr>`;
    } else {
      invTbody.innerHTML = state.materials.map((m, index) => {
        const status = getMaterialStatus(m.quantity, m.minStock);
        return `
          <tr>
            <td>${index + 1}</td>
            <td><strong>${m.name}</strong></td>
            <td>${m.category || 'Geral'}</td>
            <td><strong>${m.quantity} ${m.unit}</strong></td>
            <td>${m.minStock} ${m.unit}</td>
            <td><strong>${status.label.toUpperCase()}</strong></td>
          </tr>
        `;
      }).join('');
    }
  }

  // Section 2: Materiais Retirados (Saídas / Baixas)
  const withdrawnTbody = document.getElementById('pdf-withdrawn-tbody');
  if (withdrawnTbody) {
    const withdrawnLogs = state.logs.filter(l => l.type === 'out');
    if (withdrawnLogs.length === 0) {
      withdrawnTbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #64748b;">Nenhuma retirada de material registrada.</td></tr>`;
    } else {
      withdrawnTbody.innerHTML = withdrawnLogs.map(l => `
        <tr>
          <td>${formatDate(l.timestamp)}</td>
          <td>${l.materialName}</td>
          <td style="color: #dc2626; font-weight: 700;">-${l.quantity} ${l.unit}</td>
          <td>${l.technician || '-'}</td>
        </tr>
      `).join('');
    }
  }

  // Section 3: Entradas de Estoque
  const entriesTbody = document.getElementById('pdf-entries-tbody');
  if (entriesTbody) {
    const entryLogs = state.logs.filter(l => l.type === 'in');
    if (entryLogs.length === 0) {
      entriesTbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #64748b;">Nenhuma entrada de estoque registrada.</td></tr>`;
    } else {
      entriesTbody.innerHTML = entryLogs.map(l => `
        <tr>
          <td>${formatDate(l.timestamp)}</td>
          <td>${l.materialName}</td>
          <td style="color: #16a34a; font-weight: 700;">+${l.quantity} ${l.unit}</td>
          <td>${l.technician || '-'}</td>
        </tr>
      `).join('');
    }
  }

  // Update section visibility based on checkboxes
  updatePDFSectionVisibility();
}

function updatePDFSectionVisibility() {
  const stockCheck = document.getElementById('pdf-toggle-stock');
  const withdrawnCheck = document.getElementById('pdf-toggle-withdrawn');
  const entriesCheck = document.getElementById('pdf-toggle-entries');

  const stockSection = document.getElementById('pdf-section-stock');
  const withdrawnSection = document.getElementById('pdf-section-withdrawn');
  const entriesSection = document.getElementById('pdf-section-entries');

  if (stockSection && stockCheck) stockSection.style.display = stockCheck.checked ? 'block' : 'none';
  if (withdrawnSection && withdrawnCheck) withdrawnSection.style.display = withdrawnCheck.checked ? 'block' : 'none';
  if (entriesSection && entriesCheck) entriesSection.style.display = entriesCheck.checked ? 'block' : 'none';

  // Re-number visible sections
  let counter = 1;
  [stockSection, withdrawnSection, entriesSection].forEach(section => {
    if (section && section.style.display !== 'none') {
      const badge = section.querySelector('h3 span');
      if (badge) badge.textContent = counter++;
    }
  });
}


// ==========================================
// ACTIONS & HANDLERS
// ==========================================
function handleDeductByTypedName(typedMaterialName, qty, technician) {
  let item = findMaterialByName(typedMaterialName);

  if (!item) {
    item = {
      id: 'mat-' + Date.now(),
      name: typedMaterialName.trim(),
      category: 'Geral',
      unit: 'unidades',
      quantity: 0,
      minStock: 10,
      totalCapacity: 100,
      lastUpdated: new Date().toISOString()
    };
    state.materials.unshift(item);
  }

  if (qty > item.quantity) {
    showToast(`Atenção: Saldo insuficiente (${item.quantity} ${item.unit}). O saldo ficará zerado.`, 'warning');
  }

  item.quantity = Math.max(0, item.quantity - qty);
  item.lastUpdated = new Date().toISOString();

  const newLog = {
    id: 'log-' + Date.now(),
    type: 'out',
    materialId: item.id,
    materialName: item.name,
    quantity: qty,
    unit: item.unit,
    technician: technician || 'Equipe Não Especificada',
    timestamp: new Date().toISOString()
  };

  state.logs.unshift(newLog);
  saveState();
  renderAllViews();

  showToast(`Baixa de ${qty} ${item.unit} de "${item.name}" registrada!`, 'success');
  return true;
}

function handleAddStockByTypedName(typedMaterialName, qty) {
  let item = findMaterialByName(typedMaterialName);

  if (!item) {
    item = {
      id: 'mat-' + Date.now(),
      name: typedMaterialName.trim(),
      category: 'Geral',
      unit: 'unidades',
      quantity: 0,
      minStock: 10,
      totalCapacity: 100,
      lastUpdated: new Date().toISOString()
    };
    state.materials.unshift(item);
  }

  item.quantity += qty;
  item.lastUpdated = new Date().toISOString();

  const newLog = {
    id: 'log-' + Date.now(),
    type: 'in',
    materialId: item.id,
    materialName: item.name,
    quantity: qty,
    unit: item.unit,
    technician: 'Entrada de Estoque',
    timestamp: new Date().toISOString()
  };

  state.logs.unshift(newLog);
  saveState();
  renderAllViews();

  showToast(`Entrada de ${qty} ${item.unit} em "${item.name}" adicionada!`, 'success');
  return true;
}

function handleAddNewMaterial(name, category, qty, unit, minStock) {
  const newMaterial = {
    id: 'mat-' + Date.now(),
    name: name.trim(),
    category: category || 'Geral',
    unit: unit || 'unidades',
    quantity: parseInt(qty) || 0,
    minStock: parseInt(minStock) || 5,
    totalCapacity: (parseInt(minStock) || 5) * 4,
    lastUpdated: new Date().toISOString()
  };

  state.materials.unshift(newMaterial);
  saveState();
  renderAllViews();

  showToast(`Novo material "${name}" cadastrado!`, 'success');
}

function handleAddNewTeam(teamName) {
  if (!teamName || !teamName.trim()) return;
  const name = teamName.trim();
  if (!state.teams.includes(name)) {
    state.teams.push(name);
    saveState();
    renderAllViews();
    showToast(`Nova equipe "${name}" cadastrada!`, 'success');
  } else {
    showToast(`A equipe "${name}" já existe.`, 'warning');
  }
}

function handleUpdateTeam(index, updatedName) {
  if (!updatedName || !updatedName.trim()) return;
  const name = updatedName.trim();
  if (index >= 0 && index < state.teams.length) {
    state.teams[index] = name;
    saveState();
    renderAllViews();
    showToast(`Equipe atualizada para "${name}"!`, 'success');
  }
}

function handleDeleteTeam(index) {
  if (index >= 0 && index < state.teams.length) {
    const teamName = state.teams[index];
    if (confirm(`Deseja realmente excluir a equipe "${teamName}"?`)) {
      state.teams.splice(index, 1);
      saveState();
      renderAllViews();
      showToast(`Equipe "${teamName}" excluída!`, 'info');
    }
  }
}

// Global modal triggers
window.appOpenEditTeamModal = function(index) {
  const teamName = state.teams[index];
  if (teamName !== undefined) {
    document.getElementById('edit-tech-index').value = index;
    document.getElementById('edit-tech-name').value = teamName;
    openModal('modal-edit-tech');
  }
};

window.appDeleteTeam = function(index) {
  handleDeleteTeam(index);
};

// ==========================================
// NAVIGATION & EVENT LISTENERS
// ==========================================
function switchTab(tabKey) {
  const titles = {
    'dashboard': { title: 'Painel Geral', sub: 'Visão panorâmica do estoque e solicitações' },
    'catalog': { title: 'Estoque Completo', sub: 'Catálogo de materiais, saldos e margem de segurança' },
    'deduct-tab': { title: 'Registrar Saída', sub: 'Digite o material, quantidade e selecione a equipe!' },
    'teams': { title: 'Gerenciar Equipes', sub: 'Cadastre, edite ou remova equipes e técnicos da operação' },
    'history': { title: 'Histórico de Saídas & Entradas', sub: 'Registro detalhado de movimentações' },
    'pdf-export': { title: 'Relatório em PDF', sub: 'Gere e imprima o documento oficial em PDF' }
  };

  if (titles[tabKey]) {
    const elTitle = document.getElementById('current-tab-title');
    const elSub = document.getElementById('current-tab-sub');
    if (elTitle) elTitle.textContent = titles[tabKey].title;
    if (elSub) elSub.textContent = titles[tabKey].sub;
  }

  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.getAttribute('data-tab') === tabKey) item.classList.add('active');
    else item.classList.remove('active');
  });

  document.querySelectorAll('.mobile-nav button').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabKey) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  document.querySelectorAll('.tab-view').forEach(view => {
    if (view.id === `tab-${tabKey}`) view.classList.add('active');
    else view.classList.remove('active');
  });
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

function appOpenDeductModal(materialId) {
  const item = state.materials.find(m => m.id === materialId);
  if (!item) return;

  const idEl = document.getElementById('modal-deduct-item-id');
  const titleEl = document.getElementById('modal-deduct-item-title');
  const qtyEl = document.getElementById('modal-deduct-qty');

  if (idEl) idEl.value = item.id;
  if (titleEl) titleEl.textContent = `Dar Baixa: ${item.name}`;
  if (qtyEl) {
    qtyEl.value = 1;
    qtyEl.max = item.quantity;
  }
  openModal('modal-quick-deduct');
}

function appOpenAddStockModal(materialId) {
  const item = state.materials.find(m => m.id === materialId);
  const input = document.getElementById('add-stock-material-input');
  if (input && item) input.value = item.name;
  openModal('modal-add-stock');
}

function exportToCSV() {
  if (state.logs.length === 0) {
    showToast('Nenhum registro no histórico para exportar.', 'warning');
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
  csvContent += "Data/Hora,Tipo,Material,Quantidade,Unidade,Equipe/Tecnico\n";

  state.logs.forEach(l => {
    const row = [
      `"${formatDate(l.timestamp)}"`,
      `"${l.type === 'out' ? 'SAIDA' : 'ENTRADA'}"`,
      `"${l.materialName}"`,
      l.quantity,
      `"${l.unit}"`,
      `"${l.technician || ''}"`
    ].join(",");
    csvContent += row + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `EstoqueOps_Historico_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();

  showToast('Relatório CSV baixado com sucesso!', 'success');
}

function bindEventListeners() {
  // Global Event Delegation
  document.addEventListener('click', (e) => {
    const navTarget = e.target.closest('[data-tab]');
    if (navTarget) {
      const tabKey = navTarget.getAttribute('data-tab');
      if (tabKey) switchTab(tabKey);
      return;
    }

    const cardAction = e.target.closest('[data-action]');
    if (cardAction) {
      const action = cardAction.getAttribute('data-action');
      const matId = cardAction.getAttribute('data-id');
      if (action === 'deduct') appOpenDeductModal(matId);
      if (action === 'add') appOpenAddStockModal(matId);
      return;
    }

    if (e.target.closest('.modal-close') || e.target.closest('.btn-close-modal')) {
      closeModal();
      return;
    }
  });

  // Quick Action Buttons
  document.getElementById('btn-open-quick-deduct')?.addEventListener('click', () => switchTab('deduct-tab'));
  document.getElementById('btn-banner-go-deduct')?.addEventListener('click', () => switchTab('catalog'));
  document.getElementById('btn-view-all-history')?.addEventListener('click', () => switchTab('history'));

  // Modals Open
  document.getElementById('btn-open-add-stock')?.addEventListener('click', () => openModal('modal-add-stock'));
  document.getElementById('btn-open-add-material')?.addEventListener('click', () => openModal('modal-add-material'));
  document.getElementById('btn-open-add-tech')?.addEventListener('click', () => openModal('modal-add-tech'));
  document.getElementById('btn-tab-add-tech')?.addEventListener('click', () => openModal('modal-add-tech'));
  document.getElementById('btn-quick-add-tech')?.addEventListener('click', () => openModal('modal-add-tech'));

  // Download PDF Button
  document.getElementById('btn-download-pdf-now')?.addEventListener('click', () => {
    window.print();
  });

  // PDF Section Toggles
  document.getElementById('pdf-toggle-stock')?.addEventListener('change', updatePDFSectionVisibility);
  document.getElementById('pdf-toggle-withdrawn')?.addEventListener('change', updatePDFSectionVisibility);
  document.getElementById('pdf-toggle-entries')?.addEventListener('change', updatePDFSectionVisibility);

  // Reset Materials List
  document.getElementById('btn-reset-materials')?.addEventListener('click', () => {
    if (confirm('Deseja realmente zerar a lista de materiais?')) {
      state.materials = [];
      saveState();
      renderAllViews();
      showToast('Lista de materiais zerada com sucesso!', 'info');
    }
  });

  // Search & Filter Events
  document.getElementById('catalog-search')?.addEventListener('input', renderCatalog);
  document.getElementById('catalog-category-filter')?.addEventListener('change', renderCatalog);
  document.getElementById('catalog-status-filter')?.addEventListener('change', renderCatalog);

  document.getElementById('history-search')?.addEventListener('input', renderHistory);
  document.getElementById('history-type-filter')?.addEventListener('change', renderHistory);

  // Material Typed Input Change
  document.getElementById('deduct-material-input')?.addEventListener('input', (e) => {
    const infoBox = document.getElementById('deduct-current-info');
    const matchedMat = findMaterialByName(e.target.value);
    if (matchedMat && infoBox) {
      infoBox.style.display = 'block';
      document.getElementById('deduct-info-qty').textContent = `${matchedMat.quantity} ${matchedMat.unit}`;
      document.getElementById('deduct-info-min').textContent = `${matchedMat.minStock} ${matchedMat.unit}`;
    } else if (infoBox) {
      infoBox.style.display = 'none';
    }
  });

  // Form: Deduct Tab
  document.getElementById('form-tab-deduct')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const typedName = document.getElementById('deduct-material-input').value;
    const qty = parseInt(document.getElementById('deduct-qty-input').value);
    const tech = document.getElementById('deduct-tech-select').value;

    if (handleDeductByTypedName(typedName, qty, tech)) {
      document.getElementById('form-tab-deduct').reset();
      document.getElementById('deduct-current-info').style.display = 'none';
    }
  });

  // Form: Modal Deduct (From Card)
  document.getElementById('form-modal-deduct')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const materialId = document.getElementById('modal-deduct-item-id').value;
    const qty = parseInt(document.getElementById('modal-deduct-qty').value);
    const tech = document.getElementById('modal-deduct-tech-select').value;

    const item = state.materials.find(m => m.id === materialId);
    if (item) {
      if (handleDeductByTypedName(item.name, qty, tech)) {
        closeModal();
        document.getElementById('form-modal-deduct').reset();
      }
    }
  });

  // Form: Modal Add Tech / Team
  document.getElementById('form-modal-add-tech')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const teamName = document.getElementById('new-tech-name').value;
    handleAddNewTeam(teamName);
    closeModal();
    document.getElementById('form-modal-add-tech').reset();
  });

  // Form: Modal Edit Tech / Team
  document.getElementById('form-modal-edit-tech')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const index = parseInt(document.getElementById('edit-tech-index').value);
    const teamName = document.getElementById('edit-tech-name').value;
    handleUpdateTeam(index, teamName);
    closeModal();
    document.getElementById('form-modal-edit-tech').reset();
  });

  // Form: Modal Add Stock
  document.getElementById('form-modal-add-stock')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const typedName = document.getElementById('add-stock-material-input').value;
    const qty = parseInt(document.getElementById('add-stock-qty').value);

    if (handleAddStockByTypedName(typedName, qty)) {
      closeModal();
      document.getElementById('form-modal-add-stock').reset();
    }
  });

  // Form: Modal Add Material
  document.getElementById('form-modal-add-material')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('new-mat-name').value;
    const category = document.getElementById('new-mat-category').value;
    const qty = document.getElementById('new-mat-qty').value;
    const unit = document.getElementById('new-mat-unit').value;
    const min = document.getElementById('new-mat-min').value;

    handleAddNewMaterial(name, category, qty, unit, min);
    closeModal();
    document.getElementById('form-modal-add-material').reset();
  });

  // Export CSV
  document.getElementById('btn-export-csv')?.addEventListener('click', exportToCSV);

  // Theme Toggle
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, state.theme);
    } catch(e) {}
    updateThemeIcon();
  });
}

function updateThemeIcon() {
  const icon = document.querySelector('#theme-toggle i');
  if (icon) {
    icon.className = state.theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  }
}

// Global scope bindings
window.switchTab = switchTab;
window.openModal = openModal;
window.closeModal = closeModal;
window.appOpenDeductModal = appOpenDeductModal;
window.appOpenAddStockModal = appOpenAddStockModal;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
