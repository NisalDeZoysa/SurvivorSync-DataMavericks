# # Base image
# FROM python:3.11-slim

# # Set environment variables
# ENV PYTHONUNBUFFERED=1 \
#     PYTHONDONTWRITEBYTECODE=1

# # Set working directory
# WORKDIR /app

# # Copy requirements first for caching
# COPY requirements.txt .

# # Install dependencies
# RUN pip install --no-cache-dir --upgrade pip && \
#     pip install --no-cache-dir -r requirements.txt

# # Copy the entire project
# COPY . .

# # Expose port
# EXPOSE 8000

# # Set environment variables for FastAPI/uvicorn
# ENV HOST=0.0.0.0
# ENV PORT=8000

# # Command to run the FastAPI server
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]


# Use official Python image
FROM python:3.10-slim

# Set working directory inside container
WORKDIR /app

# Install system dependencies (needed for mysqlclient etc.)
RUN apt-get update && apt-get install -y \
    gcc \
    pkg-config \
    default-libmysqlclient-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all source code
COPY . .

# Expose FastAPI port
EXPOSE 8001

# Start FastAPI (main.py inside "app" folder, app object inside it)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]

