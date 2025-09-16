/* Data + render */
let products = JSON.parse(localStorage.getItem("products")) || [];
let editingIndex = null;

function calculateDaysDue(date) {
  const today = new Date();
  const dueDate = new Date(date);
  const diffTime = dueDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // ms → days
}

function getStatus(daysDue) {
  if (daysDue < 0) return "Overdue";
  if (daysDue === 0) return "Due Today";
  return "Pending";
}


function renderTable() {
  const tbody = document.getElementById("productsBody");
  tbody.innerHTML = "";

  products.forEach((p, index) => {
    // always recalc daysDue
    p.daysDue = calculateDaysDue(p.date);

    // auto-update status only if it's not already "Paid"
    if (p.status !== "Paid") {
      p.status = getStatus(p.daysDue);
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(p.customer)}</td>
      <td class="numeric">${escapeHtml(p.product)}</td>
      <td class="numeric">${num(p.amount)}</td>
      <td class="numeric">${p.daysDue}</td>
      <td class="numeric">${escapeHtml(p.status)}</td>
      <td class="numeric">${p.date}</td>
      <td class="actions">
        <button class="action edit" onclick="editProduct(${index})">Edit</button>
        <button class="action delete" onclick="deleteProduct(${index})">Delete</button>
        <button class="action pay" onclick="markPaid(${index})">Mark Paid</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  localStorage.setItem("products", JSON.stringify(products));

  renderTotals();

}

function markPaid(index) {
  products[index].status = "Paid";
  renderTable();
}


document.getElementById("productForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const customer = document.getElementById("customerName").value.trim();
  const product = document.getElementById("productName").value.trim();
  const amount = parseFloat(document.getElementById("amount").value) || 0;
  const date = document.getElementById("date").value;

  // auto-calc daysDue + status
  const daysDue = calculateDaysDue(date);
  const status = getStatus(daysDue);

  const entry = { customer, product, amount, daysDue, status, date };

  if (editingIndex !== null) {
    products[editingIndex] = entry;
    editingIndex = null;
  } else {
    products.push(entry);
  }

  this.reset();
  renderTable();
  document.getElementById("customerName").focus();
});

function editProduct(index) {
  const p = products[index];
  document.getElementById("customerName").value = p.customer;
  document.getElementById("productName").value = p.product;
  document.getElementById("amount").value = p.amount;
  document.getElementById("date").value = p.date;
  editingIndex = index;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteProduct(index) {
  if (!confirm("Delete this record?")) return;
  products.splice(index, 1);
  renderTable();
}

function exportCSV() {
  if (!products.length) { alert("No data to export!"); return; }
  const headers = ["Customer", "Product", "Amount", "Days Due", "Status", "Date"];
  const rows = products.map(p => [p.customer, p.product, p.amount, p.daysDue, p.status, p.date]);
  const csv = [headers, ...rows].map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(",")).join("\n");

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sales.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


function calculateTotals() {
  let totals = {
    paid: 0,
    pending: 0,
    overdue: 0
  };

  products.forEach(p => {
    if (p.status === "Paid") {
      totals.paid += p.amount;
    } else if (p.status === "Pending" || p.status === "Due Today") {
      totals.pending += p.amount;
    } else if (p.status === "Overdue") {
      totals.overdue += p.amount;
    }
  });

  return totals;
}

function renderTotals() {
  const totals = calculateTotals();
  const box = document.getElementById("totalsBox");
  box.innerHTML = `
    <strong>Totals:</strong><br>
    ✅ Paid: ${num(totals.paid)} <br>
    ⏳ Pending: ${num(totals.pending)} <br>
    ⚠️ Overdue: ${num(totals.overdue)}
  `;
}


// helpers
function num(v) { return Number(v).toFixed(2); }
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

// initial render
renderTable();
