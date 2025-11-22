#!/bin/bash
set -e

echo "🚀 Starting docker-entrypoint.sh..."

# Function to test database connection
function postgres_ready() {
    echo "📝 Testing database connection..."
    node -e "
    const { Client } = require('pg');
    
    // Build connection config
    const config = process.env.DATABASE_URL 
        ? { connectionString: process.env.DATABASE_URL }
        : {
            host: process.env.DATABASE_HOST,
            port: process.env.DATABASE_PORT,
            user: process.env.DATABASE_USERNAME,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            ssl: process.env.DATABASE_SSL_ENABLED === 'true' 
                ? { rejectUnauthorized: process.env.DATABASE_REJECT_UNAUTHORIZED === 'true' }
                : false
        };
    
    const client = new Client(config);
    client.connect().then(() => {
        console.log('✅ Database connection successful');
        client.end();
        process.exit(0);
    }).catch((err) => {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    });"
}

# Wait for database availability
MAX_RETRIES=30
RETRY_COUNT=0

until postgres_ready; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "❌ Failed to connect to PostgreSQL after $MAX_RETRIES attempts"
        exit 1
    fi
    echo "🔄 PostgreSQL is not available - waiting... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    echo "   Host: $DATABASE_HOST"
    echo "   Port: $DATABASE_PORT"
    echo "   User: $DATABASE_USERNAME"
    echo "   Database: $DATABASE_NAME"
    sleep 2
done

echo "✅ PostgreSQL is available!"

# Run migrations
echo "🔄 Running migrations..."
if npm run migration:run; then
    echo "✅ Migrations completed successfully"
else
    echo "⚠️  Migration failed or no migrations to run"
fi

# Start the application
echo "🚀 Starting the application..."
exec npm run start:dev
