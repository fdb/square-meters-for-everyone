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
  }, 2000);
}

function onChooseFile(e) {
  const file = e.target.files[0];
  const filename = file.name;
  const fileExt = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
  if (!IMAGE_EXTENSIONS.includes(fileExt)) {
    alert('Please only upload images.');
    return;
  }
  const storageRef = storage.ref(filename);
  const task = storageRef.put(file);
  task.on(
    'state_changed',
    (snapshot) => {
      const uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      document.querySelector('#progress').innerHTML = `Uploading ${uploadProgress}%`;
    },
    (error) => {
      showMessage('Error while uploading. Is your file too big?');
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
      document.location.href = '/player';
    })
    .catch((error) => {
      showMessage('Error creating database entry.');
    });
}

document.querySelector('.upload').addEventListener('click', onClickUploadButton);
document.querySelector('#file').addEventListener('change', onChooseFile);
