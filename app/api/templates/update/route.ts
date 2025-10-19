import { NextRequest, NextResponse } from 'next/server';
import { updateWorkflowStructure, getWorkflowByCustomId, getDatabaseProvider } from '@/lib/db';
import { listTemplates, getTemplate } from '@/lib/workflow/templates';

export const dynamic = 'force-dynamic';

/**
 * POST /api/templates/update - Update existing templates with latest changes
 * Works with both Convex and PostgreSQL
 */
export async function POST(request: NextRequest) {
  try {
    // Get all templates from static file
    const templateList = listTemplates();
    const updatedTemplates: string[] = [];
    const failedTemplates: string[] = [];

    for (const templateInfo of templateList) {
      const template = getTemplate(templateInfo.id);
      if (!template) continue;

      try {
        // Check if template exists
        const existing = await getWorkflowByCustomId(template.id);
        if (!existing) {
          failedTemplates.push(template.name);
          continue;
        }

        // Update template structure
        await updateWorkflowStructure(
          existing._id || existing.id!,
          template.nodes,
          template.edges
        );

        updatedTemplates.push(template.name);
      } catch (error) {
        console.error(`Failed to update template ${template.name}:`, error);
        failedTemplates.push(template.name);
      }
    }

    const provider = getDatabaseProvider();

    return NextResponse.json({
      success: true,
      updated: updatedTemplates.length,
      failed: failedTemplates.length,
      total: templateList.length,
      updatedTemplates,
      failedTemplates,
      message: `Updated ${updatedTemplates.length} templates, ${failedTemplates.length} failed`,
      source: provider,
    });
  } catch (error) {
    console.error('Error updating templates:', error);
    return NextResponse.json(
      {
        error: 'Failed to update templates',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
