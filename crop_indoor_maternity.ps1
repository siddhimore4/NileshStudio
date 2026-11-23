Add-Type -AssemblyName System.Drawing

$publicDir = "c:\Users\Admin\OneDrive\Desktop\NileshStudio_App\public\images\indoor-maternity"
$distDir = "c:\Users\Admin\OneDrive\Desktop\NileshStudio_App\dist\images\indoor-maternity"

if (!(Test-Path $publicDir)) { New-Item -ItemType Directory -Path $publicDir -Force }
if (!(Test-Path $distDir)) { New-Item -ItemType Directory -Path $distDir -Force }

$crops = @(
  @{
    Src = "C:/Users/Admin/.gemini/antigravity/brain/60c539ce-5fde-41a8-bb28-4727e53787a1/.user_uploaded/media_1795356648790_b1eaf999.jpg"
    X = 0
    Y = 140
    W = 460
    H = 638
    Name = "indoor-maternity-1.jpg"
  },
  @{
    Src = "C:/Users/Admin/.gemini/antigravity/brain/60c539ce-5fde-41a8-bb28-4727e53787a1/.user_uploaded/media_1795356648812_7b341d6b.jpg"
    X = 0
    Y = 172
    W = 460
    H = 596
    Name = "indoor-maternity-2.jpg"
  },
  @{
    Src = "C:/Users/Admin/.gemini/antigravity/brain/60c539ce-5fde-41a8-bb28-4727e53787a1/.user_uploaded/media_1795356648819_c63c89d8.jpg"
    X = 0
    Y = 147
    W = 460
    H = 645
    Name = "indoor-maternity-3.jpg"
  },
  @{
    Src = "C:/Users/Admin/.gemini/antigravity/brain/60c539ce-5fde-41a8-bb28-4727e53787a1/.user_uploaded/media_1795356648848_153b890e.jpg"
    X = 0
    Y = 148
    W = 460
    H = 634
    Name = "indoor-maternity-4.jpg"
  },
  @{
    Src = "C:/Users/Admin/.gemini/antigravity/brain/60c539ce-5fde-41a8-bb28-4727e53787a1/.user_uploaded/media_1795356648847_1edf9e5c.jpg"
    X = 0
    Y = 145
    W = 460
    H = 603
    Name = "indoor-maternity-5.jpg"
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

Write-Host "All 5 indoor maternity photos cropped and saved successfully!"
