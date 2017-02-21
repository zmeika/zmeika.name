'use strict';

var button = document.querySelector('#paintAll');
var style = document.querySelector('#style');

button.addEventListener('click', magic);

function magic() {
    style.textContent = '.zmeika {--main: #00f;}';
}