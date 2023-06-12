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
                el.setAttribute('style', 'background: url(' + reader.result + ') center; background-size: cover;'); 
            });
            object[reader.object_field_name] = reader.result;
        },
        false
    );

    dateField.setAttribute('value', getDateNow());
    dateChangeHandler();
    bindBlurValidator();  
})

function bindBlurValidator() {
    const fields = ['titleField', 'descrField', 'nameField', 'photoField', 
                    'dateField', 'imageHDInput', 'imageSDInput', 'contentText'];

    fields.forEach((id) => {
        const field = document.getElementById(id);
        field.addEventListener('blur', (event) => {
            checkEmptyField(event.currentTarget.id)
        })
    })
}

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

function updateAvatarDisplay(checkError = true) {
    const avatarInput = document.querySelector('#photoField');
    const avatarPreview = document.querySelector('.column-inputs__photo-preview');
    const btnUploadPhoto = document.querySelector('#btnUploadPhoto');
    const btnUploadPhotoNew = document.querySelector('#btnUploadPhotoNew');
    const btnRemovePhoto = document.querySelector('#btnRemovePhoto');
    const authorPhotoPreview = document.querySelector('#authorPhotoPreview');

    const curFiles = avatarInput.files;
    if (!curFiles.length) {
        authorPhotoPreview.removeAttribute('style');
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
    if (checkError) {
        checkEmptyField('photoField');
    }
}

function removeAvatar() {
    const avatarInput = document.querySelector('#photoField');

    delete(object.author_photo_name);
    delete(object.author_photo);
    avatarInput.value = '';
    updateAvatarDisplay();
}

function updateImageHDDisplay(checkError = true) {
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
    if (checkError) {
        checkEmptyField('imageHDInput');
    }
}

function removeImageHD() {
    const imageHDInput = document.querySelector('#imageHDInput');

    delete(object.image_hd_name);
    delete(object.image_hd);
    imageHDInput.value = '';

    updateImageHDDisplay();
}

function updateImageSDDisplay(checkError = true) {
    const imageSDPreview = document.querySelector('#imageSDPreview');
    const imageSDInput = document.querySelector('#imageSDInput');
    const postImagePreview = document.querySelector('#postImagePreview');

    const curFiles = imageSDInput.files;
    if (!curFiles.length) {
        imageSDPreview.removeAttribute('style');
        postImagePreview.removeAttribute('style');

        controlElementClass('btnUploadImageSD', 'hide', false);
        controlElementClass('btnUploadImageSDNew', 'unvisible', true);
        controlElementClass('btnRemoveImageSD', 'unvisible', true);
        controlElementClass('imageSDFormats', 'hide', false);
    } else {
        const uploadedFile = curFiles[0];

        object.image_sd_name = uploadedFile.name;
        reader.object_field_name = 'image_sd';
        reader.object_preview = [imageSDPreview, postImagePreview];
        reader.readAsDataURL(uploadedFile);

        controlElementClass('btnUploadImageSD', 'hide', true);
        controlElementClass('btnUploadImageSDNew', 'unvisible', false);
        controlElementClass('btnRemoveImageSD', 'unvisible', false);
        controlElementClass('imageSDFormats', 'hide', true);
    }
    if(checkError) {
        checkEmptyField('imageSDInput');
    }
}

function removeImageSD() {
    const imageSDInput = document.querySelector('#imageSDInput');

    delete(object.image_sd_name);
    delete(object.image_sd);
    imageSDInput.value = '';
    updateImageSDDisplay();
}

function removeBase64Header(str) {
    return str 
        ? str.substring(str.indexOf(',') + 1) 
        : "";
}

function validateForm() {
    var result = true;
    const fields = ['titleField', 'descrField', 'nameField', 'photoField', 
                    'dateField', 'imageHDInput', 'imageSDInput', 'contentText'];

    fields.forEach((id) => {
        result = checkEmptyField(id) && result;
    })
    
    return result;
}

function checkEmptyField(fieldId) {
    const field = document.getElementById(fieldId);
    const error = field.parentElement.querySelector('.input-wrap__error-text');
    if (!field.value) {
        error.classList.remove('hide');
        if (field.type === 'text') {
            field.classList.add('input-wrap__field_error');
        }
        if (field.type === 'textarea') {
            field.classList.add('content__text_error');
        }

        return false;
    } else {
        error.classList.add('hide');
        if (field.type === 'text') {
            field.classList.remove('input-wrap__field_error');
        }
        if (field.type === 'textarea') {
            field.classList.remove('content__text_error');
        }
    }

    return true;
}

function showMessage (isSuccess) {
    controlElementClass('messageDanger', 'publish-form__message_show', !isSuccess);
    controlElementClass('messageSuccess', 'publish-form__message_show', isSuccess);
}

function controlElementClass(elementId, className, isPresent) {
    const element = document.querySelector('#' + elementId);
    if (isPresent) {
        element.classList.add(className);
    } else {
        element.classList.remove(className);
    }
}

async function submitHandler(event) {
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

    object.author_photo = removeBase64Header(object.author_photo);
    object.image_hd = removeBase64Header(object.image_hd);
    object.image_sd = removeBase64Header(object.image_sd);

    if (validateForm()) {
        const response = await fetch('/api/post', {
            method: 'POST',
            body: JSON.stringify(object),
        })
    
        if (response.ok) {
            setFormAccessMode(false);
            showMessage(true);
            offerNewPost();
        }
    } else {
        showMessage(false);
    }
}

function offerNewPost() {
    const submitBtn = document.querySelector('#submit');
    submitBtn.removeEventListener('click', submitHandler);
    submitBtn.addEventListener('click', resetForm);
    submitBtn.value = "Next Post";
    submitBtn.classList.add('button_green');
}

function resetForm(event) {
    event.preventDefault();

    const submitBtn = document.querySelector('#submit');
    submitBtn.removeEventListener('click', resetForm);
   
    const form = document.querySelector('#form');
    form.reset();
    titleChangeHandler();
    descrChangeHandler();
    nameChangeHandler();
    updateAvatarDisplay(false);
    updateImageHDDisplay(false);
    updateImageSDDisplay(false);

    submitBtn.addEventListener('click', submitHandler);
    submitBtn.classList.remove('button_green');
    submitBtn.value = "Publish";
    controlElementClass('messageSuccess', 'publish-form__message_show', false);
    setFormAccessMode(true);
}

function setFormAccessMode(isEnable = true) {
    const mainInfo = document.getElementsByClassName('main-info');
    const content = document.getElementsByClassName('content');
    if (isEnable) {
        mainInfo[0].classList.remove('events-off');
        content[0].classList.remove('events-off');
    } else {
        mainInfo[0].classList.add('events-off');
        content[0].classList.add('events-off');
    }
}