FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY api/anomaly/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY api/anomaly ./

EXPOSE 4002

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "4002"]
