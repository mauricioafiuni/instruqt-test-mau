#!/bin/bash
set -e

echo "Setting up Frontend service systemd configuration..."

# Create systemd service for Frontend
sudo tee /etc/systemd/system/invisimart-frontend.service << 'EOF'
[Unit]
Description=Invisimart Frontend Service
Requires=docker.service ecr-login.service
After=docker.service ecr-login.service

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStartPre=/usr/bin/docker pull ${CONTAINER_IMAGE}
ExecStart=/usr/bin/docker run -d \
    --name invisimart-frontend \
    --restart unless-stopped \
    -p ${FRONTEND_PORT:-3000}:3000 \
    -e API_URL=${API_URL:-http://localhost:8080} \
    ${CONTAINER_IMAGE}
ExecStop=/usr/bin/docker stop invisimart-frontend
ExecStopPost=/usr/bin/docker rm -f invisimart-frontend
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Create startup script
sudo tee /opt/invisimart/start-frontend.sh << 'EOF'
#!/bin/bash
# Start Invisimart Frontend service
sudo systemctl start ecr-login
sudo systemctl start invisimart-frontend
EOF

sudo chmod +x /opt/invisimart/start-frontend.sh

# Enable the service
sudo systemctl daemon-reload
sudo systemctl enable invisimart-frontend.service

echo "Frontend service configuration completed."
