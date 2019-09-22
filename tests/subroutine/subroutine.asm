*=$C000
start
    lda #$00
loop
    pha
    jsr print
    pla
    clc
    adc #$01
    cmp #$0C
    bne loop
    rts
print
    tax
    lda message, x
    sta $0400, x
    rts
message
    .screen "hello world!"