# Start / stop the local portable Postgres for AffiliBlog.
# Portable binaries live in %USERPROFILE%\pgsql (no admin, no service), so the
# server must be started manually after a reboot. Run this from anywhere.
#
#   ./db/start-db.ps1           # start (if not running)
#   ./db/start-db.ps1 -Stop     # stop
#   ./db/start-db.ps1 -Status   # check

param([switch]$Stop, [switch]$Status)

$bin = "$env:USERPROFILE\pgsql\bin"
$data = "$env:USERPROFILE\pgdata"

if (-not (Test-Path -LiteralPath "$bin\pg_ctl.exe")) {
  Write-Error "Postgres binaries not found at $bin. Re-run the portable install."
  exit 1
}

if ($Status) {
  & "$bin\pg_ctl.exe" -D "$data" status
  exit 0
}

if ($Stop) {
  & "$bin\pg_ctl.exe" -D "$data" -w stop
  "Stopped."
  exit 0
}

# start only if not already running
$running = & "$bin\pg_ctl.exe" -D "$data" status 2>&1
if ($LASTEXITCODE -eq 0) {
  "Postgres is already running."
} else {
  & "$bin\pg_ctl.exe" -D "$data" -l "$data\server.log" -o "-p 5432" -w start
  "Started on port 5432 (log: $data\server.log)."
}

"Connect in DBeaver:  host=localhost  port=5432  user=postgres  (trust auth, no password)"
"Database: affiliblog"
