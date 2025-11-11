# Prueba rápida de login - CryptoWallet Pro

Write-Host "🧪 Probando Login..." -ForegroundColor Cyan

# Login Admin
$adminBody = @{
    email = "admin@cryptowallet.com"
    password = "Admin123!"
} | ConvertTo-Json

Write-Host "`n📝 Request Body:" -ForegroundColor Yellow
Write-Host $adminBody -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $adminBody -ContentType "application/json"
    
    Write-Host "`n✅ LOGIN EXITOSO!" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host "Usuario: $($response.data.user.fullName)" -ForegroundColor White
    Write-Host "Email: $($response.data.user.email)" -ForegroundColor White
    Write-Host "Role: $($response.data.user.role)" -ForegroundColor Cyan
    Write-Host "Token: $($response.data.token.substring(0,50))..." -ForegroundColor Gray
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ ERROR:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
