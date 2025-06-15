# Quick Setup Instructions

## 🚀 Get Started in 5 Minutes

### 1. Clone the Repository
```bash
git clone https://github.com/passwordless-OTP/metabase-mcp-service.git
cd metabase-mcp-service
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
- **METABASE_API_KEY**: Get from your Metabase instance (Settings → Admin → API Keys)
- **OPENAI_API_KEY**: Get from https://platform.openai.com/api-keys

### 3. Start Everything
```bash
# First time setup (builds images, creates databases)
make setup

# Start development environment
make dev
```

### 4. Verify Services
- **MCP Server**: http://localhost:8080/health
- **Metabase**: http://localhost:3000
- **API Documentation**: http://localhost:8080/mcp/tools

### 5. Test the MCP Tools

#### Test Natural Language Query:
```bash
curl -X POST http://localhost:8080/mcp/tools/query_data \
  -H "Content-Type: application/json" \
  -d '{
    "params": {
      "question": "Show me total sales by month"
    }
  }'
```

#### Test Dashboard Creation:
```bash
curl -X POST http://localhost:8080/mcp/tools/create_dashboard \
  -H "Content-Type: application/json" \
  -d '{
    "params": {
      "description": "Sales performance dashboard with key metrics"
    }
  }'
```

## 📋 Available Commands

```bash
make help          # Show all available commands
make dev           # Start development environment
make logs          # View logs
make shell         # Shell into MCP container
make test          # Run tests
make clean         # Stop all containers
make reset         # Full reset (removes all data)
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Check what's using the ports
lsof -i :3000  # Metabase
lsof -i :8080  # MCP Server
lsof -i :5432  # PostgreSQL

# Stop conflicting services or change ports in docker-compose.yml
```

### Metabase Not Starting
```bash
# Check Metabase logs
docker-compose logs metabase

# Ensure PostgreSQL is healthy
docker-compose ps
```

### API Key Issues
1. Log into Metabase at http://localhost:3000
2. Default credentials: admin@metabase.local / password
3. Go to Settings → Admin → API Keys
4. Create a new API key and update .env

## 📚 Next Steps

1. **Explore the API**: Check all available tools at http://localhost:8080/mcp/tools
2. **Modify Tools**: Edit files in `src/mcp/tools/` to enhance functionality
3. **Add Tests**: Create tests in `tests/` directory
4. **Deploy**: Use the Heroku button in README or deploy to your cloud provider

## 💡 Tips

- Use `docker-compose logs -f mcp-server` to watch logs in real-time
- The sample database includes e-commerce data for testing
- All code changes auto-reload (no need to restart)
- Check `PROJECT_STATUS.md` for detailed implementation status

Happy coding! 🎉