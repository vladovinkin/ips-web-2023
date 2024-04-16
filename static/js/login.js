window.addEventListener('load', () => {
    const passwordShowButton = document.querySelector('#passwordShowButton');
    const submitBtn = document.querySelector('#submit');

    passwordShowButton.addEventListener('click', passwordShowButtonClickHandler);
    submitBtn.addEventListener('click', submitHandler);
    bindBlurValidator();
    
})

function passwordShowButtonClickHandler() {
    const passwordShowButton = document.querySelector('#passwordShowButton');
    const passwordField = document.querySelector('#passwordField');
    if (passwordShowButton.classList.contains('password-wrap__button_show')) {
        passwordShowButton.classList.remove('password-wrap__button_show');
        passwordField.type = 'password';
    } else {
        passwordShowButton.classList.add('password-wrap__button_show');
        passwordField.type = 'text';
    }
}

function bindBlurValidator() {
    const emailField = document.querySelector('#emailField');
    const passwordField = document.querySelector('#passwordField');
    emailField.addEventListener('blur', (event) => {
        const error = event.currentTarget.labels[0].parentElement.querySelector('.input-wrap__error-text');
        error.textContent = 'Email is required';
        if (checkEmptyField(event.currentTarget.id)) {
            checkEmail();
        }
    })
    passwordField.addEventListener('blur', (event) => {
        checkEmptyField(event.currentTarget.id);
    })
}

function checkEmptyField(fieldId) {
    const field = document.getElementById(fieldId);
    const error = field.labels[0].parentElement.querySelector('.input-wrap__error-text');
    if (!field.value) {
        error.classList.remove('hide');
        field.classList.remove('input-wrap__field_filled');
        field.classList.add('input-wrap__field_error');
        return false;
    } else {
        error.classList.add('hide');
        field.classList.add('input-wrap__field_filled');
        field.classList.remove('input-wrap__field_error');
    }
    return true;
}

function checkEmail() {
    const EMAIL_REGEXP = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;
    const field = document.getElementById('emailField');
    const error = field.labels[0].parentElement.querySelector('.input-wrap__error-text');
    if (EMAIL_REGEXP.test(field.value)) {
        error.classList.add('hide');
    } else {
        error.textContent = 'Incorrect email format. Correct format is ****@**.***';
        error.classList.remove('hide');
        return false;
    }
    return true;
}

function getInputValue(id) {
    const field = document.getElementById(id);
    return field.value;
}

function checkCorrectLoginData() {
    const MOCK_EMAIL = 'login@test.com';
    const MOCK_PASS = '12345';

    return getInputValue('emailField') === MOCK_EMAIL && getInputValue('passwordField') === MOCK_PASS;
}

async function submitHandler(event) {
    event.preventDefault();

    if (!(checkEmptyField('passwordField') && checkEmptyField('emailField') && checkEmail())) {
        showMessage(true);
        return;
    } else {
        if (!(checkCorrectLoginData())) {
            const passwordField = document.getElementById('passwordField');
            const emailField = document.getElementById('emailField');
            passwordField.classList.add('input-wrap__field_error');
            emailField.classList.add('input-wrap__field_error');
            showMessage(true, 'Email or password is incorrect.');
            return;
        }
    }
    window.location.href = '/admin';
}

function controlElementClass(elementId, className, isPresent) {
    const element = document.querySelector('#' + elementId);
    if (isPresent) {
        element.classList.add(className);
    } else {
        element.classList.remove(className);
    }
}

function showMessage(isShow, message = 'A-Ah! Check all fields,') {
    messageText = document.getElementById('messageDanger').getElementsByClassName('message__text')[0];
    messageText.textContent = message;
    controlElementClass('messageDanger', 'publish-form__message_show', isShow);
}
