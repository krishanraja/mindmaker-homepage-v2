import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Initialize pdfMake with fonts
pdfMake.vfs = pdfFonts.vfs;

// Brand colors (HSL converted to hex for PDF)
const BRAND_COLORS = {
  ink: '#0a0a0a',
  mint: '#00E676',
  cream: '#FAF7F2',
  muted: '#6B7280',
};

interface FrictionMapData {
  problem: string;
  currentState: string;
  aiEnabledState: string;
  timeSaved: string;
  toolRecommendations: Array<{
    name: string;
    description: string;
    useCase: string;
  }>;
  masterPrompts: Array<{
    title: string;
    prompt: string;
  }>;
  userName?: string;
  userRole?: string;
}

interface PortfolioData {
  tasks: Array<{
    name: string;
    hoursPerWeek: number;
    potentialSavings: number;
    aiTools: string[];
  }>;
  totalTimeSaved: number;
  totalCostSavings: number;
  implementationRoadmap: string[];
  masterPrompts: Array<{
    title: string;
    prompt: string;
  }>;
  userName?: string;
  userRole?: string;
}

const createHeader = () => ({
  columns: [
    {
      text: 'MINDMAKER',
      style: 'brandHeader',
      width: 'auto',
    },
    {
      text: 'AI Friction Map Analysis',
      style: 'documentTitle',
      alignment: 'right',
    },
  ],
  margin: [0, 0, 0, 20] as [number, number, number, number],
});

const createFooter = (currentPage: number, pageCount: number) => ({
  columns: [
    {
      text: 'MindMaker | AI Leadership Training',
      style: 'footer',
    },
    {
      text: `Page ${currentPage} of ${pageCount}`,
      style: 'footer',
      alignment: 'right',
    },
  ],
  margin: [40, 10, 40, 0] as [number, number, number, number],
});

