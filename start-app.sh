#!/bin/bash

# Levantar Backend
cd ~/ElectronicaInf/backend
npm install
nohup npm start > backend.log 2>&1 &

# Levantar Frontend (ya debe estar compilado)
cd ~/ElectronicaInf/frontend
nohup serve -s build -l 3000 > frontend.log 2>&1 &

# Levantar Listener MQTT
cd ~/ElectronicaInf
nohup node mqtt_image_listener.js > mqtt.log 2>&1 &
