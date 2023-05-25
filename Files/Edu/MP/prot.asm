; switching to protected mode

.586P
.MODEL  large
;include        mac.inc

descr   STRUC ; data structure for segment descriptor
        limit   dw      0
        base_1  dw      0
        base_2  db      0
        attr    db      0
        lim_atr db      0
        base_3  db      0
descr   ENDS

; descriptor init
comment @
load_descr      MACRO   des,seg_addr,seg_size
        mov     des.limit,seg_size
        xor     eax,eax
        mov     ax,seg_addr
        shl     eax,4
        mov     des.base_1,ax
        rol     eax,16
        mov     des.base_2,al
        ENDM
@

; AR byte
;atr    MACRO   descr,bit1,bit2,bit3
;       atr_&descr=constp or bit1 or bit2 or bit3
;       ENDM

; structure for gdtr
point   STRUC
lim     dw      0
adr     dd      0
point   ENDS

; ************************* constants for AR    
; const part of AR
constp  equ     10010000b
; AR bit 1
code_r_n        equ     00010000b       ;������ ᥣ����:
                        ;�⥭�� ����饭�;
code_r_y        equ     00000010b       ;������ ᥣ����:
                        ;�⥭�� ࠧ�襭�
data_wm_n       equ     00000000b       ;ᥣ���� ������:
                        ;����䨪��� ����饭�
data_wm_y       equ     00000010b       ;ᥣ���� ������:
                        ;����䨪��� ࠧ�襭�;
; AR bit 2
code_n  equ     00000000b       ;����� ᥣ���� ����
code_p  equ     00000100b       ;���稭���� ᥣ���� ����
data_   equ     00000000b       ;��� ᥣ���� ������
stack_  equ     00000000b       ;��� ᥣ���� �⥪�

; AR bit 3
code_   equ     00001000b       ;ᥣ���� ����
data_stk        equ     00000000b       ;ᥣ���� ������ ��� �⥪�
; ************************* end of constants for AR     

; stack segment
stk     segment stack 'stack' use16
        db      256 dup (0)
stk     ends

;**********************Global Descriptor Table
gdt_seg segment para public 'data' use16

        gdt_0   descr   <0,0,0,0,0,0>   ; never use

        atr     = constp or data_wm_y or data_ or data_stk
        gdt_gdt_8       descr   <0,0,0,atr,0,0>

        gdt_ldt_10      descr   <0,0,0,0,0,0> ; won't use LDT

        atr     = constp or data_wm_y or data_ or data_stk
        gdt_ds_18       descr   <0,0,0,atr,0,0>

;       atr     gdt_vbf_20,data_wm_y,data_,data_stk
;       gdt_es_vbf_20   descr   <0,0,0,atr_gdt_vbf_20,0,0>

;       atr     gdt_ss_28,data_wm_y,stack_,data_stk
;       gdt_ss_28       descr   <0,0,0,atr_gdt_ss_28,0,0>
        
        atr     = constp or code_r_y or code_n or code_
        gdt_cs_30       descr   <0,0,0,atr,0,0> 

        gdt_size=$-gdt_0-1      ;ࠧ��� GDT ����� 1
GDT_SEG ENDS
;**************************** End of GDT

;**************************** Data Segmenet
data    segment para public 'data' use16
point_gdt       dw              gdt_size
gdt_base        dd              ?
hello           db              "Output in protected mode"
hel_size        =               $ - hello
tonelow         dw              2651    ; lower bound for beep
temp            dw              ?               ; upper bound for beep
cnt             db              0               ; counter for out
data_size       =               $ - point_gdt - 1
data    ends
;**************************** End of Data Segmenet

;**************************** Code Segmenet
code    segment byte public 'code' use16
main    proc
        mov     ax,stk
        mov     ss,ax

; fill GDT
        ; mov GDT address to data seg register
        mov     ax,gdt_seg
        mov     ds,ax

        ; load_descr    gdt_gdt_8,GDT_SEG,gdt_size
        ; fill GDT descriptor
        mov     gdt_gdt_8.limit, gdt_size
        xor     eax,eax
        mov     ax, GDT_SEG
        shl     eax,4
        mov     gdt_gdt_8.base_1, ax
        rol     eax,16
        mov     gdt_gdt_8.base_2, al
 
;       load_descr      gdt_ds_18,DATA,data_size
        ; fill data seg descriptor
        mov     gdt_ds_18.limit, data_size
        xor     eax,eax
        mov     ax, DATA
        shl     eax,4
        mov     gdt_ds_18.base_1, ax
        rol     eax,16
        mov     gdt_ds_18.base_2, al

;       load_descr      gdt_es_vbf_20,0b800h,3999
;       load_descr      gdt_ss_28,STK,255

