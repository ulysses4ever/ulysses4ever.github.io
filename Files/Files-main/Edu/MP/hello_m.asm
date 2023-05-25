stack SEGMENT PARA STACK 'STACK'
    DB 64 DUP('STACK ')
stack ENDS
;
dseg SEGMENT PARA PUBLIC 'DATA'
    greet DB 'Hello, world!$'
dseg ENDS
;
cseg SEGMENT PARA PUBLIC 'CODE'
start PROC FAR
    ASSUME CS:CSEG,DS:DSEG,SS:STACK,ES:NOTHING
    mov ax,dseg
    mov ds,ax

    mov dx,OFFSET greet
    mov ah,09H
    int 21H

    mov ah,4CH
    int 21H
start ENDP
cseg ENDS
END start
