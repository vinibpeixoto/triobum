#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const prompts = require('./prompts.js');
const htmlPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
let count = 0;
html = html.replace(/(<a\b[^>]*data-topic="([^"]+)"[^>]*\bhref=")[^"]*("[^>]*>)/g, (_, before, topic, after) => {
  const url = prompts.urlForTopic(topic);
  const query = new URL(url).searchParams.get('q');
  if (!query.includes(prompts.HOME_URL)) throw new Error(`Sem homepage no prompt: ${topic}`);
  count++;
  return before + url + after;
});
if (count !== 19) throw new Error(`Esperava 19 destinos editoriais, encontrei ${count}`);
let labeled = 0;
html = html.replace(/<a\b([^>]*data-topic="[^"]+"[^>]*)>(.*?)<\/a>/g, (_, attrs, inner) => {
  const label = inner.replace(/<[^>]*>/g, '').replace(/[↗→]/g, '').trim();
  if (!label) throw new Error('Link temático sem texto acessível');
  const clean = attrs.replace(/\saria-label="[^"]*"/, '');
  labeled++;
  return `<a${clean} aria-label="${label} — abrir conversa no ChatGPT em nova aba">${inner}</a>`;
});
if (labeled !== 19) throw new Error(`Esperava rotular 19 destinos, rotulei ${labeled}`);
fs.writeFileSync(htmlPath, html);
console.log(`Sincronizados ${count} links temáticos com a homepage pública.`);
