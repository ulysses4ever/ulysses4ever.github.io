; prints first char which is different in str1 from str2
; usinf string instructions

.model small

.stack 100h

.data
str1    db      'String 1 - !!1'
str2    db      'String 1 - !!!'
len     dw      $-str2
crlf    db      10,13,'$'

.code
start:
        mov     ax, _data
        mov     ds, ax   
        mov     es, ax  ; prepare segment register for string instruction

        lea     si, str1 ; load offset of 'source-string'
        lea     di, str2 ; load offset of 'destination-string'
        cld              ; clear DF - direction flag - scan forward
                                ; (not backward)
        mov     cx, len  ; strings' length
        repe cmpsb

        je    exit ; if CF isn't set, strings are equal - go to exit

print:
                          ; print different char
        dec     di        ; the different char is in di-1 position
        mov     dl, es:di
        mov     ah, 2
        int     21h

                          ; print crlf
        mov     dx, offset crlf
        mov     ax, 9
        int     21h

exit:
        mov     ah, 4ch
        int     21h
END start
