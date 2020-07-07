import { html, render, useState, useEffect } from 'https://unpkg.com/htm/preact/standalone.module.js';

const TIME_PER_IMAGE_MILLIS = 1 * 1000;

function Player() {
  const [images, setImages] = useState([]);
  const [index, setIndex] = useState(-1);
  let goNextTimeout;

  useEffect(() => {
    console.log('once');
    const db = firebase.firestore();
    db.collection('images')
      .orderBy('created', 'desc')
      .onSnapshot((snap) => {
        const images = snap.docs.map((doc) => doc.data());
        console.log('snap', images);
        setImages(images);
        setIndex(0);
        scheduleNext();
        // setInterval(() => goNext(), TIME_PER_IMAGE_MILLIS);
        //window.setInterval(goNext, TIME_PER_IMAGE_MILLIS);
      });
  }, []);

  const goNext = () => {
    console.log('goNext', this, index, images);
    setIndex((index + 1) % images.length);
  };

  const scheduleNext = function () {
    console.log(images, index);
    const currentItem = images[index];
    console.log('scheduleNext', currentItem);
    if (!currentItem) return;
    const time = TIME_PER_IMAGE_MILLIS;
    clearTimeout(goNextTimeout);
    goNextTimeout = setTimeout(() => goNext(), time);
  };

  const currentItem = images[index];
  if (!currentItem) {
    return html`<h1>Loading...</h1>`;
  }

  return html`<div class="wrapper">
    <div class="poster">
      <img src="/img/background.png" class="background" />
      <img src=${currentItem.url} class="currentImage" alt="" />
    </div>
  </div>`;
}

render(html`<${Player} />`, document.body);
