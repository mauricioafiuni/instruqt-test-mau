#!/bin/bash
set -e

echo "Setting up ECR authentication and base systemd configuration..."

# Create application directory
sudo mkdir -p /opt/invisimart

# Create ECR login helper script
cat << 'EOF' | sudo tee /opt/invisimart/ecr-login.sh
#!/bin/bash
# ECR login helper - gets token and logs into Docker
aws ecr get-login-password --region ${AWS_REGION:-us-west-2} | \
    docker login --username AWS --password-stdin ${ECR_REGISTRY}
EOF

sudo chmod +x /opt/invisimart/ecr-login.sh

# Create ECR login service
cat << 'EOF' | sudo tee /etc/systemd/system/ecr-login.service
[Unit]
Description=ECR Docker Login
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
ExecStart=/opt/invisimart/ecr-login.sh
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF

# Create ECR login timer (refresh every 11 hours - ECR tokens last 12 hours)
cat << 'EOF' | sudo tee /etc/systemd/system/ecr-login.timer
[Unit]
Description=ECR Login Timer
Requires=ecr-login.service

[Timer]
OnBootSec=5min
OnUnitActiveSec=11h

[Install]
WantedBy=timers.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable ecr-login.timer

echo "Base systemd configuration completed."
