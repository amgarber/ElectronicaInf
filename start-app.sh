#!/bin/bash

echo "🟢 Iniciando aplicación completa..."

# Ruta absoluta al proyecto
PROJECT_DIR="/home/ubuntu/ElectronicaInf"

# FRONTEND (React)
echo "▶️ Iniciando frontend React..."
cd "$PROJECT_DIR/frontend"
npm start &

# BACKEND (Node.js API)
echo "▶️ Iniciando backend Node.js..."
cd "$PROJECT_DIR/backend"
node index.prod.js &

# MQTT Listener
echo "▶️ Iniciando listener MQTT..."
cd "$PROJECT_DIR/mqtt"
node MQTT_Image_Listener.js &

echo "✅ Todos los servicios fueron lanzados."
