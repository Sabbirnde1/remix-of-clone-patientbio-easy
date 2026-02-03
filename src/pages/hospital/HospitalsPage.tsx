import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useHospitals, useMyHospitals } from "@/hooks/useHospitals";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Search, MapPin, Phone, ArrowRight, Zap } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import QuickRegisterDialog from "@/components/hospital/QuickRegisterDialog";

export default function HospitalsPage() {
  const { user } = useAuth();
  const { data: hospitals, isLoading } = useHospitals();
  const { data: myHospitals } = useMyHospitals();
  const [search, setSearch] = useState("");

  const filteredHospitals = hospitals?.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.city?.toLowerCase().includes(search.toLowerCase())
  );

  const myHospitalIds = myHospitals?.map((mh) => mh.hospital_id) || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Healthcare Facilities</h1>
            <p className="text-muted-foreground mt-1">
              Find and connect with hospitals and clinics
            </p>
          </div>
          <div className="flex gap-2">
            {user ? (
              <QuickRegisterDialog
                trigger={
                  <Button variant="default">
                    <Zap className="h-4 w-4 mr-2" />
                    Quick Register
                  </Button>
                }
              />
            ) : (
              <Button asChild variant="default">
                <Link to="/auth">
                  <Zap className="h-4 w-4 mr-2" />
                  Quick Register
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link to={user ? "/hospitals/register" : "/auth"}>
                <Plus className="h-4 w-4 mr-2" />
                Full Registration
              </Link>
            </Button>
          </div>
        </div>

        {/* My Hospitals Section */}
        {myHospitals && myHospitals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">My Hospitals</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myHospitals.map((staff) => (
                <Card key={staff.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{staff.hospital?.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {staff.hospital?.city || "Location not set"}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {staff.role}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full" variant="outline">
                      <Link to={`/hospital/${staff.hospital_id}`}>
                        Open Dashboard
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hospitals by name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* All Hospitals */}
        <h2 className="text-xl font-semibold mb-4">All Hospitals</h2>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-10 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredHospitals?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {search ? "No hospitals found matching your search" : "No hospitals registered yet"}
              </p>
              {user && !search && (
                <Button asChild className="mt-4">
                  <Link to="/hospitals/register">Register the first hospital</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredHospitals?.map((hospital) => (
              <Card key={hospital.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{hospital.name}</CardTitle>
                      {hospital.city && (
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{hospital.city}, {hospital.state}</span>
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {hospital.phone && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mb-3">
                      <Phone className="h-3 w-3" />
                      {hospital.phone}
                    </p>
                  )}
                  {myHospitalIds.includes(hospital.id) ? (
                    <Button asChild className="w-full" variant="outline">
                      <Link to={`/hospital/${hospital.id}`}>
                        Open Dashboard
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  ) : user ? (
                    <Button asChild className="w-full" variant="secondary">
                      <Link to={`/hospitals/${hospital.id}/apply`}>
                        Apply as Doctor
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild className="w-full" variant="secondary">
                      <Link to="/auth">Sign in to Apply</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
