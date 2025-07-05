import { createProductCard } from '/productCard.js';
import { revealOnScroll } from '/scrollReveal.js';

window.addEventListener('DOMContentLoaded', () => {
  let allProducts = [];
  let filteredProducts = [];

  const container = document.querySelector('.cards-container');
  const brandGroup = document.getElementById('filter-brand-group');
  const sizeGroup = document.getElementById('filter-size-group');
  const typeGroup = document.getElementById('filter-type-group');
  const colorGroup = document.getElementById('filter-color-group'); // Статичный в HTML
  const sortSelect = document.getElementById('sort-price');
  const sortSelected = sortSelect.querySelector('.selected-option');
  const sortOptions = sortSelect.querySelectorAll('.option');

  const resetBtn = document.getElementById('reset-filters');
  const applyAllBtn = document.getElementById('apply-all-btn'); // Общая кнопка применить

  const searchInput = document.getElementById('global-search-input');
  const catalogTitle = document.getElementById('catalog-title');
  const searchResultsTitle = document.getElementById('search-results-title');

  const slider = document.getElementById('doubleRangeSlider');
  const sliderRange = document.getElementById('sliderRange');
  const thumbMin = document.getElementById('thumbMin');
  const thumbMax = document.getElementById('thumbMax');
  const priceMinDisplay = document.getElementById('price-min-value');
  const priceMaxDisplay = document.getElementById('price-max-value');

  const applyPriceBtn = document.getElementById('apply-price-btn');
  const applyBrandBtn = document.getElementById('apply-brand-btn');
  const applySizeBtn = document.getElementById('apply-size-btn');
  const applyTypeBtn = document.getElementById('apply-type-btn');
  const applyColorBtn = document.getElementById('apply-color-btn');

  const noProductsMsg = document.getElementById('no-products-msg');

  let priceMinGlobal = 0;
  let priceMaxGlobal = 10000;
  let currentMin = 0;
  let currentMax = 10000;
  const minGap = 100;
  let activeThumb = null;
  let priceFilterActive = false;
  let sliderRect = null;

  const PRODUCTS_PER_BATCH = 12;
  let renderedCount = 0;
  let loading = false;
  let initialRenderDone = false;

  // Состояние фильтров
  const selectedFilters = {
    brand: [],
    size: [],
    type: [],
    color: [],
    priceMin: priceMinGlobal,
    priceMax: priceMaxGlobal,
  };

  // Состояние поиска
  let searchQuery = '';

  fetch('/products.json')
    .then(res => res.json())
    .then(products => {
      allProducts = products;
      const prices = products.map(p => p.price);
      priceMinGlobal = Math.min(...prices);
      priceMaxGlobal = Math.max(...prices);
      currentMin = priceMinGlobal;
      currentMax = priceMaxGlobal;

      selectedFilters.priceMin = priceMinGlobal;
      selectedFilters.priceMax = priceMaxGlobal;

      populateFilters(products);
      applyFiltersFromURL();
      updateSliderUI();
      window.addEventListener('scroll', onScrollLoadMore);
    })
    .catch(() => {
      document.body.innerHTML = '<h2>Ошибка загрузки товаров</h2>';
    });

  function createCheckbox(name, value) {
    const wrapper = document.createDocumentFragment(); // обёртка для label + br

    const label = document.createElement('label');
    label.className = 'custom-checkbox';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = name;
    input.value = value;

    const checkmark = document.createElement('span');
    checkmark.className = 'checkmark';

    label.appendChild(input);
    label.appendChild(checkmark);
    label.append(` ${value}`);

    wrapper.appendChild(label);
    wrapper.appendChild(document.createElement('br')); // добавляем <br>

    return wrapper;
  }


  document.querySelectorAll('.filters-wrap-button').forEach(button => {
    button.addEventListener('click', () => {
      // Получаем id из data-атрибута кнопки
      const targetId = button.getAttribute('data-filter-group-id');
      if (!targetId) return;

      // Находим элемент с этим id
      const targetElement = document.getElementById(targetId);
      if (!targetElement) return;
      targetElement.classList.add('active');

    });
  });

  document.querySelectorAll('.close-filter-group').forEach(button => {
    button.addEventListener('click', () => {
      const filterGroup = button.closest('.filter-group');
      if (filterGroup) filterGroup.classList.remove('active');

    });
  });

  // Обработчик для кнопок применить внутри фильтров
  document.querySelectorAll('.apply-filter-btn').forEach(button => {
    button.addEventListener('click', () => {
      const filterGroup = button.closest('.filter-group');
      if (filterGroup) filterGroup.classList.remove('active');
    });
  });
  function closeFilters() {
    document.querySelector('.filters').classList.remove('active');
    document.querySelector('.overlay').classList.remove('active');
    document.querySelector('header').classList.remove('filters-opened');
  }
  function openFilters() {
    document.querySelector('.filters').classList.add('active');
    document.querySelector('.overlay').classList.add('active');
    document.querySelector('header').classList.add('filters-opened');
  }
  document.querySelector('#close-filters').addEventListener('click', (e) => {
    closeFilters();
  })
  document.querySelector('.overlay').addEventListener('click', (e) => {
    closeFilters();
  })
  document.querySelector('#filters-button').addEventListener('click', (e) => {
    openFilters();
  })

  function populateFilters(products) {
    const brands = new Set();
    const sizes = new Set();
    const types = new Set();

    products.forEach(p => {
      if (p.brand) brands.add(p.brand);
      if (p.type) types.add(p.type);
      Object.keys(p.sizes).forEach(size => sizes.add(size.toUpperCase()));
    });

    brandGroup.innerHTML = '';
    [...brands].sort().forEach(brand => brandGroup.appendChild(createCheckbox('brand', brand)));

    sizeGroup.innerHTML = '';
    [...sizes].sort().forEach(size => sizeGroup.appendChild(createCheckbox('size', size)));
  }

  function getSelectedValues(group) {
    return Array.from(group.querySelectorAll('input:checked')).map(cb => cb.value);
  }

  function initSelectedFilters() {
    selectedFilters.brand = getSelectedValues(brandGroup);
    selectedFilters.size = getSelectedValues(sizeGroup);
    selectedFilters.type = getSelectedValues(typeGroup);
    selectedFilters.color = getSelectedValues(colorGroup);
    selectedFilters.priceMin = currentMin;
    selectedFilters.priceMax = currentMax;
  }

  function applyFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);
    const selectedBrands = params.getAll('brand');
    const selectedSizes = params.getAll('size');
    const selectedTypes = params.getAll('type');
    const selectedColors = params.getAll('color');
    const sort = params.get('sort') || '';
    const priceMin = params.get('priceMin');
    const priceMax = params.get('priceMax');
    const search = params.get('search') || '';

    brandGroup.querySelectorAll('input').forEach(i => (i.checked = selectedBrands.includes(i.value)));
    sizeGroup.querySelectorAll('input').forEach(i => (i.checked = selectedSizes.includes(i.value)));
    typeGroup.querySelectorAll('input').forEach(i => (i.checked = selectedTypes.includes(i.value)));
    colorGroup.querySelectorAll('input').forEach(i => (i.checked = selectedColors.includes(i.value)));

    sortSelect.value = sort;

    if (priceMin || priceMax) {
      currentMin = priceMin ? Math.max(priceMinGlobal, +priceMin) : priceMinGlobal;
      currentMax = priceMax ? Math.min(priceMaxGlobal, +priceMax) : priceMaxGlobal;
      priceFilterActive = true; // ← вот ключевой момент
    } else {
      currentMin = priceMinGlobal;
      currentMax = priceMaxGlobal;
      priceFilterActive = false;
    }

    searchQuery = search;
    searchInput.value = searchQuery;

    enforceMinGap();
    updateSliderUI();

    initSelectedFilters();

    filterAndRender(true);
    fillPageInitially();

    updateTitles();
  }


  function updateURL() {
    const params = new URLSearchParams();
    selectedFilters.brand.forEach(v => params.append('brand', v));
    selectedFilters.size.forEach(v => params.append('size', v));
    selectedFilters.type.forEach(v => params.append('type', v));
    selectedFilters.color.forEach(v => params.append('color', v));
    const sortValue = sortSelected.getAttribute('data-value');
    if (sortValue) params.set('sort', sortValue);

    // Только добавляем priceMin/Max если фильтр активен
    if (priceFilterActive) {
      params.set('priceMin', Math.round(selectedFilters.priceMin));
      params.set('priceMax', Math.round(selectedFilters.priceMax));
    }

    if (searchQuery) params.set('search', searchQuery);
    history.replaceState(null, '', `${window.location.pathname}?${params}`);
  }


  function filterAndRender(reset = false) {
    if (reset) {
      renderedCount = 0;
      container.innerHTML = '';
      initialRenderDone = false;
    }

    filteredProducts = [...allProducts];

    if (selectedFilters.brand.length)
      filteredProducts = filteredProducts.filter(p => selectedFilters.brand.includes(p.brand));

    if (selectedFilters.size.length)
      filteredProducts = filteredProducts.filter(p => Object.keys(p.sizes).some(s => selectedFilters.size.includes(s.toUpperCase())));

    if (selectedFilters.type.length)
      filteredProducts = filteredProducts.filter(p => selectedFilters.type.includes(p.type));

    if (selectedFilters.color.length)
      filteredProducts = filteredProducts.filter(p => p.color && selectedFilters.color.includes(p.color.toLowerCase()));

    if (priceFilterActive) {
      filteredProducts = filteredProducts.filter(p =>
        p.price >= selectedFilters.priceMin && p.price <= selectedFilters.priceMax
      );
    }

    if (searchQuery.trim() !== '') {
      const sqLower = searchQuery.trim().toLowerCase();
      filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(sqLower));
    }

    const sortValue = sortSelected.getAttribute('data-value');
    if (sortValue === 'asc') filteredProducts.sort((a, b) => a.price - b.price);
    if (sortValue === 'desc') filteredProducts.sort((a, b) => b.price - a.price);


    renderNextBatch();

    updateTitles();
  }
