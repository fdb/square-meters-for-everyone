console.log('ohello');

const db = firebase.firestore();
const storage = firebase.storage();

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg'];

function onClickUploadButton() {
  document.querySelector('#file').click();
}

function showMessage(msg) {
  document.querySelector('#progress').innerHTML = '';
  document.querySelector('#message').textContent = msg;
  window.setTimeout(() => {
    document.querySelector('#message').textContent = '';
  }, 5000);
}

// Encode images using https://github.com/eugeneware/jpeg-js
function getImageDataFromImage2(img) {
  debugger;
  const inWidth = img.naturalWidth;
  const inHeight = img.naturalHeight;
  const outWidth = 1080;
  const outHeight = 1920;
  const factor = Math.min(outWidth / inWidth, outHeight / inHeight);
  let newWidth = inWidth * factor;
  let newHeight = inHeight * factor;
  let ar = 1;
  if (newWidth < outWidth) ar = outWidth / newWidth;
  if (Math.abs(ar - 1) < 1e-14 && newHeight < outHeight) ar = outHeight / newHeight;
  newWidth *= ar;
  newHeight *= ar;

  // Calculate source rectangle
  let cw = inWidth / (newWidth / outWidth);
  let ch = inHeight / (newHeight / outHeight);
  let cx = (inWidth - cw) * 0.5;
  let cy = (inHeight - ch) * 0.5;

  const canvas = document.createElement('canvas');
  canvas.width = outWidth;
  canvas.height = outHeight;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(img, cx, cy, cw, ch, 0, 0, outWidth, outHeight);
  return ctx.getImageData(0, 0, outWidth, outHeight);
}

function resizeImage(img) {
  const quality = 85;
  const imageData = getImageDataFromImage2(img);
  const jpegData = encode(imageData, quality);
  return jpegData.data;
}

async function loadImage(file) {
  return new Promise((resolve) => {
    const imgUrl = URL.createObjectURL(file);
    const img = document.createElement('img');
    img.addEventListener('load', () => {
      const buffer = resizeImage(img);
      resolve(buffer);
    });
    img.src = imgUrl;
  });
}

async function onChooseFile(e) {
  const file = e.target.files[0];
  const filename = file.name;
  const fileExt = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
  if (!IMAGE_EXTENSIONS.includes(fileExt)) {
    alert('Please only upload images.');
    return;
  }
  const buffer = await loadImage(file);
  const storageRef = storage.ref(filename);
  const task = storageRef.put(buffer);
  task.on(
    'state_changed',
    (snapshot) => {
      const uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      document.querySelector('#progress').innerHTML = `Uploading ${uploadProgress.toFixed(0)}%`;
    },
    (error) => {
      showMessage(`Error while uploading. Is your file too big? (${error.code})`);
    },
    async (snapshot) => {
      console.log('storageRef', storageRef);
      const imageUrl = await storageRef.getDownloadURL();
      console.log('imageUrl', imageUrl);
      createImage(imageUrl);
    }
  );
}

async function createImage(url) {
  const obj = {
    url,
    created: firebase.firestore.Timestamp.fromDate(new Date()),
  };
  db.collection('images')
    .add(obj)
    .then((docRef) => {
      console.log('docRef', docRef);
      showMessage('Upload complete');
    })
    .catch((error) => {
      showMessage('Error creating database entry.');
    });
}

document.querySelector('.upload').addEventListener('click', onClickUploadButton);
document.querySelector('#file').addEventListener('change', onChooseFile);
