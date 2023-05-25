.model small

.stack 100h

.data
        a       dq      34
.code
start:
;        mov     ax, _data
;        mov     ds, ax

        fld     a
        
END start
