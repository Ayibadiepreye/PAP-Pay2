import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Plus, Minus, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { PaymentModal } from "@/components/payment-modal";

export default function Home() {
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const TICKET_PRICE = 600;
  const totalAmount = numberOfPeople * TICKET_PRICE;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <header className="p-4 flex justify-between items-center max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold text-xl">
            P
          </div>
          <h1 className="font-bold text-xl tracking-tight">PAP Pay</h1>
        </div>
        <ThemeToggle />
      </header>

      <main className="max-w-md mx-auto px-4 space-y-6 mt-4">
        <section className="text-center space-y-3 mb-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">WIGWE PAP 2025</h2>
          <p className="text-muted-foreground text-base sm:text-lg">Secure your spot. Fast and easy.</p>
        </section>

        <Card className="border-primary/20 shadow-lg shadow-primary/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Payment Details</CardTitle>
            <CardDescription>Transfer to the account below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between border">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Account Number</p>
                <p className="text-2xl font-mono font-bold">1960289836</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => handleCopy("1960289836")} className="hover-elevate">
                <Copy className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Bank</p>
                <p className="font-medium">Access Bank</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Account Name</p>
                <p className="font-medium text-sm leading-tight">PRINCEWILL AYIBADIEPREYE BONNIE</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Ticket Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Number of People</Label>
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))}
                  disabled={numberOfPeople <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input 
                  type="number" 
                  min={1} 
                  value={numberOfPeople}
                  onChange={(e) => setNumberOfPeople(Math.max(1, parseInt(e.target.value) || 1))}
                  className="text-center text-lg font-bold w-full"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setNumberOfPeople(numberOfPeople + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Total Due:</span>
              <span className="text-3xl font-bold text-primary">₦{totalAmount.toLocaleString()}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full h-14 text-lg font-bold rounded-xl shadow-lg active-elevate" 
              onClick={() => setIsModalOpen(true)}
            >
              I've Already Paid
            </Button>
          </CardFooter>
        </Card>

        <section className="space-y-4 pt-6 pb-12 text-center text-sm">
          <div className="bg-secondary/50 rounded-lg p-4 border border-secondary">
            <p className="font-medium mb-1">Delivery Information</p>
            <p className="text-muted-foreground">Documents will be delivered to you. In any special situation, please contact admin beforehand.</p>
          </div>
          
          <div className="space-y-3">
            <p className="text-muted-foreground">For further inquiries, important information or any issue, contact admin:</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button 
                className="w-full sm:w-auto bg-[#25D366] hover:bg-[#128C7E] text-white border-none shadow-md" 
                size="default" 
                asChild
              >
                <a href="https://wa.me/2348102551002" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp 1
                </a>
              </Button>
              <Button 
                className="w-full sm:w-auto bg-[#25D366] hover:bg-[#128C7E] text-white border-none shadow-md" 
                size="default" 
                asChild
              >
                <a href="https://wa.me/2347016797259" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp 2
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="text-center py-6 text-xs text-muted-foreground border-t">
        <p>WIGWE PAP 2025 • Payment Portal</p>
        <p className="mt-1">The organizers are not liable for any issues arising from incorrect information submitted.</p>
      </footer>

      <PaymentModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        initialPeople={numberOfPeople} 
      />
    </div>
  );
}
