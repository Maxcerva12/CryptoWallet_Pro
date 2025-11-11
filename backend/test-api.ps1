# Script de prueba para CryptoWallet Pro API
# Ejecutar: .\test-api.ps1

$baseUrl = "http://localhost:5000"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🧪 TEST API - CryptoWallet Pro" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Health Check
Write-Host "1️⃣ Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "✅ Status: $($health.message)" -ForegroundColor Green
    Write-Host "   Environment: $($health.environment)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
}

# 2. Login como Admin
Write-Host "2️⃣ Login como Administrador..." -ForegroundColor Yellow
try {
    $adminLogin = @{
        email = "admin@cryptowallet.com"
        password = "Admin123!"
    } | ConvertTo-Json

    $adminResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $adminLogin -ContentType "application/json"
    
    Write-Host "✅ Login exitoso!" -ForegroundColor Green
    Write-Host "   Usuario: $($adminResponse.data.user.fullName)" -ForegroundColor Gray
    Write-Host "   Role: $($adminResponse.data.user.role)" -ForegroundColor Gray
    Write-Host "   Token: $($adminResponse.data.token.substring(0,30))..." -ForegroundColor Gray
    Write-Host ""
    
    $adminToken = $adminResponse.data.token
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# 3. Login como Usuario Regular
Write-Host "3️⃣ Login como Usuario Regular (Juan)..." -ForegroundColor Yellow
try {
    $userLogin = @{
        email = "juan.perez@email.com"
        password = "User123!"
    } | ConvertTo-Json

    $userResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $userLogin -ContentType "application/json"
    
    Write-Host "✅ Login exitoso!" -ForegroundColor Green
    Write-Host "   Usuario: $($userResponse.data.user.fullName)" -ForegroundColor Gray
    Write-Host "   Email: $($userResponse.data.user.email)" -ForegroundColor Gray
    Write-Host "   Wallet: $($userResponse.data.user.wallet.address)" -ForegroundColor Gray
    Write-Host "   Balance: $($userResponse.data.user.wallet.balance) CC" -ForegroundColor Gray
    Write-Host ""
    
    $userToken = $userResponse.data.token
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# 4. Login como Comercio
Write-Host "4️⃣ Login como Comercio..." -ForegroundColor Yellow
try {
    $merchantLogin = @{
        email = "comercio1@cryptowallet.com"
        password = "Merchant123!"
    } | ConvertTo-Json

    $merchantResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $merchantLogin -ContentType "application/json"
    
    Write-Host "✅ Login exitoso!" -ForegroundColor Green
    Write-Host "   Comercio: $($merchantResponse.data.user.merchant.businessName)" -ForegroundColor Gray
    Write-Host "   Categoría: $($merchantResponse.data.user.merchant.category)" -ForegroundColor Gray
    Write-Host "   Wallet: $($merchantResponse.data.user.wallet.address)" -ForegroundColor Gray
    Write-Host ""
    
    $merchantToken = $merchantResponse.data.token
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# 5. Obtener Balance del Usuario
if ($userToken) {
    Write-Host "5️⃣ Consultar Balance (Usuario Juan)..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $userToken"
        }
        
        $balance = Invoke-RestMethod -Uri "$baseUrl/api/wallets/balance" -Method Get -Headers $headers
        
        Write-Host "✅ Balance obtenido!" -ForegroundColor Green
        Write-Host "   Saldo: $($balance.data.balance) $($balance.data.currency)" -ForegroundColor Gray
        Write-Host "   Estado: $($balance.data.isActive)" -ForegroundColor Gray
        Write-Host ""
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
}

# 6. Listar Usuarios (Admin)
if ($adminToken) {
    Write-Host "6️⃣ Listar Usuarios (Admin)..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $adminToken"
        }
        
        $users = Invoke-RestMethod -Uri "$baseUrl/api/admin/users" -Method Get -Headers $headers
        
        Write-Host "✅ Usuarios listados!" -ForegroundColor Green
        Write-Host "   Total: $($users.data.total)" -ForegroundColor Gray
        foreach ($user in $users.data.users) {
            Write-Host "   • $($user.fullName) - $($user.email) [$($user.role)]" -ForegroundColor Gray
        }
        Write-Host ""
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
}

# 7. Ver Transacciones
if ($userToken) {
    Write-Host "7️⃣ Ver Transacciones (Usuario Juan)..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $userToken"
        }
        
        $transactions = Invoke-RestMethod -Uri "$baseUrl/api/transactions/history" -Method Get -Headers $headers
        
        Write-Host "✅ Transacciones obtenidas!" -ForegroundColor Green
        Write-Host "   Total: $($transactions.data.total)" -ForegroundColor Gray
        foreach ($tx in $transactions.data.transactions) {
            Write-Host "   • $($tx.amount) CC - $($tx.type) - $($tx.status)" -ForegroundColor Gray
        }
        Write-Host ""
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Pruebas completadas" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tokens guardados en variables:" -ForegroundColor Yellow
Write-Host "   `$adminToken - Token del administrador" -ForegroundColor Gray
Write-Host "   `$userToken - Token del usuario" -ForegroundColor Gray
Write-Host "   `$merchantToken - Token del comercio" -ForegroundColor Gray
