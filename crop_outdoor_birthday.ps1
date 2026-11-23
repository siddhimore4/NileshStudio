Add-Type -AssemblyName System.Drawing

$publicDir = "c:\Users\Admin\OneDrive\Desktop\NileshStudio_App\public\images\outdoor-birthday"
$distDir = "c:\Users\Admin\OneDrive\Desktop\NileshStudio_App\dist\images\outdoor-birthday"

if (!(Test-Path $publicDir)) { New-Item -ItemType Directory -Path $publicDir -Force }
if (!(Test-Path $distDir)) { New-Item -ItemType Directory -Path $distDir -Force }

$crops = @(
  @{
    Src = "C:/Users/Admin/.gemini/antigravity/brain/60c539ce-5fde-41a8-bb28-4727e53787a1/.user_uploaded/media_1795356489415_e5777a07.jpg"
    X = 0
    Y = 254
    W = 460
    H = 575
    Name = "outdoor-birthday-1.jpg"
  },
  @{
    Src = "C:/Users/Admin/.gemini/antigravity/brain/60c539ce-5fde-41a8-bb28-4727e53787a1/.user_uploaded/media_1795356489444_9a2900d9.jpg"
    X = 0
    Y = 153
    W = 460
    H = 575
    Name = "outdoor-birthday-2.jpg"
  },
  @{
    Src = "C:/Users/Admin/.gemini/antigravity/brain/60c539ce-5fde-41a8-bb28-4727e53787a1/.user_uploaded/media_1795356489450_fb3cf080.jpg"
    X = 0
    Y = 153
    W = 460
    H = 575
    Name = "outdoor-birthday-3.jpg"
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

  Write-Host "Saved: $($item.Name)"
}

Write-Host "All outdoor birthday photos cropped and saved successfully!"
