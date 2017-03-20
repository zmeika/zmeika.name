---
layout: post
title: "Пользовательсткие свойства как связующее звено между CSS и JS"
tags: css
---
*Перевод [Bridging CSS and JS with Custom Properties](https://sgom.es/posts/2017-02-10-bridging-css-and-js-with-custom-properties/) – третьей статьи [Серджио Гомеса](http://sgom.es) о пользовательских свойствах CSS*

Пользовательские свойства CSS можно использовать не только для хранения и получения значений. В этой статье мы рассмотрим лучшие практики использования их в качестве связующего звена между CSS и JavaScript.

## Разделение CSS и JavaScript с помощью CSS-классов 

Обычно, вы хотите, чтобы CSS и JavaScript были максимально независимы друг от друга, чтобы разделить ответственность и облегчить взаимодействие между ними. 

Простейшим случаем и давно устоявшейся практикой является использование отдельных CSS-классов для взаимодействия. JS со своей стороны добавляет и удаляет их, когда нужно произвести визуальные изменения в ответ на какие-то события.

{% highlight css %}
.button {
  position: relative;
  transform: scale(1);
}
 
.button.js-toggled {
  transform: scale(1.5);
}
{% endhighlight %}

{% highlight javascript %}
const button = document.querySelector('.button');
button.addEventListener('click', () => {
  button.classList.toggle('js-toggled');
});
{% endhighlight %}

Такой подход позволяет полностью описывать внешний вид в CSS, а с помощью JavaScript только менять состояния. Вы легко можете внести визуальные изменения (например, поменять цвет) в CSS, не трогая ни строчки в JavaScript. Точно так же можно в JavaScript изменить условия, при которых меняется состояние, не трогая CSS файлы.

> **Важно**: обратите внимание, что принято различать имена обычных CSS-классов и классов, предназначенных для использования в JavaScript. Как в примере выше, к последним можно добавлять префикс `js-`. 

## Передача значений между CSS и JavaScript

Добавление и удаление класса хорошо работает для будевых состояний, но иногда необходимо передавать более сложные данные. Например, если вы реагируете на действия пользователя (клик или тач) и должны учитывать координаты.

Представим, что у нас есть контейнер и внутри него мы хотим показывать последнюю точку, где кликнул пользователь. 

{% highlight css %}
.container {
  position: relative;
}
 
.container > .auxElement {
  position: absolute;
}
{% endhighlight %}

{% highlight javascript %}
document.querySelector('.container').addEventListener('click', evt => {
  const aux = document.querySelector('.container > .auxElement');
  aux.style.transform = `translate(${evt.clientX}px, ${evt.clientY}px)`;
});
{% endhighlight %}

Код выше работает, но в нём нет никакого разделения между CSS и JavaScript. В JavaScript мы не только знаем о существовании вспомогательного элемента (в идеале — не должны), но и напрямую изменяем его свойства. 

Раньше для этой ситуации не было хорошего решения, но с пользовательскими свойствами мы можем вернуть хороший уровень абстракции.

{% highlight css %}
.container {
  position: relative;
  --clickX: 0;
  --clickY: 0;
}
 
.container > .auxElement {
  position: absolute;
  transform: translate(var(--clickX, 0), var(--clickY, 0));
}
{% endhighlight %}

{% highlight javascript %}
const container = document.querySelector('.container');
container.addEventListener('click', evt => {
  container.style.setProperty('--clickX', `${evt.clientX}px`);
  container.style.setProperty('--clickY', `${evt.clientY}px`);
});
{% endhighlight %}

Теперь мы снова можем менять внешний вид только в CSS, не трогая JavaScript. Мы теперь даже можем заменить вспомогательный блок псевдоэлементом `::after`.

{% highlight css %}
.container {
  position: relative;
  --clickX: 0;
  --clickY: 0;
}
 
.container::after {
  position: absolute;
  transform: translate(var(--clickX, 0), var(--clickY, 0));
}
{% endhighlight %}

> **Совет**. Вам когда-нибудь было нужно менять стиль псевдоэлементов (например `::after`) из JavaScript? Попробуйте следовать примеру выше и использовать пользовательское свойство родительского элемента как связку между CSS и JavaScript. Это простое и легко поддерживаемое решение!

## Одна переменная, множество изменений

Одно событие в JavaScript необязательно должно вести к единственному изменению в CSS. Эффектов может быть несколько. Хороший пример — темизация, когда изменение, скажем, цвета темы влияет на большое количество элементов. 

Рассмотрим музыкальный плеер. Чтобы менять цвет интерфейса под цвет текущего альбома без пользовательских свойств, вам бы потребовалось составить список элементов, которые должны менять цвет, а также свойств, которые должны меняться. Это можно делать в JavaScript:

{% highlight javascript %}
const thingsToUpdate = new Map([
  ['playButton', 'background-color'],
  ['title': 'color'],
  ['progress': 'background-color']
]);
 
for (let [id, property] of thingsToUpdate) {
  document.getElementById(id).style.setProperty(property, newColor);
}
{% endhighlight %}

Или в HTML:

{% highlight html %}
<span class="title js-update-color">Song title</span>
<button class="play-button js-update-background">Play</button>
<div class="progress-track js-update-background"></div>
{% endhighlight %}

{% highlight javascript %}
const colorList = document.querySelectorAll('.js-update-color');
for (let el of colorList) {
  el.style.setProperty('color', newColor);
}
 
const backgroundList =
    document.querySelectorAll('.js-update-background');
for (let el of backgroundList) {
  el.style.setProperty('background-color', newColor);
}
{% endhighlight %}

В любом случае, такой код тяжело поддерживать, потому что этот список элементов и затрагиваемых свойств нужно держать в актуальном состоянии.

В качестве другого решения можно вставлять на страницу стиль, который будет переопределять цвета. Такой подход немного лучше (но тоже грязноват). Но он всё равно предполагает переопределение множества стилей. И придётся создать шаблон, который тоже требует поддержки. 

{% highlight css %}
.play-button {
  background-color: ${newColor} !important;
}
.title {
  color: ${newColor} !important;
}
.progress-track {
  background-color: ${newColor} !important;
}
{% endhighlight %}

С пользовательскими свойствами всё становится проще. Просто определите цвет в самом высоком по иерархии элементе, который хотите изменить, и позвольте каскаду сделать всё остальное.

{% highlight css %}
.player {
  --theme-color: red;
}
 
.play-button {
  background-color: var(--theme-color);
}
.title {
  color: var(--theme-color);
}
.progress-track {
  background-color: var(--theme-color);
}
{% endhighlight %}

{% highlight javascript %}
document.querySelector('.player').style.setProperty(
    '--theme-color', newColor);
{% endhighlight %}

Такой подход позволяет вашему скрипту ничего не знать о том, какие элементы нужно менять, и не требует поддерживать какие-либо шаблоны. И он проще, чем все предыдущие!

## Почему это важно

Ограничив взаимодействие именами CSS-классов и пользовательскими свойствами вы проведёте чёткую границу между вашими JavaScript и CSS.

Это значит, что любые изменения ограничены набором заранее определённых сущностей.  Таким образом уменьшается область возникновения багов и непредвиденного поведения. А стили и поведение проще тестировать отдельно друг от друга.

Поддержка тоже станет легче, потому что вы сможете изменять стили и логику независимо и использовать правильные инструменты: CSS для стилей и JS для логики. 

В [следующей статье](https://sgom.es/posts/2017-02-17-css-custom-properties-as-your-api) мы рассмотрим больше полезных приёмов и преимуществ создания модульного CSS с помощью пользовательских свойств. До встречи!