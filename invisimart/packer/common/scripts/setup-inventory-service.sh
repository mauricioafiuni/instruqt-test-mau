#!/bin/bash
set -e

echo "Setting up Inventory service systemd configuration..."

# Create systemd service for Inventory simulator
sudo tee /etc/systemd/system/invisimart-inventory.service << 'EOF'
[Unit]
Description=Invisimart Inventory Simulator Service
Requires=docker.service ecr-login.service
After=docker.service ecr-login.service

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStartPre=/usr/bin/docker pull ${CONTAINER_IMAGE}
ExecStart=/usr/bin/docker run -d \
    --name invisimart-inventory \
    --restart unless-stopped \
    -e DB_HOST=${DB_HOST:-localhost} \
    -e DB_PORT=${DB_PORT:-5432} \
    -e DB_USER=${DB_USER:-invisimart} \
    -e DB_PASSWORD=${DB_PASSWORD:-invisimartpass} \
    -e DB_NAME=${DB_NAME:-invisimartdb} \
    -e PURCHASE_INTERVAL=${PURCHASE_INTERVAL:-2s} \
    -e RESTOCK_INTERVAL=${RESTOCK_INTERVAL:-10s} \
    ${CONTAINER_IMAGE}
ExecStop=/usr/bin/docker stop invisimart-inventory
ExecStopPost=/usr/bin/docker rm -f invisimart-inventory
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Create startup script
sudo tee /opt/invisimart/start-inventory.sh << 'EOF'
#!/bin/bash
# Start Invisimart Inventory service
sudo systemctl start ecr-login
sudo systemctl start invisimart-inventory
EOF

sudo chmod +x /opt/invisimart/start-inventory.sh

# Enable the service
sudo systemctl daemon-reload
sudo systemctl enable invisimart-inventory.service

echo "Inventory service configuration completed."
