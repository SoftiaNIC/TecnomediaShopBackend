# Etapa de construcción
FROM node:18-alpine AS builder

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar fuentes
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:18-alpine

WORKDIR /app

# Instalar solo dependencias de producción
COPY package*.json ./
RUN npm ci --only=production

# Copiar solo lo necesario
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Puerto expuesto
EXPOSE 3000

# Comando de inicio
CMD ["npm", "run", "start:prod"]