import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);

  const { data: notes, isLoading, refetch } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notes:", error);
        throw error;
      }

      return data;
    },
  });

  const handleDelete = async () => {
    if (selectedNotes.length === 0) {
      toast({
        title: "No notes selected",
        description: "Please select notes to delete",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("notes")
        .delete()
        .in("id", selectedNotes);

      if (error) throw error;

      toast({
        title: "Notes deleted successfully",
      });
      setSelectedNotes([]);
      refetch();
    } catch (error) {
      console.error("Error deleting notes:", error);
      toast({
        title: "Error deleting notes",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleAiChat = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    try {
      const apiKey = sessionStorage.getItem("groq_api_key");
      const response = await fetch("https://api.groq.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: aiPrompt }],
        }),
      });

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Create a new note with the AI response
      const { error } = await supabase.from("notes").insert({
        title: aiPrompt.slice(0, 50) + "...",
        content,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      });

      if (error) throw error;

      toast({
        title: "Note created from AI response",
        description: "Your note has been saved successfully.",
      });

      // Refresh the notes list
      window.location.reload();
    } catch (error) {
      console.error("Error in AI chat:", error);
      toast({
        title: "Error generating note",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const toggleNoteSelection = (noteId: string) => {
    setSelectedNotes(prev =>
      prev.includes(noteId)
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-[85%] mx-auto space-y-6 p-6 bg-card rounded-lg shadow-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold gradient-text">My Notes</h2>
        <div className="flex gap-4">
          <Button onClick={() => navigate("/new-note")}>
            <Plus className="mr-2 h-4 w-4" /> New Note
          </Button>
          {selectedNotes.length > 0 && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
            </Button>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" /> AI Chat
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h3 className="font-medium">Generate Note with AI</h3>
                <textarea
                  className="w-full min-h-[100px] p-2 rounded-md border"
                  placeholder="Enter your prompt here..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
                <Button className="w-full" onClick={handleAiChat}>
                  Generate
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes?.map((note) => (
          <Card 
            key={note.id} 
            className="glass-card hover:shadow-2xl transition-shadow relative"
          >
            <div className="absolute top-2 right-2">
              <Checkbox
                checked={selectedNotes.includes(note.id)}
                onCheckedChange={() => toggleNoteSelection(note.id)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div onClick={() => navigate(`/note/${note.id}`)}>
              <CardHeader>
                <CardTitle className="text-lg">{note.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {note.content?.slice(0, 100)}
                  {note.content?.length > 100 ? "..." : ""}
                </p>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Index;