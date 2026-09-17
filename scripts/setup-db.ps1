param(
  [Parameter(Mandatory = $true)]
  [string]$Password
)

$ErrorActionPreference = "Stop"
$env:PGPASSWORD = $Password
$envFile = Join-Path $PSScriptRoot "..\.env"
$connection = "postgresql://postgres:$Password@localhost:5432/smile_clinic?schema=public"

Set-Content -Path $envFile -Value "DATABASE_URL=`"$connection`"" -Encoding utf8

Write-Output "Creating database smile_clinic if needed..."
psql -U postgres -h localhost -d postgres -c "SELECT 1 FROM pg_database WHERE datname = 'smile_clinic';" | Out-Null
psql -U postgres -h localhost -d postgres -c "CREATE DATABASE smile_clinic;" 2>$null

Write-Output "Running Prisma migrations..."
npx prisma migrate deploy

Write-Output "Done. Restart the app with: npm run dev"
