/* DADOS EDITÁVEIS DA PÁGINA (Livro dos Saberes Esquecidos)
   Enquanto uma lista estiver vazia, a seção dela fica escondida para o comprador.
   Para ver os espaços reservados, abra a página com ?revisao=1 no fim do endereço.
   Preço, checkout, garantia e e-mail de suporte ficam em fonte/oferta.json (depois rodar fonte/montar.py). */
window.OFERTA = {
  id: 'saberes',

  // Contador regressivo: só com prazo verdadeiro. Exemplo de Natal: prazo: '2026-12-24T23:59:00-03:00'
  prazo: null,
  prazoTexto: '',

  // Depoimentos reais, só com autorização do cliente.
  depoimentos: [
    // { tipo: 'texto', nome: 'Primeiro nome, cidade', texto: 'O que a pessoa disse.', autorizado: true },
  ],

  // Fotos reais de clientes (o sabão, a conserva, a lista na geladeira), só com autorização.
  antesDepois: [],

  // Os 3 presentes já existem, então fica vazio.
  bonusExtras: [],

  rastreio: {
    clarity: 'zaqr8nuoo0',  // mesmo projeto do Clarity da página antiga do Saberes
    utmifyPixel: null,      // ID do pixel na Utmify (falta cadastrar). Pixel Meta do Saberes: 1176485891884913.
    endpoint: null,
    mascarar: false
  }
};
