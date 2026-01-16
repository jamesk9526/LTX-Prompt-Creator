$lines = @(Get-Content app/wizard/page.tsx)
$newLines = @($lines[0..2439]) + @($lines[2848..($lines.Count-1)])
$newLines | Set-Content app/wizard/page.tsx
Write-Host "Removed lines 2441-2848"
