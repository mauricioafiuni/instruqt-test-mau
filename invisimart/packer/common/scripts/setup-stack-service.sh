#!/bin/bash
set -e

echo "Setting up docker-compose stack systemd configuration..."

# Create systemd service for the complete stack
sudo tee /etc/systemd/system/invisimart-stack.service << 'EOF'
[Unit]
Description=Invisimart Complete Stack
Requires=docker.service ecr-login.service
After=docker.service ecr-login.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/invisimart
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=300
TimeoutStopSec=120

[Install]
WantedBy=multi-user.target
EOF

# Create startup script
sudo tee /opt/invisimart/start-stack.sh << 'EOF'
#!/bin/bash
# Start complete Invisimart stack
echo 'Starting Invisimart complete stack...'
sudo systemctl start ecr-login
sleep 5
sudo systemctl start invisimart-stack
echo 'Stack starting... Check status with: docker-compose ps'
EOF

# Create stop script
sudo tee /opt/invisimart/stop-stack.sh << 'EOF'
#!/bin/bash
# Stop complete Invisimart stack
echo 'Stopping Invisimart complete stack...'
sudo systemctl stop invisimart-stack
echo 'Stack stopped.'
EOF

# Create status script
sudo tee /opt/invisimart/status.sh << 'EOF'
#!/bin/bash
# Check Invisimart stack status
echo '=== Systemd Services ==='
sudo systemctl status ecr-login.service --no-pager -l
sudo systemctl status invisimart-stack.service --no-pager -l
echo ''
echo '=== Docker Containers ==='
cd /opt/invisimart && docker-compose ps
echo ''
echo '=== Application URLs ==='
echo 'Frontend: http://localhost:8000'
echo 'API: http://localhost:8080'
EOF

# Make scripts executable
sudo chmod +x /opt/invisimart/*.sh

# Enable the service
sudo systemctl daemon-reload
sudo systemctl enable invisimart-stack.service

echo "Docker-compose stack configuration completed."
