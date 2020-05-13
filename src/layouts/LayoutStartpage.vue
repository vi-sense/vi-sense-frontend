<template>
  <div id="app">
    <header>
      <h1>Vi-Sense</h1>
      <h2 class="header__title title-header">
      {{ $route.meta.title }}
    </h2>
    </header>
    <main>
      <slot/>
    </main>
  </div>
</template>