export const generateFrictionMapPDF = (data: FrictionMapData): void => {
  const docDefinition: any = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    
    footer: createFooter,
    
    content: [
      // Header
      {
        text: 'MINDMAKER',
        style: 'brandHeader',
        margin: [0, 0, 0, 5],
      },
      {
        text: 'AI Friction Map Analysis',
        style: 'documentTitle',
        margin: [0, 0, 0, 30],
      },
      
      // Problem Statement
      {
        text: 'THE CHALLENGE',
        style: 'sectionHeader',
      },
      {
        text: data.problem,
        style: 'problemText',
        margin: [0, 0, 0, 25],
      },
      
      // Current vs AI-Enabled State
      {
        columns: [
          {
            width: '48%',
            stack: [
              { text: 'CURRENT STATE', style: 'columnHeader' },
              { text: data.currentState, style: 'bodyText' },
            ],
          },
          { width: '4%', text: '' },
          {
            width: '48%',
            stack: [
              { text: 'AI-ENABLED STATE', style: 'columnHeaderHighlight' },
              { text: data.aiEnabledState, style: 'bodyText' },
            ],
          },
        ],
        margin: [0, 0, 0, 25] as [number, number, number, number],
      },
      
      // Impact
      {
        table: {
          widths: ['*'],
          body: [
            [
              {
                text: [
                  { text: 'PROJECTED IMPACT: ', style: 'impactLabel' },
                  { text: data.timeSaved, style: 'impactValue' },
                ],
                fillColor: BRAND_COLORS.ink,
                color: '#FFFFFF',
                margin: [15, 12, 15, 12],
              },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 30] as [number, number, number, number],
      },
      
      // Tool Recommendations
      {
        text: 'RECOMMENDED TOOLS',
        style: 'sectionHeader',
      },
      ...data.toolRecommendations.map((tool, index) => ({
        stack: [
          {
            text: `${index + 1}. ${tool.name}`,
            style: 'toolName',
          },
          {
            text: tool.description,
            style: 'bodyText',
          },
          {
            text: `Use case: ${tool.useCase}`,
            style: 'useCase',
            margin: [0, 5, 0, 15] as [number, number, number, number],
          },
        ],
      })),
      
      // Page break before prompts
      { text: '', pageBreak: 'before' },
      
      // Master Prompts
      {
        text: 'MASTER PROMPTS',
        style: 'sectionHeader',
        margin: [0, 0, 0, 10],
      },
      {
        text: 'Copy these prompts directly into your AI tools. Replace [PLACEHOLDERS] with your specific details.',
        style: 'instructionText',
        margin: [0, 0, 0, 20],
      },
      ...data.masterPrompts.map((prompt, index) => ({
        stack: [
          {
            text: prompt.title,
            style: 'promptTitle',
          },
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    text: prompt.prompt,
                    style: 'promptText',
                    fillColor: '#F5F5F5',
                    margin: [12, 10, 12, 10],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#E0E0E0',
              vLineColor: () => '#E0E0E0',
            },
            margin: [0, 0, 0, 20] as [number, number, number, number],
          },
        ],
      })),
      
      // CTA
      {
        table: {
          widths: ['*'],
          body: [
            [
              {
                stack: [
                  { text: 'READY TO GO DEEPER?', style: 'ctaHeader' },
                  { text: 'Book a 30-minute strategy session to build your complete AI implementation roadmap.', style: 'ctaText' },
                  { text: 'mindmaker.ai/sprint', style: 'ctaLink' },
                ],
                fillColor: BRAND_COLORS.ink,
                margin: [20, 15, 20, 15],
              },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 30, 0, 0] as [number, number, number, number],
      },
    ],
    
    styles: {
      brandHeader: {
        fontSize: 24,
        bold: true,
        color: BRAND_COLORS.ink,
        letterSpacing: 2,
      },
      documentTitle: {
        fontSize: 14,
        color: BRAND_COLORS.muted,
        margin: [0, 8, 0, 0],
      },
      sectionHeader: {
        fontSize: 11,
        bold: true,
        color: BRAND_COLORS.ink,
        letterSpacing: 1,
        margin: [0, 0, 0, 10],
      },
      problemText: {
        fontSize: 14,
        color: BRAND_COLORS.ink,
        lineHeight: 1.5,
        italics: true,
      },
      columnHeader: {
        fontSize: 10,
        bold: true,
        color: BRAND_COLORS.muted,
        margin: [0, 0, 0, 8],
      },
      columnHeaderHighlight: {
        fontSize: 10,
        bold: true,
        color: BRAND_COLORS.mint,
        margin: [0, 0, 0, 8],
      },
      bodyText: {
        fontSize: 11,
        color: BRAND_COLORS.ink,
        lineHeight: 1.5,
      },
      impactLabel: {
        fontSize: 11,
        bold: true,
      },
      impactValue: {
        fontSize: 14,
        bold: true,
      },
      toolName: {
        fontSize: 12,
        bold: true,
        color: BRAND_COLORS.ink,
        margin: [0, 0, 0, 5],
      },
      useCase: {
        fontSize: 10,
        italics: true,
        color: BRAND_COLORS.muted,
      },
      instructionText: {
        fontSize: 10,
        color: BRAND_COLORS.muted,
        italics: true,
      },
      promptTitle: {
        fontSize: 11,
        bold: true,
        color: BRAND_COLORS.ink,
        margin: [0, 0, 0, 8],
      },
      promptText: {
        fontSize: 10,
        color: BRAND_COLORS.ink,
        lineHeight: 1.6,
        preserveLeadingSpaces: true,
      },
      ctaHeader: {
        fontSize: 12,
        bold: true,
        color: '#FFFFFF',
        margin: [0, 0, 0, 8],
      },
      ctaText: {
        fontSize: 11,
        color: '#FFFFFF',
        lineHeight: 1.4,
        margin: [0, 0, 0, 8],
      },
      ctaLink: {
        fontSize: 12,
        bold: true,
        color: BRAND_COLORS.mint,
      },
      footer: {
        fontSize: 9,
        color: BRAND_COLORS.muted,
      },
    },
  };

  pdfMake.createPdf(docDefinition).download('MindMaker-AI-Friction-Map.pdf');
};

export const generatePortfolioPDF = (data: PortfolioData): void => {
  const docDefinition: any = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    
    footer: (currentPage: number, pageCount: number) => ({
      columns: [
        {
          text: 'MindMaker | AI Portfolio Builder',
          style: 'footer',
        },
        {
          text: `Page ${currentPage} of ${pageCount}`,
          style: 'footer',
          alignment: 'right',
        },
      ],
      margin: [40, 10, 40, 0],
    }),
    
    content: [
      // Header
      {
        text: 'MINDMAKER',
        style: 'brandHeader',
        margin: [0, 0, 0, 5],
      },
      {
        text: 'AI Portfolio Analysis',
        style: 'documentTitle',
        margin: [0, 0, 0, 30],
      },
      
      // Impact Summary
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              {
                stack: [
                  { text: 'WEEKLY TIME SAVED', style: 'metricLabel' },
                  { text: `${data.totalTimeSaved} hours`, style: 'metricValue' },
                ],
                fillColor: BRAND_COLORS.ink,
                margin: [15, 12, 15, 12],
              },
              {
                stack: [
                  { text: 'ANNUAL VALUE', style: 'metricLabel' },
                  { text: `$${data.totalCostSavings.toLocaleString()}`, style: 'metricValueHighlight' },
                ],
                fillColor: BRAND_COLORS.ink,
                margin: [15, 12, 15, 12],
              },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 30] as [number, number, number, number],
      },
      
      // Selected Systems
      {
        text: 'SELECTED AI SYSTEMS',
        style: 'sectionHeader',
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', '*'],
          body: [
            [
              { text: 'Task', style: 'tableHeader' },
              { text: 'Hours/Week', style: 'tableHeader' },
              { text: 'Savings', style: 'tableHeader' },
              { text: 'AI Tools', style: 'tableHeader' },
            ],
            ...data.tasks.map(task => [
              { text: task.name, style: 'tableCell' },
              { text: task.hoursPerWeek.toString(), style: 'tableCell', alignment: 'center' },
              { text: `${Math.round(task.potentialSavings * 100)}%`, style: 'tableCellHighlight', alignment: 'center' },
              { text: task.aiTools.join(', '), style: 'tableCell' },
            ]),
          ],
        },
        layout: {
          hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5,
          vLineWidth: () => 0,
          hLineColor: () => '#E0E0E0',
          paddingTop: () => 8,
          paddingBottom: () => 8,
        },
        margin: [0, 0, 0, 30] as [number, number, number, number],
      },
      
      // Implementation Roadmap
      {
        text: 'IMPLEMENTATION ROADMAP',
        style: 'sectionHeader',
      },
      ...data.implementationRoadmap.map((step, index) => ({
        columns: [
          {
            text: `${index + 1}`,
            style: 'stepNumber',
            width: 25,
          },
          {
            text: step,
            style: 'bodyText',
          },
        ],
        margin: [0, 0, 0, 10] as [number, number, number, number],
      })),
      
      // Page break before prompts
      { text: '', pageBreak: 'before' },
      
      // Master Prompts
      {
        text: 'MASTER PROMPTS',
        style: 'sectionHeader',
        margin: [0, 0, 0, 10],
      },
      {
        text: 'Copy these prompts directly into your AI tools. Replace [PLACEHOLDERS] with your specific details.',
        style: 'instructionText',
        margin: [0, 0, 0, 20],
      },
      ...data.masterPrompts.map((prompt) => ({
        stack: [
          {
            text: prompt.title,
            style: 'promptTitle',
          },
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    text: prompt.prompt,
                    style: 'promptText',
                    fillColor: '#F5F5F5',
                    margin: [12, 10, 12, 10],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#E0E0E0',
              vLineColor: () => '#E0E0E0',
            },
            margin: [0, 0, 0, 20] as [number, number, number, number],
          },
        ],
      })),
      
      // CTA
      {
        table: {
          widths: ['*'],
          body: [
            [
              {
                stack: [
                  { text: 'READY TO IMPLEMENT?', style: 'ctaHeader' },
                  { text: 'Join a Builder Sprint to implement these AI systems with expert guidance.', style: 'ctaText' },
                  { text: 'mindmaker.ai/sprint', style: 'ctaLink' },
                ],
                fillColor: BRAND_COLORS.ink,
                margin: [20, 15, 20, 15],
              },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 30, 0, 0] as [number, number, number, number],
      },
    ],
    
    styles: {
      brandHeader: {
        fontSize: 24,
        bold: true,
        color: BRAND_COLORS.ink,
        letterSpacing: 2,
      },
      documentTitle: {
        fontSize: 14,
        color: BRAND_COLORS.muted,
        margin: [0, 8, 0, 0],
      },
      sectionHeader: {
        fontSize: 11,
        bold: true,
        color: BRAND_COLORS.ink,
        letterSpacing: 1,
        margin: [0, 0, 0, 15],
      },
      metricLabel: {
        fontSize: 9,
        color: '#AAAAAA',
        margin: [0, 0, 0, 4],
      },
      metricValue: {
        fontSize: 18,
        bold: true,
        color: '#FFFFFF',
      },
      metricValueHighlight: {
        fontSize: 18,
        bold: true,
        color: BRAND_COLORS.mint,
      },
      tableHeader: {
        fontSize: 9,
        bold: true,
        color: BRAND_COLORS.muted,
      },
      tableCell: {
        fontSize: 10,
        color: BRAND_COLORS.ink,
      },
      tableCellHighlight: {
        fontSize: 10,
        bold: true,
        color: BRAND_COLORS.mint,
      },
      stepNumber: {
        fontSize: 11,
        bold: true,
        color: BRAND_COLORS.mint,
      },
      bodyText: {
        fontSize: 11,
        color: BRAND_COLORS.ink,
        lineHeight: 1.5,
      },
      instructionText: {
        fontSize: 10,
        color: BRAND_COLORS.muted,
        italics: true,
      },
      promptTitle: {
        fontSize: 11,
        bold: true,
        color: BRAND_COLORS.ink,
        margin: [0, 0, 0, 8],
      },
      promptText: {
        fontSize: 10,
        color: BRAND_COLORS.ink,
        lineHeight: 1.6,
        preserveLeadingSpaces: true,
      },
      ctaHeader: {
        fontSize: 12,
        bold: true,
        color: '#FFFFFF',
        margin: [0, 0, 0, 8],
      },
      ctaText: {
        fontSize: 11,
        color: '#FFFFFF',
        lineHeight: 1.4,
        margin: [0, 0, 0, 8],
      },
      ctaLink: {
        fontSize: 12,
        bold: true,
        color: BRAND_COLORS.mint,
      },
      footer: {
        fontSize: 9,
        color: BRAND_COLORS.muted,
      },
    },
  };

  pdfMake.createPdf(docDefinition).download('MindMaker-AI-Portfolio.pdf');
};
