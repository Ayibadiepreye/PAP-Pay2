import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, UploadCloud, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { PeopleSelector } from "./people-selector";
import { useSubmitPayment } from "@workspace/api-client-react";
import { TicketResult } from "./ticket-result";

export function PaymentModal({ 
  open, 
  onOpenChange,
  initialPeople
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  initialPeople: number;
}) {
  const [step, setStep] = useState<"confirm" | "form" | "people" | "review" | "success">("confirm");
  
  const [confirmedPayment, setConfirmedPayment] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [senderName, setSenderName] = useState("");
  const [numPeople, setNumPeople] = useState(initialPeople);
  
  const [selectedPeople, setSelectedPeople] = useState<number[]>([]);
  const [amountConfirmed, setAmountConfirmed] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);
  const [ticketResult, setTicketResult] = useState<any>(null);

  const submitMutation = useSubmitPayment();

  // Reset state when opened
  if (!open && step !== "confirm") {
    setTimeout(() => {
      setStep("confirm");
      setConfirmedPayment(false);
      setFile(null);
      setSenderName("");
      setNumPeople(initialPeople);
      setSelectedPeople([]);
      setAmountConfirmed(false);
      setAgreedTerms(false);
      setTicketResult(null);
    }, 300);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleNextToPeople = () => {
    if (!file) {
      toast.error("Please upload payment proof");
      return;
    }
    if (!senderName.trim()) {
      toast.error("Please enter sender account name");
      return;
    }
    if (numPeople < 1) {
      toast.error("Number of people must be at least 1");
      return;
    }
    
    // Clear selections if number changes
    if (selectedPeople.length !== numPeople) {
      setSelectedPeople([]);
    }
    
    setStep("people");
  };

  const handleSubmit = async () => {
    if (!file || selectedPeople.length === 0 || !senderName) return;
    
    try {
      setIsUploading(true);
      
      // Upload file
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadRes = await fetch("/api/upload/proof", {
        method: "POST",
        body: formData,
      });
      
      if (!uploadRes.ok) throw new Error("Failed to upload file");
      
      const { url } = await uploadRes.json();
      
      // Submit payment
      submitMutation.mutate({
        data: {
          senderName,
          numberOfPeople: numPeople,
          peopleIds: selectedPeople,
          paymentProofUrl: url,
          amountPaid: numPeople * 600,
          agreedToTerms: agreedTerms
        }
      }, {
        onSuccess: (data) => {
          setTicketResult({
            ...data,
            amountPaid: numPeople * 600,
            senderName
          });
          setStep("success");
          toast.success("Payment submitted successfully!");
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to submit payment");
        }
      });
      
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto sm:rounded-xl">
        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle>Confirm Payment</DialogTitle>
              <DialogDescription>
                Before proceeding, please confirm you have transferred the exact amount to the account provided.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-4">
              <div className="flex items-start space-x-3 p-4 border rounded-lg bg-muted/50">
                <Checkbox 
                  id="confirm" 
                  checked={confirmedPayment} 
                  onCheckedChange={(c) => setConfirmedPayment(c as boolean)} 
                  className="mt-1"
                />
                <div className="space-y-1">
                  <Label htmlFor="confirm" className="font-medium cursor-pointer">
                    I confirm that I have made the payment
                  </Label>
                  <p className="text-xs text-muted-foreground">Do not check this if you haven't transferred the money yet.</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setStep("form")} disabled={!confirmedPayment} className="w-full">
                Continue
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "form" && (
          <>
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>
                Provide the details of your transfer.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-5">
              <div className="space-y-2">
                <Label>Upload Payment Proof *</Label>
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                  <Input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  {file ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle2 className="h-8 w-8 text-primary mb-2" />
                      <span className="text-sm font-medium text-primary">{file.name}</span>
                      <span className="text-xs text-muted-foreground mt-1">Tap to change</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium">Click to upload receipt</span>
                      <span className="text-xs text-muted-foreground mt-1">Payment proof should clearly show the amount paid.</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sender Account Name *</Label>
                <Input 
                  placeholder="e.g. John Doe" 
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Please make sure this is the correct sender name as it appears on your bank transfer.</p>
              </div>

              <div className="space-y-2">
                <Label>Number of people you paid for *</Label>
                <Input 
                  type="number" 
                  min={1} 
                  value={numPeople}
                  onChange={(e) => setNumPeople(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <p className="text-xs font-medium text-primary">Amount paid should be ₦{(numPeople * 600).toLocaleString()}</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleNextToPeople} className="w-full group">
                Select Attendees <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "people" && (
          <PeopleSelector 
            requiredCount={numPeople}
            selectedIds={selectedPeople}
            onComplete={(ids) => {
              setSelectedPeople(ids);
              setStep("review");
            }}
            onCancel={() => setStep("form")}
          />
        )}

        {step === "review" && (
          <>
            <DialogHeader>
              <DialogTitle>Review & Submit</DialogTitle>
              <DialogDescription>
                Almost there! Please review your submission.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6">
              
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-start border-b pb-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Attendees Selected</p>
                    <p className="font-bold text-lg">{selectedPeople.length} People</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setStep("people")}>Edit</Button>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Amount Paid</p>
                  <p className="font-bold text-2xl text-primary">₦{(numPeople * 600).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="amount-visible" 
                    checked={amountConfirmed} 
                    onCheckedChange={(c) => setAmountConfirmed(c as boolean)} 
                    className="mt-1"
                  />
                  <Label htmlFor="amount-visible" className="font-normal text-sm leading-snug cursor-pointer">
                    Is the amount <strong>₦{(numPeople * 600).toLocaleString()}</strong> clearly visible in your payment proof?
                  </Label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="agreed-terms" 
                    checked={agreedTerms} 
                    onCheckedChange={(c) => setAgreedTerms(c as boolean)} 
                    className="mt-1"
                  />
                  <Label htmlFor="agreed-terms" className="font-normal text-sm leading-snug text-muted-foreground cursor-pointer">
                    I agree that all information presented is valid. The organizers are not liable for any issues arising from incorrect information submitted.
                  </Label>
                </div>
              </div>

            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button 
                onClick={handleSubmit} 
                disabled={!amountConfirmed || !agreedTerms || isUploading || submitMutation.isPending} 
                className="w-full h-12 text-lg font-bold"
              >
                {isUploading || submitMutation.isPending ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</>
                ) : (
                  "Get Ticket"
                )}
              </Button>
              <Button variant="ghost" onClick={() => setStep("form")} disabled={isUploading || submitMutation.isPending}>
                Back
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "success" && ticketResult && (
          <TicketResult 
            ticket={ticketResult} 
            onClose={() => onOpenChange(false)} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
