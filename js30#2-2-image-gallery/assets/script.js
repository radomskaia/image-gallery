const URL = "https://api.unsplash.com";
const ACCESS_KEY = 'wSEvY-mEibQueTI6OUJSEt3kWPxmWbTC8wFcO2Nt1UM';
const TYPE_OF_IMAGE = "photos";
const TABLET_SCREEN_WIDTH = 704;
const PHONE_SCREEN_WIDTH = 480;

const imagesBox = document.querySelector(".grid");
const searchBtn = document.querySelector(".search-btn");
const searchInput = document.querySelector(".search-input");
let pageNumber = 1;

async function getImagesData(searchValue = '') {
    let fetchURL;
    let result;
    if (!searchValue) {
        console.log('not search')
        fetchURL = `${URL}/${TYPE_OF_IMAGE}/?&page=1&per_page=30&client_id=${ACCESS_KEY}`;
    } else {
        console.log('search')
        fetchURL = `${URL}/search/${TYPE_OF_IMAGE}/?&query='${searchValue}'&page=1&per_page=30&client_id=${ACCESS_KEY}`;
    }

    result = await fetch(fetchURL);
    const imagesData = await result.json();
    createImg(searchValue ? imagesData.results : imagesData)
    pageNumber++
}

function createImg(imagesData) {
    imagesData.forEach(imagesObject => {
        const imgWrapper = document.createElement("div");
        imgWrapper.classList.add("img-wrapper");
        imagesBox.appendChild(imgWrapper);
        const imgItem = document.createElement("img");
        imgItem.src = imagesObject.urls.small;
        imgItem.alt = imagesObject.alt_description;
        const span = Math.ceil(imagesObject.height / imagesObject.width * 10)
        imgItem.classList.add("img-item")
        imgWrapper.classList.add(`span_${span}`);
        imgItem.setAttribute("data_id", imagesObject.id);
        imgWrapper.appendChild(imgItem);

    })
}

searchBtn.addEventListener("click", searchQuery);
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchQuery()
})

function searchQuery() {
    imagesBox.innerHTML = ''
    getImagesData(searchInput.value)
    console.log(searchInput.value)
    searchBtn.src = "assets/img/icons/icons8-close-50.png";
    searchBtn.removeEventListener("click", searchQuery);
    searchBtn.addEventListener("click", cleanQuery);
}

function cleanQuery() {
    searchInput.value = '';
    searchBtn.src = "assets/img/icons/icons8-search-48.png";
    searchBtn.removeEventListener("click", cleanQuery);
    searchBtn.addEventListener("click", searchQuery);
}

getImagesData();

const mediaQueryListTablet = window.matchMedia(`(max-width: ${TABLET_SCREEN_WIDTH}px)`);
const mediaQueryListPhone = window.matchMedia(`(max-width: ${PHONE_SCREEN_WIDTH}px)`);

switch (true) {
    case mediaQueryListPhone.matches :
        imagesBox.style.gridTemplateColumns = "auto";
        break;
    case mediaQueryListTablet.matches :
        imagesBox.style.gridTemplateColumns = "auto auto";
        break;
    default:
        imagesBox.style.gridTemplateColumns = "auto auto auto";
}

function changesForTabletWidth() {
    if (mediaQueryListTablet.matches) {
        imagesBox.style.gridTemplateColumns = "auto auto";
    } else {
        imagesBox.style.gridTemplateColumns = "auto auto auto";
    }
}

function changesForPhoneWidth() {
    imagesBox.style.gridTemplateColumns = mediaQueryListPhone.matches ? "auto" : "auto auto";
}

mediaQueryListTablet.addEventListener('change', changesForTabletWidth)
mediaQueryListPhone.addEventListener('change', changesForPhoneWidth)
