Add-Type -AssemblyName System.Drawing

$publicDir = "c:\Users\Admin\OneDrive\Desktop\NileshStudio_App\public\images\indoor-festive"
$distDir = "c:\Users\Admin\OneDrive\Desktop\NileshStudio_App\dist\images\indoor-festive"

if (!(Test-Path $publicDir)) { New-Item -ItemType Directory -Path $publicDir -Force }
if (!(Test-Path $distDir)) { New-Item -ItemType Directory -Path $distDir -Force }

$crops = @(
  @{
    Src = "C:/Users/Admin/.gemini/antigravity/brain/60c539ce-5fde-41a8-bb28-4727e53787a1/.user_uploaded/media_1795356946167_836afa68.jpg"
    X = 0
    Y = 181
    W = 460
    H = 575
    Name = "indoor-festive-1.jpg"
  },
  @{
    Src = "C:/Users/Admin/.gemini/antigravity/brain/60c539ce-5fde-41a8-bb28-4727e53787a1/.user_uploaded/media_1795356946186_01d6d601.jpg"
    X = 0
    Y = 158
    W = 460
    H = 632
    Name = "indoor-festive-2.jpg"
  },
  @{
    Src = "C:/Users/Admin/.gemini/antigravity/brain/60c539ce-5fde-41a8-bb28-4727e53787a1/.user_uploaded/media_1795356946185_08d9ce33.jpg"
    X = 0
    Y = 154
    W = 460
    H = 595
    Name = "indoor-festive-3.jpg"
  },
  @{
    Src = "C:/Users/Admin/.gemini/antigravity/brain/60c539ce-5fde-41a8-bb28-4727e53787a1/.user_uploaded/media_1795356946764_f671be13.jpg"
    X = 0
    Y = 192
    W = 460
    H = 572
    Name = "indoor-festive-4.jpg"
  },
  @{
    Src = "C:/Users/Admin/.gemini/antigravity/brain/60c539ce-5fde-41a8-bb28-4727e53787a1/.user_uploaded/media_1795356946780_cb810a60.jpg"
    X = 0
    Y = 206
    W = 460
    H = 582
    Name = "indoor-festive-5.jpg"
  },
  @{
    Src = "C:/Users/Admin/.gemini/antigravity/brain/60c539ce-5fde-41a8-bb28-4727e53787a1/.user_uploaded/media_1795356946794_8561d126.jpg"
    X = 0
    Y = 166
    W = 460
    H = 627
    Name = "indoor-festive-6.jpg"
  },
  @{
    Src = "C:/Users/Admin/.gemini/antigravity/brain/60c539ce-5fde-41a8-bb28-4727e53787a1/.user_uploaded/media_1795356946801_fa3eb19e.jpg"
    X = 0
    Y = 188
    W = 460
    H = 647
    Name = "indoor-festive-7.jpg"
  }
)

foreach ($item in $crops) {
  $bmp = [System.Drawing.Bitmap]::FromFile($item.Src)
  $outBmp = New-Object System.Drawing.Bitmap($item.W, $item.H, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $g = [System.Drawing.Graphics]::FromImage($outBmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

  $srcRect = New-Object System.Drawing.Rectangle($item.X, $item.Y, $item.W, $item.H)
  $destRect = New-Object System.Drawing.Rectangle(0, 0, $item.W, $item.H)

  $g.DrawImage($bmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()
  $bmp.Dispose()

  $pubPath = Join-Path $publicDir $item.Name
  $dstPath = Join-Path $distDir $item.Name

  $outBmp.Save($pubPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
  $outBmp.Save($dstPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
  $outBmp.Dispose()

  Write-Host "Saved: $($item.Name) ($($item.W) x $($item.H))"
}

Write-Host "All 7 indoor festive photos cropped and saved successfully!"
