# Pass 2: constrained geocode for the 50 Zone A localities.
# Uses an explicit viewbox around the Zone A envelope plus candidate scoring,
# then validates each hit against a sanity envelope before accepting it.
$ErrorActionPreference = 'Stop'
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ZoneA-Research/1.0 (research use)'
$out = 'C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\zone-a\tools\geocode-pass2.json'

# Zone A envelope: north-west Mangadu/Parandur -> south-east Velachery/Thoraipakkam
$vb = '79.85,12.82,80.30,13.10'
# Reference anchor: Velachery town centre (OSM 'Velachery' node)
$anchor = @{ lat = 12.9772611; lon = 80.2209183 }

$queries = [ordered]@{
  'A01' = @('Tambaram West, Tambaram, Chennai','Tambaram, Chennai')
  'A02' = @('Tambaram East, Tambaram, Chennai','Tambaram, Chennai')
  'A03' = @('Tambaram Sanatorium, Tambaram, Chennai','Tambaram Sanatorium')
  'A04' = @('Irumbuliyur, Tambaram, Chennai','Irumbuliyur')
  'A05' = @('Kadaperi, Tambaram, Chennai','Kadaperi')
  'A06' = @('Tambaram, Chennai')
  'A07' = @('Mangadu, Chengalpattu, Tamil Nadu','Mangadu, Tambaram, Chennai','Mangadu')
  'A08' = @('Mangadu New Town, Chennai','Mangadu, Chengalpattu, Tamil Nadu','Mangadu')
  'A09' = @('Vinayagar Nagar, Mangadu, Chennai','Mangadu, Chengalpattu, Tamil Nadu','Mangadu')
  'A10' = @('Mangadu Industrial Estate, Chennai','Mangadu, Chengalpattu, Tamil Nadu','Mangadu')
  'A11' = @('Parandur, Kanchipuram, Tamil Nadu','Parandur')
  'A12' = @('Valathur, Kanchipuram, Tamil Nadu','Valathur, Chennai','Parandur, Kanchipuram, Tamil Nadu')
  'A13' = @('Selaiyur, Tambaram, Chennai','Selaiyur')
  'A14' = @('Perungalathur, Chennai','Perungalathur')
  'A15' = @('Madambakkam, Tambaram, Chennai','Madambakkam')
  'A16' = @('Alandur, Chennai','Alandur')
  'A17' = @('Pammal, Chennai','Pammal')
  'A18' = @('Hasthinapuram, Chromepet, Chennai','Hasthinapuram')
  'A19' = @('Hasthinapuram, Chromepet, Chennai','Hasthinapuram')
  'A20' = @('Palayamkottai, Chennai','Hasthinapuram, Chromepet, Chennai')
  'A21' = @('Chromepet, Chennai','Chromepet')
  'A22' = @('Tiruneermalai, Chennai','Tiruneermalai')
  'A23' = @('Nemilichery, Chennai','Nemilichery')
  'A24' = @('Chromepet, Chennai')
  'A25' = @('Medavakkam, Chennai','Medavakkam')
  'A26' = @('Vengaivasal, Medavakkam, Chennai','Vengaivasal, Chennai','Medavakkam, Chennai')
  'A27' = @('Ramiah Nagar, Chennai','Medavakkam, Chennai')
  'A28' = @('Mambakkam, Medavakkam, Chennai','Mambakkam, Chennai','Medavakkam, Chennai')
  'A29' = @('Medavakkam, Chennai')
  'A30' = @('Kovilambakkam, Tambaram, Chennai','Kovilambakkam')
  'A31' = @('Chembedu, Chennai','Chemedu, Chennai','Medavakkam, Chennai')
  'A32' = @('Moovarasampettai, Chennai','Moovarasampettai')
  'A33' = @('Pallikaranai, Chennai','Pallikaranai')
  'A34' = @('Narayanapuram, Pallikaranai, Chennai','Narayanapuram, Chennai','Pallikaranai, Chennai')
  'A35' = @('Pallikaranai, Chennai')
  'A36' = @('Jalladiampet, Medavakkam, Chennai','Jalladiampet, Chennai','Pallikaranai, Chennai')
  'A37' = @('Varadharajapuram, Pallikaranai, Chennai','Varadharajapuram, Chennai','Pallikaranai, Chennai')
  'A38' = @('Santhosapuram, Pallikaranai, Chennai','Santhosapuram, Chennai','Pallikaranai, Chennai')
  'A39' = @('Velachery, Chennai','Velachery')
  'A40' = @('Velachery, Chennai')
  'A41' = @('Jaganathapuram, Velachery, Chennai','Jaganathapuram, Chennai','Velachery, Chennai')
  'A42' = @('Ashok Nagar, Velachery, Chennai','Ashok Nagar, Chennai','Velachery, Chennai')
  'A43' = @('Velachery, Chennai')
  'A44' = @('Hasthampatti, Chennai','Velachery, Chennai')
  'A45' = @('Velachery, Chennai')
  'A46' = @('Otteri, Chennai','Otteri, Medavakkam, Chennai','Medavakkam, Chennai')
  'A47' = @('Madipakkam, Chennai','Madipakkam')
  'A48' = @('Sithalapakkam, Medavakkam, Chennai','Sithalapakkam, Chennai','Sithalapakkam')
  'A49' = @('Taramani, Chennai','Taramani')
  'A50' = @('Thoraipakkam, Chennai','Thoraipakkam')
}

