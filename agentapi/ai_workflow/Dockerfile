# Use official Python image
FROM python:3.10-slim

# Set working directory inside container
WORKDIR /ai_workflow

# Install system dependencies (needed for mysqlclient etc.)
RUN apt-get update && apt-get install -y \
    gcc \
    pkg-config \
    default-libmysqlclient-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all source code
COPY . .

# Expose FastAPI port
EXPOSE 8001

# Start FastAPI (main.py inside "app" folder, app object inside it)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]

