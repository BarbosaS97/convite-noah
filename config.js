/* ==========================================================================
   CONFIGURAÇÃO DO CONVITE  —  é AQUI que você edita as informações da festa.
   Salve o arquivo e recarregue a página. Não precisa mexer em mais nada.
   ========================================================================== */
window.CONVITE = {

  /* ---- INFORMAÇÕES DA FESTA (cards "DATA / HORÁRIO / LOCAL") ---- */
  data:    'DATA A DEFINIR',      // ex.: 'Sábado, 15 de novembro'
  horario: 'HORÁRIO A DEFINIR',   // ex.: '15h às 19h'
  local:   'LOCAL A DEFINIR',     // ex.: 'Buffet Mundo Kids — Rua das Flores, 123'

  /* ---- CONTAGEM REGRESSIVA (opcional) ----
     Preencha com data e hora da festa para exibir "Faltam X dias…" no topo. Deixe '' para ocultar.
     Formato: 'AAAA-MM-DDTHH:MM:SS-03:00'   ex.: '2026-11-15T15:00:00-03:00'  */
  dataISO: '',

  /* ---- CONFIRMAÇÃO DE PRESENÇA (botão "CONFIRMAR PRESENÇA") ----
     Cole o link completo do WhatsApp. Formato: https://wa.me/55DDDNUMERO?text=MENSAGEM
     Exemplo:  https://wa.me/5511999999999?text=Oi!%20Confirmo%20presen%C3%A7a%20no%20anivers%C3%A1rio%20do%20Noah!  */
  whatsappLink: 'WHATSAPP_LINK_AQUI',

  /* ---- LOCALIZAÇÃO (bloco do mapa e botão "VER LOCALIZAÇÃO") ---- */
  localizacaoTexto: 'LOCALIZAÇÃO_AQUI',  // texto/endereço exibido no bloco do mapa
  localizacaoUrl:   'LOCALIZAÇÃO_AQUI',  // link do Google Maps / Waze (https://...)
  mapaEmbedUrl:     '',                  // OPCIONAL: URL "incorporar mapa" do Google Maps (https://www.google.com/maps/embed?...)

  /* ---- CAPA DE ENTRADA ----
     true  = se o navegador bloquear o som automático, aparece a capa "ABRIR CONVITE": 1 toque abre o convite e já toca a música.
     false = sem capa (a música começa no primeiro toque/clique do visitante).  */
  capaDeEntrada: true,

  /* ---- MÍDIA ---- */
  video:  'public/assets/video/aniversario.mp4',  // <- COLOQUE SEU VÍDEO NESTE CAMINHO (ou mude o nome aqui)
  musica: 'public/assets/audio/musica.mp3',       // única fonte de som do convite (o vídeo é mudo). Toca ao abrir/primeiro toque; botão "Música" liga/desliga
};
