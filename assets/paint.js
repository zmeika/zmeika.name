'use strict';

var button = document.querySelector('#paintAll');
var style = document.querySelector('#style');

button.addEventListener('click', magic);

function magic() {
    style.textContent = '.zmeika {--main: '+ getRandomColor(256) + ';}';
    yaCounter38283935.reachGoal('btnClick'); return true;
}

function getRandomColor(max) {
    max = Math.floor(max);

    return 'rgb(' +
        Math.floor(Math.random() * max) + ',' +
        Math.floor(Math.random() * max) + ',' +
        Math.floor(Math.random() * max) + ')';
}