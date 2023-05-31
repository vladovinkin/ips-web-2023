const reader = new FileReader();
const object = {};

const titlePlaceholder = 'New post';
const descrPlaceholder = 'Please, enter any description';
const authorNamePlaceholder = 'Enter author name';

window.addEventListener('load', () => {
    const titleField = document.querySelector('#titleField');
    const descrField = document.querySelector('#descrField');
    const nameField = document.querySelector('#nameField');
    const dateField = document.querySelector('#dateField');

    const avatarInput = document.querySelector('#photoField');
    const btnRemovePhoto = document.querySelector('#btnRemovePhoto');
    const imageHDInput = document.querySelector('#imageHDInput');
    const btnRemoveImageHD = document.querySelector('#btnRemoveImageHD');
    const imageSDInput = document.querySelector('#imageSDInput');
    const btnRemoveImageSD = document.querySelector('#btnRemoveImageSD');
    const submitBtn = document.querySelector('#submit');

    titleField.addEventListener('input', titleChangeHandler);
    descrField.addEventListener('input', descrChangeHandler);
    nameField.addEventListener('input', nameChangeHandler);
    dateField.addEventListener('change', dateChangeHandler);

    avatarInput.addEventListener('change', updateAvatarDisplay);
    btnRemovePhoto.addEventListener('click', removeAvatar);

    imageHDInput.addEventListener('change', updateImageHDDisplay);
    btnRemoveImageHD.addEventListener('click', removeImageHD);

    imageSDInput.addEventListener('change', updateImageSDDisplay);
    btnRemoveImageSD.addEventListener('click', removeImageSD);

    submitBtn.addEventListener('click', submitHandler);

    reader.addEventListener('load', 
        () => {
            // convert image file to base64 string
            reader.object_preview.forEach(el => {
                el.setAttribute('style', 'background: url(' + reader.result + '); background-size: cover;'); 
            });
            object[reader.object_field_name] = reader.result;
        },
        false
    );

    dateField.setAttribute('value', getDateNow());
    dateChangeHandler();
    
})

function titleChangeHandler() {
    const titleField = document.querySelector('#titleField');
    const articleTitlePreview = document.querySelector('#articleTitlePreview');
    const postTitlePreview = document.querySelector('#postTitlePreview');
    const titlePreviewLimit = 25;

    if(titleField.value) {
        articleTitlePreview.textContent = textLengthLimit(titleField.value, titlePreviewLimit);
        postTitlePreview.textContent = textLengthLimit(titleField.value, titlePreviewLimit);
    } else {
        articleTitlePreview.textContent = titlePlaceholder;
        postTitlePreview.textContent = titlePlaceholder;
    }
}

function descrChangeHandler() {
    const descrField = document.querySelector('#descrField');
    const articleDescrPreview = document.querySelector('#articleDescrPreview');
    const postDescrPreview = document.querySelector('#postDescrPreview');
    const descrPreviewLimit = 35;

    if(descrField.value) {
        articleDescrPreview.textContent = textLengthLimit(descrField.value, descrPreviewLimit);
        postDescrPreview.textContent = textLengthLimit(descrField.value, descrPreviewLimit);
    } else {
        articleDescrPreview.textContent = descrPlaceholder;
        postDescrPreview.textContent = descrPlaceholder;
    }
}

function nameChangeHandler() {
    const nameField = document.querySelector('#nameField');
    const authorNamePreview = document.querySelector('#authorNamePreview');
    const authorNamePreviewLimit = 20;

    authorNamePreview.textContent = nameField.value
        ? textLengthLimit(nameField.value, authorNamePreviewLimit)
        : authorNamePlaceholder;
}

function dateChangeHandler() {
    const dateField = document.querySelector('#dateField');
    const postDatePreview = document.querySelector('#postDatePreview');

    postDatePreview.textContent = dateField.value.split('-').reverse().join('/');
}

function textLengthLimit(text, limit) {
    const trimmed = text.trim();
    return trimmed.length > limit 
        ? trimmed.substring(0, limit-1).trim() + '...' 
        : trimmed;
}

function getDateNow() {
    const now = new Date();
    return now.getFullYear() + '-' 
        + (now.getMonth() < 9 ? '0' : '') 
        + (now.getMonth() + 1) + '-' 
        + (now.getDate() < 10 ? '0' : '') 
        + now.getDate();
}

