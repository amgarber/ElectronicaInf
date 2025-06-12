#!/bin/bash

# Levantar Backend
cd ~/ElectronicaInf/backend
nohup node index.prod.js > ../backend.log 2>&1 &

# Levantar Frontend en modo desarrollo (React Dev Server)
cd ~/ElectronicaInf/frontend
nohup npm start > ../frontend.log 2>&1 &

# Levantar Listener MQTT
cd ~/ElectronicaInf
nohup node mqtt_image_listener.js > mqtt.log 2>&1 &
