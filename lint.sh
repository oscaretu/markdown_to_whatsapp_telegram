#!/bin/bash

# Script para ejecutar los mismos linters que el CI/CD localmente
# Ejecuta este script antes de hacer git push para detectar errores

echo "🔍 Ejecutando linters localmente..."
echo ""

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

echo "📦 Instalando dependencias locales..."
npm install

echo ""
echo "📝 Lint HTML..."
npx htmlhint index.html --config .htmlhintrc || echo "⚠️  Errores en HTML encontrados"

echo ""
echo "🎨 Lint CSS..."
npx stylelint "style.css" --config .stylelintrc || echo "⚠️  Errores en CSS encontrados"

echo ""
echo "💻 Lint JavaScript..."
npx eslint script.js || echo "⚠️  Errores en JavaScript encontrados"

echo ""
echo "✅ Comprobaciones completadas"
echo "📌 Revisa los resultados antes de hacer git push"
