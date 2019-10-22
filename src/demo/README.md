# demo
Typical pages for Web Developer.


How it works? For Win10.<br>
<br>
1. Download Ubuntu 18.04 from Microsoft Store.<br>
1.1 Head to Control Panel > Programs > Turn Windows Features On Or Off. Enable the “Windows Subsystem for Linux” option in the list, and then click the “OK” button.<br>
1.2 Run Ubuntu 18.04, and do that console say.

2. Download VS Code.<br>
2.1 Run VS Code<br>
2.2 Go Preferens - Settings. At top right corner click "{}" <br>
2.3 In settings.json write this line: "terminal.integrated.shell.windows": "C:\\WINDOWS\\Sysnative\\bash.exe"<br>
2.4 Now default console will be bash.exe from gitbash<br>
2.5 Open terminal<br>
2.5.1 sudo apt update<br>
2.5.2 sudo apt install nodejs<br>
2.5.3 sudo apt install npm<br>
2.5.4 sudo npm install less -g<br>
2.5.6 sudo npm install less-watch-compiler -g<br>

# To compile less -> css user cmd: less-watch-compiler [less folder] [css folder output] <br>
less-watch-compiler.config.json<br>
{<br>
    "watchFolder": "src",<br>
    "outputFolder": "dist",<br>
    "mainFile": "main.less"<br>
}<br>
<br>
3. Download gitbash for Win10.<br>

# gitbash cmd:<br>
<br>
git init<br>
git add .<br>
git remote add origin [repository]<br>
git commit -m "comment"<br>
git push origin master \ git pull origin master<br>


