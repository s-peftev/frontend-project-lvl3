install:
	npm ci

lint:
	npx eslint .

prettier:
	npx prettier --write .

test-coverage:
	npm test -- --coverage --coverageProvider=v8