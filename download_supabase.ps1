$release = Invoke-RestMethod -Uri "https://api.github.com/repos/supabase/cli/releases/latest"
$asset = $release.assets | Where-Object { $_.name -like "*_windows_amd64.zip" } | Select-Object -First 1
Write-Host "Downloading Supabase CLI from: $($asset.browser_download_url)"
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile "supabase.zip"
Write-Host "Extracting archive..."
Expand-Archive -Path "supabase.zip" -DestinationPath "." -Force
Remove-Item "supabase.zip"
Write-Host "Supabase CLI downloaded successfully!"
