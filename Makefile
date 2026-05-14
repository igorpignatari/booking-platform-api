.PHONY: install dev build start test test-watch test-coverage lint lint-fix format check clean prepare

# ── Setup ──────────────────────────────────────────────────────────────────────
install:
	npm install

prepare:
	npm run prepare

# ── Dev ────────────────────────────────────────────────────────────────────────
dev:
	npm run dev

build:
	npm run build

start:
	npm run start

# ── Test ───────────────────────────────────────────────────────────────────────
test:
	npm run test

test-watch:
	npm run test:watch

test-coverage:
	npm run test:coverage

test-all:
	sudo docker compose -f docker-compose.test.yml up -d
	npx jest && npx jest --config jest.integration.config.ts
	sudo docker compose -f docker-compose.test.yml down
	sudo docker compose -f docker-compose.test.yml up -d
	npx jest --config jest.e2e.config.js
	sudo docker compose -f docker-compose.test.yml down


# ── Code Quality ───────────────────────────────────────────────────────────────
lint:
	npm run lint

lint-fix:
	npm run lint:fix

format:
	npm run format

check:
	npm run check

# ── Clean ──────────────────────────────────────────────────────────────────────
clean:
	rm -rf dist dist-test coverage node_modules

# ── Git Hooks ──────────────────────────────────────────────────────────────────
hooks:
	npx husky init
	echo "npx lint-staged" > .husky/pre-commit
	echo "npx --no -- commitlint --edit \$$1" > .husky/commit-msg
