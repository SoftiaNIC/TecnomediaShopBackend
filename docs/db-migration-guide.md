# Guía de Migración de Base de Datos PostgreSQL

Esta guía detalla los pasos para cambiar las credenciales de la base de datos PostgreSQL y migrar los datos de forma segura.

## ⚠️ Importante

- **Realizar en horas de baja concurrencia**
- **Hacer backup ANTES de cualquier cambio**
- **Verificar que el backup sea válido antes de proceder**

---

## 📋 Nuevas Credenciales

| Campo | Valor |
|-------|-------|
| Usuario | `tecnomediadbuser` |
| Contraseña | `Xk9$mP2vL@7nQ4wR#8jF5sY3hB6cT0aE&9dG1iU2oA4pZ` |
| Base de datos | `ecommerce_db` |

---

## 🔄 Proceso de Migración

### Paso 1: Verificar estado actual

```bash
# Verificar que el contenedor está corriendo
docker ps | grep db

# Verificar el nombre exacto del contenedor
docker ps --format "table {{.Names}}\t{{.Status}}" | grep db
```

### Paso 2: Crear backup de la base de datos

```bash
# Crear backup completo
docker exec tecnomediashopbackend-db-1 pg_dump -U postgres ecommerce_db > backup_ecommerce_$(date +%Y%m%d_%H%M%S).sql

# Verificar que el archivo se creó correctamente
ls -lh backup_ecommerce_*.sql

# Verificar contenido del backup (debe tener datos)
head -50 backup_ecommerce_*.sql
```

### Paso 3: Detener los contenedores

```bash
# Navegar al directorio del proyecto
cd /path/to/TecnomediaShopBackend

# Detener contenedores
docker-compose down
```

### Paso 4: Eliminar volumen de datos antiguo

```bash
# Listar volúmenes para confirmar nombre
docker volume ls | grep postgres

# Eliminar el volumen (ESTO BORRA LOS DATOS)
docker volume rm tecnomediashopbackend_postgres_data
```

### Paso 5: Levantar con nueva configuración

```bash
# Levantar contenedores (usará las nuevas credenciales)
docker-compose up -d

# Esperar a que PostgreSQL inicie completamente
sleep 10

# Verificar que los contenedores están corriendo
docker ps
```

### Paso 6: Restaurar backup

```bash
# Restaurar la base de datos
docker exec -i tecnomediashopbackend-db-1 psql -U tecnomediadbuser -d ecommerce_db < backup_ecommerce_YYYYMMDD_HHMMSS.sql

# Verificar que los datos se restauraron
docker exec tecnomediashopbackend-db-1 psql -U tecnomediadbuser -d ecommerce_db -c "SELECT COUNT(*) FROM products;"
```

### Paso 7: Verificar funcionamiento

```bash
# Probar conexión a la API
curl http://localhost:3000/health

# Ver logs de la aplicación
docker-compose logs -f api
```

---

## 🔐 Conexión Remota vía SSH Tunnel

### Establecer túnel SSH

```bash
# Desde tu máquina local
ssh -L 5432:localhost:5432 usuario@IP_SERVIDOR
```

### Conectar con cliente de base de datos

Una vez establecido el túnel, usa estos parámetros en tu cliente SQL (DBeaver, pgAdmin, etc.):

| Parámetro | Valor |
|-----------|-------|
| **Host** | `localhost` |
| **Puerto** | `5432` |
| **Usuario** | `tecnomediadbuser` |
| **Contraseña** | `Xk9$mP2vL@7nQ4wR#8jF5sY3hB6cT0aE&9dG1iU2oA4pZ` |
| **Base de datos** | `ecommerce_db` |

---

## 🚨 Troubleshooting

### Error: "FATAL: password authentication failed"

```bash
# Verificar que el volumen se eliminó correctamente
docker volume ls | grep postgres

# Si el volumen persiste, forzar eliminación
docker volume rm -f tecnomediashopbackend_postgres_data
```

### Error: "relation does not exist"

El backup no se restauró correctamente. Verificar:

```bash
# Ver errores durante restauración
docker exec -i tecnomediashopbackend-db-1 psql -U tecnomediadbuser -d ecommerce_db < backup.sql 2>&1 | head -50
```

### Error: "connection refused" en SSH tunnel

1. Verificar que el túnel SSH está activo
2. Verificar que PostgreSQL está corriendo: `docker ps | grep db`
3. Verificar logs: `docker-compose logs db`

---

## ✅ Checklist Final

- [ ] Backup creado y verificado
- [ ] Contenedores detenidos
- [ ] Volumen eliminado
- [ ] Contenedores levantados con nuevas credenciales
- [ ] Backup restaurado
- [ ] API funcionando correctamente
- [ ] Conexión SSH tunnel probada
