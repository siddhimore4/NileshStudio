Add-Type -AssemblyName System.Drawing

$srcPath = "C:/Users/Admin/.gemini/antigravity/brain/60c539ce-5fde-41a8-bb28-4727e53787a1/.user_uploaded/media_1795353050405_2cf5bb3a.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)

# Find circle center and radius
# Total width is 460, center x is likely near 230
# Let's find top and bottom edge of the black circle at x = 230
$topY = 0
for ($y = 300; $y -lt 450; $y++) {
    $c = $bmp.GetPixel(230, $y)
    # Background is reddish/greyish around R=35-40, circle is black R<15, G<15, B<15
    if ($c.R -lt 15 -and $c.G -lt 15 -and $c.B -lt 15) {
        $topY = $y
        break
    }
}

$bottomY = 0
for ($y = 700; $y -gt 600; $y--) {
    $c = $bmp.GetPixel(230, $y)
    if ($c.R -lt 15 -and $c.G -lt 15 -and $c.B -lt 15) {
        $bottomY = $y
        break
    }
}

$centerY = ($topY + $bottomY) / 2
$diameterY = $bottomY - $topY

# Find left and right edge of the black circle at y = [int]$centerY
$leftX = 0
for ($x = 40; $x -lt 150; $x++) {
    $c = $bmp.GetPixel($x, [int]$centerY)
    if ($c.R -lt 15 -and $c.G -lt 15 -and $c.B -lt 15) {
        $leftX = $x
        break
    }
}

$rightX = 0
for ($x = 420; $x -gt 300; $x--) {
    $c = $bmp.GetPixel($x, [int]$centerY)
    if ($c.R -lt 15 -and $c.G -lt 15 -and $c.B -lt 15) {
        $rightX = $x
        break
    }
}

$centerX = ($leftX + $rightX) / 2
$diameterX = $rightX - $leftX

Write-Host "TopY: $topY, BottomY: $bottomY, DiffY: $diameterY"
Write-Host "LeftX: $leftX, RightX: $rightX, DiffX: $diameterX"
Write-Host "Center: ($centerX, $centerY)"

$radius = [Math]::Min($diameterX, $diameterY) / 2
Write-Host "Radius: $radius"

# Now let's crop a square region centered at ($centerX, $centerY) with diameter
$d = [int]([Math]::Min($diameterX, $diameterY))
$x0 = [int]($centerX - ($d / 2))
$y0 = [int]($centerY - ($d / 2))

# Create destination bitmap with transparency (32-bit ARGB)
$outBmp = New-Object System.Drawing.Bitmap($d, $d, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($outBmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

# Circular clip path
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddEllipse(0, 0, $d, $d)
$g.SetClip($path)

# Draw image
$srcRect = New-Object System.Drawing.Rectangle($x0, $y0, $d, $d)
$destRect = New-Object System.Drawing.Rectangle(0, 0, $d, $d)
$g.DrawImage($bmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

$g.Dispose()

# Save to public directory
$outDir = "c:\Users\Admin\OneDrive\Desktop\NileshStudio_App\public"
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir }
$outBmp.Save("$outDir\logo.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Also save a higher resolution version or copy for business portal
$bizDir = "c:\Users\Admin\OneDrive\Desktop\NileshStudio_App\business-portal"
$outBmp.Save("$bizDir\logo.png", [System.Drawing.Imaging.ImageFormat]::Png)

Write-Host "Successfully saved logo.png ($d x $d)!"
$bmp.Dispose()
$outBmp.Dispose()
