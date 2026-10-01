$e = $null
try {
  Set-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\CrashControl' -Name CrashDumpEnabled -Value 7 -ErrorAction Stop
  $now = (Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\CrashControl' -Name CrashDumpEnabled).CrashDumpEnabled
  "CrashDumpEnabled now = $now"
} catch { $e = $_.Exception.Message; "REGISTRY WRITE FAILED: $e" }
"---"
"Free C: GB = {0:N1}" -f ((Get-PSDrive C).Free/1GB)
"--- REALTEK ---"
$r = Get-PnpDevice -FriendlyName 'Realtek PCIe GbE*' | Select-Object FriendlyName,Status,Problem,ConfigManagerErrorCode,DeviceID
$r | Format-List | Out-String | Write-Output