;       load_descr      gdt_cs_30,CODE,0ffffh   ;code_size
        ; fill code seg descriptor
        mov     gdt_cs_30.limit, 0ffffh ; code size in store
        xor     eax,eax
        mov     ax, CODE
        shl     eax,4
        mov     gdt_cs_30.base_1, ax
        rol     eax,16
        mov     gdt_cs_30.base_2, al
; end of GDT filling

        ; move ordinary data sement address to ds
        mov     ax,data
        mov     ds,ax

; load gdtr
        xor             eax, eax
        mov             ax, gdt_seg
        shl             eax, 4
        mov             gdt_base, eax
        lgdt            fword ptr point_gdt

; ban interuptions
        cli
        mov     al,80h
        out     70h,al
        
; switch to protected mode
        mov     eax,cr0
        or      al,1
        mov     cr0,eax
        
; load selectors to segment registers
        db      0eah                    ; jmp opcode
        dw      offset protect  
        dw      30h                             ; code segment selector in GDT

protect:
        mov     ax,18h
        mov     ds,ax
        mov     ax,20h
        mov     es,ax
        mov     ax,28h
        mov     ss,ax
        
;************************ work in protected mode
comment @
;�뢮��� ��ப� � ���������
        mov     cx,hel_size     ;����� ᮮ�饭��
        mov     si,offset hello ;���� ��ப� ᮮ�饭��
        mov     di,1640 ;��砫�� ���� ��������� ��� �뢮��
        mov     ah,07h  ;��ਡ�� �뢮����� ᨬ�����
outstrr:
        mov     al,[si]
        mov     es:[di],ax
        inc     si
        inc     di
        inc     di
        loop    outstrr
;����᪠�� �७�
go:
;����ᨬ ᫮�� ���ﭨ� 110110110b (0�6h):
;�롨ࠥ� ��ன ����� ���� 43h - �������
        mov     ax,0B06h
        out     43h,ax  ;� ���� 43h
        in      al,61h  ;����稬 ���祭�� ���� 61h � al
        or      al,3    ;���樠�����㥬 ������� - ������ ⮪
        out     61h,al  ;� ���� 61h
        mov     cx,2083 ;������⢮ 蠣��
musicup:
;� ax ���祭�� ������ �࠭��� ����� 1193000/2651 = 450 ��,
;��� 1193000- ���� ��������
        mov     ax,tonelow
        out     42h,al  ;al � ���� 42h
        mov     al,ah   ;����� ����� al � ah
        out     42h,al  ;���訩 ����ax (ah) � ���� 42h
        add     tonelow,1       ;㢥��稢��� �����
        delay   1       ;����প� �� 1 ���
        mov     dx,tonelow      ; ⥪�饥 ���祭�� ����� � dx
        mov     temp,dx ;temp - ���孥� ���祭�� �����
        loop    musicup ;������� 横� ����襭��
        mov     cx,2083
musicdown:
        mov     ax,temp ;���孥� ���祭�� ����� � ax
        out     42h,al  ;����訩 ����ax (al)� ���� 42h
        mov     al,ah   ;����� ����� al � ah
        out     42h,al  ;� ���� 42h 㦥 ���訩 ���� ax (ah)
        sub     temp,1  ;㬥��蠥� ���祭�� �����
        delay   1       ;����প� �� 1 ���
        loop    musicdown       ;������� 横� ���������
nosound:
        in      al,61h  ;����稬 ���祭�� ���� 61h � al
;᫮�� ���ﭨ� - �몫�祭�� �������� � ⠩���
        and     al,0FCh
        out     61h,al  ;� ���� 61h
        mov     dx,2651 ;��� ��᫥����� 横���
        mov     tonelow,dx
;㢥��稢��� ����稪 ��室�� - ������⢮ ���砭�� �७�
        inc     cnt
        cmp     cnt,5   ;5 ࠧ
        jne     go      ;�᫨ ��� - ��� �� ���� go
@
;******************** end of work in protected mode

; form descriptors for real mode
        mov     ax,8h
        mov     ds,ax
        mov     gdt_ds_18.limit,0ffffh
;        mov     gdt_es_vbf_20.limit,0ffffh
;        mov     gdt_ss_28.limit,0ffffh
        mov     gdt_cs_30.limit,0ffffh

;load "shadow" regs
        mov     ax,18h
        mov     ds,ax
        mov     ax,20h
        mov     es,ax
        mov     ax,28h
        mov     ss,ax
        db      0eah
        dw      offset jump
        dw      30h
        
jump:
        mov     eax,cr0
        and     al,0feh
        mov     cr0,eax
        db      0eah
        dw      offset r_mode
        dw      code
        
r_mode:
        mov     ax,data
        mov     ds,ax
        mov     ax,stk
        mov     ss,ax
        
; allow interruptions
        sti
        xor     al,al
        out     70h,al

; happy end
        mov     ax,4c00h
        int     21h
main    endp
code    ends
        end     main
