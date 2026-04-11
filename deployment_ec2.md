# ☁️ Amazon EC2 Deployment Guide

This guide covers the "Lift and Shift" deployment of **Math Stumper** to an Amazon EC2 instance.

## 1. Launch EC2 Instance

1.  **AMI:** Select **Amazon Linux 2023** (Free Tier eligible).
2.  **Instance Type:** `t2.micro` or `t3.micro`.
3.  **Key Pair:** Create/Download a `.pem` file for SSH access.
4.  **Network Settings (Security Groups):** 
    -   Create a new Security Group.
    -   **Add Inbound Rules:**
        -   `SSH` (Port 22): Source `My IP`.
        -   `HTTP` (Port 80): Source `0.0.0.0/0`.
        -   `HTTPS` (Port 443): Source `0.0.0.0/0`.

## 2. Server Configuration

Connect to your instance:
```bash
ssh -i "your-key.pem" ec2-user@your-ec2-ip
```

### Install Docker
```bash
# Update system
sudo dnf update -y

# Install Docker
sudo dnf install docker -y
sudo systemctl start docker
sudo systemctl enable docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group (requires logout/login to take effect)
sudo usermod -aG docker ec2-user
```
*Logout and SSH back in to refresh permissions.*

## 3. Deployment

1.  **Clone Repository:**
    ```bash
    git clone https://github.com/your-username/django_math_stumper.git
    cd django_math_stumper
    ```

2.  **Configure Environment:**
    ```bash
    nano .env
    ```
    Paste your environment variables, including the essential **`ALLOWED_HOSTS`**:
    ```env
    GEMINI_API_KEY=your_key
    GEMINI_MODEL=gemini-flash-latest
    DEBUG=False
    ALLOWED_HOSTS=your-ec2-public-ip,your-domain.com
    ```

3.  **Start Platform:**
    ```bash
    docker-compose up -d --build
    ```

## 4. Key Considerations

> [!IMPORTANT]
> **Production Settings:** I have updated `App.js` to use relative paths (`/api`). This ensures your browser talks to the EC2 server instead of trying to hit `localhost`.
> 
> **Database Persistence:** The Docker setup uses a volume named `postgres_data`. This ensures your problem history survives container restarts.
> 
> **SSL (HTTPS):** For production, it is highly recommended to use **AWS Certificate Manager** with an **Application Load Balancer (ALB)**, or install **Certbot** inside the frontend container.

---
**Your app is now live at `http://your-ec2-public-ip`!**
