# Metabase MCP Service

## AI-powered natural language interface for Metabase using Model Context Protocol

MMS (Metabase MCP Service) enables users to interact with Metabase using natural language queries, automatically create visualizations, and build dashboards through an AI assistant interface.

## 🚀 Quick Start (MVP)

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Metabase instance (or use the included docker-compose)
- Metabase API key

### Local Development

```bash
# Clone repository
git clone https://github.com/passwordless-OTP/metabase-mcp-service.git
cd metabase-mcp-service

# Setup environment
cp .env.example .env
# Edit .env with your Metabase credentials

# Start all services
make setup  # First time only
make dev    # Start development environment

# Access services
# MCP Server: http://localhost:8080
# Metabase: http://localhost:3000
# API Docs: http://localhost:8080/docs
```

## 🎯 Core Features

### MVP Features (Available Now)
- **Natural Language Queries**: "Show me sales by region last quarter"
- **Smart Visualizations**: Auto-selects best chart type for your data
- **Quick Dashboards**: "Create a sales performance dashboard"
- **Basic Insights**: Identifies trends and anomalies

### Coming Soon (Full Service)
- Advanced analytics and forecasting
- Multi-turn conversations with context
- Enterprise authentication (OAuth 2.1)
- Performance optimization and caching
- 20+ comprehensive tools

## 📖 Documentation

- [Installation Guide](docs/installation.md)
- [API Reference](docs/api-reference.md)
- [Development Guide](docs/development.md)
- [Deployment Guide](docs/deployment.md)

## 🧪 Testing

```bash
# Run all tests
make test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

## 🚢 Deployment

### Deploy to Heroku (MVP)
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

### Production Deployment
See [deployment guide](docs/deployment.md) for AWS EKS, Docker Swarm, and other options.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📊 Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ AI Assistant│────▶│  MCP Server  │────▶│  Metabase   │
│   (Client)  │◀────│  (Node.js)   │◀────│    API      │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │    Redis    │
                    │   Cache     │
                    └─────────────┘
```

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on [Anthropic's Model Context Protocol](https://anthropic.com/mcp)
- Powered by [Metabase](https://www.metabase.com/)

---

**Built with ❤️ for data democratization**