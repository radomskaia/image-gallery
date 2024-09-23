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
const SLICED_NAME_LENGTH = 15;

const imagesBox = document.querySelector(".grid");
const searchBtn = document.querySelector(".search-btn");
const searchInput = document.querySelector(".search-input");
const errorMessage = document.querySelector(".error-message");
const popupWrapper = document.querySelector(".popup-wrapper");
const popup = document.querySelector(".popup");
const preloader = document.querySelector(".preloader");
const mediaQueryListDesktop = window.matchMedia(`(max-width: ${DESKTOP_SCREEN_WIDTH}px)`);
const mediaQueryListTabletL = window.matchMedia(`(max-width: ${TABLET_L_SCREEN_WIDTH}px)`);
const mediaQueryListTabletS = window.matchMedia(`(max-width: ${TABLET_S_SCREEN_WIDTH}px)`);
const mediaQueryListPhone = window.matchMedia(`(max-width: ${PHONE_SCREEN_WIDTH}px)`);
let pageNumber = 0;
let isLoad, imagesPerPage, colsNumber, allPhotosBigURL = {};


async function getData() {
    let searchValue = searchInput.value;
    pageNumber++;
    let fetchURL, result, data;
    if (!searchValue) {
        fetchURL = `${URL}/${TYPE_OF_IMAGE}/?&page=${pageNumber}&per_page=${imagesPerPage}&client_id=${ACCESS_KEY}`;
    } else {
        fetchURL = `${URL}/search/${TYPE_OF_IMAGE}/?&query='${searchValue}'&page=${pageNumber}&per_page=${imagesPerPage}&client_id=${ACCESS_KEY}`;
    }

    try {
        result = await fetch(fetchURL);
        if (result.status >= 400) {
            throw new Error(result.status);
        }
        data = await result.json();
    } catch (error) {
        if (pageNumber > 1 && error.toLocaleString().includes('403')) {
            errorMessage.innerHTML = 'Nothing found matching your request. <br> Try another one.'
        } else {
            errorMessage.innerHTML = `${error} <br> Something went wrong. Try again later.`;
        }
        errorMessage.classList.add('visible');
        pageNumber--;
        return
    }

    return searchInput.value ? data.results : data;
}

function createDOMElement(option) {
    let {
        tagName = 'div',
        appendParent = null,
        classList = '',
        textContent = '',
        attributes = {},

    } = option;
    const element = document.createElement(tagName);
    appendParent.append(element);
    if (classList) {
        classList = classList.split(" ");
        classList.forEach(newClass => {
                element.classList.add(newClass)
            }
        );
    }
    if (textContent) {
        element.textContent = textContent;
    }
    for (let key in attributes) {
        element.setAttribute(key, attributes[key]);
    }
    return element;
}

