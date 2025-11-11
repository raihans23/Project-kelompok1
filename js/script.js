// Bagian KASIR — hanya jalan kalau ada elemen menuGrid
const menuGrid = document.getElementById('menuGrid');
if (menuGrid) {
  const menuItems = [
    { name: "Chocolate", price: 20000, sold: 50, category: "Minuman", img: "img/coklat2.jpg", date: "2024-03-01" },
    { name: "Red Velvet", price: 25000, sold: 40, category: "Minuman", img: "img/red.jpg", date: "2024-03-10" },
    { name: "Matcha Latte", price: 20000, sold: 35, category: "Minuman", img: "img/matcha.jpg", date: "2024-03-15" },
    { name: "Thai Tea", price: 20000, sold: 60, category: "Minuman", img: "img/tea.jpeg", date: "2024-03-12" },
    { name: "Taro", price: 15000, sold: 30, category: "Minuman", img: "img/taro.jpg", date: "2024-03-20" },
    { name: "Roti Bakar", price: 12000, sold: 20, category: "Makanan", img: "img/roti.jpg", date: "2024-03-18" },
    { name: "Kentang Goreng", price: 15000, sold: 45, category: "Makanan", img: "img/kentang.jpg", date: "2024-03-14" },
    { name: "Donat", price: 10000, sold: 25, category: "Makanan", img: "img/donat.jpg", date: "2024-03-21" },
  ];

  const orderList = document.getElementById('orderList');
  const totalEl = document.getElementById('total');
  const diskonEl = document.getElementById('diskon');
  const grandTotalEl = document.getElementById('grandTotal');
  const searchInput = document.getElementById('search');
  const categoryFilter = document.getElementById('categoryFilter');
  const sortFilter = document.getElementById('sortFilter');
  const payBtn = document.getElementById('payBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const customerNameInput = document.getElementById('customerName');

  let orders = {};
  let filteredMenu = [...menuItems];

  function renderMenu() {
    menuGrid.innerHTML = '';
    filteredMenu.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <span class="category">${item.category}</span>
        <img src="${item.img}" alt="${item.name}">
        <h3>${item.name}</h3>
        <p class="price">Rp${item.price.toLocaleString()}</p>
        <p class="sold">Terjual ${item.sold}</p>
      `;
      card.addEventListener('click', () => addToOrder(item));
      menuGrid.appendChild(card);
    });
  }

  function addToOrder(item) {
    if (!orders[item.name]) {
      orders[item.name] = { ...item, qty: 1 };
    } else {
      orders[item.name].qty++;
    }
    renderOrder();
  }

  function updateQty(name, delta) {
    if (orders[name]) {
      orders[name].qty += delta;
      if (orders[name].qty <= 0) delete orders[name];
      renderOrder();
    }
  }

  function renderOrder() {
    orderList.innerHTML = '';
    let total = 0;

    Object.values(orders).forEach(order => {
      const itemTotal = order.price * order.qty;
      total += itemTotal;

      const div = document.createElement('div');
      div.className = 'order-item';
      div.innerHTML = `
        <span>${order.name}</span>
        <span class="price">Rp${itemTotal.toLocaleString()}</span>
        <div class="quantity">
          <button onclick="updateQty('${order.name}', -1)">-</button>
          <span>${order.qty}</span>
          <button onclick="updateQty('${order.name}', 1)">+</button>
        </div>
      `;
      orderList.appendChild(div);
    });

    const diskon = total > 50000 ? 2000 : 0;
    totalEl.textContent = `Rp${total.toLocaleString()}`;
    diskonEl.textContent = `Rp${diskon.toLocaleString()}`;
    grandTotalEl.textContent = `Rp${(total - diskon).toLocaleString()}`;
  }

  // 🔍 Filter menu
  function applyFilters() {
    const searchValue = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedSort = sortFilter.value;

    filteredMenu = menuItems.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchValue);
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchSearch && matchCategory;
    });

    if (selectedSort === 'new') filteredMenu.sort((a, b) => new Date(b.date) - new Date(a.date));
    else if (selectedSort === 'priceAsc') filteredMenu.sort((a, b) => a.price - b.price);
    else if (selectedSort === 'priceDesc') filteredMenu.sort((a, b) => b.price - a.price);
    else filteredMenu.sort((a, b) => b.sold - a.sold);

    renderMenu();
  }

  // Event filters
  searchInput.addEventListener('input', applyFilters);
  categoryFilter.addEventListener('change', applyFilters);
  sortFilter.addEventListener('change', applyFilters);

  // 🧍 Tombol bayar
  payBtn.addEventListener('click', () => {
    const customerName = customerNameInput.value.trim();

    if (Object.keys(orders).length === 0) {
      alert("Belum ada pesanan!");
      return;
    }

    if (!customerName) {
      alert("Masukkan nama customer terlebih dahulu!");
      return;
    }

    let total = 0;
    Object.values(orders).forEach(order => total += order.price * order.qty);
    const diskon = total > 50000 ? 2000 : 0;
    const grandTotal = total - diskon;

    alert(
      `Transaksi Berhasil!\n\n` +
      `Customer: ${customerName}\n` +
      `Total: Rp${total.toLocaleString()}\n` +
      `Diskon: Rp${diskon.toLocaleString()}\n` +
      `Grand Total: Rp${grandTotal.toLocaleString()}`
    );

    // Reset order dan input
    orders = {};
    renderOrder();
    customerNameInput.value = "";
  });

  // 🧼 Tombol batal
  cancelBtn.addEventListener('click', () => {
    orders = {};
    renderOrder();
    customerNameInput.value = "";
  });

  // Render awal
  renderMenu();
  renderOrder();
}


// Bagian TRANSACTION — hanya jalan kalau ada elemen transactionBody
const transactionBody = document.getElementById("transactionBody");
if (transactionBody) {
  // Contoh data transaksi
  const transactions = [
    { customer: "Andi", qty: 3, total: 45000, date: "2025-11-06" },
    { customer: "Budi", qty: 5, total: 72000, date: "2025-11-05" },
    { customer: "Citra", qty: 2, total: 25000, date: "2025-11-04" },
    { customer: "Dewi", qty: 4, total: 60000, date: "2025-11-10" },
    { customer: "Eka", qty: 6, total: 90000, date: "2025-11-08" },
  ];

  // 🪑 Data meja dengan status default
  const tables = [
    { name: "Table 1", status: "Kosong" },
    { name: "Table 2", status: "Disi" },
    { name: "Table 3", status: "Reservasi" },
    { name: "Table 4", status: "Kosong" }
  ];

  // 🧮 Fungsi format tanggal ke dd/mm/yyyy
  function formatDate(dateStr) {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // 🧾 Render daftar transaksi
  function renderTransactions(list) {
    transactionBody.innerHTML = "";

    if (list.length === 0) {
      transactionBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; color:gray;">No transactions found</td>
        </tr>
      `;
      return;
    }

    list.forEach((item, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.customer}</td>
        <td>${item.qty}</td>
        <td>Rp ${item.total.toLocaleString()}</td>
        <td>${formatDate(item.date)}</td>
        <td><button class="btn-invoice" onclick="showInvoice(${index})">Invoice</button></td>
      `;
      transactionBody.appendChild(row);
    });
  }

  // 🪑 Render daftar meja
  function renderTables() {
    const container = document.getElementById("tables");
    container.innerHTML = "";

    tables.forEach((table, index) => {
      const div = document.createElement("div");
      div.classList.add("table-item");

      // Tentukan warna status
      let colorClass = "";
      if (table.status === "Kosong") colorClass = "available";
      else if (table.status === "Disi") colorClass = "occupied";
      else if (table.status === "Reservasi") colorClass = "reserved";

      div.innerHTML = `
        <span>${table.name}</span>
        <select class="status-select" data-index="${index}">
          <option value="Kosong" ${table.status === "Kosong" ? "selected" : ""}>Kosong</option>
          <option value="Disi" ${table.status === "Disi" ? "selected" : ""}>Disi</option>
          <option value="Reservasi" ${table.status === "Reservasi" ? "selected" : ""}>Reservasi</option>
        </select>
        <span class="status-label ${colorClass}">${table.status}</span>
      `;

      container.appendChild(div);
    });

    // Tambahkan event listener ke setiap dropdown
    document.querySelectorAll(".status-select").forEach(select => {
      select.addEventListener("change", (e) => {
        const index = e.target.getAttribute("data-index");
        const newStatus = e.target.value;
        tables[index].status = newStatus;
        renderTables(); // render ulang untuk update tampilan
      });
    });
  }

  // 🧾 Fungsi invoice
  function showInvoice(index) {
    const trx = filteredTransactions[index];
    alert(`Customer: ${trx.customer}\nTotal: Rp ${trx.total.toLocaleString()}\nTanggal: ${formatDate(trx.date)}`);
  }

  // 🔍 Filter data transaksi
  const searchInput = document.getElementById("search");
  const filterDate = document.getElementById("filterDate");
  let filteredTransactions = [...transactions];

  function applyTransactionFilters() {
    const searchValue = searchInput.value.toLowerCase();
    const selectedDate = filterDate.value;

    filteredTransactions = transactions.filter(item => {
      const matchSearch = item.customer.toLowerCase().includes(searchValue);
      const matchDate = !selectedDate || item.date === selectedDate;
      return matchSearch && matchDate;
    });

    renderTransactions(filteredTransactions);
  }

  // ⌚ Event listener filter
  searchInput.addEventListener("input", applyTransactionFilters);
  filterDate.addEventListener("change", applyTransactionFilters);

  // 🏁 Jalankan saat halaman dimuat
  renderTransactions(filteredTransactions);
  renderTables();
}
