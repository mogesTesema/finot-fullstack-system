# Use official Python image
FROM python:3.13-slim


WORKDIR /app


RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*



RUN pip install --upgrade pip && pip install uv

COPY pyproject.toml uv.lock /app/
RUN uv pip install --system --no-cache-dir -e .
COPY . /app/


EXPOSE 8000


CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:$PORT", "--workers", "3"]