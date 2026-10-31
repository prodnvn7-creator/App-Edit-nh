Add-Type -AssemblyName System.Drawing

# 1. Base dimensions
$width = 1024
$height = 764

$bmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

# LAYER 1: Background
$bg = [System.Drawing.Image]::FromFile("assets/template_clean.png")
$g.DrawImage($bg, 0, 0, $width, $height)
$bg.Dispose()

# LAYER 3 & 2: Artist & Glow
$artist = [System.Drawing.Image]::FromFile("assets/artist_sample_dam_on.png")
$aw = [int]($artist.Width * 2.05)
$ah = [int]($artist.Height * 2.05)
$ax = [int](($width - $aw) / 2)
$ay = [int](($height - $ah) / 2 - 25)

# Layer 2: Back Glow (draw cyan halo behind artist)
$glowPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 0, 210, 255), 30)
$glowPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$g.DrawImage($artist, ($ax - 10), ($ay - 5), ($aw + 20), ($ah + 10))

# Layer 3: Draw Artist with gradient bottom
$g.DrawImage($artist, $ax, $ay, $aw, $ah)
$artist.Dispose()

# LAYER 4: Text 'DAM ON' with CF Jack Story
$pfc = New-Object System.Drawing.Text.PrivateFontCollection
$pfc.AddFontFile("fonts/CFJackStory-Regular.ttf")
$fontFamily = $pfc.Families[0]
$font = New-Object System.Drawing.Font($fontFamily, 86, [System.Drawing.FontStyle]::Bold)

# Rotate -8 degrees for text
$cx = $width / 2
$cy = [int]($height * 0.72)
$g.TranslateTransform($cx, $cy)
$g.RotateTransform(-8)

$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$sf.LineAlignment = [System.Drawing.StringAlignment]::Center

# Outer glow / 3D stroke
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddString("DAM ON", $fontFamily, [int][System.Drawing.FontStyle]::Bold, 110, (New-Object System.Drawing.PointF(0, 0)), $sf)

# Cyan glow outer pen
$penGlow = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220, 0, 210, 255), 18)
$g.DrawPath($penGlow, $path)

# Blue rim pen
$penRim = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 0, 140, 220), 8)
$g.DrawPath($penRim, $path)

# Fill with Ice Texture
$iceTex = [System.Drawing.Image]::FromFile("assets/ice_texture.jpg")
$texBrush = New-Object System.Drawing.TextureBrush($iceTex)
$g.FillPath($texBrush, $path)
$iceTex.Dispose()

# Inner white frost highlight pen
$penHighlight = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220, 255, 255, 255), 3)
$g.DrawPath($penHighlight, $path)

# Crown on top of text
$p1 = New-Object System.Drawing.PointF(-36, -55)
$p2 = New-Object System.Drawing.PointF(36, -55)
$p3 = New-Object System.Drawing.PointF(48, -90)
$p4 = New-Object System.Drawing.PointF(22, -75)
$p5 = New-Object System.Drawing.PointF(0, -105)
$p6 = New-Object System.Drawing.PointF(-22, -75)
$p7 = New-Object System.Drawing.PointF(-48, -90)
[System.Drawing.PointF[]]$crownPts = @($p1, $p2, $p3, $p4, $p5, $p6, $p7)
$crownPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 240, 250, 255), 4)
$g.DrawPolygon($crownPen, $crownPts)

# Reset transform
$g.ResetTransform()

# LAYER 5: Sparkles
function DrawSparkle($gfx, [float]$sx, [float]$sy, [float]$r) {
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $s1 = New-Object System.Drawing.PointF($sx, ($sy - $r))
    $s2 = New-Object System.Drawing.PointF(($sx + 4), ($sy - 4))
    $s3 = New-Object System.Drawing.PointF(($sx + $r), $sy)
    $s4 = New-Object System.Drawing.PointF(($sx + 4), ($sy + 4))
    $s5 = New-Object System.Drawing.PointF($sx, ($sy + $r))
    $s6 = New-Object System.Drawing.PointF(($sx - 4), ($sy + 4))
    $s7 = New-Object System.Drawing.PointF(($sx - $r), $sy)
    $s8 = New-Object System.Drawing.PointF(($sx - 4), ($sy - 4))
    [System.Drawing.PointF[]]$pts = @($s1, $s2, $s3, $s4, $s5, $s6, $s7, $s8)
    $gfx.FillPolygon($brush, $pts)
}

# Left sparkle near D
DrawSparkle $g 360 520 28
# Right sparkle near N
DrawSparkle $g 680 480 28
# Crown sparkle
DrawSparkle $g 515 440 20

# Save output
$bmp.Save("assets/test_rendered_poster.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$g.Dispose()
Write-Output "Successfully generated assets/test_rendered_poster.png"
