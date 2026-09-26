#!/bin/bash
# Dê dois cliques neste arquivo no Mac para ligar o Ateliê.
cd "$(dirname "$0")"
exec python3 servidor.py 8080
