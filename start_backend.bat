@echo off
echo ===========================
echo  AgriLink - Backend Server
echo ===========================
echo.
echo Installing dependencies...
pip install -r requirements.txt
echo.
echo Starting Flask server...
python app.py
pause
