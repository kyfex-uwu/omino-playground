rmdir omino-playground-test\files /s /q
mkdir omino-playground-test\files

copy public_assets\omino-playground.js omino-playground-test\files
copy views\ominoes.html omino-playground-test\files
xcopy public_assets\omino omino-playground-test\files\omino\ /s /e /h