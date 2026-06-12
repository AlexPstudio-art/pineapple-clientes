# Pineapple Clientes — repo Vercel

Área pública de clientes de Pineapple Studio. El OS interno (pineapple-os.html) NUNCA va aquí.

## Setup inicial (una sola vez, ~5 min)
```bash
git init && git add -A && git commit -m "pineapple clientes v1"
# crea repo vacío en GitHub (privado está bien) y:
git remote add origin git@github.com:TUUSUARIO/pineapple-clientes.git
git push -u origin main
```
Luego en vercel.com → **Add New Project** → importa el repo → Deploy (sin configurar nada, es estático).
Opcional recomendado: en Settings → Domains agrega **clientes.pstudio.com.mx**.

> Alternativa si prefieres el MISMO dominio: copia la carpeta `clientes/`, `robots.txt` y los `headers` de `vercel.json` dentro de tu proyecto actual de pstudio.com.mx y haz push ahí.

## Flujo por cliente nuevo
```bash
./nuevo-cliente.sh alma-grande     # crea clientes/alma-grande-k3x9/brief.html
git add -A && git commit -m "cliente alma" && git push   # live en ~30s
```
Manda el link con prefill: `.../clientes/alma-grande-k3x9/brief?c=Alma%20Grande&i=Bebidas`

## Cuando cotices
Exporta la propuesta desde tu Cotizador → guárdala como `propuesta.html` en la carpeta del cliente → push.
El cliente la abre y descarga su PDF con el botón flotante.

## Activar envío directo del brief a tu correo (opcional)
1. formspree.io → New Form → copia el ID
2. Edita `clientes/_plantilla/brief.html`: `const FORMSPREE_ID = "tuID";`
3. Los clientes nuevos ya lo traerán. Sin esto, el botón Enviar descarga el JSON y el cliente te lo manda por WhatsApp.

## Privacidad
- `robots.txt` + header `X-Robots-Tag: noindex` en todo `/clientes/*`
- URLs con token aleatorio. Para revocar acceso: borra la carpeta y push.
