var nameError = document.getElementById('name-error');
var mobileError = document.getElementById('phone-error');
var zipError = document.getElementById('zip-error');
var houseError = document.getElementById('house-error');
var streetError = document.getElementById('street-error');
var cityError = document.getElementById('city-error');
var stateError = document.getElementById('state-error')
var submitError = document.getElementById('submit-error');


function validateName(){
    var name = document.getElementById('address-name').value;
    if(name.length==0){
        nameError.innerHTML = 'Name is required'
        return false
    }
    if(!name.match(/^([\w]{3,})+\s+([\w\s]{3,})+$/i)){
        nameError.innerHTML = 'Write full name';
        return false
    }
    if ((name.length <= 2) || (name.length > 20)) {
        nameError.innerHTML = 'Name length must be between 3 and 20';
        return false
    }
    nameError.innerHTML = '<i class="fa fa-check" aria-hidden="true" style="color:green;"></i>';
    return true
}
function validatePhone() {
    var mobile = document.getElementById('address-phone').value;

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
function validateZip(){
    var zip = document.getElementById('address-zip').value;

    if (zip.length == 0) {
        zipError.innerHTML = 'Pincode is required';
        return false
    }
    if (!zip.match(/^[1-9][0-9]{5}$/)) {
        zipError.innerHTML = 'Only 6 digits allowed';
        return false
    }
    zipError.innerHTML = '<i class="fa fa-check" aria-hidden="true" style="color:green;"></i>';
    return true
}
function validateHouse(){
    var house = document.getElementById('address-house').value;

    if (house.length == 0) {
        houseError.innerHTML = 'Address is required';
        return false
    }
    if (!house.match(/^[a-zA-Z0-9\s,.'-]{3,}$/)) {
        houseError.innerHTML = 'invalid characters is not allowed';
        return false
    }
    houseError.innerHTML = '<i class="fa fa-check" aria-hidden="true" style="color:green;"></i>';
    return true
}
function validateStreet(){
    var street = document.getElementById('address-house').value;

    if (street.length == 0) {
        streetError.innerHTML = ' Street address is required';
        return false
    }
    if (!street.match(/^[a-zA-Z0-9\s,.'-]{3,}$/)) {
        streetError.innerHTML = 'invalid characters is not allowed';
        return false
    }
    streetError.innerHTML = '<i class="fa fa-check" aria-hidden="true" style="color:green;"></i>';
    return true
}
function validateCity(){
    var city = document.getElementById('address-city').value;

    if (city.length == 0) {
        cityError.innerHTML = 'Town/City name is required';
        return false
    }
    cityError.innerHTML = '<i class="fa fa-check" aria-hidden="true" style="color:green;"></i>';
    return true
}
function validateState(){
    var state = document.getElementById('address-state').value;

    if (state.length == 0) {
        stateError.innerHTML = 'State name is required';
        return false
    }
    stateError.innerHTML = '<i class="fa fa-check" aria-hidden="true" style="color:green;"></i>';
    return true
}
function validateForm() {
    if (!validateName() || !validatePhone()|| !validateZip() || !validateHouse()|| !validateStreet() || !validatecity() || !validateState()) {
        submitError.style.display = 'block'
        submitError.innerHTML = 'Please fill the form';
        setTimeout(function () { submitError.style.display = 'none' }, 3000)
        return false;
    }
}
