# Geocode the 50 Zone A localities against OpenStreetMap Nominatim.
# Tier-A coordinates. Saves raw Nominatim responses for the generator to consume.
$ErrorActionPreference = 'Stop'
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ZoneA-Research/1.0 (research use; contact aswath)'
$out = 'C:\Users\aswat\Downloads\Projects\mobile-vet-report\research\zone-a\tools\geocode-raw.json'

$queries = [ordered]@{
  'A01' = @('Tambaram West, Chennai, India','Tambaram, Chennai, India')
  'A02' = @('Tambaram East, Chennai, India','Tambaram, Chennai, India')
  'A03' = @('Tambaram Sanatorium, Chennai, India','Tambaram, Chennai, India')
  'A04' = @('Irumbuliyur, Chennai, India','Tambaram, Chennai, India')
  'A05' = @('Kadaperi, Chennai, India','Tambaram, Chennai, India')
  'A06' = @('Nithyanandham Nagar, Chennai, India','Tambaram, Chennai, India')
  'A07' = @('Mangadu, Chennai, India')
  'A08' = @('Mangadu New Town, Chennai, India','Mangadu, Chennai, India')
  'A09' = @('Vinayagar Nagar, Mangadu, Chennai','Mangadu, Chennai, India')
  'A10' = @('Mangadu, Chennai, India')
  'A11' = @('Parandur, Chennai, India','Parandur, Chengalpattu, India')
  'A12' = @('Valathur, Chennai, India','Parandur, Chennai, India')
  'A13' = @('Selaiyur, Chennai, India')
  'A14' = @('Perungalathur, Chennai, India')
  'A15' = @('Madambakkam, Chennai, India')
  'A16' = @('Alandur, Chennai, India')
  'A17' = @('Pammal, Chennai, India')
  'A18' = @('Hasthinapuram, Chennai, India')
  'A19' = @('Hasthinapuram New Colony, Chennai, India','Hasthinapuram, Chennai, India')
  'A20' = @('Palayamkottai, Chennai, India','Hasthinapuram, Chennai, India')
  'A21' = @('Chromepet, Chennai, India')
  'A22' = @('Tiruneermalai, Chennai, India','Chromepet, Chennai, India')
  'A23' = @('Nemilichery, Chennai, India','Chromepet, Chennai, India')
  'A24' = @('Kabil Nagar, Chennai, India','Chromepet, Chennai, India')
  'A25' = @('Medavakkam, Chennai, India')
  'A26' = @('Vengaivasal, Chennai, India','Medavakkam, Chennai, India')
  'A27' = @('Ramiah Nagar, Chennai, India','Medavakkam, Chennai, India')
  'A28' = @('Mambakkam, Chennai, India','Medavakkam, Chennai, India')
  'A29' = @('Medavakkam, Chennai, India')
  'A30' = @('Kovilambakkam, Chennai, India')
  'A31' = @('Chembedu, Chennai, India','Chembedu, Medavakkam, Chennai')
  'A32' = @('Moovarasampettai, Chennai, India','Medavakkam, Chennai, India')
  'A33' = @('Pallikaranai, Chennai, India')
  'A34' = @('Narayanapuram, Chennai, India','Pallikaranai, Chennai, India')
  'A35' = @('VGP Shanthi Nagar, Pallikaranai, Chennai','Pallikaranai, Chennai, India')
  'A36' = @('Jalladiampet, Chennai, India','Pallikaranai, Chennai, India')
  'A37' = @('Varadharajapuram, Chennai, India','Pallikaranai, Chennai, India')
  'A38' = @('Santhosapuram, Chennai, India','Pallikaranai, Chennai, India')
  'A39' = @('Velachery, Chennai, India')
  'A40' = @('Ram Nagar North, Velachery, Chennai','Velachery, Chennai, India')
  'A41' = @('Jaganathapuram, Chennai, India','Velachery, Chennai, India')
  'A42' = @('Ashok Nagar, Velachery, Chennai','Velachery, Chennai, India')
  'A43' = @('Udayam Nagar, Chennai, India','Velachery, Chennai, India')
  'A44' = @('Hasthampatti, Chennai, India','Velachery, Chennai, India')
  'A45' = @('Velachery, Chennai, India')
  'A46' = @('Otteri, Chennai, India','Medavakkam, Chennai, India')
  'A47' = @('Madipakkam, Chennai, India')
  'A48' = @('Sithalapakkam, Chennai, India')
  'A49' = @('Taramani, Chennai, India')
  'A50' = @('Thoraipakkam, Chennai, India')
}

$result = [ordered]@{}
foreach ($k in $queries.Keys) {
  $cands = $queries[$k]
  $chosen = $null
  $tries = @()
  for ($i = 0; $i -lt $cands.Count; $i++) {
    $q = [uri]::EscapeDataString($cands[$i])
    $url = "https://nominatim.openstreetmap.org/search?q=$q&format=json&limit=1&addressdetails=1&countrycodes=in"
    try {
      $r = Invoke-RestMethod -Uri $url -Headers @{ 'User-Agent' = $ua } -TimeoutSec 30
    } catch {
      $r = $null
    }
    $tries += [ordered]@{ query = $cands[$i]; hit = ($null -ne $r -and $r.Count -gt 0) }
    if ($null -ne $r -and $r.Count -gt 0) {
      $h = $r[0]
      $chosen = [ordered]@{
        query_used     = $cands[$i]
        candidate_index = $i
        lat            = [double]$h.lat
        lon            = [double]$h.lon
        osm_type       = $h.osm_type
        osm_id         = $h.osm_id
        place_rank     = $h.place_rank
        type           = $h.type
        addresstype    = $h.addresstype
        display_name   = $h.display_name
        postcode       = $h.address.postcode
        county         = $h.address.county
        suburb         = $h.address.suburb
        city           = $h.address.city
        neighbourhood  = $h.address.neighbourhood
        state_district = $h.address.state_district
      }
      break
    }
    Start-Sleep -Milliseconds 1200
  }
  if ($null -eq $chosen) {
    $chosen = [ordered]@{ query_used = $null; candidate_index = -1; lat = $null; lon = $null; display_name = 'NOT FOUND' }
  }
  $result[$k] = [ordered]@{ chosen = $chosen; attempts = $tries }
  Write-Host ("{0} -> {1} | {2}" -f $k, $chosen.lat, $chosen.display_name)
  Start-Sleep -Milliseconds 1200
}

$result | ConvertTo-Json -Depth 8 | Out-File -FilePath $out -Encoding utf8
Write-Host "SAVED $out"
