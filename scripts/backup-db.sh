#!/bin/bash

# Configuration
BACKUP_DIR="/backups"
DB_NAME="Thanh Hương Storestore_db"
DB_USER="Thanh Hương Storestore"
DB_HOST="postgres"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_backup_${DATE}.sql.gz"
RETENTION_DAYS=7

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

echo "Starting database backup at $(date)"

# Export password for pg_dump to run non-interactively
export PGPASSWORD="${POSTGRES_PASSWORD}"

# Perform dump, compress, and save
pg_dump -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" | gzip > "${BACKUP_FILE}"

if [ $? -eq 0 ]; then
    echo "Backup completed successfully: ${BACKUP_FILE}"
else
    echo "ERROR: Backup failed!"
    exit 1
fi

# Retention cleanup
echo "Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "${DB_NAME}_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

echo "Backup process finished at $(date)"
