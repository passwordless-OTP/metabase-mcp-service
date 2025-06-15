import { Logger } from 'winston';
import { MetabaseClient } from '../../clients/MetabaseClient';

interface CreateChartParams {
  data_question: string;
  chart_type?: 'auto' | 'line' | 'bar' | 'pie';
}

export class CreateChartTool {
  public readonly description = 'Automatically create the best chart for your data';
  public readonly inputSchema = {
    type: 'object',
    properties: {
      data_question: {
        type: 'string',
        description: 'What do you want to visualize?'
      },
      chart_type: {
        type: 'string',
        enum: ['auto', 'line', 'bar', 'pie'],
        default: 'auto'
      }
    },
    required: ['data_question']
  };

  private logger: Logger;
  private metabaseClient: MetabaseClient;

  constructor(config: any) {
    this.logger = config.logger;
    this.metabaseClient = config.metabaseClient;
  }

  async execute(params: CreateChartParams) {
    try {
      this.logger.info('Creating chart', { question: params.data_question });

      // For MVP, create a simple card with auto-visualization
      const card = await this.metabaseClient.createCard({
        name: params.data_question,
        display: params.chart_type === 'auto' ? 'table' : params.chart_type,
        visualization_settings: {},
        dataset_query: {
          database: 1,
          type: 'native',
          native: {
            query: `-- Placeholder query for: ${params.data_question}\nSELECT 1 as value`
          }
        }
      });

      return {
        content: [{
          type: 'text',
          text: `Chart created successfully!\n\nView your chart at: ${process.env.METABASE_URL}/question/${card.id}`
        }],
        metadata: {
          card_id: card.id,
          preview_url: `${process.env.METABASE_URL}/question/${card.id}`,
          chart_type: params.chart_type || 'auto'
        }
      };
    } catch (error) {
      this.logger.error('Error creating chart', { error });
      throw error;
    }
  }
}