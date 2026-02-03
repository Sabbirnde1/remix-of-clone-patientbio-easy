import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateHospital } from "@/hooks/useHospitals";
import { HospitalType } from "@/types/hospital";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Loader2, Shield, Clock, Zap } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import RegistrationSteps from "@/components/hospital/RegistrationSteps";
import StepBasicInfo from "@/components/hospital/StepBasicInfo";
import StepLocation from "@/components/hospital/StepLocation";
import StepContact from "@/components/hospital/StepContact";
import RegistrationSuccess from "@/components/hospital/RegistrationSuccess";

const STEPS = [
  { id: 1, title: "Basic Info", description: "Facility details" },
  { id: 2, title: "Location", description: "Address info" },
  { id: 3, title: "Contact", description: "How to reach you" },
];

const STORAGE_KEY = "hospital_registration_data";

interface FormData {
  name: string;
  type: HospitalType;
  registration_number: string;
  city: string;
  state: string;
  address: string;
  country: string;
  phone: string;
  email: string;
  website: string;
}

const initialFormData: FormData = {
  name: "",
  type: "hospital",
  registration_number: "",
  city: "",
  state: "",
  address: "",
  country: "India",
  phone: "",
  email: "",
  website: "",
};

export default function HospitalOnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const createHospital = useCreateHospital();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registeredHospital, setRegisteredHospital] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Load saved data from session storage
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        // Invalid data, ignore
      }
    }
  }, []);

  // Save data to session storage when form changes
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  // Auto-submit if user just authenticated and has saved data
  useEffect(() => {
    const shouldAutoSubmit = sessionStorage.getItem("hospital_pending_submit");
    if (user && shouldAutoSubmit && formData.name && formData.city) {
      sessionStorage.removeItem("hospital_pending_submit");
      handleSubmit();
    }
  }, [user]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim() || formData.name.trim().length < 2) {
        newErrors.name = "Facility name must be at least 2 characters";
      }
    }

    if (step === 2) {
      if (!formData.city.trim() || formData.city.trim().length < 2) {
        newErrors.city = "City must be at least 2 characters";
      }
    }

    if (step === 3) {
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
      if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
        newErrors.website = "Please enter a valid URL starting with http:// or https://";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    if (currentStep === 3) {
      // Final step - check auth
      if (!user) {
        // Save pending submit flag and redirect to auth
        sessionStorage.setItem("hospital_pending_submit", "true");
        navigate("/auth?redirect=/hospitals/register");
        return;
      }
      handleSubmit();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      const hospital = await createHospital.mutateAsync({
        name: formData.name.trim(),
        type: formData.type,
        registration_number: formData.registration_number.trim() || undefined,
        city: formData.city.trim(),
        state: formData.state.trim() || undefined,
        address: formData.address.trim() || undefined,
        country: formData.country.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        website: formData.website.trim() || undefined,
      });

      // Clear saved data
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem("hospital_pending_submit");

      setRegisteredHospital({ id: hospital.id, name: hospital.name });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    // Clear errors for updated fields
    const clearedErrors = { ...errors };
    Object.keys(data).forEach((key) => delete clearedErrors[key]);
    setErrors(clearedErrors);
  };

  // Show success screen
  if (registeredHospital) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 pt-24 pb-8 max-w-2xl">
          <RegistrationSuccess
            hospitalId={registeredHospital.id}
            hospitalName={registeredHospital.name}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 pt-24 pb-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/hospitals")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Hospitals
        </Button>

        <div className="max-w-2xl mx-auto">
          {/* Hero Section - Only show on first step */}
          {currentStep === 1 && (
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                Register Your Healthcare Facility
              </h1>
              <p className="text-muted-foreground mb-6">
                Join our network and start managing your facility in minutes
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Secure & Private</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Setup in 2 minutes</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>Free to start</span>
                </div>
              </div>
            </div>
          )}

          {/* Progress Steps */}
          <div className="mb-8">
            <RegistrationSteps steps={STEPS} currentStep={currentStep} />
          </div>

          {/* Form Card */}
          <Card>
            <CardContent className="p-6 sm:p-8">
              {currentStep === 1 && (
                <StepBasicInfo
                  data={{
                    name: formData.name,
                    type: formData.type,
                    registration_number: formData.registration_number,
                  }}
                  onChange={updateFormData}
                  errors={errors}
                />
              )}

              {currentStep === 2 && (
                <StepLocation
                  data={{
                    city: formData.city,
                    state: formData.state,
                    address: formData.address,
                    country: formData.country,
                  }}
                  onChange={updateFormData}
                  errors={errors}
                />
              )}

              {currentStep === 3 && (
                <StepContact
                  data={{
                    phone: formData.phone,
                    email: formData.email,
                    website: formData.website,
                  }}
                  onChange={updateFormData}
                  errors={errors}
                />
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={createHospital.isPending}
                >
                  {createHospital.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : currentStep === 3 ? (
                    user ? (
                      "Complete Registration"
                    ) : (
                      "Continue to Sign In"
                    )
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              {/* Auth hint for guests */}
              {currentStep === 3 && !user && (
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    to="/auth?redirect=/hospitals/register"
                    className="text-primary hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