function Get-Hits([string]$q) {
  $u = "https://nominatim.openstreetmap.org/search?q=$([uri]::EscapeDataString($q))&format=json&limit=6&addressdetails=1&countrycodes=in&viewbox=$vb"
  try { return Invoke-RestMethod -Uri $u -Headers @{ 'User-Agent' = $ua } -TimeoutSec 30 } catch { return $null }
}

$result = [ordered]@{}
foreach ($k in $queries.Keys) {
  $cands = $queries[$k]
  $chosen = $null
  $all = @()
  for ($i = 0; $i -lt $cands.Count; $i++) {
    $r = Get-Hits $cands[$i]
    if ($null -ne $r -and $r.Count -gt 0) {
      foreach ($h in $r) {
        $la = [double]$h.lat; $lo = [double]$h.lon
        # distance from Velachery anchor (km), haversine
        $R = 6371.0
        $dLat = ($la - $anchor.lat) * [math]::PI / 180
        $dLon = ($lo - $anchor.lon) * [math]::PI / 180
        $a = [math]::Sin($dLat/2)*[math]::Sin($dLat/2) + [math]::Cos($anchor.lat*[math]::PI/180)*[math]::Cos($la*[math]::PI/180)*[math]::Sin($dLon/2)*[math]::Sin($dLon/2)
        $d = 2 * $R * [math]::Asin([math]::Sqrt($a))
        $all += [ordered]@{
          query = $cands[$i]; idx = $i; lat = $la; lon = $lo; dist_km = [math]::Round($d,2)
          type = $h.type; addresstype = $h.addresstype; place_rank = $h.place_rank
          suburb = $h.address.suburb; neighbourhood = $h.address.neighbourhood
          county = $h.address.county; city = $h.address.city; postcode = $h.address.postcode
          display_name = $h.display_name
        }
      }
      $pick = $all | Where-Object { $_.idx -eq $i -and $_.dist_km -le 32 } | Sort-Object dist_km | Select-Object -First 1
      if ($null -ne $pick) { $chosen = $pick; break }
    }
    Start-Sleep -Milliseconds 1100
  }
  if ($null -eq $chosen) {
    $best = $all | Sort-Object dist_km | Select-Object -First 1
    if ($null -ne $best) { $chosen = $best; $chosen | Add-Member -NotePropertyName 'FALLBACK' -NotePropertyValue $true }
    else { $chosen = [ordered]@{ query='NONE'; idx=-1; lat=$null; lon=$null; dist_km=$null; display_name='NOT FOUND' } }
  }
  $result[$k] = [ordered]@{ chosen = $chosen; candidates = $all }
  Write-Host ("{0} -> {1},{2} d={3}km | {4}" -f $k, $chosen.lat, $chosen.lon, $chosen.dist_km, $chosen.display_name)
  Start-Sleep -Milliseconds 1100
}
$result | ConvertTo-Json -Depth 8 | Out-File -FilePath $out -Encoding utf8
Write-Host "SAVED $out"
