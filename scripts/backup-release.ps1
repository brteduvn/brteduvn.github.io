param(
 [Parameter(Mandatory=$true)][string]$Tag,
 [string]$Destination = "artifacts/backups"
)
$ErrorActionPreference="Stop"
$root=(git rev-parse --show-toplevel).Trim()
if($LASTEXITCODE -ne 0){throw "Not a Git repository"}
if((Resolve-Path '.').Path -ne (Resolve-Path $root).Path){throw "Run from the repository root"}
$tagSha=(git rev-parse -q --verify "refs/tags/$Tag").Trim()
if($LASTEXITCODE -ne 0 -or !$tagSha){throw "Missing validated tag: $Tag"}
$dirty=(git status --porcelain --untracked-files=no)
if($dirty){throw "Tracked files have uncommitted changes"}
if(!(Test-Path "dist/build-info.json")){throw "Run production build first"}
$info=Get-Content "dist/build-info.json" -Raw | ConvertFrom-Json
if($Tag -ne ("v"+$info.version)){throw "Tag/version mismatch: $Tag vs $($info.version)"}
if(-not [IO.Path]::IsPathRooted($Destination)){$Destination=Join-Path $root $Destination}
$ts=Get-Date -Format "yyyyMMdd-HHmmss"
$folder=Join-Path $Destination ($Tag+"-"+$ts)
New-Item -ItemType Directory -Path $folder -Force | Out-Null
$bundle=Join-Path $folder "source-and-history.bundle"
& git bundle create $bundle --all
if($LASTEXITCODE -ne 0){throw "Git bundle creation failed"}
& git bundle verify $bundle | Out-Null
if($LASTEXITCODE -ne 0){throw "Git bundle verification failed"}
$distZip=Join-Path $folder "web-build.zip"
Compress-Archive -Path "dist/*" -DestinationPath $distZip -CompressionLevel Optimal
Copy-Item -Path "dist/build-info.json" -Destination (Join-Path $folder "build-info.json")
$manifest=@{
 project=(Split-Path $root -Leaf);tag=$Tag;commit=(git rev-parse HEAD).Trim()
 verifiedAtUTC=(Get-Date).ToUniversalTime().ToString("o")
 buildInfo=$info
 files=@()
}
foreach($f in Get-ChildItem -File -Path $folder){
 $hash=(Get-FileHash $f.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
 $manifest.files+=@{name=$f.Name;sha256=$hash;bytes=$f.Length}
}
$manifest|ConvertTo-Json -Depth 8|Out-File -Encoding utf8 (Join-Path $folder "manifest.json")
Write-Output ($manifest|ConvertTo-Json -Depth 8)
Write-Output ("BACKUP_PATH="+$folder)
