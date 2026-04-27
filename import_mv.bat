@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set SRC=H:\迅雷下载\movie
set DST=E:\Vue3\music\vue\back\29\music-website-master\music-server\movie

echo ===== 开始复制MP4文件到项目目录 =====

for /D %%d in ("%SRC%\*") do (
    set FOLDER=%%~nxd
    if exist "%%d\*.mp4" (
        if not exist "%DST%\!FOLDER!" mkdir "%DST%\!FOLDER!"
        copy "%%d\*.mp4" "%DST%\!FOLDER!\" >nul
        echo   ✓ !FOLDER!
    )
)

echo.
echo ===== 生成SQL插入语句 =====
echo.
echo -- 请将以下SQL在MySQL中执行：
echo.

for /D %%d in ("%SRC%\*") do (
    set FOLDER=%%~nxd
    for %%f in ("%%d\*.mp4") do (
        set FNAME=%%~nf
        set EXT=%%~xf
        echo INSERT INTO mv ^(mv_name, singer_name, url^) VALUES ^('!FNAME!', '!FOLDER!', '/movie/!FOLDER!/%%~nxf'^)^;
    )
)

echo.
echo ===== 完成 =====
pause
