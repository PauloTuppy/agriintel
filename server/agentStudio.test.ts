import { describe, it, expect, vi } from 'vitest';
import { runAgentStudio } from './agentStudio';

describe('Algolia Agent Studio Orchestration', () => {
    it('should route market price queries correctly', async () => {
        const result = await runAgentStudio("What are the almond prices in California?");

        expect(result.metadata.orchestration_type).toBe('algolia_agent_studio');
        expect(result.message).toContain('market prices');
        // Ensure data is populated (either simulated or real)
        expect(result.data.market).toBeDefined();
    });

    it('should route crop rotation queries correctly', async () => {
        const result = await runAgentStudio("What should I plant after corn?");

        expect(result.message).toContain('agronomy rules');
        expect(result.data.rotation).toBeDefined();
    });

    it('should route logistics queries correctly', async () => {
        const result = await runAgentStudio("Find buyers for my crops");

        expect(result.message).toContain('logistics chain');
        expect(result.data.logistics).toBeDefined();
    });

    it('should handle broad queries by searching all indices', async () => {
        const result = await runAgentStudio("Analyze my farm's potential");

        expect(result.message).toContain('broad search');
        expect(result.data.market).toBeDefined();
        expect(result.data.rotation).toBeDefined();
        expect(result.data.logistics).toBeDefined();
    });
});
