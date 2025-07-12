```bash
# run dev mode

## telegram mode 
yarn dev:watch --telegram

## cli mode
yarn dev:watch --cli

# build for production
yarn build

# run production
yarn start
```

## Envs

Envs can be store in `.env` file:

* `AI_PROVIDER` — Selected AI Provider
OpenAI configuration:
* `OPENAI_API_KEY` — Open AI Api key (if use)
* `OPENAI_MODEL_TOOLS` — Model for tool handle 
* `OPENAI_MODEL_TALK` — Model for simple talk handle
Gigachat configuration:
* `GIGACHAT_CLIENT_ID` — Gigachat Client ID 
* `GIGACHAT_CLIENT_SECRET` — Gigachat Client Secret
* `GIGACHAT_CLIENT_SCOPE` — Gigachat Client Scope
* `GIGACHAT_MODEL_TALK` — Model for tool handle
* `GIGACHAT_MODEL_TOOLS` — Model for simple talk handle
* `TELEGRAM_BOT_TOKEN` — Telegram bot token for Telegram mode