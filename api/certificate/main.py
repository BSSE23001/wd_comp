import os
from datetime import datetime
from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from weasyprint import HTML
from jinja2 import Environment, FileSystemLoader
import httpx
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

EARNINGS_SERVICE_URL = os.getenv("EARNINGS_SERVICE_URL", "http://localhost:4001")
INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY")

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.client = httpx.AsyncClient()
    yield
    await app.state.client.aclose()

app = FastAPI(
    title="FairGig Certificate Service",
    description="Generates verifiable PDF income certificates from validated gig data.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Jinja2 templating
env = Environment(loader=FileSystemLoader("templates"))

@app.get(
    "/api/certificate/generate",
    tags=["Worker Certificate"],
    summary="Generate a PDF Income Certificate",
    response_class=Response,
    responses={
        200: {
            "content": {"application/pdf": {}},
            "description": "Returns a binary PDF stream.",
        }
    }
)
async def generate_certificate(
    workerId: str = Query(..., description="The ID of the worker requesting the certificate"),
    startDate: str = Query(..., description="Start date (YYYY-MM-DD)"),
    endDate: str = Query(..., description="End date (YYYY-MM-DD)")
):
    """
    1. Validates the request parameters.
    2. Calls the Earnings Service internal route to fetch ONLY VERIFIED logs for the date range.
    3. Injects data into an HTML template.
    4. Converts HTML to a PDF binary stream and returns it as a downloadable attachment.
    """
    headers = {"x-internal-api-key": INTERNAL_API_KEY}
    client: httpx.AsyncClient = app.state.client

    try:
        # Inter-Service Hop: Fetch Verified Logs
        res = await client.get(
            f"{EARNINGS_SERVICE_URL}/api/earnings/internal/logs/{workerId}/verified",
            params={"startDate": startDate, "endDate": endDate},
            headers=headers
        )
        res.raise_for_status()
        logs = res.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail="Failed to fetch verified logs from Earnings Service.")

    if not logs:
        raise HTTPException(status_code=404, detail="No verified logs found for this date range.")

    # Calculate Aggregates
    total_net = sum(log['netReceived'] for log in logs)
    total_hours = sum(log['hoursWorked'] for log in logs)
    currency = logs[0].get('currency', 'PKR') if logs else 'PKR'

    # Render HTML Template
    template = env.get_template("certificate.html")
    html_out = template.render(
        worker_id=workerId,
        start_date=startDate,
        end_date=endDate,
        generated_on=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        logs=logs,
        total_net=f"{total_net:,.2f}",
        total_hours=f"{total_hours:,.1f}",
        log_count=len(logs),
        currency=currency
    )

    # Convert to PDF
    pdf_bytes = HTML(string=html_out).write_pdf()

    # Return as binary stream
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=FairGig_Income_{workerId}.pdf"
        }
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 4003))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)