document.addEventListener('DOMContentLoaded', () => {
    const header = document.createElement('header');
    header.innerHTML = `
        <div class="content">
            <nav class="noto-sans-header">
                <a href="" class="underline-animated">Про нас</a>
                <a href="" class="underline-animated">Написати нам</a>
                <div class="dropdown">
                    <span class="dropdown-title">Бренди</span>
                    <div class="dropdown-menu">
                        <a href="/balenciaga" class="underline-animated dd noto-sans-dd">Balenciaga</a>
                        <a href="/vetements" class="underline-animated dd noto-sans-dd">Vetements</a>
                    </div>
                </div>
                <div class="dropdown">
                    <span class="dropdown-title">Бренди</span>
                    <div class="dropdown-menu">
                        <a href="/balenciaga" class="underline-animated dd noto-sans-dd">Футболки</a>
                        <a href="/vetements" class="underline-animated dd noto-sans-dd">Шорти</a>
                    </div>
                </div>
                <a href="https://kirito-sneakers.com" class="underline-animated">Кросівки</a>
            </nav>
            <a href="/" class="logo">
                <img src="/img/logotype.svg" alt="Kirito Cloth logotype">
            </a>
            <div class="header-buttons">
                <button class="labelforsearch">
                    <svg class="searchIcon" viewBox="0 0 512 512"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"></path></svg>
                </button>
                <div class="dropdown noto-sans-header">
                    <span class="dropdown-title montserrat-light">
                        UA
                        <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24">
                            <path d="M12 17.414 3.293 8.707l1.414-1.414L12 14.586l7.293-7.293 1.414 1.414L12 17.414z"/>
                        </svg>
                    </span>
                    <div class="dropdown-menu lang">
                        <a data-lang='ru' class="montserrat-light underline-animated dd">RU</a>
                        <a data-lang='en' class="montserrat-light underline-animated dd">EN</a>
                    </div>
                </div>
                <a href="/saved.html" class="saved-icon">
                <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="#000000">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier"> 
                        <path d="M0 0h48v48H0z" fill="none"></path> 
                        <g id="Shopicon"> 
                            <path d="M14,4c-2.2,0-4,1.8-4,4v36l14-8l14,8V8c0-2.2-1.8-4-4-4H14z"></path> 
                        </g> 
                    </g>
                </svg>
            </a>
            </div>
        </div>
        <div class="search-wrapper">
            <form id="global-search-form">
                <input type="text" id="global-search-input" placeholder="Пошук по товарам і брендам">
                <button type="submit" id="global-search-btn" class="main-btn animated">Знайти</button>
            </form>
        </div>

    `;

    const overlayElem = document.createElement('div');
    overlayElem.classList.add('overlay');
    document.body.prepend(overlayElem);



    document.body.prepend(header)

    const form = document.getElementById('global-search-form');
    const input = document.getElementById('global-search-input');
    const labelBtn = document.querySelector('.labelforsearch')
    const overlay = document.querySelector('.overlay');

    function openSearch() {
        document.querySelector('header').classList.add('search');
        overlay.classList.add('active')
    }

    function closeSearch() {
        document.querySelector('header').classList.remove('search');
        overlay.classList.remove('active')
    }

    labelBtn.addEventListener('click', () => {
        openSearch();
    })

    overlay.addEventListener('click', () => {
        closeSearch();
    });
    if (!form || !input) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = input.value.trim();

        if (!query) {
            const currentUrl = window.location.pathname;
            const params = new URLSearchParams(window.location.search);

            params.delete('search');

            if (currentUrl.includes('/catalog')) {
                window.location.href = `${currentUrl}?${params.toString()}`;
            } else {
                window.location.href = `/catalog`;
            }
            return;
        }


        const currentUrl = window.location.pathname;
        const params = new URLSearchParams(window.location.search);

        params.set('search', query);

        if (currentUrl.includes('/catalog')) {
            // Уже на странице каталога — просто обновим URL с сохранением других фильтров
            window.location.href = `${currentUrl}?${params.toString()}`;
        } else {
            // На другой странице — переход на каталог
            window.location.href = `/catalog/?search=${encodeURIComponent(query)}`;
        }
    });

})