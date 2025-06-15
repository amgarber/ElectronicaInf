#!/bin/bash

echo "🟢 Iniciando aplicación completa..."

PROJECT_DIR="/home/ubuntu/ElectronicaInf"
LOG_DIR="$PROJECT_DIR/logs"

# Crear carpeta de logs si no existe
mkdir -p "$LOG_DIR"

# Crear archivos vacíos para evitar errores de tail
touch "$LOG_DIR/frontend.log" "$LOG_DIR/backend.log" "$LOG_DIR/mqtt.log"

# FRONTEND
echo "▶️ Iniciando frontend React..."
cd "$PROJECT_DIR/frontend"
npm start > "$LOG_DIR/frontend.log" 2>&1 &

# BACKEND
echo "▶️ Iniciando backend Node.js..."
cd "$PROJECT_DIR/backend"
node index.prod.js > "$LOG_DIR/backend.log" 2>&1 &

# MQTT LISTENER
echo "▶️ Iniciando listener MQTT..."
cd "$PROJECT_DIR/backend/MQTT"
node MQTT_Image_Listener.js > "$LOG_DIR/mqtt.log" 2>&1 &

echo "✅ Todos los servicios fueron lanzados."
echo "📡 Mostrando logs combinados (Ctrl+C para salir)..."

# Mostrar todos los logs en vivo
tail -F "$LOG_DIR"/*.log
