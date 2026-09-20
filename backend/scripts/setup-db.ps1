param(
  [Parameter(Mandatory = $true)]
  [string]$Password
)

$ErrorActionPreference = "Stop"
$env:PGPASSWORD = $Password
$envFile = Join-Path $PSScriptRoot "..\.env"
$connection = "postgresql://postgres:$Password@localhost:5432/smile_clinic?schema=public"

@"
DATABASE_URL="$connection"
PORT=4000
FRONTEND_URL="http://localhost:3000"
"@ | Set-Content -Path $envFile -Encoding utf8

Write-Output "Creating database smile_clinic if needed..."
psql -U postgres -h localhost -d postgres -c "CREATE DATABASE smile_clinic;" 2>$null

Write-Output "Running Prisma migrations..."
Set-Location (Join-Path $PSScriptRoot "..")
npx prisma migrate deploy

Write-Output "Done. Run npm run dev from the project root."
