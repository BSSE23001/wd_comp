FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# WeasyPrint needs these system libraries at runtime.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf-2.0-0 \
    libffi8 \
    shared-mime-info \
    fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

COPY api/certificate/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY api/certificate ./

EXPOSE 4003

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "4003"]
