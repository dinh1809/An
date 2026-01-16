// TherapistLocationPicker - Using plain Leaflet with Nominatim geocoding
// Last updated: 2025-12-26 - Added address search feature
import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MapPin, Save, Building2, Navigation, Search, Loader2 } from "lucide-react";
import { fixLeafletDefaultIcon, DEFAULT_CENTER, DEFAULT_ZOOM } from "@/lib/leaflet-config";
import { searchLocation } from "@/utils/geocoding";

// Fix leaflet icons on module load
fixLeafletDefaultIcon();

interface LocationData {
  latitude: number | null;
  longitude: number | null;
  clinic_name: string | null;
  clinic_address: string | null;
  is_public_profile: boolean;
}

export function TherapistLocationPicker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const [locationData, setLocationData] = useState<LocationData>({
    latitude: null,
    longitude: null,
    clinic_name: null,
    clinic_address: null,
    is_public_profile: false,
  });

  const position: [number, number] = [
    locationData.latitude ?? DEFAULT_CENTER[0],
    locationData.longitude ?? DEFAULT_CENTER[1],
  ];

  useEffect(() => {
    if (user) {
      fetchLocationData();
    }
  }, [user]);

  // Initialize map
  useEffect(() => {
    if (loading || !mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView(position, DEFAULT_ZOOM);
    
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const marker = L.marker(position, { draggable: true }).addTo(map);
    
    marker.on("dragend", () => {
      const { lat, lng } = marker.getLatLng();
      setLocationData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    });

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      setLocationData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [loading]);

  // Update marker position when locationData changes
  useEffect(() => {
    if (markerRef.current && locationData.latitude && locationData.longitude) {
      markerRef.current.setLatLng([locationData.latitude, locationData.longitude]);
    }
  }, [locationData.latitude, locationData.longitude]);

  const fetchLocationData = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("latitude, longitude, clinic_name, clinic_address, is_public_profile")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setLocationData({
        latitude: data.latitude,
        longitude: data.longitude,
        clinic_name: data.clinic_name,
        clinic_address: data.clinic_address,
        is_public_profile: data.is_public_profile ?? false,
      });
    }
    setLoading(false);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Geolocation not supported",
        description: "Your browser doesn't support location services.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocationData((prev) => ({ ...prev, latitude, longitude }));
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], DEFAULT_ZOOM);
        }
        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
        }
        toast({
          title: "Location updated",
          description: "Map centered on your current location.",
        });
      },
      () => {
        toast({
          variant: "destructive",
          title: "Location error",
          description: "Could not get your location. Please allow location access.",
        });
      }
    );
  };

  const handleLocateAddress = async () => {
    const address = locationData.clinic_address;
    if (!address || !address.trim()) {
      toast({
        variant: "destructive",
        title: "No address",
        description: "Please enter a clinic address first.",
      });
      return;
    }

    setSearching(true);
    const result = await searchLocation(address);
    setSearching(false);

    if (result) {
      const { lat, lon } = result;
      setLocationData((prev) => ({ ...prev, latitude: lat, longitude: lon }));
      
      if (mapRef.current) {
        mapRef.current.flyTo([lat, lon], DEFAULT_ZOOM);
      }
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lon]);
      }
      
      toast({
        title: "Location found",
        description: "Map updated to your clinic address.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Address not found",
        description: "Could not find this address. Try being more specific or drag the marker manually.",
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        clinic_name: locationData.clinic_name,
        clinic_address: locationData.clinic_address,
        is_public_profile: locationData.is_public_profile,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save location settings.",
      });
    } else {
      toast({
        title: "Location saved",
        description: locationData.is_public_profile 
          ? "Your clinic is now visible on the map to parents."
          : "Location saved but not visible to parents.",
      });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <Card className="glass-card border border-border/50 mt-6">
        <CardContent className="p-6">
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border border-border/50 mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Clinic Location
        </CardTitle>
        <CardDescription>
          Set your clinic location so parents can find you on the map
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Public Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
          <div className="space-y-0.5">
            <Label className="text-base font-medium">Show on map</Label>
            <p className="text-sm text-muted-foreground">
              Allow parents to see your clinic on the discovery map
            </p>
          </div>
          <Switch
            checked={locationData.is_public_profile}
            onCheckedChange={(checked) =>
              setLocationData((prev) => ({ ...prev, is_public_profile: checked }))
            }
          />
        </div>

        {/* Map Container */}
        <div className="relative rounded-xl overflow-hidden border border-border" style={{ height: "300px", zIndex: 0 }}>
          <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
          
          {/* Use My Location Button */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="absolute top-3 right-3 z-[1000] shadow-lg gap-2"
            onClick={handleUseMyLocation}
          >
            <Navigation className="h-4 w-4" />
            My Location
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Click on the map or drag the marker to set your clinic location
        </p>

        {/* Clinic Details */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Clinic Name
            </Label>
            <Input
              placeholder="e.g., An. Therapy Center"
              value={locationData.clinic_name || ""}
              onChange={(e) =>
                setLocationData((prev) => ({ ...prev, clinic_name: e.target.value }))
              }
            />
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Clinic Address
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., 123 Main Street, District 1, Ho Chi Minh City"
                value={locationData.clinic_address || ""}
                onChange={(e) =>
                  setLocationData((prev) => ({ ...prev, clinic_address: e.target.value }))
                }
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleLocateAddress}
                disabled={searching}
                className="gap-2 shrink-0"
              >
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Locate
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter your address and click "Locate" to find it on the map
            </p>
          </div>
        </div>

        {/* Coordinates Display */}
        {locationData.latitude && locationData.longitude && (
          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
            📍 Coordinates: {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
          </div>
        )}

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={saving} 
          className="w-full gap-2"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : "Save Location"}
        </Button>
      </CardContent>
    </Card>
  );
}
