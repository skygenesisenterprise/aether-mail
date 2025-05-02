:: filepath: /home/liamforsky/Bureau/office/aether-mail-os/install.bat
@echo off

:: Vérifier si le script est exécuté en tant qu'administrateur
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Ce script doit être exécuté en tant qu'administrateur.
    pause
    exit /b 1
)

:: Mettre à jour les paquets (non applicable sous Windows, mais on peut vérifier les outils nécessaires)
echo Vérification des outils nécessaires...
where git >nul 2>&1 || (
    echo Git n'est pas installé. Veuillez l'installer avant de continuer.
    pause
    exit /b 1
)
where node >nul 2>&1 || (
    echo Node.js n'est pas installé. Veuillez l'installer avant de continuer.
    pause
    exit /b 1
)
where npm >nul 2>&1 || (
    echo npm n'est pas installé. Veuillez l'installer avant de continuer.
    pause
    exit /b 1
)

:: Cloner le dépôt du projet
echo Clonage du dépôt du projet...
if not exist "C:\opt\aether-mail" (
    git clone https://github.com/Sky-Genesis-Enterprise/aether-mail.git C:\opt\aether-mail
) else (
    echo Le répertoire C:\opt\aether-mail existe déjà. Ignoré.
)

:: Naviguer vers le répertoire du projet
cd /d C:\opt\aether-mail

:: Installer les dépendances spécifiques au projet
echo Installation des dépendances spécifiques au projet...
npm install

:: Exécuter la commande de build
echo Exécution de la commande de build...
npm run build

:: Configurer les fichiers nécessaires
echo Configuration des fichiers...
:: Copier les fichiers de configuration, créer des répertoires, etc.
if not exist "C:\ProgramData\aether-mail" mkdir C:\ProgramData\aether-mail
copy config\example.config C:\ProgramData\aether-mail\config >nul

:: Créer un service Windows pour Aether Mail
echo Création d'un service Windows...
sc create "AetherMail" binPath= "C:\opt\aether-mail\start.bat" start= auto
if %errorlevel% neq 0 (
    echo Impossible de créer le service. Assurez-vous que vous avez les droits nécessaires.
    pause
    exit /b 1
)

:: Démarrer le service Aether Mail
echo Démarrage du service Aether Mail...
sc start "AetherMail"

echo Installation terminée. Aether Mail est maintenant installé et en cours d'exécution.
pause