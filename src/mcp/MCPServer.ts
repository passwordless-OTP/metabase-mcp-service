import { Router } from 'express';
import { Logger } from 'winston';
import { RedisClientType } from 'redis';
import { MetabaseClient } from '../clients/MetabaseClient';
import { QueryDataTool } from './tools/QueryDataTool';
import { CreateChartTool } from './tools/CreateChartTool';
import { CreateDashboardTool } from './tools/CreateDashboardTool';
import { GetInsightsTool } from './tools/GetInsightsTool';

interface MCPServerConfig {
  metabaseClient: MetabaseClient;
  redisClient: RedisClientType;
  logger: Logger;
}

export class MCPServer {
  private router: Router;
  private tools: Map<string, any>;
  private logger: Logger;

  constructor(private config: MCPServerConfig) {
    this.router = Router();
    this.logger = config.logger;
    this.tools = new Map();
    
    this.initializeTools();
    this.setupRoutes();
  }

  private initializeTools() {
    // Initialize MVP tools
    this.tools.set('query_data', new QueryDataTool(this.config));
    this.tools.set('create_chart', new CreateChartTool(this.config));
    this.tools.set('create_dashboard', new CreateDashboardTool(this.config));
    this.tools.set('get_insights', new GetInsightsTool(this.config));
    
    this.logger.info('MCP tools initialized', { 
      tools: Array.from(this.tools.keys()) 
    });
  }

  private setupRoutes() {
    // MCP initialization endpoint
    this.router.post('/initialize', (req, res) => {
      res.json({
        protocolVersion: '1.0.0',
        serverCapabilities: {
          tools: this.getToolDefinitions(),
          resources: false,
          prompts: false
        },
        serverInfo: {
          name: 'metabase-mcp-service',
          version: '0.1.0',
          description: 'AI-powered Metabase interface'
        }
      });
    });

    // Tool invocation endpoint
    this.router.post('/tools/:toolName', async (req, res, next) => {
      const { toolName } = req.params;
      const { params } = req.body;
      
      try {
        const tool = this.tools.get(toolName);
        if (!tool) {
          return res.status(404).json({ 
            error: `Tool '${toolName}' not found` 
          });
        }
        
        const result = await tool.execute(params);
        res.json(result);
      } catch (error) {
        next(error);
      }
    });

    // List available tools
    this.router.get('/tools', (req, res) => {
      res.json({
        tools: this.getToolDefinitions()
      });
    });
  }

  private getToolDefinitions() {
    return Array.from(this.tools.entries()).map(([name, tool]) => ({
      name,
      description: tool.description,
      inputSchema: tool.inputSchema
    }));
  }

  getRouter(): Router {
    return this.router;
  }
}