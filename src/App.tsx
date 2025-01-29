import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";
import Layout from "@/components/Layout";
import Index from "@/pages/Index";
import NewNote from "@/pages/NewNote";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/new-note" element={<NewNote />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;