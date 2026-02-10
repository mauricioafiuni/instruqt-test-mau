#!/bin/bash

# Update system
yum update -y

# Install Docker
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install AWS CLI
yum install -y aws-cli

# Install docker-compose
curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create application directory
mkdir -p /opt/invisimart
cd /opt/invisimart || exit 1

# Create docker-compose.yml
cat > docker-compose.yml << EOF
version: '3.8'

services:
  db:
    image: ${database_image}
    environment:
      POSTGRES_USER: ${db_user}
      POSTGRES_PASSWORD: ${db_password}
      POSTGRES_DB: ${db_name}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${db_user} -d ${db_name}"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    image: ${api_image}
    ports:
      - "8080:8080"
    environment:
      PORT: 8080
      DB_HOST: db
      DB_PORT: 5432
      DB_NAME: ${db_name}
      DB_USER: ${db_user}
      DB_PASSWORD: ${db_password}
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  inventory:
    image: ${inventory_image}
    environment:
      PURCHASE_INTERVAL: 2s
      RESTOCK_INTERVAL: 10s
      DB_HOST: db
      DB_PORT: 5432
      DB_NAME: ${db_name}
      DB_USER: ${db_user}
      DB_PASSWORD: ${db_password}
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    image: ${frontend_image}
    ports:
      - "80:3000" # Map host port 80 to container port 3000
    environment:
      # Use ALB FQDN or instance public IP for API_URL since frontend JavaScript runs in browser
      API_URL: ${api_url}
      NODE_ENV: production
    depends_on:
      - api
    restart: unless-stopped

volumes:
  postgres_data:
EOF

if [ "${api_url}" == "NOT_SET_USE_PUBLIC_IP_IN_USER_DATA" ]; then
  # Use EC2 metadata to get public IP at container startup
  public_ip=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
  sed -i.bak "s|API_URL: ${api_url}|API_URL: \"http://$public_ip:8080\"|" docker-compose.yml
fi

# Start the application stack
docker-compose up -d

# Create a systemd service to manage the stack
cat > /etc/systemd/system/invisimart.service << EOF
[Unit]
Description=Invisimart Application Stack
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=true
WorkingDirectory=/opt/invisimart
ExecStartPre=/usr/bin/bash -c 'docker login -u AWS -p $(aws ecr get-login-password --region ${aws_region}) ${container_registry}'
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable the service
systemctl enable invisimart.service

# Create health check script
cat > /opt/invisimart/health-check.sh << 'EOF'
#!/bin/bash
curl -f http://localhost:80 >/dev/null 2>&1 && curl -f http://localhost:8080/health >/dev/null 2>&1
EOF

chmod +x /opt/invisimart/health-check.sh

# Signal completion
echo "Invisimart setup completed at $(date)" > /opt/invisimart/setup-complete.log
