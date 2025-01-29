import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const NewNote = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        toast({
          title: "Please login to create notes",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("notes").insert({
        title,
        content,
        user_id: userId,
      });

      if (error) throw error;

      toast({
        title: "Note created successfully",
      });
      navigate("/");
    } catch (error) {
      console.error("Error creating note:", error);
      toast({
        title: "Error creating note",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-[85%] mx-auto space-y-6 p-6 bg-card rounded-lg shadow-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">New Note</h2>
        <div className="flex gap-2">
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Save Note
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <Input
            placeholder="Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium"
          />
        </div>
        <div>
          <Textarea
            placeholder="Write your note content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[300px]"
          />
        </div>
      </div>
    </div>
  );
};

export default NewNote;