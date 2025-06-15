#!/bin/bash

echo "🟢 Iniciando aplicación completa..."

PROJECT_DIR="/home/ubuntu/ElectronicaInf"
LOG_DIR="$PROJECT_DIR/logs"

mkdir -p "$LOG_DIR"

# FRONTEND
echo "▶️ Iniciando frontend React..."
cd "$PROJECT_DIR/frontend"
npm start > "$LOG_DIR/frontend.log" 2>&1 &

# BACKEND
echo "▶️ Iniciando backend Node.js..."
cd "$PROJECT_DIR/backend"
node index.prod.js > "$LOG_DIR/backend.log" 2>&1 &

# MQTT Listener
echo "▶️ Iniciando listener MQTT..."
cd "$PROJECT_DIR/backend/MQTT"
node MQTT_Image_Listener.js > "$LOG_DIR/mqtt.log" 2>&1 &

echo "✅ Todos los servicios fueron lanzados."
echo "📡 Mostrando logs combinados (Ctrl+C para salir)..."
tail -f "$LOG_DIR"/*.log
