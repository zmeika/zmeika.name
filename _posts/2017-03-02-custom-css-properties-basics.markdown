---
layout: post
title: "Пользовательские свойства CSS. Основы"
tags: css
---

*Это перевод ["CSS Custom Properties - The Basics"](https://sgom.es/posts/2017-01-27-css-custom-properties-the-basics/) — первой из серии статей [Серджио Гомеса](https://sgom.es) о пользовательских свойствах CSS. В ней рассказываются самые основы: что такое пользовательские свойства и как ими пользоваться.*

Вы уже слышали о пользовательских свойствах CSS (также известных как CSS переменные) или даже имеете о них некоторое представление? Возможно, вы знаете о них из [поста на developers.google.com](https://developers.google.com/web/updates/2016/02/css-variables-why-should-you-care)? Если вы ещё не разобрались в особенностях их поддержки браузерами, не слышали о лучших практиках и не знаете чем они лучше переменных в Sass или Less — читайте дальше!

## Поддержка браузерами

Начнём с главного: где работают пользовательские свойства CSS? На самом деле поддержка уже довольно хорошая: полная в Chrome, Opera, Firefox и Safari; [Edge в разработке](https://developer.microsoft.com/en-us/microsoft-edge/platform/status/csscustompropertiesakacssvariables/). Отслеживать можно на  [Can I use CSS Variables (Custom Properties)](http://caniuse.com/#feat=css-variables).

Это значит, что их уже можно использовать для прогрессивного улучшения, а вскоре и как основной метод. В конце статьи немного о том как повторить функциональность пользовательских свойств с плагинов PostCSS.

## Задайте значение, любое значение

Что же такое пользовательское свойство? Если коротко, это CSS свойство, которое может быть названо и использовано разработчиком. В отличии от встроенных свойств, таких как color или position, каждое из которых браузер понимает определённым образом, у пользовательского свойства нет иного значения, кроме того, которое ему зададите вы.

{% highlight css %}
.foo {
    color: red;
    --theme-color: gray;
}
{% endhighlight %}

Пользовательские свойства отличаются от обычных просто по имени — у них есть префикс ‘`--`’.
Браузер ничего не делает с новым свойством. Если задать значение свойству `color`, то у элементов, соответствующих селектору изменится цвет текста, если задать значение свойству `--text-color`, то немедленных изменений не произойдёт.

В пользовательских свойствах CSS можно хранить любое [валидное CSS значение](https://developer.mozilla.org/en-US/docs/Web/CSS/Value_definition_syntax).

{% highlight css %}
.foo {
  --theme-color: blue;
  --spacer-width: 8px;
  --favorite-number: 3;
  --greeting: "Hey, what's up?";
  --reusable-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.85);
}
{% endhighlight %}

## Используйте повторно

От пользовательских свойств было бы мало толку, если бы вы могли только задавать им значения. Как минимум, нужно ещё и получать их обратно!

Для этого есть функция `var()`.

{% highlight css %}
.button {
  background-color: var(--theme-color);
}
{% endhighlight %}

Здесь мы присваиваем фону кнопки значение, которое хранится в пользовательском свойстве `--theme-color`. Поначалу может казаться, что нет большой разницы между этим способом и прямым присваиванием значения. Но преимущества становятся более явными, когда мы начинаем использовать `--theme-color` во многих селекторах и свойствах.

{% highlight css %}
.button {
  background-color: var(--theme-color);
}
 
.title {
  color: var(--theme-color);
}
 
.image-grid > .image {
  border-color: var(--theme-color);
}
{% endhighlight %}

### Значения по-умолчанию

Что если `--theme-color` нигде не задано? `var()` может принимать необязательный второй параметр, значение которого используется по-умолчанию.

{% highlight css %}
.button {
  background-color: var(--theme-color, gray);
}
{% endhighlight %}

> **Важно:** Если вы хотите использовать в качестве значения по-умолчанию другое пользовательское свойство, корректный синтаксис `background-color: var(--theme-color, var(--fallback-color))`;

{% highlight css %}
.button {
  background-color: gray;
  background-color: var(--theme-color, gray);
}
{% endhighlight %}

## Область видимости и каскад

Где нужно задавать эти значения, прежде чем использовать? Пользовательские свойства следуют стандартным правилам насчёт области видимости и каскадирования, так что вы уже знаете как это работает!

Например, для чего-то вроде `--theme-color`  лучше всего использовать глобальную область видимости, чтобы значение было доступно везде. Проще всего это сделать с помощью [псевдо-класса `:root`](https://developer.mozilla.org/en-US/docs/Web/CSS/:root):

{% highlight css %}
:root {
  --theme-color: gray;
}
{% endhighlight %}

Значение будет доступно в любом месте документа и его смогут использовать все ваши кнопки, заголовки и картинки.

Но что если вы хотите, чтобы у каждой части вашего сайта был свой цвет? Вы делаете всё так же, как и раньше, но теперь вы задаёте одно пользовательское свойство вместо того чтобы менять каждое свойство где он используется.

{% highlight css %}
section.about {
  --theme-color: darkblue;
}
 
section.contacts {
  --theme-color: darkred;
}
 
section.news {
  --theme-color: teal;
}
{% endhighlight %}

И конечно, вы всегда можете сделать исключения, задавая такие сложные селекторы, какие вам нужны.

{% highlight css %}
section.news > .sidenote {
  --theme-color: gray;
}
{% endhighlight %}

## Математика CSS

[В функции `calc()`](https://developer.mozilla.org/en-US/docs/Web/CSS/calc) часто совмещают разные единицы измерения:

{% highlight css %}
.child {
  width: calc(100% - 16px);
}
{% endhighlight %}

Во время исполнения браузер вычисляет окончательный размер в пикселях, который зависит от ширины родителя.

Ещё один козырь в рукаве `calc()` — его можно использовать с пользовательскими свойствами! Такая комбинация может быть очень полезна, поэтому ей уделено особое внимание в спецификации пользовательских свойств. 

{% highlight css %}
:root {
  --base-size: 4px;
}
 
.title {
  text-size: calc(5 * var(--base-size));
}
 
.body {
  text-size: calc(3 * var(--base-size));
}
{% endhighlight %}

Можно даже совмещать разные единицы измерения, при условии что конечный результат будет осмысленным.

{% highlight css %}
:root {
  --base-size: 4px;
  --title-multiplier: 5;
  --body-multiplier: 3;
}
 
.title {
  text-size: calc(var(--title-multiplier) * var(--base-size));
}
 
.body {
  text-size: calc(var(--body-multiplier) * var(--base-size));
}
{% endhighlight %}

## Взаимодействие CSS и JavaScript

Сравнивая пользовательские свойства с переменными в Sass, Less, PostCSS или других препроцессорах нужно учитывать, что пользовательские свойства — это настоящие сущности в браузере. Это значит их можно динамически менять во время исполнения, в отличии от результата работы препроцессоров.

Пользовательские свойства [любого элемента](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration) доступны для методов `getPropertyValue` и `setProperty` .

{% highlight javascript %}
const styles = getComputedStyle(document.querySelector('.foo'));
// Чтение свойства. Не забыть убрать пробелы с помощью trim()
const oldColor = styles.getPropertyValue('--color').trim();
// Запись свойства. 
foo.style.setProperty('--color', 'green');
{% endhighlight %}

Изменение значения пользовательского свойства сразу же повлияет на все свойства,  которые от него зависят, как если бы вы меняли их напрямую. Значит, это отличный способ изменять сразу множество элементов с помощью скриптов.

Более подробно эта тема и лучшие практики использования пользовательских свойств в следующей статье.

## Приложение: плагины PostCSS

Если вы хотите начать использовать пользовательские свойства CSS прямо сейчас, но вам нужна работа в браузерах, которые их пока не поддерживают, можете восполнить пробелы с помощью плагинов PostCSS.

Примите во внимание, что это сработает для организации и повторного использования CSS, но динамическая функциональность, такая как изменение пользовательских свойств с помощью JavaScript будет недоступна.

Вот краткий обзор основных случаев использования пользовательских свойств и их поддержки в паре популярных плагинов.

| Функциональность                        | Пример кода                              | [`postcss-custom-properties`](https://github.com/postcss/postcss-custom-properties) | [`postcss-css-variables`](https://github.com/MadLittleMods/postcss-css-variables) |
| --------------------------------------- | ---------------------------------------- | ---------------------------------------- | ---------------------------------------- |
| Определение в области видимости `:root` | `:root {  --color: red;}`                | **Да.**                                  |                                          |
| Определение в других областях видимости | `body {  --color: red;}`                 | **Нет.**                                 | **Да.** [Может привести к неправильному поведению](https://github.com/MadLittleMods/postcss-css-variables#caveats) |
| Получение значения                      | `.foo {  color: var(--color);}`          | **Да.**                                  |                                          |
| Получение значения с фолбэком           | `.foo {  color: var(--color, red);}`     | **Да.**                                  |                                          |
| Определение внутри директивы            | `@media (min-size: 600px) {  :root {    --color: red;  }}` | **Нет.**                                 | **Да.** [Может привести к неправильному поведению](https://github.com/MadLittleMods/postcss-css-variables/issues/30) |
| Использование внутри псевдоселектора    | `.foo:hover {  --color: red;}`           | **Нет.**                                 | **Да.** [Может привести к неправильному поведению](https://github.com/MadLittleMods/postcss-css-variables#caveats) |
| Вычисления                              | `.foo {  text-size: calc(2 *    var(--size));}` | **Да**, с помощью [postcss-calc](https://github.com/postcss/postcss-calc). |                                          |
| Изменение с помощью JavaScript          | `el.style.setProperty(  '--color', 'red');` | **Нет.** Невозможно с помощью препроцессоров. |                                          |

 