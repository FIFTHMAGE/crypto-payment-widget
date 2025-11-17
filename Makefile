.PHONY: install build test deploy

install:
	npm install

build:
	npm run build

test:
	npm test

deploy:
	./scripts/deploy.sh

