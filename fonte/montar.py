# Gera o index.html desta página a partir de fonte/pagina.html (texto) + fonte/oferta.json (preço, checkout, garantia, suporte).
# Uso: python montar.py   (rodar dentro da pasta fonte/ ou passar o caminho da pasta da página)
# Também confere: preço e checkout iguais em todos os lugares, nenhum {{CAMPO}} sobrando e nenhum travessão no texto.
import html, json, os, re, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
AQUI = os.path.dirname(os.path.abspath(__file__))
PAG = os.path.dirname(AQUI) if os.path.basename(AQUI) == 'fonte' else AQUI
F = os.path.join(PAG, 'fonte')
cfg = json.load(open(os.path.join(F, 'oferta.json'), encoding='utf-8'))
src = open(os.path.join(F, 'pagina.html'), encoding='utf-8').read()

css = ''
for nome in ('fontes.css', 'base.css', 'estilo.css'):
    p = os.path.join(F, nome) if nome != 'estilo.css' else os.path.join(PAG, 'estilo.css')
    if not os.path.exists(p): p = os.path.join(PAG, nome)
    if os.path.exists(p): css += open(p, encoding='utf-8').read() + '\n'
css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
css = re.sub(r'\s*\n\s*', '', css)

def troca(m):
    k = m.group(1)
    if k == 'CSS': return css
    if k not in cfg: raise SystemExit(f'campo {{{{{k}}}}} não existe em oferta.json')
    return html.escape(str(cfg[k]), quote=True)
out = re.sub(r'\{\{([A-Z_]+)\}\}', troca, src)

# conferências
erros = []
vis = re.sub(r'<(script|style)\b.*?</\1>', ' ', out, flags=re.S | re.I)
vis = re.sub(r'<[^>]+>', ' ', vis)
for ch, nome in (('—', 'travessão (—)'), ('–', 'meia-risca (–)')):
    if ch in vis:
        i = vis.index(ch); erros.append(f'{nome} no texto: "...{vis[max(0, i - 40):i + 40].strip()}..."')
cks = set(re.findall(r'https://pay\.wiapy\.com/[A-Za-z0-9_-]+', out))
if cks != {cfg['CHECKOUT']}: erros.append(f'checkouts diferentes na página: {cks}')
precos = set(re.findall(r'R\$\s?\d+(?:,\d\d)?', vis))
if precos - {cfg['PRECO'], cfg['PRECO'].replace(' ', ' ')} and not cfg.get('OUTROS_VALORES_OK'):
    erros.append(f'valores em reais além do preço: {precos}')
if '{{' in out: erros.append('sobrou {{CAMPO}} sem trocar')
open(os.path.join(PAG, 'index.html'), 'w', encoding='utf-8', newline='\n').write(out)
print('index.html gerado:', len(out), 'bytes;', len(re.findall(r'data-onde=', out)), 'botões de compra;', 'checkout', cfg['CHECKOUT'])
if erros:
    print('ATENÇÃO:'); [print(' -', e) for e in erros]; sys.exit(1)
print('conferência ok')
