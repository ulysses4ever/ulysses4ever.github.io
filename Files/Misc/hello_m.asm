.model tiny 			;модель памяти в COM
.code 				;начало сегмента кода
org 100h 			;начальное значение счетчика
start:   	 		;начало процедуры start

mov ah,9 			;функция DOS вывода на экран
mov dx,OFFSET greet 		;ds:dx указывает на 'Hello, world!' 
int 21H 			;вывод на экран

ret 				;завершение COM-программы

greet DB "Hello, world!",00h,0Ah,'$'	;описание текстовой строки для вывода
END start  			;конец программы с точкой входа start