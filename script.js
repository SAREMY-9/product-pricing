/* Data + render */
    let products = JSON.parse(localStorage.getItem("products")) || [];
    let editingIndex = null;

    function renderTable() {
      const tbody = document.getElementById("productsBody");
      tbody.innerHTML = "";

      products.forEach((p, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${escapeHtml(p.name)}</td>
          <td class="numeric">${num(p.buying)}</td>
          <td class="numeric">${num(p.packaging)}</td>
          <td class="numeric">${num(p.delivery)}</td>
          <td class="numeric">${num(p.other)}</td>
          <td class="numeric">${num(p.margin, true)}</td>
          <td class="numeric">${num(p.totalCost)}</td>
          <td class="numeric">${num(p.profit)}</td>
          <td class="numeric">${num(p.sellingPrice)}</td>
          <td class="actions">
            <button class="action edit" onclick="editProduct(${index})">Edit</button>
            <button class="action delete" onclick="deleteProduct(${index})">Delete</button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      localStorage.setItem("products", JSON.stringify(products));
    }

    document.getElementById("productForm").addEventListener("submit", function(e) {
      e.preventDefault();
      const name = document.getElementById("productName").value.trim();
      const buying = parseFloat(document.getElementById("buyingCost").value) || 0;
      const packaging = parseFloat(document.getElementById("packagingCost").value) || 0;
      const delivery = parseFloat(document.getElementById("deliveryCost").value) || 0;
      const other = parseFloat(document.getElementById("otherCosts").value) || 0;
      const margin = parseFloat(document.getElementById("profitMargin").value) || 0;

      const totalCost = buying + packaging + delivery + other;
      const profit = (totalCost * margin) / 100;
      const sellingPrice = totalCost + profit;

      const product = { name, buying, packaging, delivery, other, margin, totalCost, profit, sellingPrice };

      if (editingIndex !== null) {
        products[editingIndex] = product;
        editingIndex = null;
      } else {
        products.push(product);
      }

      this.reset();
      renderTable();
      // keep focus on name for quick entry
      document.getElementById("productName").focus();
    });

    function editProduct(index) {
      const p = products[index];
      document.getElementById("productName").value = p.name;
      document.getElementById("buyingCost").value = p.buying;
      document.getElementById("packagingCost").value = p.packaging;
      document.getElementById("deliveryCost").value = p.delivery;
      document.getElementById("otherCosts").value = p.other;
      document.getElementById("profitMargin").value = p.margin;
      editingIndex = index;
      // Scroll to top of form on small screens
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function deleteProduct(index) {
      if (!confirm("Delete this product?")) return;
      products.splice(index, 1);
      renderTable();
    }

    function exportCSV() {
      if (!products.length) { alert("No products to export!"); return; }
      const headers = ["Name","Buying","Packaging","Delivery","Other","Margin %","Total Cost","Profit","Selling Price"];
      const rows = products.map(p => [p.name, p.buying, p.packaging, p.delivery, p.other, p.margin, p.totalCost, p.profit, p.sellingPrice]);
      const csv = [headers, ...rows].map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    // small helpers
    function num(v, noFixed=false) { return (noFixed ? Number(v) : Number(v).toFixed(2)); }
    function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

    // initial render
    renderTable();