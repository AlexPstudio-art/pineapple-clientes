#!/bin/bash
# Uso: ./nuevo-cliente.sh nombre-cliente  →  crea clientes/nombre-cliente-{token}/brief.html
set -e
if [ -z "$1" ]; then echo "Uso: ./nuevo-cliente.sh nombre-cliente"; exit 1; fi
SLUG=$(echo "$1" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-')
TOKEN=$(LC_ALL=C tr -dc 'a-z0-9' < /dev/urandom | head -c 4)
DIR="clientes/${SLUG}-${TOKEN}"
mkdir -p "$DIR"
cp clientes/_plantilla/brief.html "$DIR/brief.html"
echo "✅ Carpeta creada: $DIR"
echo "🔗 Link para el cliente (tras hacer push):"
echo "   https://TU-DOMINIO/clientes/${SLUG}-${TOKEN}/brief?c=NOMBRE%20CLIENTE"
echo "📄 Cuando cotices: guarda la propuesta como $DIR/propuesta.html y haz push."
