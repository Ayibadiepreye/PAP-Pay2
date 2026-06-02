import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdminLogin, useAdminLogout, useGetAdminMe, useGetStats, useListPayments, useListTickets, useListPeople, useUpdatePaymentStatus, useMarkTicketDelivered } from "@workspace/api-client-react";
import { toast } from "sonner";
import { Loader2, LogOut, Check, X, Search, FileText, Download } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Dashboard() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const queryClient = useQueryClient();

  const { data: session, isLoading: sessionLoading } = useGetAdminMe({
    query: { retry: false, refetchOnWindowFocus: false }
  });

  const loginMutation = useAdminLogin();
  const logoutMutation = useAdminLogout();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { username, password } }, {
      onSuccess: () => {
        toast.success("Logged in successfully");
        queryClient.invalidateQueries({ queryKey: ["/api/admin/me"] });
      },
      onError: () => {
        toast.error("Invalid credentials");
      }
    });
  };

  const handleLogout = () => {
    logoutMutation.mutate({}, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/me"] });
      }
    });
  };

  if (sessionLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!session?.authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the dashboard</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Login"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-primary">PAP Admin</h1>
          <p className="text-sm text-muted-foreground">Welcome, {session.username}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} disabled={logoutMutation.isPending}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </header>

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
        <Tabs defaultValue="overview" className="w-full space-y-6">
          <TabsList className="grid grid-cols-4 max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="people">People</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsTab />
          </TabsContent>

          <TabsContent value="tickets">
            <TicketsTab />
          </TabsContent>

          <TabsContent value="people">
            <PeopleTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function OverviewTab() {
  const { data: stats, isLoading } = useGetStats();

  if (isLoading) return <div className="py-10 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>;
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total People</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.totalPeople}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Paid vs Unpaid</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">{stats.paidCount} <span className="text-muted-foreground text-xl">/ {stats.totalPeople}</span></div>
          <p className="text-sm text-destructive mt-1">{stats.unpaidCount} remaining</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-amber-500">{stats.pendingPayments}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.totalTickets}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Delivered Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-500">{stats.deliveredCount}</div>
        </CardContent>
      </Card>
    </div>
  );
}

function PaymentsTab() {
  const [filter, setFilter] = useState<"pending" | "verified" | "rejected" | "all">("all");
  const [search, setSearch] = useState("");
  
  const { data: payments, isLoading } = useListPayments(
    { status: filter === "all" ? undefined : filter, search: search || undefined },
    { query: { queryKey: ["/api/payments", filter, search] } }
  );

  const updateMutation = useUpdatePaymentStatus();
  const queryClient = useQueryClient();

  const handleUpdate = (id: number, status: "verified" | "rejected") => {
    updateMutation.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast.success(`Payment marked as ${status}`);
        queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      }
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <CardTitle>Payments</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search..." 
                className="pl-9" 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select 
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={filter}
              onChange={e => setFilter(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-10 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
        ) : payments?.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">No payments found</div>
        ) : (
          <div className="space-y-4">
            {payments?.map(payment => (
              <div key={payment.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg bg-card gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{payment.senderName}</span>
                    <Badge variant={payment.status === "verified" ? "default" : payment.status === "rejected" ? "destructive" : "secondary"}>
                      {payment.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ₦{payment.amountPaid} • {payment.numberOfPeople} people • Ticket: <span className="font-mono">{payment.ticketCode}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(payment.createdAt).toLocaleString()}
                  </div>
                  {payment.peopleNames && payment.peopleNames.length > 0 && (
                    <div className="mt-2 text-xs border bg-muted/50 p-2 rounded max-w-md">
                      <strong>People:</strong> {payment.peopleNames.join(", ")}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href={payment.paymentProofUrl} target="_blank" rel="noreferrer">
                      <FileText className="mr-2 h-4 w-4" /> View Proof
                    </a>
                  </Button>
                  
                  {payment.status === "pending" && (
                    <div className="flex gap-2 w-full">
                      <Button size="sm" variant="default" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleUpdate(payment.id, "verified")}>
                        <Check className="mr-1 h-4 w-4" /> Verify
                      </Button>
                      <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleUpdate(payment.id, "rejected")}>
                        <X className="mr-1 h-4 w-4" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TicketsTab() {
  const [filter, setFilter] = useState<"all" | "delivered" | "not_delivered">("all");
  const [search, setSearch] = useState("");
  
  const { data: tickets, isLoading } = useListTickets(
    { delivered: filter === "all" ? undefined : filter === "delivered", search: search || undefined },
    { query: { queryKey: ["/api/tickets", filter, search] } }
  );

  const deliverMutation = useMarkTicketDelivered();
  const queryClient = useQueryClient();

  const handleDeliver = (code: string) => {
    deliverMutation.mutate({ ticketCode: code }, {
      onSuccess: () => {
        toast.success("Ticket marked as delivered");
        queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      }
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <CardTitle>Tickets</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search..." 
                className="pl-9" 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select 
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={filter}
              onChange={e => setFilter(e.target.value as any)}
            >
              <option value="all">All Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="not_delivered">Not Delivered</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-10 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
        ) : tickets?.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">No tickets found</div>
        ) : (
          <div className="space-y-4">
            {tickets?.map(ticket => (
              <div key={ticket.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg bg-card gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-lg">{ticket.ticketCode}</span>
                    <Badge variant={ticket.isDelivered ? "default" : "secondary"} className={ticket.isDelivered ? "bg-green-600 hover:bg-green-700" : ""}>
                      {ticket.isDelivered ? "Delivered" : "Pending Delivery"}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <strong>Sender:</strong> {ticket.senderName || "Unknown"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </div>
                  <div className="mt-2 text-sm border bg-muted/50 p-2 rounded max-w-md">
                    <strong>Covers:</strong> {ticket.peopleNames.join(", ")}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                  {!ticket.isDelivered && (
                    <Button size="sm" className="w-full bg-primary" onClick={() => handleDeliver(ticket.ticketCode)}>
                      <Download className="mr-2 h-4 w-4" /> Mark Delivered
                    </Button>
                  )}
                  {ticket.paymentProofUrl && (
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href={ticket.paymentProofUrl} target="_blank" rel="noreferrer">
                        View Proof
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PeopleTab() {
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [search, setSearch] = useState("");
  
  const { data: people, isLoading } = useListPeople(
    undefined,
    { query: { queryKey: ["/api/people"] } }
  );

  const filteredPeople = people?.filter(p => {
    if (filter === "paid" && !p.isPaid) return false;
    if (filter === "unpaid" && p.isPaid) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <CardTitle>Attendees</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search..." 
                className="pl-9" 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select 
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={filter}
              onChange={e => setFilter(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-10 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPeople?.map(person => (
              <div key={person.id} className={`p-3 border rounded-lg flex items-center justify-between ${person.isPaid ? 'bg-primary/5 border-primary/20' : 'bg-card'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                    {person.number}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${person.isPaid ? 'line-through text-muted-foreground' : ''}`}>{person.name}</p>
                    {person.ticketCode && <p className="text-xs font-mono text-primary mt-0.5">{person.ticketCode}</p>}
                  </div>
                </div>
                <Badge variant={person.isPaid ? "default" : "outline"} className={person.isPaid ? "bg-primary text-primary-foreground" : ""}>
                  {person.isPaid ? "Paid" : "Unpaid"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
