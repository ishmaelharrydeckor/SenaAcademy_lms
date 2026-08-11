param(
    [Parameter(Mandatory=$true)]
    [string]$ShotName,
    [Parameter(Mandatory=$true)]
    [string]$PromptFile,
    [Parameter(Mandatory=$true)]
    [string]$Refs,
    [string]$Genre = "epic"
)

# Setup output directories
$OutDir = "scratch/outputs/batch-01-cinematics"
if (!(Test-Path $OutDir)) {
    New-Item -ItemType Directory -Path $OutDir | Out-Null
}

# Read prompt and strip '@' and escape double quotes
if (!(Test-Path $PromptFile)) {
    Write-Error "Prompt file not found at $PromptFile"
    exit 1
}
$Prompt = (Get-Content $PromptFile -Raw) -replace '@', '' -replace '"', '\"'

Write-Host "Firing generation: $ShotName"

# Construct and run the command string via cmd.exe
$CmdStr = "higgsfield generate create seedance_2_0 --prompt `"$Prompt`" $Refs --duration 5 --resolution 1080p --aspect_ratio 9:16 --genre $Genre --mode std --wait --wait-timeout 30m"
Write-Host "Running: $CmdStr"
cmd.exe /c $CmdStr 2>&1 | Tee-Object -FilePath "$OutDir/$ShotName.txt"

# Search for the generated MP4 download URL
$LogContent = Get-Content "$OutDir/$ShotName.txt" -Raw
if ($LogContent -match "(https://[^\s]+\.mp4)") {
    $Url = $Matches[0]
    Write-Host "SUCCESS: Found video URL: $Url"
    Write-Host "Downloading video..."
    Invoke-WebRequest -Uri $Url -OutFile "$OutDir/$ShotName.mp4"
    Write-Host "SUCCESS: Saved to $OutDir/$ShotName.mp4"
} else {
    Write-Host "FAILED: $ShotName. Could not find download URL in output logs."
}
