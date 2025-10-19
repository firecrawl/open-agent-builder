import { NextRequest, NextResponse } from 'next/server';
import { saveWorkflow, getWorkflowByCustomId, getDatabaseProvider } from '@/lib/db';
import { listTemplates, getTemplate } from '@/lib/workflow/templates';

export const dynamic = 'force-dynamic';

/**
 * POST /api/templates/seed - Seed official templates
 * Works with both Convex and PostgreSQL
 */
export async function POST(request: NextRequest) {
  try {
    // Get all templates from static file
    const templateList = listTemplates();
    const seededTemplates: string[] = [];
    const skippedTemplates: string[] = [];

    for (const templateInfo of templateList) {
      const template = getTemplate(templateInfo.id);
      if (!template) continue;

      try {
        // Check if template already exists
        const existing = await getWorkflowByCustomId(template.id);
        if (existing) {
          skippedTemplates.push(template.name);
          continue;
        }

        // Save as template
        await saveWorkflow({
          customId: template.id,
          name: template.name,
          description: template.description,
          category: template.category,
          tags: template.tags || [],
          difficulty: template.difficulty,
          estimatedTime: template.estimatedTime,
          nodes: template.nodes,
          edges: template.edges,
          isTemplate: true,
          isPublic: true,
        });

        seededTemplates.push(template.name);
      } catch (error) {
        console.error(`Failed to seed template ${template.name}:`, error);
        skippedTemplates.push(template.name);
      }
    }

    const provider = getDatabaseProvider();

    return NextResponse.json({
      success: true,
      seeded: seededTemplates.length,
      skipped: skippedTemplates.length,
      total: templateList.length,
      seededTemplates,
      skippedTemplates,
      message: `Seeded ${seededTemplates.length} templates, skipped ${skippedTemplates.length}`,
      source: provider,
    });
  } catch (error) {
    console.error('Error seeding templates:', error);
    return NextResponse.json(
      {
        error: 'Failed to seed templates',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}