# PowerShell script to clear Next.js cache and restart dev server
Write-Host "Clearing Next.js cache..." -ForegroundColor Yellow

if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host "✓ .next folder deleted" -ForegroundColor Green
} else {
    Write-Host "✓ .next folder doesn't exist" -ForegroundColor Green
}

Write-Host "`nStarting Next.js dev server..." -ForegroundColor Yellow
Write-Host "Make sure Convex is running in another terminal: npx convex dev`n" -ForegroundColor Cyan

npm run dev

