all: build

build:
	cd ./frontend && ember build --environment=production

run-frontend:
	@cd ./frontend && ember serve --port 4200

install: install-frontend

install-frontend:
	cd frontend && npm install
	cd frontend && bower install
