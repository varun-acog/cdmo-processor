# cdmo-processor
## Create a .env file
```bash
OLLAMA_BASE_URL=https://ollama.own1.aganitha.ai
USER_NAME=ldap_username
USER_PASSWORD=ldap_password
GEMINI_API_KEY=your-gemini-key
LLM_MODEL=gpt-4o
OPENAI_API_KEY=your-OpenAI-key
```
## For report generation
```bash
docker compose run cdmo-processor npm run cli -- report sample.pdf
```
## For querying
```bash
docker compose run cdmo-processor npm run cli -- query "What is the boiling point of this material from 'sample.pdf'?"
```
