"use client";
import React, { useState } from 'react';
// import { genkitClient } from '@/lib/genkitClient';
import { AnswerGs1QuestionsWithVectorSearchOutputSchema, AnswerGs1QuestionsWithVectorSearchInputSchema } from '@/ai/schemas';
import { AiOutputCard } from '@/components/features/AiOutputCard';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

const qaVectorSearchFormSchema = z.object({
    query: z.string().min(2, { message: 'Query must be at least 2 characters.' }),
    topK: z.preprocess(
        (val) => (val === '' ? undefined : Number(val)),
        z.number().int().positive().optional().default(5)
    ),
});

type QaVectorSearchFormValues = z.infer<typeof qaVectorSearchFormSchema>;

const extractExplainability = (output: AnswerGs1QuestionsWithVectorSearchOutputSchema) => {
    const explainability = {
        reasoningSteps: output.reasoningSteps,
        citedSources: output.citedSources,
        retrievedChunksCount: output.retrievedChunksCount, // Optionally add retrievedChunksCount here
    };

    const modelEvaluationMetrics = {
         retrievedChunksCount: output.retrievedChunksCount, // Optionally add retrievedChunksCount here
    };

    return { explainability, modelEvaluationMetrics };
};

const renderOutput = (output: AnswerGs1QuestionsWithVectorSearchOutputSchema) => {
    const { explainability } = extractExplainability(output);

    return (
        <div className="space-y-4">
            {output.answer && (
                <div>
                    <h3 className="text-lg font-semibold">Answer:</h3>
                    <p>{output.answer}</p>
                </div>
            )}
            {explainability.retrievedChunksCount !== undefined && (
                 <div>
                     <h3 className="text-lg font-semibold">Retrieved Chunks:</h3>
                     <p>{explainability.retrievedChunksCount}</p>
                 </div>
            )}
            {explainability.reasoningSteps && explainability.reasoningSteps.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold">Reasoning Steps:</h3>
                    <ul className="list-disc list-inside">
                        {explainability.reasoningSteps.map((step, index) => (
                            <li key={index}>{step}</li>
                        ))}
                    </ul>
                </div>
            )}
            {explainability.citedSources && explainability.citedSources.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold">Cited Sources:</h3>
                    <ul className="list-disc list-inside">
                        {explainability.citedSources.map((source, index) => (
                            <li key={index}>
                                {source.sourceName}
                                {source.pageNumber && `, Page ${source.pageNumber}`}
                                {source.sectionTitle && `, Section: ${source.sectionTitle}`}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const AdvancedQaVectorSearchPage = () => {
    const [output, setOutput] = useState<AnswerGs1QuestionsWithVectorSearchOutputSchema | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const form = useForm<QaVectorSearchFormValues>({
        resolver: zodResolver(qaVectorSearchFormSchema),
        defaultValues: {
            query: '',
            topK: 5,
        },
    });

    const onSubmit = async (values: QaVectorSearchFormValues) => {
        setLoading(true);
        setOutput(null);
        setError(null);
        try {
            // const result = await genkitClient.answerGs1QuestionsWithVectorSearch(values as AnswerGs1QuestionsWithVectorSearchInputSchema);
            const result = null; // TODO: Restore genkitClient functionality
            setOutput(result);
        } catch (err) {
            console.error('Error calling Genkit flow:', err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-[calc(100vh-57px)] flex-col items-center py-10 px-4 lg:p-10 dark:bg-zinc-900 dark:text-white">
            <Card className="w-full max-w-3xl dark:bg-zinc-800 dark:border-zinc-700">
                <CardHeader>
                    <CardTitle>Q&A with Conceptual Vector Search</CardTitle>
                    <CardDescription>
                        Ask a question about GS1 standards. This uses a conceptual RAG pipeline with a mock vector store.
                        <br />
                        <span className="text-yellow-500 font-semibold">Note:</span> The vector search is currently mocked using internal data. It does not query a live database.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="query"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Your Question</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="e.g., What is a GTIN?"
                                                className="resize-none dark:bg-zinc-900 dark:border-zinc-700"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Enter the question you want to ask the AI about GS1 standards.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="topK"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Top K Results (Mock)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="e.g., 5"
                                                className="dark:bg-zinc-900 dark:border-zinc-700"
                                                {...field}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    field.onChange(value === '' ? undefined : Number(value));
                                                }}
                                                value={field.value === undefined ? '' : field.value}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Simulate the number of top search results to consider (conceptual).
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={loading} className="dark:bg-blue-600 dark:hover:bg-blue-700">
                                {loading ? 'Processing...' : 'Get Answer'}
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-8">
                        <AiOutputCard
                            output={output}
                            loading={loading}
                            error={error}
                            renderOutput={renderOutput}
                            extractExplainability={extractExplainability}
                        />
                         {loading && (
                            <div className="space-y-4 mt-4">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                         )}
                    </div>
                </CardContent>
            </Card>
        </main>
    );
};

export default AdvancedQaVectorSearchPage;