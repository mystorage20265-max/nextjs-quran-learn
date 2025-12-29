#!/usr/bin/env pwsh
# Test Radio Backend Endpoints

$BaseUrl = "http://localhost:3000"
$Endpoints = @(
    @{
        Name = "Reciters Endpoint"
        Url = "/api/radio/reciters"
        Method = "GET"
    },
    @{
        Name = "Audio Endpoint"
        Url = "/api/radio/audio?reciterId=2&surahNumber=1"
        Method = "GET"
    }
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Radio Backend API Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

foreach ($endpoint in $Endpoints) {
    $fullUrl = "$BaseUrl$($endpoint.Url)"
    Write-Host "`n[TEST] $($endpoint.Name)" -ForegroundColor Yellow
    Write-Host "URL: $fullUrl" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $fullUrl -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        $json = $response.Content | ConvertFrom-Json
        
        Write-Host "✅ Status: 200 OK" -ForegroundColor Green
        Write-Host "📋 Response: $($json.status)" -ForegroundColor Gray
    }
    catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Tests Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
