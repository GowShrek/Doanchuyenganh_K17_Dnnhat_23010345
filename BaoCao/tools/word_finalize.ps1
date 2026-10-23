# Mở file .docx bằng Microsoft Word, cập nhật mục lục / danh mục bảng-hình, lưu lại và xuất PDF.
# Cách dùng: powershell -File word_finalize.ps1 <đường-dẫn-docx> [<đường-dẫn-pdf>]
param([string]$Docx, [string]$Pdf)
$Docx = (Resolve-Path $Docx).Path
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
    $doc = $word.Documents.Open($Docx)
    foreach ($toc in $doc.TablesOfContents) { $toc.Update() }
    $doc.Fields.Update() | Out-Null
    foreach ($toc in $doc.TablesOfContents) { $toc.Update() }
    $pages = $doc.ComputeStatistics(2)
    Write-Output "PAGES=$pages"
    $doc.Save()
    if ($Pdf) {
        # xuất ra tệp tạm rồi thay thế: Word có thể bỏ qua im lặng khi không ghi đè được tệp PDF cũ
        $tmp = "$Pdf.tmp.pdf"
        $doc.ExportAsFixedFormat($tmp, 17)
        Move-Item -Force -ErrorAction Stop $tmp $Pdf
    }
    $doc.Close(0)
}
finally {
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}
