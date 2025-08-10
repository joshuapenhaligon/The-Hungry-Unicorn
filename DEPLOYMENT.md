
# Deployment Guide

## Containers

### Build API image
```bash
# at API root
pip install -r requirements.txt
# create a simple Dockerfile (example)
# FROM python:3.11-slim
# WORKDIR /app
# COPY . /app
# RUN pip install --no-cache-dir -r requirements.txt
# EXPOSE 8547
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8547"]
docker build -t hungry-unicorn-api:latest .
```

### Build Frontend
```bash
cd restaurant-frontend
npm ci
npm run build
# dist/ → upload to S3 (or serve via Nginx container)
```

## AWS (reference)

- **Frontend:** S3 (static website) + CloudFront (CDN). Set cache headers and invalidations on deploy.
- **API:** ECS Fargate service behind an ALB.
- **DB:** Amazon RDS (Postgres). Apply migrations; import seed data via init job.
- **Secrets:** Store DB creds/JWT secrets in Secrets Manager.
- **TLS:** ACM certificates on ALB & CloudFront.
- **DNS:** Route 53 records to ALB and CloudFront.

## CI/CD (GitHub Actions sketch)

- On push to `main`:
  1. Frontend: `npm ci && npm run build` → upload `dist/` to S3, invalidate CF
  2. API: Build & push Docker to ECR; update ECS service

## Config at runtime

- API config via env vars: `DATABASE_URL`, `ALLOWED_ORIGINS`, `JWT_SECRET`, etc.
- Frontend config via `VITE_API_BASE` env var at build time.

## Cost (rough, small-scale)

- S3+CF: ~ $1–10/mo (low traffic) + bandwidth
- ECS Fargate (1–2 tasks): tens of $/mo
- RDS t4g.micro: ~ $15–30/mo + storage
- WAF optional: adds ~$5–$20/mo

Scale cost linearly with traffic.
