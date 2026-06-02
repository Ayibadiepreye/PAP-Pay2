import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useListPeople } from "@workspace/api-client-react";
import { Search, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

export function PeopleSelector({ 
  requiredCount, 
  selectedIds, 
  onComplete, 
  onCancel 
}: { 
  requiredCount: number;
  selectedIds: number[];
  onComplete: (ids: number[]) => void;
  onCancel: () => void;
}) {
  const [search, setSearch] = useState("");
  const [localSelected, setLocalSelected] = useState<number[]>(selectedIds);
  
  const { data: people, isLoading } = useListPeople(undefined, {
    query: { queryKey: ["/api/people"] }
  });

  const filteredPeople = useMemo(() => {
    if (!people) return [];
    if (!search.trim()) return people;
    const lowerSearch = search.toLowerCase();
    return people.filter(p => p.name.toLowerCase().includes(lowerSearch) || p.number.toString().includes(lowerSearch));
  }, [people, search]);

  const togglePerson = (id: number, isPaid: boolean) => {
    if (isPaid) {
      toast("This person has already been paid for. Clarify with admin for any issues.", {
        icon: "⚠️"
      });
      return;
    }

    if (localSelected.includes(id)) {
      setLocalSelected(prev => prev.filter(x => x !== id));
    } else {
      if (localSelected.length >= requiredCount) {
        toast.error(`You can only select exactly ${requiredCount} people.`);
        return;
      }
      setLocalSelected(prev => [...prev, id]);
    }
  };

  const handleComplete = () => {
    if (localSelected.length !== requiredCount) {
      toast.error(`Please select exactly ${requiredCount} people.`);
      return;
    }
    onComplete(localSelected);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Select Attendees</DialogTitle>
        <DialogDescription>
          Select exactly {requiredCount} {requiredCount === 1 ? 'person' : 'people'} to pay for.
          Currently selected: {localSelected.length} / {requiredCount}
        </DialogDescription>
      </DialogHeader>
      
      <div className="py-2 flex flex-col h-[50vh] min-h-[400px]">
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or number..." 
            className="pl-9" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="flex-1 border rounded-md">
            <div className="p-2 space-y-1">
              {filteredPeople.map(person => {
                const isSelected = localSelected.includes(person.id);
                return (
                  <div 
                    key={person.id}
                    onClick={() => togglePerson(person.id, person.isPaid)}
                    className={`
                      flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors
                      ${person.isPaid ? 'opacity-50 bg-muted/50 cursor-not-allowed' : 'hover:bg-muted/50'}
                      ${isSelected ? 'bg-primary/10 border-primary border' : 'border border-transparent'}
                    `}
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                      {person.number}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${person.isPaid ? 'line-through' : ''}`}>
                        {person.name}
                      </p>
                      {person.isPaid && <p className="text-xs text-destructive">Already Paid</p>}
                    </div>

                    {isSelected && (
                      <div className="h-5 w-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredPeople.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  No attendees found matching "{search}"
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      <DialogFooter className="flex-col gap-2 sm:flex-col">
        <Button 
          onClick={handleComplete} 
          disabled={localSelected.length !== requiredCount}
          className="w-full"
        >
          Confirm Selection ({localSelected.length}/{requiredCount})
        </Button>
        <Button variant="ghost" onClick={onCancel} className="w-full">
          Back
        </Button>
      </DialogFooter>
    </>
  );
}
