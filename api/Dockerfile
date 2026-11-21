FROM python:3.12.8-slim-bookworm@sha256:2199a62885a12290dc9c5be3ca0681d367576ab7bf037da120e564723292a2f0

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    YONOSE_DATA_DIR=/data

COPY requirements.txt requirements.lock ./
# Prefer full lock when present so transitive deps stay pinned.
RUN pip install --no-cache-dir -r requirements.lock

COPY app ./app

RUN mkdir -p /data
VOLUME ["/data"]

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
