*=$C000 ; 00 C0
start
    ldx #$00 ; A2 00
loop
    ; a = *(message + x)
    lda message, x ; BD message[0E C0 => C0 0E]
    ; *0400 + x = a
    sta $0400, x ; 9D 00 04 => [04 00]
    ; x += 1
    inx ; E8
    ; x ? 12
    cpx #$0C ; E0 0C
    ; x <> 12? => loop
    bne loop ; D0 loop[PC + signed byte F5]
    ; return
    rts ; 60
message
    .screen "hello world!"