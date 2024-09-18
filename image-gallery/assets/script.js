'use strict';

const URL = "https://api.unsplash.com";
const ACCESS_KEY = 'wSEvY-mEibQueTI6OUJSEt3kWPxmWbTC8wFcO2Nt1UM';
const TYPE_OF_IMAGE = "photos";
const DESKTOP_SCREEN_WIDTH = 1216;
const TABLET_L_SCREEN_WIDTH = 928;
const TABLET_S_SCREEN_WIDTH = 704;
const PHONE_SCREEN_WIDTH = 480;
const AVERAGE_IMAGE_WIDTH = 250;
const MAX_IMAGE_PER_PAGE = 30;

const imagesBox = document.querySelector(".grid");
const searchBtn = document.querySelector(".search-btn");
const searchInput = document.querySelector(".search-input");
const mediaQueryListDesktop = window.matchMedia(`(max-width: ${DESKTOP_SCREEN_WIDTH}px)`);
const mediaQueryListTabletL = window.matchMedia(`(max-width: ${TABLET_L_SCREEN_WIDTH}px)`);
const mediaQueryListTabletS = window.matchMedia(`(max-width: ${TABLET_S_SCREEN_WIDTH}px)`);
const mediaQueryListPhone = window.matchMedia(`(max-width: ${PHONE_SCREEN_WIDTH}px)`);

let pageNumber = 0;
let isLoad, isSearch, imagesPerPage, colsNumber;


async function getData() {
    let searchValue = searchInput.value;
    pageNumber++;
    let fetchURL, result, imagesData;
    if (!searchValue) {
        fetchURL = `${URL}/${TYPE_OF_IMAGE}/?&page=${pageNumber}&per_page=${imagesPerPage}&client_id=${ACCESS_KEY}`;
    } else {
        fetchURL = `${URL}/search/${TYPE_OF_IMAGE}/?&query='${searchValue}'&page=${pageNumber}&per_page=${imagesPerPage}&client_id=${ACCESS_KEY}`;
    }

    try {
        result = await fetch(fetchURL);
        imagesData = await result.json();
    } catch (error) {
        console.log(error);
    }

    return imagesData;
}

async function renderData() {
    const screenHeight = document.documentElement.clientHeight;
    let documentHeight = imagesBox.getBoundingClientRect().bottom;
    do {
        const imagesData = await getData();
        (searchInput.value ? imagesData.results : imagesData).forEach(imagesObject => {
            const imgWrapper = document.createElement("div");
            imgWrapper.classList.add("img-wrapper");
            imagesBox.appendChild(imgWrapper);
            const imgItem = document.createElement("img");
            imgItem.src = imagesObject.urls.small;
            imgItem.alt = imagesObject.alt_description;
            const span = Math.ceil(imagesObject.height / imagesObject.width * 11)
            imgItem.classList.add("img-item")
            imgWrapper.style.gridRow = `span ${span}`;
            imgItem.setAttribute("data_id", imagesObject.id);
            imgWrapper.appendChild(imgItem);
        })
        documentHeight = imagesBox.getBoundingClientRect().bottom;
    } while (documentHeight < screenHeight);
}


async function searchQuery() {
    if (isSearch) {
        searchInput.value = '';
        searchBtn.src = "assets/img/icons/icons8-search-48.png";
        isSearch = false;
    } else {
        imagesBox.innerHTML = '';
        pageNumber = 0;
        await renderData()
        searchBtn.src = "assets/img/icons/icons8-close-50.png";
        isSearch = true;
    }
}

function setGridCols() {
    switch (true) {
        case mediaQueryListPhone.matches:
            colsNumber = 1;
            break;
        case mediaQueryListTabletS.matches:
            colsNumber = 2;
            break;
        case mediaQueryListTabletL.matches:
            colsNumber = 3;
            break;
        case mediaQueryListDesktop.matches:
            colsNumber = 4;
            break;
        default:
            colsNumber = 5;
    }
    imagesBox.style.gridTemplateColumns = `repeat(${colsNumber}, auto)`;
}

function setImagesPerPageNumber() {
    imagesPerPage = (Math.ceil((document.documentElement.clientHeight - 140) / AVERAGE_IMAGE_WIDTH) * colsNumber)
    imagesPerPage = imagesPerPage > MAX_IMAGE_PER_PAGE ? MAX_IMAGE_PER_PAGE : imagesPerPage;
}

async function getNewPage() {
    console.log('start');
    const heightForRequest = (imagesBox.getBoundingClientRect().bottom - document.documentElement.clientHeight - AVERAGE_IMAGE_WIDTH);
    console.log('heightForRequest', heightForRequest);
    console.log('scrollY', scrollY);
    if (!isLoad && scrollY >= heightForRequest) {
        console.log('render');
        isLoad = true

        await renderData()
        pageNumber++;
        isLoad = false;
    }
}


setGridCols()
setImagesPerPageNumber()
await renderData()


searchBtn.addEventListener("click", searchQuery);
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchQuery()
})
mediaQueryListDesktop.addEventListener("change", setGridCols);
mediaQueryListTabletL.addEventListener('change', setGridCols)
mediaQueryListTabletS.addEventListener('change', setGridCols)
mediaQueryListPhone.addEventListener('change', setGridCols)
window.addEventListener('scroll', getNewPage);
