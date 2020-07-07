console.log('ohello');

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg'];

function onClickUploadButton() {
  document.querySelector('#file').click();
}

function onChooseFile(e) {
  console.log(e);
  const file = e.target.files[0];
  const filename = file.name;
  const fileExt = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
  if (!IMAGE_EXTENSIONS.includes(fileExt)) {
    alert('Please only upload images.');
  }
  const storageRef = firebase.storage().ref(filename);
  const task = storageRef.put(file);
  task.on(
    'state_changed',
    (snapshot) => {
      const uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      document.querySelector('#progress').innerHTML = `Uploading ${uploadProgress}%`;
    },
    (error) => {
      this.setState({
        message: '#ERR(0967)# Error while uploading. Is your file too big?',
        isUploading: false,
      });
    },
    (snapshot) => {
      console.log('storageRef', storageRef);
      this._sendToDB(fileType, storageRef);
    }
  );
}

document.querySelector('.upload').addEventListener('click', onClickUploadButton);
document.querySelector('#file').addEventListener('change', onChooseFile);
