# Get all image full paths
$ImageFiles = Get-ChildItem "C:\Users\user\Downloads\Telegram Desktop\images\*.jpg"

# Build the command string
$CmdStr = "higgsfield soul-id create --name Kofi --soul-2"
foreach ($File in $ImageFiles) {
    $CmdStr += " --image `"$($File.FullName)`""
}

Write-Host "Running: $CmdStr"
cmd.exe /c $CmdStr
