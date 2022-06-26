import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const axios = require('axios').default;
const form = document.querySelector("#search-form");
const input = document.querySelector("input");
const gallery = document.querySelector(".gallery");
const btnLoadMore = document.querySelector(".load-more");
const KEY = "28091582-4f46659dd3a5179a3fd2eadd3";
let findImages = "";
let numberPage = 1;
let perPage = 40;
let lightBox;

async function fetchImages(key, find) {
  try {
    const results = await axios.get(`https://pixabay.com/api/?key=${key}&q=${find}&image_type=photo&orientation=horizontal&safesearch=true&page=${numberPage}&per_page=${perPage}`)
    const response = await results.data
    return response;
  } catch (error) {
    console.log(error);
  }
}

function incrementPage() {
  numberPage += 1;
  return numberPage;
}

form.addEventListener("submit", submitForm);
btnLoadMore.addEventListener("click", loadMore);
async function loadMore() {
  incrementPage();
  const response = await fetchImages(KEY, findImages);
  try {
    renderImages(response.hits);
    lightBox.refresh();
    if (response.hits < perPage) {
      Notify.warning("We're sorry, but you've reached the end of search results.");
      smoothScroll();
    }
  } catch (error) {
    console.log(error);
  }
}

async function submitForm(e) {
  e.preventDefault();
  removeMarkup();
  if (submitForm) {
    numberPage = 1;
  }

  const inputValue = input.value;
  findImages = inputValue;

  const response = await fetchImages(KEY, findImages);
  try {
    renderImages(response.hits);
    lightBox = createLightBox();
    console.log(response);

    if (findImages === "") {
      Notify.failure("Field cannot be empty.");
    }
    if (response.hits.length === 0) {
      btnLoadMore.style.display = "none";
      Notify.failure("Sorry, there are no images matching your search query. Please try again.");
    }
    if(findImages !== "" && response.hits.length !== 0 ) {
      Notify.success(`Hooray! We found ${response.totalHits} images.`);
      btnLoadMore.style.display = "block";
    }

    if (response.totalHits <= 40) {
      btnLoadMore.style.display = "none";
    }

    if (findImages === "") {
      removeMarkup()
    }

  } catch (error) {
    console.log(error);
  }
}

function renderImages(items) {
  const htmlEl = items.map(({ largeImageURL, webformatURL, tags, likes, views, comments, downloads }) =>
    `<div class="photo-card">
        <a href = "${largeImageURL}">
  <img class="image" src="${webformatURL}" alt="${tags}" width = "300" height = "300" loading="lazy" />
  </a>
  <div class="info">
    <p class="info-item">
      <b>Likes ${likes}</b>
    </p>
    <p class="info-item">
      <b>Views ${views}</b>
    </p>
    <p class="info-item">
      <b>Comments ${comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads ${downloads}</b>
    </p>
  </div>
</div>`).join("");

  gallery.insertAdjacentHTML("beforeend", htmlEl);
}

function removeMarkup() {
  gallery.innerHTML = "";
}

gallery.addEventListener("click", handleImageClick);

function createLightBox() {
  return new SimpleLightbox('.gallery .photo-card a', { captionsData: "alt", captionDelay: 250 });
};

function handleImageClick(e) {
  e.preventDefault();
  debugger;
  lightBox.open(e.target);
}

function smoothScroll() {
  const { height: cardHeight } = document.querySelector(".gallery").firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: "smooth",
  });
}
