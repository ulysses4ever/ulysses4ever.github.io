.model tiny 			;������ ������ � COM
.code 				;������ �������� ����
org 100h 			;��������� �������� ��������
start:   	 		;������ ��������� start

mov ah,9 			;������� DOS ������ �� �����
mov dx,OFFSET greet 		;ds:dx ��������� �� 'Hello, world!' 
int 21H 			;����� �� �����

ret 				;���������� COM-���������

greet DB "Hello, world!",00h,0Ah,'$'	;�������� ��������� ������ ��� ������
END start  			;����� ��������� � ������ ����� start