function updateAvatarDisplay() {
    const avatarInput = document.querySelector('#photoField');
    const avatarPreview = document.querySelector('.column-inputs__photo-preview');
    const btnUploadPhoto = document.querySelector('#btnUploadPhoto');
    const btnUploadPhotoNew = document.querySelector('#btnUploadPhotoNew');
    const btnRemovePhoto = document.querySelector('#btnRemovePhoto');
    const authorPhotoPreview = document.querySelector('#authorPhotoPreview');

    const curFiles = avatarInput.files;
    if (!curFiles.length) {
        avatarPreview.removeAttribute('style');
        btnUploadPhoto.classList.remove('hide');
        btnUploadPhotoNew.classList.add('hide');
        btnRemovePhoto.classList.add('hide');
    } else {
        const uploadedFile = curFiles[0];

        object.author_photo_name = uploadedFile.name;
        reader.object_preview = [avatarPreview, authorPhotoPreview];
        reader.object_field_name = 'author_photo';
        reader.readAsDataURL(uploadedFile);
        
        btnUploadPhoto.classList.add('hide');
        btnUploadPhotoNew.classList.remove('hide');
        btnRemovePhoto.classList.remove('hide');
    }
}

function removeAvatar() {
    const avatarInput = document.querySelector('#photoField');

    delete(object.author_photo_name);
    delete(object.author_photo);
    avatarInput.value = '';
    updateAvatarDisplay();
}

function updateImageHDDisplay() {
    const imageHDPreview = document.querySelector('#imageHDPreview');
    const imageHDInput = document.querySelector('#imageHDInput');
    const btnUploadImageHD = document.querySelector('#btnUploadImageHD');
    const btnUploadImageHDNew = document.querySelector('#btnUploadImageHDNew');
    const btnRemoveImageHD = document.querySelector('#btnRemoveImageHD');
    const imageHDFormats = document.querySelector('#imageHDFormats');
    const articleImagePreview = document.querySelector('#articleImagePreview');

    const curFiles = imageHDInput.files;
    if (!curFiles.length) {
        imageHDPreview.removeAttribute('style');
        articleImagePreview.removeAttribute('style');
        btnUploadImageHD.classList.remove('hide');
        btnUploadImageHDNew.classList.add('unvisible');
        btnRemoveImageHD.classList.add('unvisible');
        imageHDFormats.classList.remove('hide');
    } else {
        const uploadedFile = curFiles[0];

        object.image_hd_name = uploadedFile.name;
        reader.object_field_name = 'image_hd';
        reader.object_preview = [imageHDPreview, articleImagePreview];
        reader.readAsDataURL(uploadedFile);

        btnUploadImageHD.classList.add('hide');
        btnUploadImageHDNew.classList.remove('unvisible');
        btnRemoveImageHD.classList.remove('unvisible');
        imageHDFormats.classList.add('hide');
    }
}

function removeImageHD() {
    const imageHDInput = document.querySelector('#imageHDInput');

    delete(object.image_hd_name);
    delete(object.image_hd);
    imageHDInput.value = '';

    updateImageHDDisplay();
}

function updateImageSDDisplay() {
    const imageSDPreview = document.querySelector('#imageSDPreview');
    const imageSDInput = document.querySelector('#imageSDInput');
    const btnUploadImageSD = document.querySelector('#btnUploadImageSD');
    const btnUploadImageSDNew = document.querySelector('#btnUploadImageSDNew');
    const btnRemoveImageSD = document.querySelector('#btnRemoveImageSD');
    const imageSDFormats = document.querySelector('#imageSDFormats');
    const postImagePreview = document.querySelector('#postImagePreview');

    const curFiles = imageSDInput.files;
    if (!curFiles.length) {
        imageSDPreview.removeAttribute('style');
        postImagePreview.removeAttribute('style');
        btnUploadImageSD.classList.remove('hide');
        btnUploadImageSDNew.classList.add('unvisible');
        btnRemoveImageSD.classList.add('unvisible');
        imageSDFormats.classList.remove('hide');
    } else {
        const uploadedFile = curFiles[0];

        object.image_sd_name = uploadedFile.name;
        reader.object_field_name = 'image_sd';
        reader.object_preview = [imageSDPreview, postImagePreview];
        reader.readAsDataURL(uploadedFile);

        btnUploadImageSD.classList.add('hide');
        btnUploadImageSDNew.classList.remove('unvisible');
        btnRemoveImageSD.classList.remove('unvisible');
        imageSDFormats.classList.add('hide');
    }
}

function removeImageSD() {
    const imageSDInput = document.querySelector('#imageSDInput');

    delete(object.image_sd_name);
    delete(object.image_sd);
    imageSDInput.value = '';
    updateImageSDDisplay();
}

function submitHandler(event) {
    event.preventDefault();

    const titleField = document.querySelector('#titleField');
    const descrField = document.querySelector('#descrField');
    const nameField = document.querySelector('#nameField');
    const dateField = document.querySelector('#dateField');
    const contentText = document.querySelector('#contentText');

    object.title = titleField.value;
    object.description = descrField.value;
    object.author_name = nameField.value;
    object.publish_date = dateField.value;
    object.content = contentText.value;
  
    const json = JSON.stringify(object);
    console.log(json);
}
