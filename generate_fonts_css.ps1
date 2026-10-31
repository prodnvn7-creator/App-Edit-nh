$cfBytes = [System.IO.File]::ReadAllBytes('fonts/CFJackStory-Regular.ttf')
$cfB64 = [Convert]::ToBase64String($cfBytes)
$iceBytes = [System.IO.File]::ReadAllBytes('fonts/IceCold.otf')
$iceB64 = [Convert]::ToBase64String($iceBytes)

$cssContent = @"
@font-face {
    font-family: 'CF Jack Story';
    src: url('data:font/ttf;base64,$cfB64') format('truetype');
    font-weight: normal;
    font-style: normal;
}
@font-face {
    font-family: 'Ice Cold';
    src: url('data:font/otf;base64,$iceB64') format('opentype');
    font-weight: normal;
    font-style: normal;
}
"@

Set-Content -Path 'assets/fonts_embedded.css' -Value $cssContent -Encoding utf8
Write-Output "Successfully generated assets/fonts_embedded.css: $((Get-Item 'assets/fonts_embedded.css').Length) bytes"
