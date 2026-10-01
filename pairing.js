/* Sorteio de duplas: independe do DOM para funcionar também em HTMLs pré-gerados. */
(() => {
  'use strict';

  function chooseOtherPair(products, currentIds, random = Math.random) {
    const available = products.filter(product => product.status === 'ready');
    const combinations = [];
    const currentKey = [...currentIds].sort().join('|');

    for (let first = 0; first < available.length; first += 1) {
      for (let second = first + 1; second < available.length; second += 1) {
        const pair = [available[first], available[second]];
        if (pair.map(product => product.id).sort().join('|') !== currentKey) {
          combinations.push(pair);
        }
      }
    }

    if (!combinations.length) return null;
    // Cada dupla alternativa tem a mesma probabilidade, inclusive com catálogos maiores.
    return combinations[Math.min(combinations.length - 1,
      Math.floor(Math.max(0, random()) * combinations.length))];
  }

  window.TriobumPairing = {chooseOtherPair};
})();