async function renderData() {
    const screenHeight = document.documentElement.clientHeight;
    let documentHeight = imagesBox.getBoundingClientRect().bottom;
    do {
        let imagesData = await getData();
        if (errorMessage.classList.contains('visible')) return;
        if (imagesData.length === 0) {
            errorMessage.innerHTML = 'Nothing found matching your request. <br> Try another one.'
            errorMessage.classList.add('visible');
            return
        }
        // console.log(imagesData);
        imagesData.forEach(imagesObject => {
                // for (let imagesObject of imagesData) {
                const imgWrapper = createDOMElement({
                    appendParent: imagesBox,
                    classList: "img-wrapper"
                });
                const iconsBlock = createDOMElement({
                    appendParent: imgWrapper,
                    classList: 'float-block icons-block flex flex_justify-between flex_align-center'
                });
                const likesContainer = createDOMElement({
                    appendParent: iconsBlock,
                    classList: 'likesContainer flex flex_align-center'
                });
                createDOMElement({
                    tagName: "p",
                    appendParent: likesContainer,
                    classList: 'likes-numbers',
                    textContent: imagesObject.likes
                });
                createDOMElement({
                    tagName: "img",
                    appendParent: likesContainer,
                    classList: 'icon',
                    attributes: {
                        alt: "like's icon",
                        src: "assets/img/icons/icons8-like-50.png"
                    },
                });
                const postedDate = imagesObject.promoted_at ? new Date(imagesObject.promoted_at).toLocaleDateString(navigator.language) : '';
                createDOMElement({
                    tagName: "p",
                    appendParent: iconsBlock,
                    textContent: postedDate,
                });
                const downloadBtn = createDOMElement({
                    tagName: "a",
                    appendParent: iconsBlock,
                    classList: 'link flex flex_align-center',
                    attributes: {
                        href: imagesObject.links.download,
                        target: "_blank"
                    }
                });
                createDOMElement({
                    tagName: "img",
                    appendParent: downloadBtn,
                    classList: 'icon' +
                        '',
                    attributes: {
                        src: "assets/img/icons/icons8-download-48.png",
                        alt: "download icon"
                    }
                });

                const imgItem = createDOMElement({
                    tagName: "img",
                    appendParent: imgWrapper,
                    classList: "img-item",
                    attributes: {
                        src: imagesObject.urls.small,
                        alt: imagesObject.alt_description
                    }
                });

                const authorBlock = createDOMElement({
                    appendParent: imgWrapper,
                    classList: 'float-block author-block flex flex_justify-between flex_align-center'
                });
                createDOMElement({
                    tagName: "p",
                    appendParent: authorBlock,
                    textContent: 'Posted by',
                });
                let authorName = imagesObject.user.name;
                authorName = authorName.length > SLICED_NAME_LENGTH ? authorName.slice(0, SLICED_NAME_LENGTH) + '...' : authorName;
                createDOMElement(
                    {
                        tagName: "a",
                        appendParent: authorBlock,
                        classList: 'link',
                        textContent: authorName,
                        attributes: {
                            href: `https://www.instagram.com/${imagesObject.user.social.instagram_username}`,
                            target: "_blank"
                        }
                    }
                )
                const span = Math.ceil(imagesObject.height / imagesObject.width * 11)
                imgWrapper.style.gridRow = `span ${span}`;
                allPhotosBigURL[imagesObject.id] = {
                    src: imagesObject.urls.regular,
                    alt: imagesObject.alt_description
                };
                imgItem.setAttribute("data_id", imagesObject.id);

            }
        )
        documentHeight = imagesBox.getBoundingClientRect().bottom;
    }
    while (documentHeight < screenHeight) ;

}


async function searchQuery() {
    errorMessage.classList.remove('visible');
    imagesBox.innerHTML = '';
    pageNumber = 0;
    await renderData()
}

function setGridCols() {
    const oldColsNumber = colsNumber
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
    if (oldColsNumber < colsNumber) getNewPage();
}

function setImagesPerPageNumber() {
    imagesPerPage = (Math.ceil((document.documentElement.clientHeight) / AVERAGE_IMAGE_WIDTH) * colsNumber)
    imagesPerPage = imagesPerPage > MAX_IMAGE_PER_PAGE ? MAX_IMAGE_PER_PAGE : imagesPerPage;
}

async function getNewPage() {
    const heightForRequest = (imagesBox.getBoundingClientRect().bottom - document.documentElement.clientHeight - AVERAGE_IMAGE_WIDTH);
    if (isLoad && scrollY >= imagesBox.getBoundingClientRect().bottom) preloaderShow();
    if (isLoad && scrollY < imagesBox.getBoundingClientRect().bottom) preloaderHide();

    if (!isLoad && scrollY >= heightForRequest) {
        preloaderShow()
        isLoad = true;

        await renderData()
        isLoad = false;
        preloaderHide()
    }
}

function preloaderShow() {
    preloader.classList.add('visible');
}

function preloaderHide() {
    preloader.classList.remove('visible');
}

function popupShow(e) {
    const target = e.target.closest('.img-item');
    if (target) {
        preloaderShow()
        popup.src = allPhotosBigURL[e.target.getAttribute('data_id')].src;
        popup.alt = allPhotosBigURL[e.target.getAttribute('data_id')].alt;
        popupWrapper.classList.add('visible');
        document.body.style.overflowY = 'hidden';
    }
}

function popupClose(e) {
    const target = e.target.closest('.popup-wrapper');
    if (target) {
        popup.src = ''
        popup.alt = '';
        popupWrapper.classList.remove('visible');
        document.body.style.overflowY = '';
        preloaderHide()
    }
}

setGridCols()
setImagesPerPageNumber()
await getNewPage(1)


searchBtn.addEventListener("click", searchQuery);
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchQuery()
})
mediaQueryListDesktop.addEventListener("change", setGridCols);
mediaQueryListTabletL.addEventListener('change', setGridCols)
mediaQueryListTabletS.addEventListener('change', setGridCols)
mediaQueryListPhone.addEventListener('change', setGridCols)
window.addEventListener('scroll', getNewPage);
imagesBox.addEventListener("click", popupShow);
popupWrapper.addEventListener("click", popupClose);
popup.addEventListener("load", preloaderHide);
// window.addEventListener('load', preloaderShow);
