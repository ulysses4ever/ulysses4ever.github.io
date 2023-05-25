; lrs.asm - linear reccuring sequence calculator

.286
.model small

extrn hexstr : far ; prints ax as hex number

.data
        a       dw      1, 3, 6
        k       dw      ($-a)/2
        f       dw      2, 5, 4
        n       dw      4
        
        res     dw      0

.code

lrs     PROC    near
        push    bp
        mov     bp, sp
        pusha

        lres    EQU [bp+4]
        lf      EQU [bp+6]
        la      EQU [bp+8]
        lk      EQU [bp+10]
        ln      EQU [bp+12]

        sub     sp, 2
        i       EQU [bp-2]
        mov     word ptr i, 1

        mov     ax, ln
        sub     ax, lk
        jle     nlessoreqk
        mov     ln, ax      ; number of convolution steps 
                            ; (i. e. evaluations of \sum a_{m+i}f_i)

        mov     si, lk
        add     si, si
        mov     lk, si      ; convolution length scaled for words (2*k)

        mov     word ptr lres, word ptr 0
        mov     si, 0       ; inner convolution index

an:   
conv:
        mov     bx, la
        mov     ax, [bx + si]

        mov     bx, lf
        mov     dx, [bx + si]
        mul     dx

        add     lres, ax

        add     si, 2
        cmp     si, lk
        jl      conv

        mov     ax, i
        cmp     ax, ln
        je      lexit

        inc     ax
        mov     i, ax

; shift a_i's (push back a_j just computed, throw a_{j-k})
        mov     dx, lres
        mov     word ptr lres, 0
        mov     si, 0
shifta:
        mov     bx, la
        mov     ax, [bx + si]
        mov     [bx + si], dx
        mov     dx, ax

        add     si, 2
        cmp     si, lk
        jl      shifta
        jmp     an

nlessoreqk:
        mov     bx, la
        mov     si, ln
        add     si, ln ; ln * 2 - scaling index to words
        push    [bx][si-2]
        pop     lres

lexit:
        add     sp, 2 ; clear i
        popa
        pop     bp
        ret
lrs     ENDP

start:
        mov     ax, _data
        mov     ds, ax

        mov     cx, 4  ; counter for a_i's to compute
lp:
        mov     a, 1
        mov     a[2], 3
        mov     a[4], 6
        push    n
        push    k
        push    offset a
        push    offset f
        push    ax
        call    lrs
        pop     res
        add     sp, 8

        mov     ax, res
        call    hexstr
        shl     n, 1
        loop    lp

        mov     ax, 4c00h
        int     21h

end start
