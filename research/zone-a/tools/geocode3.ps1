# Pass 3: candidate dump for the localities whose pass-2 hit was ambiguous or wrong.
$ErrorActionPreference = 'Stop'
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ZoneA-Research/1.0 (research use)'
$queries = [ordered]@{
  'A07' = @('Mangadu, Tambaram, Chennai','Mangadu, Chengalpattu','Mangadu')
  'A11' = @('Parandur','Parandur, Kanchipuram','Parandur, Chennai')
  'A12' = @('Valathur','Valathur, Chennai','Valathur, Kanchipuram')
  'A14' = @('Perungalathur','Perungalathur, Tambaram')
  'A17' = @('Pammal','Pammal, Chennai')
  'A26' = @('Vengaivasal','Vengaivasal, Medavakkam','Vengaivasal, Chennai')
  'A28' = @('Mambakkam, Medavakkam','Mambakkam, Chennai','Mambakkam')
  'A31' = @('Chembedu','Chembedu, Chennai','Chembedu, Medavakkam')
  'A36' = @('Jalladiampet','Jalladiampet, Chennai')
  'A37' = @('Varadharajapuram','Varadharajapuram, Chennai')
  'A38' = @('Santhosapuram, Pallikaranai','Santhosapuram, Chennai','Santoshapuram')
  'A41' = @('Jaganathapuram, Velachery','Jaganathapuram, Chennai')
  'A42' = @('Ashok Nagar, 50th Street, Velachery','Ashok Nagar, Velachery','Ashok Nagar, Chennai')
  'A44' = @('Hasthampatti, Velachery','Hasthampatti')
  'A46' = @('Otteri, Medavakkam','Otteri, Chennai')
  'A48' = @('Sithalapakkam, Medavakkam','Sithalapakkam')
  'A50' = @('Thoraipakkam','Thoraipakkam, Chennai')
  'A40' = @('Ram Nagar North, Velachery','Ram Nagar, Velachery')
  'A45' = @('Velachery 100 Feet Road','100 Feet Bypass, Velachery')
}
foreach ($k in $queries.Keys) {
  foreach ($q in $queries[$k]) {
    $u = "https://nominatim.openstreetmap.org/search?q=$([uri]::EscapeDataString($q))&format=json&limit=5&addressdetails=1&countrycodes=in"
    try { $r = Invoke-RestMethod -Uri $u -Headers @{ 'User-Agent' = $ua } -TimeoutSec 30 } catch { $r = $null }
    if ($null -ne $r -and $r.Count -gt 0) {
      Write-Host "=== $k :: $q"
      foreach ($h in $r) {
        Write-Host ("    {0},{1} | {2} | {3}" -f $h.lat, $h.lon, $h.type, $h.display_name)
      }
    }
    Start-Sleep -Milliseconds 1150
  }
}
