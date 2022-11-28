var nameError = document.getElementById('name-error');
var emailError = document.getElementById('email-error');
var mobileError = document.getElementById('phone-error');
var passError = document.getElementById('pass-error');
var confirmPassError = document.getElementById('confirmPass-error');
var submitError = document.getElementById('submit-error');

function validatename() {
    var name = document.getElementById('register-name-2').value;

    if (name.length == 0) {
        nameError.innerHTML = 'Name is required';
        return false
    }
    if (!name.match(/^[a-zA-Z]+$/)) {
        nameError.innerHTML = 'Write full name';
        return false;
    }
    if ((name.length <= 2) || (name.length > 20)) {
        nameError.innerHTML = 'Name length must be between 3 and 20';
        return false
    }
    nameError.innerHTML = '<i class="fa fa-check" aria-hidden="true" style="color:green;"></i>';
    return true
}
function validateEmail() {
    var email = document.getElementById('register-email-2').value;

    if (email.length == 0) {
        emailError.innerHTML = 'Email is required';
        return false
    }
    if (email.indexOf('@') <= 0) {
        emailError.innerHTML = 'Invalid email format';
        return false
    }
    if ((email.charAt(email.length - 4) != '.') && (email.charAt(email.length - 3) != '.')) {
        emailError.innerHTML = 'invalid email format ';
        return false
    }
    emailError.innerHTML = '<i class="fa fa-check" aria-hidden="true" style="color:green;"></i>';
    return true
}

function validatePhone() {
    var mobile = document.getElementById('register-phone-2').value;

    if (mobile.length == 0) {
        mobileError.innerHTML = 'Phone no is required';
        return false
    }
    if (mobile.length != 10) {
        mobileError.innerHTML = 'Phone number should be 10 digits';
        return false
    }
    if (!mobile.match(/^[0-9]{10}$/)) {
        mobileError.innerHTML = 'Only digits please';
        return false
    }
    mobileError.innerHTML = '<i class="fa fa-check" aria-hidden="true" style="color:green;"></i>';
    return true
}
function validatePassword() {
    var pass = document.getElementById('register-password-2').value;

    if (pass.length == 0) {
        passError.innerHTML = 'Password is required';
        return false
    }
    if (pass.length <= 8) {
        passError.innerHTML = 'Minimum password length must be 8';
        return false
    }
    passError.innerHTML = '<i class="fa fa-check" aria-hidden="true" style="color:green;"></i>';
    return true
}

function validateConfirm() {
    var confirmPass = document.getElementById('rePassword').value;
    var pass = document.getElementById('register-password-2').value;

    if (confirmPass.length == 0) {
        confirmPassError.innerHTML = 'Confirm password is required';
        return false
    }
    if (pass != confirmPass) {
        confirmPassError.innerHTML = 'Password doesnt matches';
        return false
    }
    confirmPassError.innerHTML = '<i class="fa fa-check" aria-hidden="true" style="color:green;"></i>';
    return true
}
function validateForm() {
    if (!validateName() || !validateEmail() || !validatePassword() || !validateConfirm()|| !validatePhone()) {
        submitError.style.display = 'block'
        submitError.innerHTML = 'Please fill the form';
        setTimeout(function () { submitError.style.display = 'none' }, 3000)
        return false;
    }
}