import { html, render, useState, useEffect } from 'https://unpkg.com/htm/preact/standalone.module.js';

const TIME_PER_IMAGE_MILLIS = 5 * 1000;

function Player() {
  const [images, setImages] = useState([]);
  const [index, setIndex] = useState(-1);
  let goNextTimeout;

  useEffect(() => {
    const db = firebase.firestore();
    db.collection('images')
      .orderBy('created', 'desc')
      .onSnapshot((snap) => {
        const documents = snap.docs.map((doc) => doc.data());
        console.log('snap', documents);
        setImages(documents);
        setIndex(0);
      });
  }, []);

  const goNext = () => {
    clearTimeout(goNextTimeout);
    // console.log('goNext', index, images);
    setIndex((index + 1) % images.length);
  };

  const scheduleNext = () => {
    const currentItem = images[index];
    // console.log('scheduleNext', images, index, currentItem);
    const time = TIME_PER_IMAGE_MILLIS;
    clearTimeout(goNextTimeout);
    goNextTimeout = setTimeout(goNext, time);
  };

  const currentItem = images[index];
  if (!currentItem) {
    return html`<h1>Loading...</h1>`;
  }

  if (!goNextTimeout) {
    scheduleNext();
  }

  return html`<div class="wrapper">
    <div class="poster">
      <img src="/img/background_horizontal.png" class="background" />
      <img src=${currentItem.url} class="currentImage" alt="" />
    </div>
  </div>`;
}

render(html`<${Player} />`, document.body);
