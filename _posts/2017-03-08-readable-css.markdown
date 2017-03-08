---
layout: post
title: "Пишем читаемый код с пользовательскими свойствами CSS"
tags: css
---

Теперь, когда вы знаете [как работают пользовательские свойства CSS](http://zmeika.name/2017/03/02/custom-css-properties-basics.html), можно использовать их для улучшения читаемости и облегчения поддержки кода.

> **Важно**: в статье для краткости опущены фолбэки при использовании `var()`, но для надёжности кода про них нужно помнить.  
>
{% highlight css %}
.foo {
  /* для браузеров, которые не поддерживают пользовательские свойства */
  color: black;
  /* black используется в случае, когда --color не определён */
  color: var(--color, black);
}
{% endhighlight %}

## Придерживайтесь принципа DRY

[DRY](https://ru.wikipedia.org/wiki/Don%E2%80%99t_repeat_yourself) означает "Don't Repeat Yourself" (Не Повторяйтесь). Этот принцип хорош тем, что экономит время и силы не только при наборе кода, но и при поиске, замене и отладке каждый раз, когда нужно  внести изменения. Проще говоря, он уменьшает стоимость поддержки кода. 

Вот пример плохого CSS со множеством повторений:

{% highlight css %}
.button {
  background-color: gray;
}
 
.title {
  color: gray;
}
 
.image-grid > .image {
  border-color: gray;
}
 
.caption {
  color: gray; /* должен быть gray вне зависимости от темы */
}
{% endhighlight %}

Чтобы поменять цветовую тему, нужно заменить цвет в первых трёх селекторах, но оставить его прежним для цвета подписи.

Как могут помочь пользовательские свойства CSS? Просто задаём значение в одном месте и потом используем его много раз! Давайте создадим свойство `--theme-color`:

{% highlight css %}
:root {
  --theme-color: gray;
}
 
.button {
  background-color: var(--theme-color);
}
 
.title {
  color: var(--theme-color);
}
 
.image-grid > .image {
  border-color: var(--theme-color);
}
 
.caption {
  color: gray;
}
{% endhighlight %}

Если цвет задан в пользовательском свойстве, то достаточно внести изменение в одном месте и значения изменятся везде. Более того, код становится семантичным: если раньше было неясно, должен ли измениться цвет именно в этом свойстве, то теперь это очевидно.

Для цвета подписи тоже можно создать пользовательское свойство:

{% highlight css %}
:root {
  --theme-color: gray;
  --caption-text-color: gray;
}
 
.button {
  background-color: var(--theme-color);
}
 
.title {
  color: var(--theme-color);
}
 
.image-grid > .image {
  border-color: var(--theme-color);
}
 
.caption {
  color: var(--caption-text-color);
}
{% endhighlight %}

Но это только начало!

## Отложите калькулятор

Как вы уже знаете из [введения в пользовательские свойства CSS](http://zmeika.name/2017/03/02/custom-css-properties-basics.html), их можно использовать совместно с функцией `calc()`.

Посмотрите на эту сетку:

![img](/post_images/2017/grid.png)

{% highlight css %}
.image-grid {
  padding: 8px;
}
 
.image-grid > .image {
  margin: 8px;
}
{% endhighlight %}

Если вы уже видели этот пример раньше или хорошо знакомы с блочной моделью, вы поймёте, что у нас получается раскладка с отступами 16px вокруг и между ячейками. Это не совсем очевидно из CSS и мы не подчёркиваем вещи, о которых заботимся больше всего.

С точки зрения дизайна здесь важны отступы в 16px вокруг и между ячейками. Нас интересует результат, а не промежуточные вычисления. Они не имеют смысла сами по себе, но увеличивают стоимость поддержки.

С помощью пользовательских свойств и `calc()` можем написать более понятно:

{% highlight css %}
:root {
  --image-grid-spacing: 16px;
}
 
.image-grid {
  padding: calc(var(--image-grid-spacing) / 2);
}
 
.image-grid > .image {
  margin: calc(var(--image-grid-spacing) / 2);
}
{% endhighlight %}

Таким образом, мы работаем с осмысленными значениями, а не с результатами вычислений. В будущем будет проще вносить изменения.

Эту идею можно расширить и подстраивать все элементы под раскладку. 

{% highlight css %}
:root {
  --page-grid: 4px;
  --image-grid-spacing: calc(4 * var(--page-grid));
}
 
.title {
  font-size: calc(5 * var(--page-grid));
}
 
.paragraph {
  margin: calc(4 * var(--page-grid));
}
 
.image-grid {
  padding: calc(var(--image-grid-spacing) / 2);
}
 
.image-grid > .image {
  margin: calc(var(--image-grid-spacing) / 2);
}
{% endhighlight %}

В примере выше мы для ясности вводим промежуточные вычисления.

> **Важно**: В Safari/WebKit такие вычисления пока не работают. Это уже исправлено в Safari Technology Preview, так что вероятно будет исправлено в следующем релизе Safari 10.1.

## Понятные изменения

До сих пор мы задавали значения один раз в документе и использовали их везде, не собираясь часто их менять. Но пользовательские свойства ещё более удобны для значений, которые вы *хотите* менять в определённых случаях. 

Например, вот простая сетка с помощью флексбоксов:

{% highlight css %}
.image-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 8px;
}
 
.image-grid > .image {
  margin: 8px;
  width: calc(100% - 16px);
}
 
@media (min-size: 600px) {
  /* 3 картинки в ряд */
  .image-grid > .image {
    width: calc(100% / 3 - 16px);
  }
}
 
@media (min-size: 1024px) {
  /* 6 картинок в ряд */
  .image-grid > .image {
    width: calc(100% / 6 - 16px);
  }
}
{% endhighlight %}

Здесь не сразу понятно что происходит, так что давайте разберёмся. По умолчанию, для маленьких экранов, сетка с одной колонкой. При увеличении размера экрана колонок становится 3, а потом 6. Как и в примере из предыдущей части, вокруг и между ячейками по прежнему отступ 16px.

Из-за сложности вычислений нам пришлось добавить комментарии. Но, если мы используем пользовательские свойства:

{% highlight css %}
:root {
  --grid-spacing: 16px;
  --grid-columns: 1;
}
 
.image-grid {
  display: flex;
  flex-wrap: wrap;
  padding: calc(var(--grid-spacing) / 2);
}
 
.image-grid > .image {
  margin: calc(var(--grid-spacing) / 2);
  width: calc(100% / var(--grid-columns) - var(--grid-spacing));
}
 
@media (min-size: 600px) {
  :root {
    --grid-columns: 3;
  }
}
 
@media (min-size: 1024px) {
  :root {
    --grid-columns: 6;
  }
}
{% endhighlight %}

Теперь все вычисления находятся в одном месте, и всё что нужно менять в медиа-запросах — значение пользовательского свойства. Так понятнее вне зависимости от того насколько вы знакомы с кодом. Как бонус, таким образом вы не рискуете ошибиться в вычислениях в новом медиа-запросе и получить непредвиденные результаты.

> **Важно**: код выше может быть слишком сложным для препроцессоров. Учтите это, если используете какой-нибудь и что-то идёт не так. 

Теперь, когда вы знаете как сделать ваш CSS понятным и легко поддерживаемым, посмотрим как от пользовательских свойств [может выиграть Javascript](https://sgom.es/posts/2017-02-10-bridging-css-and-js-with-custom-properties).