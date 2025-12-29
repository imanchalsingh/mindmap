// Local backend proxy for OpenAI API
export const generateAISuggestions = async (topic: string): Promise<string[]> => {
  try {
    // Make request to your backend endpoint
    const response = await fetch('/api/ai-suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch suggestions');
    }

    const data = await response.json();
    return data.suggestions;
  } catch (error) {
    console.error('Error fetching AI suggestions:', error);
    // Fallback suggestions
    return getFallbackSuggestions(topic);
  }
};

const getFallbackSuggestions = (topic: string): string[] => {
  const suggestionMap: Record<string, string[]> = {
    "Central Idea": [
      "Feature 1",
      "User Benefits",
      "Technical Stack",
      "Business Model",
    ],
    "Feature 1": ["Drag & Drop", "Real-time Updates", "Export Options"],
    "User Benefits": [
      "Improved Productivity",
      "Visual Organization",
      "Brainstorming Tool",
    ],
    "Technical Stack": ["Front-end", "Back-end", "Database", "AI Components"],
    "Business Model": ["Freemium", "Subscription", "Enterprise"],
    "Drag & Drop": ["Touch Support", "Multi-select", "Grouping"],
    "Export Options": ["PNG", "PDF", "SVG", "JSON"],
    "AI Components": ["NLP Processing", "Suggestion Engine", "Auto-layout"],
  };

  return suggestionMap[topic] || [
    "New Idea",
    "Related Concept",
    "Example",
    "Sub-category",
  ];
};