import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateHospital } from "@/hooks/useHospitals";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Loader2 } from "lucide-react";

interface QuickRegisterDialogProps {
  trigger?: React.ReactNode;
}

export default function QuickRegisterDialog({ trigger }: QuickRegisterDialogProps) {
  const navigate = useNavigate();
  const createHospital = useCreateHospital();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const hospital = await createHospital.mutateAsync({
        name: name.trim(),
        city: city.trim(),
      });
      setOpen(false);
      setName("");
      setCity("");
      navigate(`/hospital/${hospital.id}`);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isValid = name.trim().length > 0 && city.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Zap className="h-4 w-4 mr-2" />
            Quick Register
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Register
          </DialogTitle>
          <DialogDescription>
            Register your hospital in seconds. You can add more details later from your dashboard.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quick-name">Hospital Name *</Label>
              <Input
                id="quick-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., City General Hospital"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quick-city">City *</Label>
              <Input
                id="quick-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Mumbai"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || createHospital.isPending}
            >
              {createHospital.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Hospital"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
