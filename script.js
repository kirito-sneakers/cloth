import { createProductCard } from '/productCard.js';
import { revealOnScroll } from '/scrollReveal.js';


function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

fetch('/products.json')
  .then(res => res.json())
  .then(products => {
    const id = parseInt(getProductId(), 10);
    const product = products.find(p => p.id === id);

    if (!product) {
      document.body.innerHTML = '<h2>Product not found</h2>';
      return;
    }

    const sizesObj = product.sizes;
    const dollarPrice = Math.ceil(product.price * 0.024);
    const itemImgWrap = document.querySelector('.item-img-wrap');
    const readyDelver = document.querySelector('.ready-deliver');

    // Все таблицы размеров
    const tables = {
      tee: document.getElementById('sizes-tee'),
      shorts: document.getElementById('sizes-shorts'),
      tank: document.getElementById('sizes-tank'),
    };

    // Скрыть все таблицы
    Object.values(tables).forEach(table => {
      if (table) table.style.display = 'none';
    });

    // Показать нужную таблицу по типу
    const activeTable = tables[product.type];
    if (!activeTable) {
      console.warn(`Нет таблицы для типа ${product.type}`);
      return;
    }
    activeTable.style.display = '';

    // Очистить таблицу (оставляем заголовок)
    while (activeTable.rows.length > 1) {
      activeTable.deleteRow(1);
    }

    // Вспомогательная функция для создания ячейки с текстом + ' см'
    function createTd(value) {
      const td = document.createElement('td');
      td.textContent = value !== undefined ? value + ' см' : '-';
      return td;
    }

    // Заполнение строк в зависимости от типа
    for (const sizeKey in sizesObj) {
      const sizeData = sizesObj[sizeKey];
      const tr = document.createElement('tr');

      const th = document.createElement('th');
      th.textContent = sizeKey.toUpperCase();
      tr.appendChild(th);

      if (product.type === 'tee') {
        tr.appendChild(createTd(sizeData.length ?? sizeData.lenght));
        tr.appendChild(createTd(sizeData.chest));
        tr.appendChild(createTd(sizeData.shoulder));
      } else if (product.type === 'shorts') {
        tr.appendChild(createTd(sizeData.length ?? sizeData.lenght));
        tr.appendChild(createTd(sizeData.waist));
        tr.appendChild(createTd(sizeData.hip));
      } else if (product.type === 'tank') {
        tr.appendChild(createTd(sizeData.length ?? sizeData.lenght));
        tr.appendChild(createTd(sizeData.chest));
        tr.appendChild(createTd(sizeData.shoulder));
      }

      activeTable.appendChild(tr);
    }

    // Картинки
    itemImgWrap.innerHTML = '';
    product.images.forEach(img => {
      const imgEl = document.createElement('img');
      imgEl.src = img;
      imgEl.alt = product.name;
      itemImgWrap.appendChild(imgEl);
    });

    // Статус готовности
    readyDelver.classList.toggle('active', product.ready);

    // Название, цена, размеры
    document.title = product.name;
    document.getElementById('item-title').textContent = product.name;
    document.getElementById('item-price').textContent = `${dollarPrice} $ / ${product.price} ₴`;
    document.getElementById('item-sizes').textContent = Object.keys(sizesObj).map(s => s.toUpperCase()).join(', ');

    // === Same products ===
    const sameContainer = document.querySelector('.same-products-container .cards-container');
    sameContainer.innerHTML = '';

    if (Array.isArray(product.same) && product.same.length > 0) {
      document.querySelector('.same-products-container').classList.add('active');
      const sameProducts = products.filter(p => product.same.includes(p.id));
      sameProducts.forEach(p => sameContainer.appendChild(createProductCard(p)));
    }

    // === Like / Random products ===
    const likeContainer = document.querySelector('.like-products-container .cards-container');
    likeContainer.innerHTML = '';

    function getRandomProducts(arr, n, excludeId) {
      const filtered = arr.filter(p => p.id !== excludeId);
      const result = [];
      const taken = new Set();

      while (result.length < n && result.length < filtered.length) {
        const idx = Math.floor(Math.random() * filtered.length);
        if (!taken.has(idx)) {
          taken.add(idx);
          result.push(filtered[idx]);
        }
      }
      return result;
    }

    const randomProducts = getRandomProducts(products, 4, product.id);
    randomProducts.forEach(p => likeContainer.appendChild(createProductCard(p)));
    revealOnScroll();
  })
  .catch(() => {
    document.body.innerHTML = '<h2>Error loading product</h2>';
  });
