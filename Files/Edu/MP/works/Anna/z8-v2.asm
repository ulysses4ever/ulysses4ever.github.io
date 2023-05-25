.model large

.586p

point   struc 
        lim     dw 0
        adr     dd 0
point   ends


descr   struc
        limit           dw 0
        base_1          dw 0
        base_2          db 0
        ar              db 0
        lim_attr        db 0
        base_3          db 0
descr   ends 

gdt_seg segment para public 'DATA' use16
        gdt_0           descr <0,0,0,0,0,0>
        gdt_gdt         descr <0,0,0,0,0,0>
        gdt_ldt         descr <>
        gdt_ds          descr <0,0,0,0,0,0>
        gdt_cs          descr <0,0,0,0,0,0>
        gdt_ss          descr <0,0,0,0,0,0>
        gdt_buf         descr <0,0,0,0,0,0>
        gdt_size        = $-gdt_0-1
gdt_seg ends


stk     segment stack "stack" use16
        db      256 dup(0)
stk     ends

gdt_ss_size=100h
gdt_buf_size=1000h
gdt_cs_size=protect-cs_m-1

data    segment para public "data" use16
        d               db 0
        hi              db 'Vse ok!$'
        _stk            dw 0
        _code           dw 0
        point_gdt       point <gdt_size,0>
        gdt_ds_size     = $-d-1
data    ends

code segment para public 'CODE' use16
start:
                        ; initializing gdt
mov ax,gdt_seg
mov ds,ax

mov ebx, offset  gdt_buf 
mov [ebx].limit,1000h
xor ax,ax
mov ax, 0B800h
mov dx,ax
and ax,0fh
mov cl,4
shl ax,cl
mov [ebx].base_1,ax
and dx,0f0h
mov cl,4
shr dx,cl
mov [ebx].base_2,dl
mov ax,10010110b
mov [ebx].ar,al

mov ebx, offset  gdt_gdt 
mov [ebx].limit,gdt_size
xor eax,eax
mov ax, gdt_seg
mov dx,ax
and ax,0fh
mov cl,4
shl ax,cl
mov [ebx].base_1,ax
and dx,0f0h
mov cl,4
shr dx,cl
mov ebx,offset gdt_gdt
mov [ebx].base_2,dl
mov ax,10010010b
mov [ebx].ar,al

mov ebx, offset  gdt_ds 
mov [ebx].limit,gdt_ds_size
xor ax, ax
mov ax, data
shl eax, 4
mov [ebx].base_1, ax
rol eax, 16
mov [ebx].base_2, al
comment @
mov ds,ax
and ax,0fh
mov cl,4
shl ax,cl
mov [ebx].base_1,ax
and dx,0f0h
mov cl,4
shr dx,cl
mov [ebx].base_2,dl
@
mov ax,10010010b
mov [ebx].ar,al

mov ebx, offset  gdt_ss 
mov [ebx].limit,gdt_ss_size
xor ax,ax
mov ax, ss
mov dx,ax
and ax,0fh
mov cl,4
shl ax,cl
mov [ebx].base_1,ax
and dx,0f0h
mov cl,4
shr dx,cl
mov [ebx].base_2,dl
mov ax,10010110b
mov [ebx].ar,al


mov ebx, offset  gdt_cs 
mov [ebx].limit, 0ffffh
xor eax, eax
mov ax, code
        comment @
mov dx,ax
and ax,0fh
mov cl,4
shl ax,cl
mov [ebx].base_1,ax
and dx,0f0h
mov cl,4
shr dx,cl
mov [ebx].base_2,dl
        @
shl eax, 4
mov [ebx].base_1, ax
rol eax, 16
mov [ebx].base_2, al
mov ax,10011010b
mov [ebx].ar,al

                        ; end of gdt-init
        
mov dx,data
mov ds,dx

                        ; load gdtr
xor eax,eax
mov ax,gdt_seg
shl eax,4
mov ebx, offset point_gdt
mov [ebx].adr,eax
                        ; trace
mov ah, 09h
mov edx, offset hi
int 21h

lgdt fword ptr point_gdt

                        ; trace                
mov ah,09h
mov edx,offset hi
int 21h
;mov _stk,ss
;xor eax,eax
;mov ax,cs
;mov _code,ax

cli             ; iterruptions OFF
;in al,70h
mov al,80h
out 70h,al

                ; switch to protected mode
mov eax,cr0
or eax,0001h
mov cr0,eax

                ; load segment regs in pm-style
                ; first - cs
;db 66h
db 0eah
dw offset protect
dw 20h
                ; then - others
protect:
mov ax,18h
mov ds,ax
mov ax,28h
mov ss,ax
mov ax,30h
mov es,ax

; mov ax,es ; - redundant
; mov ds,ax ; -||-
comment @
mov ebx,1
mov ah, 4Eh
mov al,'s'
mov [ebx],ax
@
;mov [ebx+1],'s'

                        ; load shadow registers
mov ax, 8h
mov ds,ax
mov ebx,offset gdt_ds
mov [ebx].limit, 0ffffh
mov ebx, offset gdt_buf
mov [ebx].limit,0ffffh
mov ebx,offset gdt_ss
mov [ebx].limit,0ffffh
mov ebx,offset gdt_cs
mov [ebx].limit,0ffffh

mov ax,18h
mov ds,ax
mov ax,28h
mov ss,ax
mov ax,30h
mov es,ax
db 0eah
dw offset to_real
dw 20h

to_real:           ; switch to real mode
mov eax,cr0
and eax,00feh
mov cr0,eax

                ; set segment regs in real time-style
db 0eah         ; first - cs
dw offset real_mode
dw code
real_mode:
mov ax,data    ; then - others
mov ds,ax
mov es,ax
mov ax,stk
mov ss,ax

sti             ; interrupts ON
xor al,al
out 70h,al

;exit
;protect:
mov ah,4ch
int 21h
cs_m:code ends
end start
