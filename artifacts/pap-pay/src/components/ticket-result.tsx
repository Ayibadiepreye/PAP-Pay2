import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Download, MessageCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

export function TicketResult({ ticket, onClose }: { ticket: any, onClose: () => void }) {
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(ticket.ticketCode);
    toast.success("Ticket code copied!");
  };

  const handleSavePdf = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      doc.setFillColor(23, 163, 74); // primary color sort of
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text("WIGWE PAP 2025", 105, 20, { align: "center" });
      doc.setFontSize(12);
      doc.text("OFFICIAL EVENT TICKET", 105, 30, { align: "center" });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text("Ticket Code:", 20, 60);
      
      doc.setFontSize(24);
      doc.setFont("courier", "bold");
      doc.text(ticket.ticketCode, 20, 75);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(`Sender Name: ${ticket.senderName}`, 20, 100);
      doc.text(`Amount Paid: NGN ${ticket.amountPaid.toLocaleString()}`, 20, 110);
      doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 20, 120);

      doc.text("Attendees Covered:", 20, 140);
      
      doc.setFont("helvetica", "bold");
      let y = 150;
      ticket.peopleNames.forEach((name: string, i: number) => {
        doc.text(`${i + 1}. ${name}`, 25, y);
        y += 8;
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Please keep this ticket code safe. Present it upon request.", 105, 280, { align: "center" });

      doc.save(`PAP2025-Ticket-${ticket.ticketCode}.pdf`);
      toast.success("Ticket saved as PDF");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF. Please screenshot this page instead.");
    }
  };

  return (
    <div className="flex flex-col h-full text-center">
      <div className="flex justify-center mb-6 mt-4">
        <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10" />
        </div>
      </div>
      
      <DialogHeader className="mb-6">
        <DialogTitle className="text-2xl font-bold text-center">🎉 Payment Submitted!</DialogTitle>
      </DialogHeader>

      <div className="bg-card border rounded-xl p-6 mb-6 shadow-sm">
        <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium mb-2">Your Ticket Code</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-3xl sm:text-4xl font-mono font-bold tracking-widest text-primary">{ticket.ticketCode}</span>
          <Button size="icon" variant="outline" onClick={handleCopyCode} className="h-10 w-10 shrink-0 rounded-full">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-6 pt-6 border-t text-left space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sender</span>
            <span className="font-medium">{ticket.senderName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-medium font-mono text-primary">₦{ticket.amountPaid.toLocaleString()}</span>
          </div>
          <div className="pt-2">
            <span className="text-muted-foreground text-sm block mb-1">Attendees ({ticket.peopleNames.length})</span>
            <div className="bg-muted p-3 rounded-md text-sm font-medium">
              {ticket.peopleNames.map((name: string, i: number) => (
                <div key={i} className="py-1 border-b last:border-0 border-border/50">{name}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <Button onClick={handleSavePdf} className="w-full bg-primary" size="lg">
          <Download className="mr-2 h-5 w-5" /> Save as PDF
        </Button>
        <Button variant="outline" onClick={onClose} className="w-full">
          Close
        </Button>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg text-sm text-left border">
        <p className="font-medium flex items-center mb-2">
          <MessageCircle className="h-4 w-4 mr-2 text-primary" /> Important
        </p>
        <p className="text-muted-foreground">
          For further information, join our groups: <strong>WIGWE PAP 2025 | PAP STUDENTS (WIGWE UNIVERSITY)</strong>
        </p>
      </div>
    </div>
  );
}
