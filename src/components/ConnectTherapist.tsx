import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { UserPlus, Link2, Search, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TherapistResult {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  clinic_name: string | null;
}

export function ConnectTherapist() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<TherapistResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setShowResults(true);
    try {
      // Search by therapist_code, phone, or name
      const query = searchQuery.trim();
      
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, clinic_name, therapist_code, phone")
        .or(`therapist_code.eq.${query},phone.eq.${query},full_name.ilike.%${query}%`)
        .not("therapist_code", "is", null)
        .limit(5);

      if (error) throw error;

      setSearchResults(data || []);
      
      if (!data || data.length === 0) {
        toast({
          title: "No therapists found",
          description: "Try searching by code (DR-XXXXXX), phone, or name.",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        variant: "destructive",
        title: "Search failed",
        description: "Please try again.",
      });
    }
    setSearching(false);
  };

  const handleConnect = async (therapist: TherapistResult) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error: connectError } = await supabase
        .from("connections")
        .insert({
          parent_id: user.id,
          therapist_id: therapist.user_id,
          status: "pending",
        });

      if (connectError) {
        if (connectError.code === "23505") {
          toast({
            title: "Already connected",
            description: "You already have a connection with this therapist.",
          });
        } else {
          throw connectError;
        }
      } else {
        toast({
          title: "Connection request sent!",
          description: `Waiting for ${therapist.full_name || "therapist"} to accept.`,
        });
        setSearchQuery("");
        setSearchResults([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error("Error connecting:", error);
      toast({
        title: "Error",
        description: "Failed to send connection request.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Link2 className="h-5 w-5 text-primary" />
          Connect with Therapist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Search by therapist code (e.g., DR-ABC123), phone number, or name.
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="Code, phone, or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button 
            onClick={handleSearch} 
            disabled={searching || !searchQuery.trim()}
            variant="outline"
          >
            {searching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Search Results */}
        {showResults && searchResults.length > 0 && (
          <div className="space-y-2 mt-4">
            <p className="text-xs font-medium text-muted-foreground">Found {searchResults.length} therapist(s)</p>
            {searchResults.map((therapist) => (
              <div 
                key={therapist.user_id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={therapist.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {therapist.full_name?.[0]?.toUpperCase() || "T"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{therapist.full_name || "Therapist"}</p>
                    {therapist.clinic_name && (
                      <p className="text-xs text-muted-foreground">{therapist.clinic_name}</p>
                    )}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleConnect(therapist)}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-1" />
                      Connect
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}

        {showResults && searchResults.length === 0 && !searching && (
          <p className="text-sm text-center text-muted-foreground py-4">
            No therapists found. Try a different search.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
