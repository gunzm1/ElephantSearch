all: clean build

build:
	pdflatex template.tex
	bibtex template.aux
	makeglossaries template.glo
	pdflatex template.tex

clean:
	@rm -f template.aux template.idx template.glo template.ist template.lof template.log template.lot template.out template.pdf template.toc template.gls
