CC = gcc
CFLAGS = -Wall -Wextra -std=c99 -D_GNU_SOURCE -g
FLEX = flex
BISON = bison

TARGET = kotlin_parser
SOURCES = main.c ast.c parser.tab.c lex.yy.c
HEADERS = ast.h parser.tab.h

all: $(TARGET)

parser.tab.c parser.tab.h: parser.y
	$(BISON) -d parser.y

lex.yy.c: lexer.l parser.tab.h
	$(FLEX) lexer.l

$(TARGET): $(SOURCES) $(HEADERS)
	$(CC) $(CFLAGS) $(SOURCES) -o $(TARGET)

clean:
	rm -f $(TARGET) parser.tab.c parser.tab.h lex.yy.c *.o

test: $(TARGET)
	@echo "Running Parser Test Suite..."
	@bash ../tests/run_tests.sh

.PHONY: all clean test
