document.addEventListener('DOMContentLoaded', () => {
  const itemDetails = document.querySelectorAll('.item-details-title');

  itemDetails.forEach(item => {
    item.addEventListener('click', () => {
      const parent = item.parentElement;
      const isOpened = parent.classList.contains('opened');

      itemDetails.forEach(i => i.parentElement.classList.remove('opened'));

      if (!isOpened) {
        parent.classList.add('opened');
        setTimeout(() => {
          parent.querySelector('.item-details-content').scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
        }, 200);
      }
    });
  });
});
