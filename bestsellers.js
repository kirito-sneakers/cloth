import { createProductCard } from '/productCard.js';
import { revealOnScroll } from '/scrollReveal.js';


Promise.all([
  fetch('/bestsellers.json').then(res => res.json()), // Массив ID, например [1, 2]
  fetch('/products.json').then(res => res.json())      // Все товары
])
  .then(([bestsellers, products]) => {
    const container = document.querySelector('.cards-container');

    const filteredProducts = products.filter(product => bestsellers.includes(product.id));

    filteredProducts.forEach(product => {
      const card = createProductCard(product);
      container.appendChild(card);
    });
    revealOnScroll();
  })
  .catch(error => {
    console.error('Ошибка загрузки JSON:', error);
  });
