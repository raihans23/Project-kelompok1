/* script.js - global interactions for all pages (no framework) */

/* ---- Utilities: storage & logs ---- */
const STORAGE_KEYS = {
    MENU: 'app_menu_items_v1',
    ADMIN: 'app_admin_users_v1',
    TRANSACTIONS: 'app_transactions_v1',
    LOGS: 'app_logs_v1'
  };
  
  function storageGet(key, fallback = []) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function storageSet(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
  
  function addLog(type, detail) {
    const logs = storageGet(STORAGE_KEYS.LOGS, []);
    logs.unshift({
      time: new Date().toISOString().replace('T',' ').slice(0,19),
      user: 'system',
      type,
      detail
    });
    storageSet(STORAGE_KEYS.LOGS, logs);
  }
  
  /* ---- Toast ---- */
  function showToast(msg, time = 2200) {
    let t = document.getElementById('global-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'global-toast';
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._hideTimeout);
    t._hideTimeout = setTimeout(()=> t.classList.remove('show'), time);
  }
  
  /* ---- Modal helpers ---- */
  function openModal(htmlContent = '', title = 'Form') {
    let backdrop = document.getElementById('modal-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'modal-backdrop';
      backdrop.className = 'modal-backdrop';
      document.body.appendChild(backdrop);
    }
    backdrop.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <h3>${title}</h3>
        <div class="modal-body">${htmlContent}</div>
        <div class="modal-footer">
          <button class="btn ghost" id="modal-close-btn">Batal</button>
        </div>
      </div>`;
    backdrop.style.display = 'flex';
    document.getElementById('modal-close-btn').addEventListener('click', closeModal);
    backdrop.addEventListener('click', (e)=>{
      if (e.target === backdrop) closeModal();
    });
  }
  
  function closeModal() {
    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) backdrop.style.display = 'none';
  }
  
  /* ---- CRUD: Menu ---- */
  function renderMenu() {
    const tbody = document.getElementById('menu-tbody');
    if (!tbody) return;
    const items = storageGet(STORAGE_KEYS.MENU, []);
    tbody.innerHTML = '';
    items.forEach((it, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(it.name)}</td>
        <td>${escapeHtml(it.category)}</td>
        <td>Rp ${numberWithSeparator(it.price)}</td>
        <td class="actions">
          <button class="btn small" data-action="edit-menu" data-index="${idx}">Edit</button>
          <button class="btn danger small" data-action="del-menu" data-index="${idx}">Hapus</button>
        </td>`;
      tbody.appendChild(tr);
    });
  }
  
  function initMenuHandlers() {
    const form = document.getElementById('menu-form');
    if (form) {
      form.addEventListener('submit', (e)=>{
        e.preventDefault();
        const name = form.querySelector('[name=name]').value.trim();
        const category = form.querySelector('[name=category]').value.trim();
        const price = Number(form.querySelector('[name=price]').value) || 0;
        if (!name) return showToast('Isi nama menu terlebih dahulu');
        const items = storageGet(STORAGE_KEYS.MENU, []);
        items.unshift({name, category, price});
        storageSet(STORAGE_KEYS.MENU, items);
        form.reset();
        renderMenu();
        addLog('CRUD', `Tambah menu: ${name}`);
        showToast('Menu ditambahkan');
      });
      // delegate edit/delete
      document.getElementById('menu-tbody')?.addEventListener('click', (e)=>{
        const btn = e.target.closest('button');
        if (!btn) return;
        const action = btn.dataset.action;
        const idx = Number(btn.dataset.index);
        if (action === 'del-menu') {
          if (!confirm('Yakin ingin menghapus menu ini?')) return;
          const items = storageGet(STORAGE_KEYS.MENU, []);
          const removed = items.splice(idx,1)[0];
          storageSet(STORAGE_KEYS.MENU, items);
          renderMenu();
          addLog('CRUD', `Hapus menu: ${removed?.name || 'unknown'}`);
          showToast('Menu dihapus');
        } else if (action === 'edit-menu') {
          const items = storageGet(STORAGE_KEYS.MENU, []);
          const it = items[idx];
          openModal(`
            <form id="menu-edit-form">
              <input name="name" placeholder="Nama Menu" value="${escapeHtml(it.name)}" style="width:100%;padding:8px;margin-bottom:8px" />
              <input name="category" placeholder="Kategori" value="${escapeHtml(it.category)}" style="width:100%;padding:8px;margin-bottom:8px" />
              <input name="price" type="number" placeholder="Harga" value="${it.price}" style="width:100%;padding:8px;margin-bottom:8px" />
              <div style="display:flex;gap:8px;justify-content:flex-end">
                <button class="btn ghost" type="button" id="cancel-edit">Batal</button>
                <button class="btn primary" type="submit">Simpan</button>
              </div>
            </form>
          `, 'Edit Menu');
          document.getElementById('cancel-edit').addEventListener('click', closeModal);
          document.getElementById('menu-edit-form').addEventListener('submit', (ev)=>{
            ev.preventDefault();
            const name2 = ev.target.name.value.trim();
            const cat2 = ev.target.category.value.trim();
            const price2 = Number(ev.target.price.value) || 0;
            const items2 = storageGet(STORAGE_KEYS.MENU, []);
            items2[idx] = {name: name2, category: cat2, price: price2};
            storageSet(STORAGE_KEYS.MENU, items2);
            renderMenu();
            closeModal();
            addLog('CRUD','Edit menu: '+name2);
            showToast('Menu disimpan');
          });
        }
      });
    }
  }
  
  /* ---- CRUD: Admin ---- */
  function renderAdmin() {
    const tbody = document.getElementById('admin-tbody');
    if (!tbody) return;
    const items = storageGet(STORAGE_KEYS.ADMIN, []);
    tbody.innerHTML = '';
    items.forEach((it, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(it.name)}</td>
        <td>${escapeHtml(it.email)}</td>
        <td>${escapeHtml(it.role)}</td>
        <td class="actions">
          <button class="btn small" data-action="edit-admin" data-index="${idx}">Edit</button>
          <button class="btn danger small" data-action="del-admin" data-index="${idx}">Nonaktifkan</button>
        </td>`;
      tbody.appendChild(tr);
    });
  }
  
  function initAdminHandlers() {
    const form = document.getElementById('admin-form');
    if (form) {
      form.addEventListener('submit', (e)=>{
        e.preventDefault();
        const name = form.querySelector('[name=name]').value.trim();
        const email = form.querySelector('[name=email]').value.trim();
        const role = form.querySelector('[name=role]').value || 'Admin';
        if (!name || !email) return showToast('Nama dan email dibutuhkan');
        const items = storageGet(STORAGE_KEYS.ADMIN, []);
        items.unshift({name, email, role});
        storageSet(STORAGE_KEYS.ADMIN, items);
        form.reset();
        renderAdmin();
        addLog('CRUD','Tambah admin: '+name);
        showToast('Admin ditambahkan');
      });
      document.getElementById('admin-tbody')?.addEventListener('click', (e)=>{
        const btn = e.target.closest('button');
        if (!btn) return;
        const action = btn.dataset.action;
        const idx = Number(btn.dataset.index);
        if (action === 'del-admin') {
          if (!confirm('Nonaktifkan akun ini?')) return;
          const items = storageGet(STORAGE_KEYS.ADMIN, []);
          const removed = items.splice(idx,1)[0];
          storageSet(STORAGE_KEYS.ADMIN, items);
          renderAdmin();
          addLog('CRUD','Nonaktifkan admin: '+(removed?.name||'unknown'));
          showToast('Admin dinonaktifkan');
        } else if (action === 'edit-admin') {
          const items = storageGet(STORAGE_KEYS.ADMIN, []);
          const it = items[idx];
          openModal(`
            <form id="admin-edit-form">
              <input name="name" placeholder="Nama lengkap" value="${escapeHtml(it.name)}" style="width:100%;padding:8px;margin-bottom:8px" />
              <input name="email" placeholder="Email" value="${escapeHtml(it.email)}" style="width:100%;padding:8px;margin-bottom:8px" />
              <select name="role" style="width:100%;padding:8px;margin-bottom:8px">
                <option ${it.role==='Super Admin'?'selected':''}>Super Admin</option>
                <option ${it.role==='Admin'?'selected':''}>Admin</option>
                <option ${it.role==='Operator'?'selected':''}>Operator</option>
              </select>
              <div style="display:flex;gap:8px;justify-content:flex-end">
                <button class="btn ghost" type="button" id="cancel-admin-edit">Batal</button>
                <button class="btn primary" type="submit">Simpan</button>
              </div>
            </form>
          `,'Edit Admin');
          document.getElementById('cancel-admin-edit').addEventListener('click', closeModal);
          document.getElementById('admin-edit-form').addEventListener('submit', (ev)=>{
            ev.preventDefault();
            const name2 = ev.target.name.value.trim();
            const email2 = ev.target.email.value.trim();
            const role2 = ev.target.role.value;
            const items2 = storageGet(STORAGE_KEYS.ADMIN, []);
            items2[idx] = {name:name2,email:email2,role:role2};
            storageSet(STORAGE_KEYS.ADMIN, items2);
            renderAdmin();
            closeModal();
            addLog('CRUD','Edit admin: '+name2);
            showToast('Perubahan disimpan');
          });
        }
      });
    }
  }
  
  /* ---- Transactions ---- */
  function renderTransactions() {
    const tbody = document.getElementById('transactions-tbody');
    if (!tbody) return;
    const items = storageGet(STORAGE_KEYS.TRANSACTIONS, []);
    tbody.innerHTML = '';
    items.forEach((tx, idx)=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(tx.no)}</td>
        <td>${escapeHtml(tx.date)}</td>
        <td>${escapeHtml(tx.customer)}</td>
        <td>Rp ${numberWithSeparator(tx.total)}</td>
        <td class="actions">
          <button class="btn small" data-action="detail-tx" data-index="${idx}">Detail</button>
          <button class="btn small" data-action="print-tx" data-index="${idx}">Cetak</button>
          <button class="btn danger small" data-action="del-tx" data-index="${idx}">Hapus</button>
        </td>`;
      tbody.appendChild(tr);
    });
  }
  
  function initTransactionHandlers() {
    const addBtn = document.getElementById('btn-add-transaction');
    if (addBtn) {
      addBtn.addEventListener('click', ()=> {
        openModal(`
          <form id="tx-add-form">
            <input name="no" placeholder="No Transaksi (mis: 003)" style="width:100%;padding:8px;margin-bottom:8px" />
            <input name="date" type="date" style="width:100%;padding:8px;margin-bottom:8px" />
            <input name="customer" placeholder="Nama Pembeli" style="width:100%;padding:8px;margin-bottom:8px" />
            <input name="total" type="number" placeholder="Total (angka)" style="width:100%;padding:8px;margin-bottom:8px" />
            <div style="display:flex;gap:8px;justify-content:flex-end">
              <button class="btn ghost" type="button" id="cancel-tx-add">Batal</button>
              <button class="btn primary" type="submit">Tambah</button>
            </div>
          </form>
        `, 'Tambah Transaksi');
        document.getElementById('cancel-tx-add').addEventListener('click', closeModal);
        document.getElementById('tx-add-form').addEventListener('submit', (ev)=>{
          ev.preventDefault();
          const no = ev.target.no.value.trim();
          const date = ev.target.date.value || (new Date()).toISOString().slice(0,10);
          const customer = ev.target.customer.value.trim();
          const total = Number(ev.target.total.value) || 0;
          if (!no || !customer) return showToast('No & Nama Pembeli dibutuhkan');
          const items = storageGet(STORAGE_KEYS.TRANSACTIONS, []);
          items.unshift({no, date, customer, total});
          storageSet(STORAGE_KEYS.TRANSACTIONS, items);
          renderTransactions();
          closeModal();
          addLog('Transaksi', `Tambah transaksi ${no}`);
          showToast('Transaksi ditambahkan');
        });
      });
  
      document.getElementById('transactions-tbody')?.addEventListener('click', (e)=>{
        const btn = e.target.closest('button');
        if (!btn) return;
        const action = btn.dataset.action;
        const idx = Number(btn.dataset.index);
        if (action === 'del-tx') {
          if (!confirm('Hapus transaksi ini?')) return;
          const items = storageGet(STORAGE_KEYS.TRANSACTIONS, []);
          const removed = items.splice(idx,1)[0];
          storageSet(STORAGE_KEYS.TRANSACTIONS, items);
          renderTransactions();
          addLog('Transaksi', `Hapus transaksi ${removed?.no||'unknown'}`);
          showToast('Transaksi dihapus');
        } else if (action === 'detail-tx') {
          const items = storageGet(STORAGE_KEYS.TRANSACTIONS, []);
          const tx = items[idx];
          openModal(`
            <div>
              <p><strong>No:</strong> ${escapeHtml(tx.no)}</p>
              <p><strong>Tanggal:</strong> ${escapeHtml(tx.date)}</p>
              <p><strong>Pembeli:</strong> ${escapeHtml(tx.customer)}</p>
              <p><strong>Total:</strong> Rp ${numberWithSeparator(tx.total)}</p>
            </div>
          `, 'Detail Transaksi');
        } else if (action === 'print-tx') {
          const items = storageGet(STORAGE_KEYS.TRANSACTIONS, []);
          const tx = items[idx];
          const w = window.open('', '_blank', 'width=800,height=600');
          const html = `
            <html><head><title>Struk ${escapeHtml(tx.no)}</title>
            <style>body{font-family:Arial;padding:20px}h2{margin-bottom:8px}</style>
            </head><body>
            <h2>Struk Transaksi - ${escapeHtml(tx.no)}</h2>
            <p>Tanggal: ${escapeHtml(tx.date)}</p>
            <p>Pembeli: ${escapeHtml(tx.customer)}</p>
            <p>Total: Rp ${numberWithSeparator(tx.total)}</p>
            <hr>
            <p>Terima kasih!</p>
            </body></html>`;
          w.document.write(html);
          w.document.close();
          w.focus();
          addLog('Transaksi', `Cetak struk ${tx.no}`);
          setTimeout(()=> w.print(), 300);
        }
      });
    }
  }
  
  /* ---- Log rendering ---- */
  function renderLogs() {
    const tbody = document.getElementById('log-tbody');
    if (!tbody) return;
    const logs = storageGet(STORAGE_KEYS.LOGS, []);
    tbody.innerHTML = '';
    logs.forEach(l => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${escapeHtml(l.time)}</td><td>${escapeHtml(l.user)}</td><td>${escapeHtml(l.type)}</td><td>${escapeHtml(l.detail)}</td>`;
      tbody.appendChild(tr);
    });
  }
  
  /* ---- Dashboard: show summary ---- */
  function renderDashboardSummary() {
    const elTxCount = document.getElementById('summary-transactions-count');
    const elIncome = document.getElementById('summary-income');
    const elAdmins = document.getElementById('summary-admins');
    if (elTxCount) elTxCount.textContent = storageGet(STORAGE_KEYS.TRANSACTIONS, []).length;
    if (elIncome) {
      const total = storageGet(STORAGE_KEYS.TRANSACTIONS, []).reduce((s,t)=> s + (Number(t.total)||0), 0);
      elIncome.textContent = 'Rp ' + numberWithSeparator(total);
    }
    if (elAdmins) elAdmins.textContent = storageGet(STORAGE_KEYS.ADMIN, []).length;
  }
  
  /* ---- Helpers ---- */
  function escapeHtml(str='') {
    return String(str).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]); });
  }
  function numberWithSeparator(n) {
    try {
      return Number(n).toLocaleString('id-ID');
    } catch { return n; }
  }
  
  /* ---- Initialize per page ---- */
  document.addEventListener('DOMContentLoaded', ()=>{
    // Menu page
    renderMenu();
    initMenuHandlers();
  
    // Admin page
    renderAdmin();
    initAdminHandlers();
  
    // Transactions page
    renderTransactions();
    initTransactionHandlers();
  
    // Log page
    renderLogs();
  
    // Dashboard
    renderDashboardSummary();
  
    // Generic: attach print buttons that have data-print attribute
    document.querySelectorAll('[data-print]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        window.print();
      });
    });
  
    // small auto-seed sample data if empty (only first time)
    if (!localStorage.getItem(STORAGE_KEYS.MENU)) {
      storageSet(STORAGE_KEYS.MENU, [
        {name:'Nasi Goreng', category:'Makanan', price:25000},
        {name:'Es Teh', category:'Minuman', price:7000}
      ]);
      renderMenu();
    }
    if (!localStorage.getItem(STORAGE_KEYS.ADMIN)) {
      storageSet(STORAGE_KEYS.ADMIN, [
        {name:'Rai', email:'rai@example.com', role:'Super Admin'},
        {name:'Ruri', email:'ruri@example.com', role:'Operator'}
      ]);
      renderAdmin();
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      storageSet(STORAGE_KEYS.TRANSACTIONS, [
        {no:'001', date:'2025-10-23', customer:'Budi', total:120000},
        {no:'002', date:'2025-10-22', customer:'Siti', total:45000}
      ]);
      renderTransactions();
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
      storageSet(STORAGE_KEYS.LOGS, [
        {time: new Date().toISOString().replace('T',' ').slice(0,19), user:'system', type:'Init','detail':'Seed data created'}
      ]);
      renderLogs();
    }
  });
  // Tandai link aktif sesuai halaman
const currentPage = window.location.pathname.split("/").pop();
document.querySelectorAll(".navbar a").forEach(link => {
  if (link.getAttribute("href") === currentPage) {
    link.classList.add("active");
  }
});
