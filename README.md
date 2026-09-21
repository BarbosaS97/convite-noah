# Convite de aniversário do Noah, 4 anos

Convite web de uma página só (HTML + CSS + JavaScript, sem bibliotecas), mobile first, em estilo quadrinhos.
Ordem da página: capa "Abrir convite" (foto do Noah) → **vídeo** → informações (data, horário, local) → confirmação → mapa.
Os sete super-heróis ficam ao fundo, espiando por trás dos blocos.

## Como executar

- **Mais simples:** dê dois cliques em `index.html`. Funciona direto no navegador.
- **Servidor local (recomendado, igual ao site publicado):** `python tools/serve.py` e abra <http://localhost:8080>.

## Onde editar (tudo em `config.js`)

| O que | Campo |
|---|---|
| Data, horário e local (cards) | `data`, `horario`, `local` |
| Link do botão CONFIRMAR PRESENÇA | `whatsappLink` (ex.: `https://wa.me/55DDDNUMERO?text=...`) |
| Texto e link do mapa (VER LOCALIZAÇÃO) | `localizacaoTexto`, `localizacaoUrl` (e, opcional, `mapaEmbedUrl`) |
| Contagem regressiva (opcional) | `dataISO`, ex.: `'2026-11-15T15:00:00-03:00'` |
| Capa "Abrir convite" | `capaDeEntrada: true/false` |

Enquanto os valores forem `DATA A DEFINIR`, `WHATSAPP_LINK_AQUI` e `LOCALIZAÇÃO_AQUI`, os botões avisam que o link
ainda não foi configurado.

## Vídeo

Coloque o arquivo em **`public/assets/video/aniversario.mp4`** (ou mude o caminho em `config.js`).
Serve vídeo vertical ou horizontal. A moldura se ajusta sozinha. O vídeo toca **sem som** (o som do convite é só a música).
Se o arquivo não existir, aparece um cartão de "vídeo em breve".

## Música

A música fica em **`public/assets/audio/musica.mp3`**. O convite tenta tocá-la assim que abre. Como os navegadores
bloqueiam som automático, no celular aparece a capa **ABRIR CONVITE**: um toque abre o convite e a música começa.
O botão **Música** liga/desliga. Se o arquivo não existir, o botão e a capa não aparecem.

## Foto da capa

A foto do Noah (Homem-Aranha em pose de ação) aparece na capa acima do botão "Abrir convite" e no topo, ao lado do nome. Arquivos:
`public/assets/images/noah-spider.webp` (grande) e `noah-spider-s.webp` (menor, para o topo). Para trocar, gere duas versões com fundo transparente
com esses nomes, ou mude o `src` no `index.html` (procure `cover__photo` e `noah-top`).

## Super-heróis

Ficam em `public/assets/heroes/*.webp` (fundo transparente), ao fundo: cada um espia por trás de um bloco da página
(Homem-Aranha na faixa "Você está convidado!"; Homem de Ferro, Hulk e Batman nas laterais dos cards, alternando os lados; Capitão no balão de confirmação; Thor no mapa; Pantera no rodapé). Nunca cobrem texto. Para trocar um herói, coloque a nova imagem em
`tools/heroes-originais/<nome>.png` (nomes: `spiderman`, `ironman`, `hulk`, `batman`, `captain`, `thor`, `panther`)
e rode `python tools/process-heroes.py` (remove o fundo e gera os `.webp`). Depois ajuste `width`/`height` da `<img>`
correspondente em `index.html` se a proporção mudar.

## Publicar

Envie **apenas** estes itens (Netlify, Vercel, Cloudflare Pages, GitHub Pages ou qualquer hospedagem estática):
`index.html`, `styles.css`, `script.js`, `config.js` e a pasta `public/`. A pasta `tools/` é só de desenvolvimento.
Para a **prévia no WhatsApp**, em `index.html` troque o `og:image` pelo endereço completo da imagem publicada, por exemplo
`https://seusite.com/public/assets/images/poster.jpg`.

## Publicar no GitHub Pages (passo a passo)

1. Suba **todos** os itens acima para a raiz do repositório (o arquivo `.nojekyll` também).
2. No GitHub: **Settings > Pages > Build and deployment > Deploy from a branch > main / (root)**.
3. Abra o endereço `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/` (não abra o `index.html` pela tela do repositório nem pelo
   "raw": ali o site não funciona).
4. Se atualizar e o celular mostrar a versão antiga, feche a aba e abra de novo (os arquivos levam `?v=14` para forçar a atualização;
   ao mudar algo, aumente esse número no `index.html`).
5. **Diagnóstico:** acrescente `?debug` ao endereço (ex.: `.../repo/?debug`) para ver na tela qualquer erro de JavaScript.

## Estrutura

```
index.html  styles.css  script.js  config.js  ASSETS-SOURCES.md
public/assets/{heroes,video,audio,images,fonts}/
tools/   serve.py · process-heroes.py · make-poster.py · render-heroes/ (heróis 3D alternativos) · *-original/ (backups)
```

## Licenças

Veja **ASSETS-SOURCES.md**. Personagens, vídeo e música são de terceiros (Disney/Marvel/DC); use somente de forma privada.
