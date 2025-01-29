import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

const Index = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold gradient-text">My Notes</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Note
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="glass-card hover:shadow-2xl transition-shadow">
            <CardHeader>
              <CardTitle>Note {i}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Click to view or edit this note...
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Index;