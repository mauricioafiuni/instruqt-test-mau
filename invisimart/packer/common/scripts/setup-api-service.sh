#!/bin/bash
set -e

echo "Setting up API service systemd configuration..."

# Create systemd service for API
sudo tee /etc/systemd/system/invisimart-api.service << 'EOF'
[Unit]
Description=Invisimart API Service
Requires=docker.service ecr-login.service
After=docker.service ecr-login.service

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStartPre=/usr/bin/docker pull ${CONTAINER_IMAGE}
ExecStart=/usr/bin/docker run -d \
    --name invisimart-api \
    --restart unless-stopped \
    -p 8080:8080 \
    -e DB_HOST=${DB_HOST:-localhost} \
    -e DB_PORT=${DB_PORT:-5432} \
    -e DB_USER=${DB_USER:-invisimart} \
    -e DB_PASSWORD=${DB_PASSWORD:-invisimartpass} \
    -e DB_NAME=${DB_NAME:-invisimartdb} \
    ${CONTAINER_IMAGE}
ExecStop=/usr/bin/docker stop invisimart-api
ExecStopPost=/usr/bin/docker rm -f invisimart-api
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Create startup script
sudo tee /opt/invisimart/start-api.sh << 'EOF'
#!/bin/bash
# Start Invisimart API service
sudo systemctl start ecr-login
sudo systemctl start invisimart-api
EOF

sudo chmod +x /opt/invisimart/start-api.sh

# Enable the service
sudo systemctl daemon-reload
sudo systemctl enable invisimart-api.service

echo "API service configuration completed."
