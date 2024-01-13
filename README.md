# Elysia with Bun runtime

## Configuration

Install [NVM](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating)

Install NodeJS with NVM

```bash
nvm install
nvm use
```

Install Bun

```bash
curl https://bun.sh/install | bash
```

Install dependencies

```bash
bun install
```

Create a .env.local file with correct variables for your Postgresql database.

```env
LEXICON_DB_USER=user
LEXICON_DB_PWD=password
LEXICON_DB_HOST=localhost
LEXICON_DB_PORT=5432
LEXICON_DB_DATABASE=my_db
LEXICON_DB_SCHEMA=my_schema
```

## Development

To start the development server run:
```bash
bun run dev
```

Open http://localhost:3003/ with your browser to see the result.