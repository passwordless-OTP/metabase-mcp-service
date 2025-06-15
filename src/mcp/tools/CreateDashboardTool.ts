import { Logger } from 'winston';
import { MetabaseClient } from '../../clients/MetabaseClient';

interface CreateDashboardParams {
  description: string;
  name?: string;
}

export class CreateDashboardTool {
  public readonly description = 'Build a dashboard from a simple description';
  public readonly inputSchema = {
    type: 'object',
    properties: {
      description: {
        type: 'string',
        description: 'Describe the dashboard you want'
      },
      name: {
        type: 'string',
        description: 'Dashboard name (optional)'
      }
    },
    required: ['description']
  };

  private logger: Logger;
  private metabaseClient: MetabaseClient;

  constructor(config: any) {
    this.logger = config.logger;
    this.metabaseClient = config.metabaseClient;
  }

  async execute(params: CreateDashboardParams) {
    try {
      this.logger.info('Creating dashboard', { description: params.description });

      // For MVP, create a simple empty dashboard
      const dashboardName = params.name || this.generateDashboardName(params.description);
      
      const dashboard = await this.metabaseClient.createDashboard({
        name: dashboardName,
        description: params.description,
        parameters: []
      });

      return {
        content: [{
          type: 'text',
          text: `Dashboard "${dashboardName}" created successfully!\n\nView your dashboard at: ${process.env.METABASE_URL}/dashboard/${dashboard.id}\n\nNext steps:\n- Add cards to your dashboard\n- Set up filters and parameters\n- Share with your team`
        }],
        metadata: {
          dashboard_id: dashboard.id,
          dashboard_url: `${process.env.METABASE_URL}/dashboard/${dashboard.id}`,
          name: dashboardName
        }
      };
    } catch (error) {
      this.logger.error('Error creating dashboard', { error });
      throw error;
    }
  }

  private generateDashboardName(description: string): string {
    // Simple name generation from description
    const words = description.toLowerCase().split(' ');
    const keywords = ['dashboard', 'overview', 'analysis', 'report', 'metrics'];
    
    // Find relevant words
    const relevantWords = words.filter(w => 
      w.length > 3 && !['create', 'make', 'build', 'want', 'need'].includes(w)
    ).slice(0, 3);
    
    // Capitalize and join
    const name = relevantWords
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    
    return name + ' Dashboard';
  }
}