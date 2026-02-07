// FindTherapist - Using plain Leaflet with Nominatim search
// Last updated: 2025-12-26 - Added manual search, fixed therapist filter
import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, UserPlus, Navigation, RefreshCw, Search, Loader2 } from "lucide-react";
import { fixLeafletDefaultIcon, DEFAULT_CENTER, DEFAULT_ZOOM } from "@/lib/leaflet-config";
import { searchLocation } from "@/utils/geocoding";
import { ParentLayout } from "@/components/layout/ParentLayout";

// Fix leaflet icons on module load
fixLeafletDefaultIcon();

interface TherapistProfile {
  user_id: string;
  full_name: string | null;
  latitude: number;
  longitude: number;
  clinic_name: string | null;
  clinic_address: string | null;
}

export default function FindTherapist() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const [loading, setLoading] = useState(true);
  const [therapists, setTherapists] = useState<TherapistProfile[]>([]);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchTherapists();
    getUserLocation();
  }, []);

  // Initialize map after therapists are loaded
  useEffect(() => {
    if (loading || !mapContainerRef.current || mapRef.current) return;

    const center = userLocation || DEFAULT_CENTER;
    const map = L.map(mapContainerRef.current).setView(center, DEFAULT_ZOOM);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Add therapist markers
    therapists.forEach((therapist) => {
      const lat = Number(therapist.latitude);
      const lng = Number(therapist.longitude);

      if (isNaN(lat) || isNaN(lng)) return;

      const marker = L.marker([lat, lng]).addTo(map);

      const popupContent = document.createElement("div");
      popupContent.className = "min-w-[200px] p-1";

      const title = document.createElement("h3");
      title.className = "font-semibold text-base mb-1";
      title.textContent = therapist.full_name || "Therapist";
      popupContent.appendChild(title);

      if (therapist.clinic_name) {
        const clinic = document.createElement("div");
        clinic.className = "flex items-center gap-1.5 text-sm text-gray-600 mb-1";
        clinic.textContent = `🏥 ${therapist.clinic_name}`;
        popupContent.appendChild(clinic);
      }

      if (therapist.clinic_address) {
        const address = document.createElement("div");
        address.className = "flex items-start gap-1.5 text-sm text-gray-600 mb-3";
        address.textContent = `📍 ${therapist.clinic_address}`;
        popupContent.appendChild(address);
      }

      const connectBtn = document.createElement("button");
      connectBtn.className = "connect-btn w-full px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700";
      connectBtn.textContent = "Connect Now";
      connectBtn.onclick = () => handleConnect(therapist.user_id);
      popupContent.appendChild(connectBtn);

      const popup = L.popup().setContent(popupContent);
      marker.bindPopup(popup);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [loading, therapists, userLocation]);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setUserLocation(DEFAULT_CENTER);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
        if (mapRef.current) {
          mapRef.current.setView(loc, DEFAULT_ZOOM);
        }
      },
      () => {
        // If permission denied, still set default and show info
        setUserLocation(DEFAULT_CENTER);
        toast({
          title: "Location access denied",
          description: "Use the search bar to find therapists in your area.",
        });
      }
    );
  };

  const fetchTherapists = async () => {
    setLoading(true);

    // First get therapist user_ids from user_roles table
    const { data: therapistRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "therapist");

    if (rolesError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load therapist data.",
      });
      setLoading(false);
      return;
    }

    const therapistUserIds = (therapistRoles || []).map((r) => r.user_id);

    if (therapistUserIds.length === 0) {
      setTherapists([]);
      setLoading(false);
      toast({
        title: "No therapists yet",
        description: "No therapists have registered on the platform yet.",
      });
      return;
    }

    // Now fetch profiles that are public, have coordinates, and belong to therapists
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, full_name, latitude, longitude, clinic_name, clinic_address")
      .eq("is_public_profile", true)
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      .in("user_id", therapistUserIds);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load therapist locations.",
      });
    } else {
      const validTherapists = (data || []).filter(
        (p) => p.latitude !== null && p.longitude !== null
      ) as TherapistProfile[];

      setTherapists(validTherapists);

      if (validTherapists.length === 0) {
        toast({
          title: "No therapists found",
          description: "No therapists are showing their location on the map yet.",
        });
      }
    }
    setLoading(false);
  };

  const handleConnect = async (therapistId: string) => {
    if (!user) return;

    setConnectingId(therapistId);

    const { data: existing } = await supabase
      .from("connections")
      .select("id, status")
      .eq("parent_id", user.id)
      .eq("therapist_id", therapistId)
      .maybeSingle();

    if (existing) {
      toast({
        title: existing.status === "accepted" ? "Already connected" : "Request pending",
        description: existing.status === "accepted"
          ? "You're already connected with this therapist."
          : "Your connection request is pending approval.",
      });
      setConnectingId(null);
      return;
    }

    const { error } = await supabase.from("connections").insert({
      parent_id: user.id,
      therapist_id: therapistId,
      status: "pending",
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send connection request.",
      });
    } else {
      toast({
        title: "Request sent!",
        description: "Your connection request has been sent to the therapist.",
      });
      navigate("/parent/home");
    }
    setConnectingId(null);
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView(userLocation, DEFAULT_ZOOM);
    }
  };

  const handleRefresh = () => {
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    fetchTherapists();
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    const result = await searchLocation(searchQuery);
    setSearching(false);

    if (result) {
      const { lat, lon } = result;
      if (mapRef.current) {
        mapRef.current.flyTo([lat, lon], DEFAULT_ZOOM);
      }
      toast({
        title: "Location found",
        description: `Showing area: ${result.display_name.split(",").slice(0, 2).join(",")}`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Location not found",
        description: "Could not find this location. Try a different search.",
      });
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (loading) {
    return (
      <ParentLayout>
        <div className="flex flex-col h-[calc(100vh-180px)]">
          <div className="p-4 border-b border-border bg-card">
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="flex-1" />
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout>
      <div className="flex flex-col h-[calc(100vh-180px)]">
        {/* Header */}
        <div className="p-4 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Find a Therapist
            </h1>
            <p className="text-xs text-muted-foreground">
              {therapists.length} therapist{therapists.length !== 1 ? "s" : ""} available
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={centerOnUser} title="Center on my location">
              <Navigation className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleRefresh} title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative" style={{ zIndex: 1 }}>
          {/* Search Bar - Floating */}
          <div className="absolute top-3 left-3 right-16 z-[1000] flex gap-2">
            <Input
              placeholder="Search city or area (e.g., Hanoi, District 1...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="bg-card/95 backdrop-blur-sm shadow-lg border-border"
            />
            <Button
              onClick={handleSearch}
              disabled={searching}
              className="shrink-0 shadow-lg"
            >
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />

          {/* Empty state overlay */}
          {therapists.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-[1000]">
              <div className="text-center p-6 rounded-2xl bg-card border border-border shadow-lg max-w-sm mx-4">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold mb-2">No therapists found</h3>
                <p className="text-sm text-muted-foreground">
                  There are no therapists with public profiles on the map yet. Try again later.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ParentLayout>
  );
}
