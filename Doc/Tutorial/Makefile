all: clean build

build:
	pdflatex template.tex
	bibtex template.aux
	pdflatex template.tex
	makeglossaries template.glo
	pdflatex template.tex

clean:
	@rm -f *.aux
	@rm -f *.idx
	@rm -f *.glo
	@rm -f *.ist
	@rm -f *.lof
	@rm -f *.log
	@rm -f *.lot
	@rm -f *.out
	@rm -f *.pdf
	@rm -f *.toc
	@rm -f *.bbl
	@rm -f *.blg
	@rm -f *.glg
	@rm -f *.gls
	@rm -f *.tcp
	@rm -f kapitel/*.aux
	@rm -f vorspann/*.aux
	@rm -f datenbanken/*.aux
