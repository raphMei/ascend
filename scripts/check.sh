#!/bin/sh
# Vérifie la syntaxe de tous les modules puis lance les tests (Node ≥ 20, aucune dépendance).
set -e
cd "$(dirname "$0")/.."
for f in $(find src tests -name '*.js'); do node --check "$f"; done
echo "Syntaxe OK"
node --test tests/*.test.js
