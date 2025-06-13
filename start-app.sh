#!/bin/bash

echo "🟢 Iniciando aplicación completa..."

PROJECT_DIR="/home/ubuntu/ElectronicaInf"

# FRONTEND
echo "▶️ Iniciando frontend React..."
cd "$PROJECT_DIR/frontend"
npm start &

# BACKEND
echo "▶️ Iniciando backend Node.js..."
cd "$PROJECT_DIR/backend"
node index.prod.js &

# MQTT Listener (dentro de backend/MQTT)
echo "▶️ Iniciando listener MQTT..."
cd "$PROJECT_DIR/backend/MQTT"
node MQTT_Image_Listener.js &

echo "✅ Todos los servicios fueron lanzados."
