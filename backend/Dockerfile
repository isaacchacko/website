FROM python:3.12-slim

WORKDIR /app

# install dependencies first (cached layer — only re-runs if requirements.txt changes)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy the rest of the backend code
COPY . .

# run uvicorn with hot reload, listening on all interfaces so Docker can expose the port
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3001", "--reload"]
