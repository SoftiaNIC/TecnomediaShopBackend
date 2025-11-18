# Etapa de construcción
FROM node:22-alpine AS builder

WORKDIR /app

# 1. Copiar solo los archivos necesarios para instalar dependencias
COPY package*.json ./
COPY tsconfig*.json ./

# 2. Instalar dependencias
RUN npm ci

# 3. Copiar el resto del código
COPY . .

# 4. Construir la aplicación
RUN npm run build

# 5. Verificar la estructura generada
RUN ls -la /app/dist

# Etapa de producción
FROM node:22-alpine

WORKDIR /app

# 1. Copiar package.json
COPY package*.json ./

# 2. Instalar solo dependencias de producción
RUN npm ci --only=production

# 3. Copiar archivos construidos
COPY --from=builder /app/dist ./dist

# 4. Exponer el puerto
EXPOSE 3000

# 5. Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# 6. Comando de inicio
CMD ["node", "dist/main"]