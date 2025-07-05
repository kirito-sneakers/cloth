// productCard.js
export function createProductCard(product) {
  const dollarPrice = Math.ceil(product.price * 0.024);
  const sizesStr = Object.keys(product.sizes).map(s => s.toUpperCase()).join(', ');

  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `
    <a href="/product/?id=${product.id}" class="product-img">
      <img src="${product.images[0] || ''}" alt="${product.name}">
      ${product.images[1] ? `<img src="${product.images[1]}" alt="${product.name}">` : ''}
    </a>
    <div class="product-info">
      <a href="/product/?id=${product.id}" class="product-title outfit-card-title">${product.name}</a>
      <span class="product-sizes outfit-card-sizes">${sizesStr}</span>
      <p class="product-price outfit-card-price">${dollarPrice} $ / ${product.price} ₴</p>
    </div>
  `;
  return card;
}
