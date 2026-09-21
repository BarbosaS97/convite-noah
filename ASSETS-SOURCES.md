# Origem e licenças dos assets

> **Resumo honesto:** os sete super-heróis, o vídeo e a música são **materiais de terceiros (Marvel/Disney e DC/Warner)**
> fornecidos por você. Nenhum deles tem licença de uso livre. Para um convite **privado**, enviado a convidados
> (por exemplo, por WhatsApp), esse uso é comum e costuma ser tolerado, mas a licença **não** é verificável.
> Não publique o convite em anúncios, venda, monetização ou divulgação pública ampla sem autorização dos detentores.

## 1. Personagens (public/assets/heroes/)

| Personagem | Arquivo usado | URL de origem | Autor/criador | Licença | Observações |
|---|---|---|---|---|---|
| Homem-Aranha | `spiderman.webp` | **desconhecida** (arquivo fornecido pelo usuário) | desconhecido | **não verificada** | Arte de fã (chibi). Personagem: marca Marvel/Disney. Fundo (xadrez) removido. |
| Homem de Ferro | `ironman.webp` | **desconhecida** (fornecido pelo usuário) | desconhecido | **não verificada** | Arte de fã com contorno de adesivo. Contém um logotipo "MARVEL" pequeno no pé, mantido como veio. Fundo removido. |
| Hulk | `hulk.webp` | **desconhecida** (fornecido pelo usuário) | desconhecido (há assinatura do artista no canto inferior esquerdo) | **não verificada** | Fundo cinza e sombra no chão removidos; assinatura mantida. |
| Batman | `batman.webp` | **desconhecida** (fornecido pelo usuário) | desconhecido (há assinatura do artista perto da capa) | **não verificada** | Personagem: marca DC/Warner Bros. Fundo (xadrez) removido; assinatura mantida. |
| Capitão América | `captain.webp` | **desconhecida** (fornecido pelo usuário) | desconhecido | **não verificada** | Fundo removido. Recebe brilho/contorno via CSS para não sumir no fundo azul-marinho. |
| Thor | `thor.webp` | **desconhecida** (fornecido pelo usuário) | desconhecido | **não verificada** | Fundo (xadrez) removido. |
| Pantera Negra | `panther.webp` | **desconhecida** (fornecido pelo usuário) | desconhecido | **não verificada** | Fundo (xadrez) removido. Recebe brilho/contorno via CSS. |

Os originais (antes do recorte) estão guardados em `tools/heroes-originais/`. O recorte é refeito com
`python tools/process-heroes.py`.

### O que a pesquisa encontrou (e por que não foi usado)

Foram feitas buscas por "chibi 3D PNG transparent" para os sete personagens. Resultado:

- **Sites agregadores de PNG** (CleanPNG, TopPNG, NicePNG, PNGkey, ImgBin, PNGitem, etc.): declaram apenas
  "Free for personal use", o envio é feito por usuários anônimos (não pelo artista) e o estilo varia de 2D a 3D entre
  personagens. Não há licença que permita reutilização. Exemplos:
  <https://toppng.com/freepng/501388/3d-chibi-captain-america-with-shield-png> (uploader "John3", "Free for personal use") e
  <https://www.cleanpng.com/png-chibi-spider-man-character-illustration-8409831/> (2D, sem termos claros).
- **Sketchfab** tem modelos 3D chibi com **CC BY** apenas do Homem-Aranha
  (<https://sketchfab.com/3d-models/spiderman-chibi-character-low-poly-758dc9682f954cf18251077dec25f17d>,
  <https://sketchfab.com/3d-models/chibi-spider-man-animated-3d-model-f36475ae771d40268c63cfd1cad21706>),
  e o download exige login. Não há um conjunto dos sete no mesmo estilo.
- Nenhuma fonte reunia os sete com licença clara. Por isso foram usadas as imagens que você forneceu.

### Alternativa própria (não usada no site)

Foi criado um conjunto **original** dos sete heróis em 3D (renderizados com three.js, MIT) em
`tools/render-heroes/`. Os PNGs ficam em `tools/render-heroes/out/`. Como arte, é minha (sem terceiros), mas os
personagens continuam sendo marcas Marvel/DC. Para usá-los, copie o WebP gerado em `public/assets/heroes/`.

## 2. Vídeo (public/assets/video/aniversario.mp4)

- **Origem:** trecho de vídeo promocional da Disney Junior ("Marvel Spidey and His Amazing Friends" / "Spidey e Iron Man:
  Avengers Team-Up!"), baixado por você do TikTok @disneyjr (arquivo original `ssstik.io_@disneyjr_…`).
- **Autor/detentor:** Disney / Marvel. **Licença:** todos os direitos reservados (não verificável).
- **Edição:** cortado de 1,1 s a 23,7 s (remove o início e o cartão final "Disney+"), *fade* de 0,35 s nas pontas,
  **áudio removido** e recompressão (H.264, 576×1024). O original está em `tools/video-original/`.

## 3. Música (public/assets/audio/musica.mp3)

- **Origem:** tema de abertura de "Spidey e Seus Amigos Espetaculares" (arquivo fornecido por você, veio do YouTube).
- **Autor/detentor:** Disney / Marvel. **Licença:** todos os direitos reservados (não verificável).
- **Edição:** MP3 128 kbps com *fade* de entrada e saída; o original está em `tools/audio-original/`.

## 4. Fontes (embutidas em styles.css; cópias em public/assets/fonts/)

| Fonte | Autor | Licença | Origem |
|---|---|---|---|
| Luckiest Guy | Astigmatic | SIL Open Font License 1.1 | <https://fonts.google.com/specimen/Luckiest+Guy> |
| Baloo 2 | Ek Type | SIL Open Font License 1.1 | <https://fonts.google.com/specimen/Baloo+2> |

## 5. Demais itens

- Ícones (calendário, relógio, mapa, alto-falante, WhatsApp, etc.) e o mapa são **SVG desenhados neste projeto**
  (o ícone do WhatsApp é uma silhueta genérica; a marca WhatsApp pertence à Meta).
- Pôster do vídeo (`public/assets/images/poster*.webp/.jpg`): gerado a partir do próprio convite
  (`tools/make-poster.py`) e de um quadro do vídeo.
- three.js r160 (`tools/render-heroes/vendor/`): MIT, usado só para gerar as imagens alternativas; não vai para o site.
