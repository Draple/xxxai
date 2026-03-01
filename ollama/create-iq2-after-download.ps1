# Espera a que exista el .gguf IQ2_M y luego crea el modelo glm-uncensored-small
$gguf = "C:\Users\julia\videoOnix\ollama\GLM-4.7-Flash-Uncen-Hrt-NEO-CODE-MAX-imat-D_AU-IQ2_M.gguf"
$expectedMinBytes = 10 * 1024 * 1024 * 1024  # 10 GB

Write-Host "Esperando a que termine la descarga de IQ2_M..."
while ($true) {
  if (Test-Path $gguf) {
    $size = (Get-Item $gguf).Length
    if ($size -ge $expectedMinBytes) {
      Write-Host "Archivo listo ($([math]::Round($size/1GB, 2)) GB). Creando modelo..."
      Set-Location "c:\Users\julia\videoOnix\ollama"
      & "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe" create glm-uncensored-small -f Modelfile-IQ2_M
      exit $LASTEXITCODE
    }
  }
  Start-Sleep -Seconds 15
}