function renderNextBatch() {
  if (loading) return;
  loading = true;

  const nextBatch = filteredProducts.slice(renderedCount, renderedCount + PRODUCTS_PER_BATCH);

  if (nextBatch.length === 0) {
    if (renderedCount === 0) noProductsMsg.style.display = 'block';
    loading = false;
    return;
  }

  noProductsMsg.style.display = 'none';
  nextBatch.forEach(p => container.appendChild(createProductCard(p)));
  renderedCount += nextBatch.length;
  loading = false;

  revealOnScroll('.cards-container', '.card'); // <--- ДОБАВИЛИ ЭТО

  if (initialRenderDone && window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    renderNextBatch();
  } else {
    initialRenderDone = true;
  }
}

  function fillPageInitially() {
    let batchesLoaded = 0;
    const maxBatches = 10;
    function loadBatch() {
      renderNextBatch();
      batchesLoaded++;
      if (batchesLoaded < maxBatches && window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        setTimeout(loadBatch, 100);
      }
    }
    loadBatch();
  }

  function enforceMinGap() {
    if (currentMax - currentMin < minGap) {
      if (activeThumb === thumbMin) currentMin = currentMax - minGap;
      else if (activeThumb === thumbMax) currentMax = currentMin + minGap;
    }
  }

  function updateSliderUI() {
    const range = priceMaxGlobal - priceMinGlobal;
    const leftPercent = ((currentMin - priceMinGlobal) / range) * 100;
    const rightPercent = ((priceMaxGlobal - currentMax) / range) * 100;

    thumbMin.style.left = `${leftPercent}%`;
    thumbMax.style.left = `${100 - rightPercent}%`;
    sliderRange.style.left = `${leftPercent}%`;
    sliderRange.style.right = `${rightPercent}%`;

    priceMinDisplay.textContent = `${Math.round(currentMin)} ₴`;
    priceMaxDisplay.textContent = `${Math.round(currentMax)} ₴`;
  }

  function onPointerDown(e) {
    activeThumb = e.target;
    sliderRect = slider.getBoundingClientRect();
    activeThumb.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!activeThumb) return;
    let x = e.clientX - sliderRect.left;
    if (x < 0) x = 0;
    if (x > sliderRect.width) x = sliderRect.width;
    const percent = x / sliderRect.width;
    const value = priceMinGlobal + percent * (priceMaxGlobal - priceMinGlobal);
    if (activeThumb === thumbMin) currentMin = Math.min(value, currentMax - minGap);
    if (activeThumb === thumbMax) currentMax = Math.max(value, currentMin + minGap);
    enforceMinGap();
    updateSliderUI();
  }

  function onPointerUp(e) {
    if (!activeThumb) return;
    activeThumb.releasePointerCapture(e.pointerId);
    activeThumb = null;
  }

  thumbMin.addEventListener('pointerdown', onPointerDown);
  thumbMax.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);

  // Индивидуальные кнопки обновляют selectedFilters, но не вызывают рендер
  applyBrandBtn.addEventListener('click', () => {
    selectedFilters.brand = getSelectedValues(brandGroup);
  });
  applySizeBtn.addEventListener('click', () => {
    selectedFilters.size = getSelectedValues(sizeGroup);
  });
  applyTypeBtn.addEventListener('click', () => {
    selectedFilters.type = getSelectedValues(typeGroup);
  });
  applyColorBtn.addEventListener('click', () => {
    selectedFilters.color = getSelectedValues(colorGroup);
  });
  applyPriceBtn.addEventListener('click', () => {
    selectedFilters.priceMin = currentMin;
    selectedFilters.priceMax = currentMax;
  });

  // Общая кнопка применить — применяет все фильтры сразу
  applyAllBtn.addEventListener('click', () => {
    closeFilters();
    updateURL();
    filterAndRender(true);
    fillPageInitially();
  });

  sortOptions.forEach(option => {
  option.addEventListener('click', () => {
    const value = option.getAttribute('data-value');
    
    const textEl = sortSelected.querySelector('p');
    if (textEl) textEl.textContent = option.textContent;
    
    sortSelected.setAttribute('data-value', value);
    sortSelect.querySelector('.options-list').style.display = 'none';

    updateURL();
    filterAndRender(true);
    fillPageInitially();
  });
});


  sortSelected.addEventListener('click', () => {
    const list = sortSelect.querySelector('.options-list');
    list.style.display = list.style.display === 'block' ? 'none' : 'block';
  });

  document.addEventListener('click', (e) => {
    if (!sortSelect.contains(e.target)) {
      sortSelect.querySelector('.options-list').style.display = 'none';
    }
  });


  resetBtn.addEventListener('click', () => {
    [brandGroup, sizeGroup, typeGroup, colorGroup].forEach(group => {
      group.querySelectorAll('input').forEach(cb => (cb.checked = false));
    });
    sortSelect.value = '';
    currentMin = priceMinGlobal;
    currentMax = priceMaxGlobal;
    updateSliderUI();

    selectedFilters.brand = [];
    selectedFilters.size = [];
    selectedFilters.type = [];
    selectedFilters.color = [];
    selectedFilters.priceMin = priceMinGlobal;
    selectedFilters.priceMax = priceMaxGlobal;
    priceFilterActive = false; // <--- ВАЖНО!

    searchQuery = '';
    searchInput.value = '';

    updateURL();
    updateFilterButtonLabels();
  });

  function onScrollLoadMore() {
    if (loading) return;
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
      renderNextBatch();
    }
  }

  // Управление заголовками при поиске
  function updateTitles() {
    if (searchQuery.trim() !== '') {
      catalogTitle.style.display = 'none';
      searchResultsTitle.style.display = 'block';
      searchResultsTitle.textContent = `Результати пошуку "${searchQuery}"`;
    } else {
      catalogTitle.style.display = 'block';
      searchResultsTitle.style.display = 'none';
    }
  }

  function updateFilterButtonLabels() {
    const map = {
      type: {
        tee: 'Футболки',
        tank: 'Майки',
        shorts: 'Шорти',
      },
      brand: {}, // Заполним динамически
      size: {},  // Просто как есть
      color: {
        white: 'Білий',
        black: 'Чорний',
        yellow: 'Жовтий',
      },
    };

    // Динамически добавить бренды и размеры
    document.querySelectorAll('#filter-brand-group input').forEach(input => {
      map.brand[input.value] = input.value;
    });
    document.querySelectorAll('#filter-size-group input').forEach(input => {
      map.size[input.value.toUpperCase()] = input.value.toUpperCase();
    });

    const buttonMap = {
      type: 'filter-group-category',
      brand: 'filter-group-brand',
      size: 'filter-group-size',
      color: 'filter-group-color',
      price: 'filter-group-price',
    };

    Object.entries(buttonMap).forEach(([filterKey, groupId]) => {
      const btn = document.querySelector(`.filters-wrap-button[data-filter-group-id="${groupId}"]`);
      if (!btn) return;

      const span = btn.querySelector('.filters-wrap-button-choice');
      let values = selectedFilters[filterKey];

      if (!Array.isArray(values)) {
        if (filterKey === 'price') {
          if (priceFilterActive) {
            values = [`${Math.round(selectedFilters.priceMin)} - ${Math.round(selectedFilters.priceMax)} ₴`];
          } else {
            values = []; // не показываем ничего, если фильтр цены не активен
          }
        } else {
          values = [];
        }
      }


      const mapped = values.map(v => map[filterKey]?.[v] || v);
      span.textContent = mapped.length ? mapped.join(', ') : '';
    });

    const filtersAmountEl = document.getElementById('filters-button-amount');

    let activeCount = 0;
    if (selectedFilters.brand.length) activeCount++;
    if (selectedFilters.size.length) activeCount++;
    if (selectedFilters.type.length) activeCount++;
    if (selectedFilters.color.length) activeCount++;
    if (priceFilterActive) activeCount++;

    if (activeCount > 0) {
      filtersAmountEl.classList.add('active');
      filtersAmountEl.querySelector('span').textContent = activeCount;
    } else {
      filtersAmountEl.classList.remove('active');
      filtersAmountEl.querySelector('span').textContent = '';
    }

  }
  applyBrandBtn.addEventListener('click', () => {
    selectedFilters.brand = getSelectedValues(brandGroup);
    updateFilterButtonLabels();
  });
  applySizeBtn.addEventListener('click', () => {
    selectedFilters.size = getSelectedValues(sizeGroup);
    updateFilterButtonLabels();
  });
  applyTypeBtn.addEventListener('click', () => {
    selectedFilters.type = getSelectedValues(typeGroup);
    updateFilterButtonLabels();
  });
  applyColorBtn.addEventListener('click', () => {
    selectedFilters.color = getSelectedValues(colorGroup);
    updateFilterButtonLabels();
  });
  applyPriceBtn.addEventListener('click', () => {
    selectedFilters.priceMin = currentMin;
    selectedFilters.priceMax = currentMax;
    priceFilterActive = true;
    updateFilterButtonLabels();
  });

  const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      obs.unobserve(entry.target); // Отключаем, чтобы не триггерилось повторно
    }
  });
}, {
  threshold: 0.1 // Можно регулировать, когда считать карточку "видимой"
});
revealOnScroll('.cards-container', '.card');


});
