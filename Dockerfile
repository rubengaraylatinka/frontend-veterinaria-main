FROM python:3.9-slim
WORKDIR /app
COPY . .
# Sirve el contenido del directorio actual en el puerto 8080
CMD ["python", "-m", "http.server", "8080"]