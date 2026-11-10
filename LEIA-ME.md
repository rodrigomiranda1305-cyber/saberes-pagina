# Página de vendas: como mexer

| Quero mudar | Onde |
|---|---|
| Texto da página (títulos, parágrafos, perguntas) | `fonte/pagina.html`, depois rodar `python fonte/montar.py` |
| Preço, link do checkout, dias de garantia, e-mail de suporte | `fonte/oferta.json`, depois rodar `python fonte/montar.py` |
| Depoimentos, fotos de antes e depois, bônus que faltam | `dados.js` (não precisa rodar nada) |
| Prazo do contador regressivo | `dados.js`: `prazo` e `prazoTexto` (sem prazo verdadeiro, o contador fica escondido) |
| Clarity, pixel da Utmify, destino dos eventos | `dados.js`: bloco `rastreio` |
| Cores e letras | `estilo.css`, depois rodar `python fonte/montar.py` |
| Imagens | pasta `img/` (WebP). Mantenha o mesmo nome do arquivo ou troque no `fonte/pagina.html` |
| Termos de uso e privacidade | `termos/` e `privacidade/` |

- `index.html` é gerado pelo `montar.py`: não editar à mão.
- `pagina.js` é o mesmo nas 4 páginas (botão fixo, contador, depoimentos, medição). Não precisa mexer.
- Ver os espaços reservados: abrir a página com `?revisao=1` no fim do endereço. Eles não aparecem para o comprador.
- O script de UTMs da Utmify fica no `<head>` de `fonte/pagina.html`, igual ao das páginas antigas. Ele acrescenta as UTMs em todos os links do checkout.
- O `montar.py` confere sozinho: um checkout só, preço igual em todos os lugares e nenhum travessão no texto.
