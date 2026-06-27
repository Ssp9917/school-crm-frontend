# #!/usr/bin/env bash
# # Build with the DEV API base URL and deploy the frontend to the EC2 host.
# set -euo pipefail

# PEM="/Users/rajesh/Documents/bellator/fitclub-new-crm.pem"
# HOST="ec2-user@13.232.199.92"
# API_URL="https://school-crm-backend-smoky.vercel.app/api"
# REMOTE_DIR="/var/www/fitclub-development"          # development.crm-fitclub.in
# STAGING="/home/ec2-user/temp-build-development"

# echo "🏗️  Building (dev → $API_URL) …"
# VITE_API_BASE_URL="$API_URL" npm run build

# echo "🚀 Deploying to $HOST:$REMOTE_DIR …"
# ssh -i "$PEM" "$HOST" "mkdir -p $STAGING && rm -rf $STAGING/*"
# scp -i "$PEM" -r build/* "$HOST":"$STAGING"/ \
#   && ssh -i "$PEM" "$HOST" "sudo rm -rf $REMOTE_DIR/* && sudo cp -r $STAGING/* $REMOTE_DIR/ && sudo chown -R nginx:nginx $REMOTE_DIR && sudo chmod -R 755 $REMOTE_DIR"

# echo "✅ Dev deploy complete."
# # ./deploy-dev.sh
