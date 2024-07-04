import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Fetch top stories IDs
const fetchTopStories = async () => {
  const res = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
  return res.json();
};

// Fetch story details by ID
const fetchStoryDetails = async (storyId) => {
  const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`);
  return res.json();
};

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: storyIds, isLoading: isLoadingIds, error: errorIds } = useQuery({
    queryKey: ["topStories"],
    queryFn: fetchTopStories,
  });

  const { data: stories, isLoading: isLoadingStories, error: errorStories } = useQuery({
    queryKey: ["stories", storyIds],
    queryFn: async () => {
      if (!storyIds) return [];
      const storyPromises = storyIds.slice(0, 100).map(fetchStoryDetails);
      return Promise.all(storyPromises);
    },
    enabled: !!storyIds,
  });

  const filteredStories = stories?.filter((story) =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (errorIds || errorStories) {
    return <div>Error loading stories.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Hacker News Top Stories</h1>
      <Input
        type="text"
        placeholder="Search stories..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      {isLoadingIds || isLoadingStories ? (
        <Skeleton className="w-full h-10 mb-4" />
      ) : (
        <div className="grid gap-4">
          {filteredStories.map((story) => (
            <Card key={story.id}>
              <CardHeader>
                <CardTitle>
                  <a href={story.url} target="_blank" rel="noopener noreferrer">
                    {story.title}
                  </a>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{story.score} upvotes</p>
                <a href={story.url} target="_blank" rel="noopener noreferrer">
                  Read more
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Index;
