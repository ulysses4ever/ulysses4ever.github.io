.model large        
.586P   ; allow instruction of Pentium
; struct for description of segments descriptors
descr struct
        limit   dw      0       ;size of segment
        base_1  dw      0       ;line address of the begining of segment
        base_2  db      0       ;24-31  
        attr    db      0       ;atributes
        lim_atr db      0
        base_3  db      0
descr ends


load_descr macro des,seg_addr,seg_size ; fill descriptor
        mov des.limit,seg_size
        xor eax,eax
        mov ax,seg_addr ; ax = addres of segment
        shl eax,4       ; get phisycal addr
        mov des.base_1,ax
        rol eax,16      ; remind of address
        mov des.base_2,al
endm

atr0 macro descr,bit1,bit2,bit3 ; sum of constants
        atr_&descr=constp or bit1 or bit2 or bit3
endm
; psevdodescriptor
point struct
        lim dw 0
        adr dd 0
point ends
; bits 0,4,5,6,7 - constant part
; byte AR for all types of segments      
constp  equ 10010000b;  segment in memory, not system and now in memory
; bit 1 - read or write
code_r_n equ 00010000b ; segment of code, not read 
code_r_y equ 00000010b ; segment of code, can read 
data_wm_n equ 00000000b; segment of data, not change  
data_wm_y equ 00000010b; segment of data, can change        
; bit 2 - type of segment
code_n equ 00000000b   ; usual segment 
code_p equ 00000100b   ; subordinate
data_ equ 00000000b    ; segment of data 
stack_ equ 00000000b   ; stack segment 
code_ equ 00001000b    ; code segment 
data_stk equ 00000000b ; segment of data or stack 

stk     segment stack   "stack" use16
        db      256 dup(0)
stk     ends
;GDT
gdt_seg segment para public "data" use16 ; initialization of table of descrioptors
        gdt_0   descr <0,0,0,0,0,0> ; never used
                atr0 gdt_gdt_8,data_wm_y,data_,data_stk   
        ;GDT
        gdt_gdt_8   descr <0,0,0,atr_gdt_gdt_8,0,0>
        ; not used
        gdt_ldt_10   descr <0,0,0,0,0,0>
                atr0 gdt_ds_18,data_wm_y,data_,data_stk     
        ; descriptor of data segment
        gdt_ds_18    descr <0,0,0,atr_gdt_ds_18,0,0>
                atr0 gdt_es_vbf_20,data_wm_y,data_,data_stk    
        ; videobuffer
        gdt_es_vbf_20   descr <0,0,0,atr_gdt_es_vbf_20,0,0>         
                atr0 gdt_ss_28,data_wm_y,stack_,data_stk  
        ; stack segment
        gdt_ss_28       descr <0,0,0,atr_gdt_ss_28,0,0>     
                atr0 gdt_cs_30,code_r_y,code_n,code_                 
        ; code segment
        gdt_cs_30       descr <0,0,0,atr_gdt_cs_30,0,0>         
        gdt_size = $-gdt_0-1;   size of table GDT -1
gdt_seg  ends

    
data    segment para    public  "data"  use16
        point_gdt       point<gdt_size,0>
        line   db       'Enter line: ',13,10,'$'
        max_length      db      100
        act_length      db      ?
        buf             db      100 dup (0)     
        data_size =     $-point_gdt-1
data    ends

code    segment byte    public  "code"  use16
        assume  cs:code,        ss:stk
        main    proc
                mov     ax,     stk
                mov     ss,     ax
        ; fill GDT
        assume  ds:gdt_seg
                mov     ax,     gdt_seg
                mov     ds,     ax
                load_descr      gdt_gdt_8, gdt_seg, gdt_size
                load_descr      gdt_ds_18, data, data_size
                load_descr      gdt_es_vbf_20,0b800h, 4000
                load_descr      gdt_ss_28, stk, 255
                load_descr      gdt_cs_30, code, 0ffffh ; code size
        assume  ds:data
                mov     ax,     data
                mov     ds,     ax

                ; load gdtr
                xor     eax,    eax
                mov     ax,     gdt_seg
                shl     eax,    4
                mov     point_gdt.adr,  eax
                lgdt    fword ptr point_gdt

                mov     dx,     offset  line
                mov     ah,     09h
                int     21h
                
                mov     dx,     offset  max_length
                mov     ah,     0Ah
                int     21h

                mov     ax,     3
                int     10h

                
                
                ; lock interruptions
                cli     
                mov     al,     80h
                out     70h,    al

                ; go to protecting mode    
                mov     eax,    cr0
                or      al,     1
                mov     cr0,    eax
                ; setting of registers
                db      0eah    ; machine code of jmp
                dw      offset  protect; offset of label of jump in segment of commands
                dw      30h     ; selector of code segment in GDT
                
                protect:
                ; load selectors for other descriptors
                        mov     ax,     18h
                        mov     ds,     ax      ; 18h - descriptor of data segment
                        mov     ax,     20h     ; for videobuf
                        mov     es,     ax      ; 20h - descriptor of additional data segment
                        mov     ax,     28h
                        mov     ss,     ax      ; 28h - descriptor of stack segment
                        
                        xor     cx,     cx  
                        mov     cl,     act_length; length of message
                        mov     si,     offset  max_length[2]; address of message
                        mov     di,     1640; address of videobuf for output 
                        mov     ah,     07h; atribute of outputing symbols
                outstr:
                        mov     al,     [si]
                        mov     es:[di],ax
                        inc     si
                        inc     di        
                        inc     di                                     
                        loop    outstr
        ; return to real mode        
        ; form descriptors for real mode
        assume ds:gdt_seg
                mov     ax,     8h
                mov     ds,     ax
                mov     gdt_ds_18.limit, 0ffffh
                mov     gdt_es_vbf_20.limit, 0ffffh
                mov     gdt_ss_28.limit, 0ffffh        
                mov     gdt_cs_30.limit, 0ffffh
        assume ds:data
        ; load shadow descriptors
                mov     ax,     18h
                mov     ds,     ax
                mov     ax,     20h
                mov     es,     ax
                mov     ax,     28h
                mov     ss,     ax
                db      0eah
                dw      offset  jump
                dw      30h
        jump:
                ; turn to real mode
                mov     eax,    cr0
                and     al,     0feh
                mov     cr0,    eax
                ;load selector for cs
                db      0eah
                dw      offset  r_mode
                dw      code
        r_mode:
                ; settings of system registers
                mov     ax,     data
                mov     ds,     ax
                mov     ax,     stk
                mov     ss,     ax
                sti     ; allow interruption, IF = 1
                xor     al,     al
                out     70h,    al
                ;       standard of programm finish
                mov     ax,     4c00h
                int     21h
main endp                               
code    ends
end     main               