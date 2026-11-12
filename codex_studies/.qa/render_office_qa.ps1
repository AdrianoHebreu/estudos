$ErrorActionPreference = 'Stop'
$root = (Resolve-Path '.').Path
$qaRoot = Join-Path $root '.qa\rendered'
$pdfRoot = Join-Path $qaRoot 'word-pdf'
$slideRoot = Join-Path $qaRoot 'slides'
New-Item -ItemType Directory -Force -Path $pdfRoot, $slideRoot | Out-Null

$word = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    Get-ChildItem -Path $root -Recurse -File -Filter '*.docx' |
        Where-Object { -not $_.Name.StartsWith('~$') } |
        Sort-Object FullName |
        ForEach-Object {
            $relative = $_.FullName.Substring($root.Length).TrimStart('\')
            $pdfPath = Join-Path $pdfRoot ($_.BaseName + '.pdf')
            $doc = $word.Documents.Open($_.FullName, $false, $true, $false)
            try {
                $pages = $doc.ComputeStatistics(2)
                $doc.ExportAsFixedFormat($pdfPath, 17)
                Write-Output "DOCX $relative pages=$pages"
            }
            finally {
                $doc.Close(0)
                [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($doc)
            }
        }
}
finally {
    if ($word) {
        $word.Quit()
        [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($word)
    }
}

$ppt = $null
try {
    $ppt = New-Object -ComObject PowerPoint.Application
    $ppt.DisplayAlerts = 0
    Get-ChildItem -Path $root -Recurse -File -Filter '*.pptx' |
        Sort-Object FullName |
        ForEach-Object {
            $relative = $_.FullName.Substring($root.Length).TrimStart('\')
            $outDir = Join-Path $slideRoot $_.BaseName
            New-Item -ItemType Directory -Force -Path $outDir | Out-Null
            $pres = $ppt.Presentations.Open($_.FullName, -1, 0, 0)
            try {
                $count = $pres.Slides.Count
                $pres.Export($outDir, 'PNG', 1280, 720)
                Write-Output "PPTX $relative slides=$count"
            }
            finally {
                $pres.Close()
                [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($pres)
            }
        }
}
finally {
    if ($ppt) {
        $ppt.Quit()
        [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($ppt)
    }
}
