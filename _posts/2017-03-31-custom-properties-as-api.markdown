---
layout: post
title: "Пользовательские свойства CSS в качестве API"
tags: css
---

*Перевод [CSS Custom Properties as your API](https://sgom.es/posts/2017-02-17-css-custom-properties-as-your-api/) – четвёртой статьи [Серджио Гомеса](http://sgom.es) о пользовательских свойствах CSS*

Теперь, когда вы [разобрались с пользовательскими свойствами](http://zmeika.name/2017/03/02/custom-css-properties-basics.html) и знаете как писать [более понятный код](http://zmeika.name/2017/03/09/readable-css.html), давайте посмотрим как сделать код модульным и переиспользуемым.

## Модульный CSS: делаем настраиваемую сетку

Если вы по какой-то причине не можете использовать прекрасные [CSS-гриды](https://www.w3.org/TR/css-grid-1/), постройте сетку на флексбоксах. Это отличное упражнение и можно получить настраиваемый и переиспользуемый компонент. Посмотрим на простую реализацию:

{% highlight css %}
.grid {  
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding: calc(var(--margin) / 2);
}
 
.grid > .cell {
  display: block;
  width: calc(100% / var(--columns) - var(--margin));
  margin: calc(var(--margin) / 2);
}
{% endhighlight %}

Как добавить модульность? Для начала, давайте всё аккуратно переименуем. Можно использовать любую из методологий, например [БЭМ](https://ru.bem.info/) или [SMACSS](https://smacss.com/). Но сейчас просто добавим к каждому классу и пользовательскому свойству префикс `my-` . Также, добавим к пользовательским свойствам комментарии и значения по умолчанию.

{% highlight css %}
.my-grid {
  /* пользовательские свойства my-grid */
  /* Количество колонок сетки */
  --my-grid-columns: 1;
  /* Размер отступов */
  --my-grid-margin: 16px;
 
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  /* Фолбэк для браузеров, не поддерживающих пользовательские свойства */
  padding: 8px;
  padding: calc(var(--my-grid-margin) / 2);
}
 
.my-grid > .my-grid-cell {
  display: block;
  /* Фолбэк для браузеров, не поддерживающих пользовательские свойства */
  width: calc(100% - 8px);
  width: calc(100% / var(--my-grid-columns) - var(--my-grid-margin));
  /* Фолбэк для браузеров, не поддерживающих пользовательские свойства */
  margin: 8px;
  margin: calc(var(--my-grid-margin) / 2);
}
{% endhighlight %}

`my-grid` теперь инкапсулированный, самодостаточный модуль. Как его использовать?

{% highlight html %}
<link rel="stylesheet" href="my-grid.css">
{% endhighlight %}

Всё! Подключая CSS-файл, вы импортируете значения по умолчанию и можете переопределять их собственными.

{% highlight html %}
<link rel="stylesheet" href="my-grid.css">
<style>
  .my-grid {
    --my-grid-columns: 2;
  }
</style>
{% endhighlight %}

Вы можете не только просто переопределить значения, но и использовать более специфичные селекторы, определить контрольные точки в которых для экранов разных размеров меняются отступы и количество колонок.

{% highlight css %}
.my-app .my-grid {
  --my-grid-columns: 1;
  --my-grid-margin: 8px;
}
 
@media (min-size: 600px) {
  .my-app .my-grid {
    --my-grid-columns: 3;
    --my-grid-margin: 16px;
  }
}
 
@media (min-size: 1024px) {
  .my-app .my-grid {
    --my-grid-columns: 6;
    --my-grid-margin: 16px;
  }
}
{% endhighlight %}

Обратите внимание, что вся конфигурация находится в CSS. Нет необходимости заранее определять классы, изменяющие раскладку. Не нужно создавать набор классов, которые *возможно* пригодятся разработчику. Можно использовать любые значения свойств, а не только те, для которых не забыли создать класс.

## Другой пример: пропорции

Представим, что вы делаете сайт (например, личный блог, где пишете о технологиях) и собираетесь задать для всех изображений `max-width`, чтобы они не выходили за пределы контейнера.

{% highlight css %}
.my-content {
  max-width: 600px;
}
{% endhighlight %}

Чтобы контент не скакал, когда загрузится изображение, для него нужно зарезервировать достаточно места. Это делается в HTML. Возможно, это часть вашего процесса сборки. 

{% highlight html %}
<img src="kitten.jpg" height="1024" width="768" alt="A cute kitten">
{% endhighlight %}

Но в этом случае `max-width` работает не очень хорошо. Браузер не учитывает пропорции картинки при изменении размеров. В результате получим изображение с максимальной возможной шириной 600px, изначальной высотой 768px и грустным перекошенным котёнком. 

![Искажённый котёнок](/post_images/2017/deformed-kitten.jpg)

<small>Искажённый котёнок. Оригинал фото [latch.r](https://www.flickr.com/photos/lachlanrogers/)</small>

Как сохранить пропорции? Есть популярный способ сохранить пропорции блока ([статья](https://alistapart.com/article/creating-intrinsic-ratios-for-video)) с помощью трюка с padding.  Вот как сохранить пропорцию 16:9:

{% highlight css %}
.aspect-ratio-16-9 {
  position: relative;
}
 
.aspect-ratio-16-9::before {
  display: block;
  padding-top: 56.25%; /* 9 / 16 * 100% */
  content: "";
}
 
.aspect-ratio-16-9-content {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
{% endhighlight %}

В HTML это выглядит так:

{% highlight html %}
<div class="aspect-ratio-16-9">
  <div class="aspect-ratio-16-9-content">
    У этого блока будет пропорция 16:9
  </div>
</div>
{% endhighlight %}

Это отлично работает, пока у вас на сайте есть всего несколько различных пропорций (например, вы делаете галерею изображений), но быстро становится неподдерживаемым, если у вас могут быть картинки произвольных пропорций. 

Давайте сделаем обёртку с фиксированными пропорциями с API на пользовательских свойствах!

{% highlight css %}
.my-image-wrapper {
  /* пользовательские свойства my-image-wrapper */
  /* ширина, например 16 в 16:9. */
  --my-image-wrapper-w: 1;
  /* высота, например 9 в 16:9. */
  --my-image-wrapper-h: 1;
 
  position: relative;
}
 
.my-image-wrapper::before {
  display: block;
  padding-top: calc(var(--my-image-wrapper-h, 1) /
      var(--my-image-wrapper-w, 1) * 100%);
  content: "";
}
 
.my-image-wrapper > img {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  height: 100%;
  width: 100%;
}
{% endhighlight %}

`--my-image-wrapper-w` и `--my-image-wrapper-h` теперь API для вашего CSS модуля и вы можете использовать код для любого изображения:

{% highlight html %}
<div class="my-content my-image-wrapper"
 style="width:768px; --my-image-wrapper-w:4; --my-image-wrapper-h:3;">
 
  <img src="kitten.jpg" alt="A cute kitten">
</div>
{% endhighlight %}

И котёнок теперь нормальный!

![Здоровый котёнок](/post_images/2017/healthy-kitten.jpg)

<small>Нормальный, здоровый котёнок. Оригинал фото [latch.r](https://www.flickr.com/photos/lachlanrogers/)</small>

Вы даже можете включить его в процесс сборки и автоматически применять ко всем картинкам. Здорово!

> Я сделал npm-пакет [css-aspect-ratio](https://www.npmjs.com/package/css-aspect-ratio).

## Веб-компоненты

[Веб-компоненты](https://www.webcomponents.org/) — это набор технологий, которые позволяют вам делать настоящие инкапсулированные и переиспользуемые компоненты.

{% highlight html %}
<my-component></my-component>
Вот так.
{% endhighlight %}

Вне зависимости от того, используете вы [Shadow DOM](https://www.w3.org/TR/shadow-dom/) или нет, полезно определить набор свойств, которые вы позволяете кастомизировать. Это позволит показать что доступно для изменения. Разработчикам не нужно будет копаться в реализации вашего компонента в поисках селекторов и свойств для переопределения. 

Классический пример — темизация. Если вы не потрудитесь заранее подготовить пользовательские свойства, которые можно настраивать, разработчикам придётся разбираться в коде вашего компонента.

{% highlight css %}
/* Наши изменения в my-component */
my-component > .top-thing {
  background: red;
}
 
my-component > .big-text {
  color: red;
}
 
my-component > .big-text:hover {
  color: red !important; /* Исправляет баг #42. */
}
 
my-component > .content > .column {
  width: calc(50% - 16px); /* 2 колонки вместо 3 */
}
{% endhighlight %}

Заботьтесь о своих пользователях (и себе будущем). Если что-то в вашем компоненте должно настраиваться, заверните это в пользовательское свойство.

{% highlight css %}
my-component {
  /* пользовательские свойства my-component */
  /* Основной цвет. Изменение повлияет на весь компонент. */
  --my-component-theme-color: blue;
  /* Акцентный цвет. Изменение повлияет на весь компонент. */
  --my-component-accent-color: red;
  /* На сколько колонок делить контент */
  --my-component-columns: 3;
}
{% endhighlight %}

Таким образом, вашим пользователям не придётся беспокоиться, что их изменения сломаются с обновлением компонента. Их код примет такой вид:

{% highlight css %}
/* Наши изменения в my-component */
my-component {
  --my-component-theme-color: red;
  --my-component-columns: 2;
}
{% endhighlight %}

Это ещё более важно, если в своих компонентах вы используете Shadow DOM, потому что к его элементам сложнее применять стили. Для более подробной информации советую прочитать отличное [руководство Эрика Бидельмана](https://developers.google.com/web/fundamentals/getting-started/primers/shadowdom). 

## Ваша работа, моя работа

Важно разделять ваш модуль (или веб-компонент) и его клиентский код. Так разработчики которые его используют, будут знать что можно менять безопасно, а что — на свой страх и риск. Даже если вы сами будете использовать свой код через несколько месяцев, вещи, которые сейчас кажутся очевидными, могут подзабыться. 

Заранее созданный набор пользовательских свойств облегчает повторное использование ваших модулей и компонентов, позволяет писать более стабильный клиентский код и даже служит встроенной документацией.