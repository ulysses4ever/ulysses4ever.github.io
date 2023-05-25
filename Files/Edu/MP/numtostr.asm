;       numtostr.asm
;       print a number in hex

.model small

.stack 100h

.data
        num             dw      20      ; number to print
        msk             dw      0fh     ; mask to get first 4 bits
        zero_char       dw      '0'     ; constants
        a_char          dw      'A'     ;       to make ASCII hex-figures
        result          db      4 dup (0),'h$'  ; result string

.code
start:
        mov     ax, _DATA       ; loading address
        mov     ds, ax          ;       of the data segment

        mov     bx, offset result       ; loading addr of result string
                                        ; to manipulate C-pointer-style
        mov     cl, 0           ; shift to get next 4-bit group
                                ;       to the bits #1-3 (begining of byte)
cont_print:
        mov     ax, num
        shr     ax, cl
        and     ax, msk
        cmp     ax, 10
        jge     letter          ; figure 'A'..'F'
        add     ax, zero_char   ; figure '0'..'9'
        jmp     print
letter:
        sub     ax, 10
        add     ax, a_char
print:
        mov     [bx], al        ; print current figure into result string
        inc     bx              ; move to place for the next figure
        add     cl, 4
        cmp     cl, 16
        jl      cont_print
; end of cycle

        mov     dx, offset result
        mov     ah, 09
        int     21h

;exit:
        mov     ah, 4ch
        int     21h
END start
