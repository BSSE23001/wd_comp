import os
import httpx
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Header
from dotenv import load_dotenv

from schemas import AnalyzeRequest, AnomalyResult, TestRequest
from logic import detect_anomalies

load_dotenv()

EARNINGS_SERVICE_URL = os.getenv("EARNINGS_SERVICE_URL", "http://localhost:4001")
INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY")

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.client = httpx.AsyncClient()
    yield
    await app.state.client.aclose()

app = FastAPI(
    title="FairGig Anomaly Detection Service",
    description="Mathematical processing engine for gig worker earnings anomalies.",
    version="1.0.0",
    lifespan=lifespan
)

@app.post(
    "/api/anomaly/analyze", 
    response_model=AnomalyResult,
    tags=["Worker/System Actions"],
    summary="Analyze worker data for anomalies and flag if found"
)
async def analyze_worker_data(payload: AnalyzeRequest):
    """
    1. Fetches recent logs from the Earnings Service.
    2. Runs mathematical statistical checks.
    3. If an anomaly is found, posts a flag back to the Earnings Service.
    """
    headers = {"x-internal-api-key": INTERNAL_API_KEY}
    client: httpx.AsyncClient = app.state.client

    try:
        # Inter-Service Hop 1: Fetch Data
        res_logs = await client.get(
            f"{EARNINGS_SERVICE_URL}/api/earnings/internal/logs/{payload.workerId}",
            headers=headers
        )
        res_logs.raise_for_status()
        raw_logs = res_logs.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch logs from Earnings Service: {str(e)}")

    if not raw_logs:
        return AnomalyResult(hasAnomaly=False, explanation="No logs found for worker.")

    # Process Data
    analysis_result = detect_anomalies(raw_logs)

    # Inter-Service Hop 2: Save Flag if anomaly detected
    if analysis_result.hasAnomaly:
        try:
            await client.post(
                f"{EARNINGS_SERVICE_URL}/api/earnings/internal/flags",
                headers=headers,
                json={
                    "workerId": payload.workerId,
                    "type": analysis_result.type,
                    "explanation": analysis_result.explanation
                }
            )
        except httpx.HTTPError as e:
            # We log the error but still return the explanation to the frontend
            print(f"Failed to post flag: {e}")

    return analysis_result

@app.post(
    "/api/anomaly/test",
    response_model=AnomalyResult,
    tags=["Public/Judge Testing"],
    summary="Pure logic test endpoint (No Database/Network)"
)
async def test_anomaly_logic(payload: TestRequest):
    return detect_anomalies(payload.logs)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 4002))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)