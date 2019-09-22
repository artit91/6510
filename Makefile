.PHONY: clean

PRG = $(patsubst tests/%.asm, tests/%.prg, $(wildcard tests/**/*.asm))

all: $(PRG)

tests/%.prg: tests/%.asm
	tmpx -i $< -o $@

clean:
	find tests -name "*.prg" -type f -delete
