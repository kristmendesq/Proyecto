const STORAGE_KEY = "surtitodo_products";

function getStoredProducts() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function mostrarSeccion(id) {
  document.querySelectorAll("main > section").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

function cerrarModalAdmin() {
  document.getElementById("adminLogin").classList.add("hidden");
}

function verificarClave() {
  mostrarSeccion("admin");
  mostrarProductosAdmin();
}

function logoutAdmin() {
  mostrarSeccion("inicio");
}

function filterProducts() {
  const selected = document.getElementById("categoriaSelect").value;
  renderProducts(selected);
}

function renderProducts(filtro = "all") {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";

  const products = getStoredProducts();

  products
    .filter(p => filtro === "all" || p.category === filtro)
    .forEach(product => {
      const div = document.createElement("div");
      div.className = "product";
      div.innerHTML = `
        <img src="${product.media[0]}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p class="price">${product.price}</p>
      `;
      div.onclick = () => openProductModal(product);
      productList.appendChild(div);
    });
}

function openProductModal(product) {
  const modal = document.getElementById('productModal');
  const carousel = document.getElementById('carouselInner');
  carousel.innerHTML = '';

  product.media.forEach(src => {
    carousel.innerHTML += src.endsWith(".mp4")
      ? `<video controls src="${src}"></video>`
      : `<img src="${src}" alt="${product.name}">`;
  });

  document.getElementById("modalDescription").innerText = product.description;

  const rec = document.getElementById("recommendedProducts");
  rec.innerHTML = '';
  (product.recommendations || []).forEach(r => {
    const div = document.createElement("div");
    div.className = "rec-card";
    div.innerHTML = `<img src="${r.image}" alt="${r.name}"><p>${r.name}</p>`;
    rec.appendChild(div);
  });

  document.getElementById("modalWhats").href =
    `https://wa.me/${product.whatsAppNumber || "50660001234"}?text=${encodeURIComponent("Estoy interesado en " + product.name)}`;

  modal.classList.remove("hidden");
  modal.classList.add("visible");
}

function closeProductModal() {
  const modal = document.getElementById("productModal");
  modal.classList.remove("visible");
  modal.classList.add("hidden");
}

function buscarProducto() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const suggestions = document.getElementById("searchSuggestions");
  suggestions.innerHTML = "";

  getStoredProducts()
    .filter(p => p.name.toLowerCase().includes(input))
    .forEach(p => {
      const li = document.createElement("li");
      li.textContent = p.name;
      li.onclick = () => {
        openProductModal(p);
        suggestions.innerHTML = "";
      };
      suggestions.appendChild(li);
    });
}

let editingIndex = null;

function mostrarProductosAdmin() {
  const list = document.getElementById("adminList");
  const products = getStoredProducts();
  list.innerHTML = "";

  products.forEach((p, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${p.name}</strong> - ${p.category} - ${p.price}
      <div>
        <button onclick="editarProducto(${index})">Editar</button>
        <button onclick="eliminarProducto(${index})">Eliminar</button>
      </div>
    `;
    list.appendChild(li);
  });
}

function editarProducto(index) {
  const products = getStoredProducts();
  const p = products[index];

  document.getElementById("productName").value = p.name;
  document.getElementById("productCategory").value = p.category;
  document.getElementById("productDescription").value = p.description;
  document.getElementById("productPrice").value = p.price.replace("₡", "");
  document.getElementById("productImageFile").value = "";

  editingIndex = index;
  alert("Modo edición activado: modifica los campos y haz clic en 'Agregar Producto' para guardar.");
}

function eliminarProducto(index) {
  const products = getStoredProducts();
  if (!confirm(`¿Eliminar "${products[index].name}"?`)) return;

  products.splice(index, 1);
  saveProducts(products);
  renderProducts();
  mostrarProductosAdmin();
}

function addProduct() {
  const name = document.getElementById("productName").value.trim();
  const category = document.getElementById("productCategory").value;
  const description = document.getElementById("productDescription").value.trim();
  const price = document.getElementById("productPrice").value.trim();
  const fileInput = document.getElementById("productImageFile");
  const files = Array.from(fileInput.files);

  if (!name || !category || !description || !price) {
    alert("Completa todos los campos obligatorios.");
    return;
  }

  const products = getStoredProducts();

  const readFiles = (fileList, callback) => {
    const results = [];
    let count = 0;

    if (fileList.length === 0) {
      callback([]);
      return;
    }

    fileList.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        results.push(e.target.result);
        count++;
        if (count === fileList.length) callback(results);
      };
      reader.readAsDataURL(file);
    });
  };

  readFiles(files, mediaData => {
    const productData = {
      name,
      category,
      description,
      price: `₡${price}`,
      media: mediaData.length > 0
        ? mediaData
        : editingIndex !== null ? getStoredProducts()[editingIndex].media : [],
      recommendations: [],
      whatsAppNumber: "50660001234"
    };

    if (editingIndex !== null) {
      products[editingIndex] = productData;
      alert("Producto editado correctamente.");
      editingIndex = null;
    } else {
      products.push(productData);
      alert("Producto agregado correctamente.");
    }

    saveProducts(products);
    limpiarFormulario();
    renderProducts();
    mostrarProductosAdmin();
  });
}

function limpiarFormulario() {
  document.getElementById("productName").value = "";
  document.getElementById("productCategory").value = "convencional";
  document.getElementById("productDescription").value = "";
  document.getElementById("productPrice").value = "";
  document.getElementById("productImageFile").value = "";
}

window.onload = () => {
  renderProducts();
  mostrarProductosAdmin();
};
