import { Logger } from 'winston';
import { RedisClientType } from 'redis';
import { MetabaseClient } from '../../clients/MetabaseClient';
import { OpenAI } from 'openai';

interface QueryDataParams {
  question: string;
  database_id?: number;
  context?: {
    date_range?: {
      start: string;
      end: string;
    };
    filters?: Array<{
      field: string;
      operator: string;
      value: string | number | string[];
    }>;
  };
}

export class QueryDataTool {
  public readonly description = 'Execute natural language queries against Metabase databases';
  public readonly inputSchema = {
    type: 'object',
    properties: {
      question: {
        type: 'string',
        description: 'Natural language question about your data'
      },
      database_id: {
        type: 'integer',
        description: 'Target database ID (optional, defaults to primary)'
      },
      context: {
        type: 'object',
        description: 'Additional context like date ranges or filters'
      }
    },
    required: ['question']
  };

  private openai: OpenAI;
  private logger: Logger;
  private metabaseClient: MetabaseClient;
  private redisClient: RedisClientType;

  constructor(config: any) {
    this.logger = config.logger;
    this.metabaseClient = config.metabaseClient;
    this.redisClient = config.redisClient;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async execute(params: QueryDataParams) {
    try {
      this.logger.info('Executing natural language query', { question: params.question });

      // For MVP, use a simplified SQL generation
      const sql = await this.generateSQL(params.question, params.database_id || 1);
      
      // Execute the query
      const result = await this.metabaseClient.executeQuery({
        database: params.database_id || 1,
        type: 'native',
        native: { query: sql }
      });

      return {
        content: [{
          type: 'text',
          text: this.formatResults(result, params.question)
        }],
        metadata: {
          sql: sql,
          rowCount: result.data?.rows?.length || 0,
          executionTime: result.json_query?.average_execution_time || null
        }
      };
    } catch (error) {
      this.logger.error('Error executing query', { error });
      throw error;
    }
  }

  private async generateSQL(question: string, databaseId: number): Promise<string> {
    // For MVP, use OpenAI to generate SQL
    const prompt = `Convert this question to SQL for a PostgreSQL database:
Question: ${question}

Assume common e-commerce tables: customers, orders, products.
Return only the SQL query, no explanation.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a SQL expert. Generate valid PostgreSQL queries.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 200
    });

    const sql = completion.choices[0].message.content?.trim() || '';
    this.logger.debug('Generated SQL', { sql });
    
    return sql;
  }

  private formatResults(result: any, question: string): string {
    if (!result.data?.rows || result.data.rows.length === 0) {
      return 'No results found for your query.';
    }

    const rows = result.data.rows;
    const cols = result.data.cols || [];
    
    // Simple table formatting for MVP
    let response = `Results for "${question}":\n\n`;
    
    // Add column headers
    if (cols.length > 0) {
      response += cols.map((col: any) => col.display_name || col.name).join(' | ') + '\n';
      response += '-'.repeat(50) + '\n';
    }
    
    // Add first 10 rows
    rows.slice(0, 10).forEach((row: any[]) => {
      response += row.join(' | ') + '\n';
    });
    
    if (rows.length > 10) {
      response += `\n... and ${rows.length - 10} more rows`;
    }
    
    return response;
  }
}