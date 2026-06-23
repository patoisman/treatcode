import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdatePledge } from "../hooks/useUpdatePledge";

const PRESETS_GBP = [25, 35, 50, 75, 100] as const;

export function PledgeStep() {
  const [presetPence, setPresetPence] = useState<number | null>(null);
  const [customPounds, setCustomPounds] = useState("");
  const { mutate, isPending } = useUpdatePledge();

  const effectivePence =
    presetPence ??
    (customPounds ? Math.round(parseFloat(customPounds) * 100) : null);

  function handlePreset(pounds: number) {
    setPresetPence(pounds * 100);
    setCustomPounds("");
  }

  function handleCustom(value: string) {
    setCustomPounds(value);
    setPresetPence(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!effectivePence || isNaN(effectivePence)) return;
    if (effectivePence < 2500) {
      toast.error("Minimum pledge is £25");
      return;
    }
    if (effectivePence > 50000) {
      toast.error("Maximum pledge is £500");
      return;
    }
    mutate(effectivePence, {
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Failed to save pledge"),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Choose your monthly deposit</p>
        <div className="grid grid-cols-5 gap-2">
          {PRESETS_GBP.map((gbp) => (
            <button
              key={gbp}
              type="button"
              onClick={() => handlePreset(gbp)}
              className={cn(
                "rounded-md border py-3 text-sm font-medium transition-colors",
                presetPence === gbp * 100
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border hover:border-primary/50 text-foreground"
              )}
            >
              £{gbp}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom-amount">Custom amount (£25–£500)</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            £
          </span>
          <Input
            id="custom-amount"
            type="number"
            min="25"
            max="500"
            step="1"
            placeholder="0"
            className="pl-7"
            value={customPounds}
            onChange={(e) => handleCustom(e.target.value)}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!effectivePence || isNaN(effectivePence) || isPending}
      >
        {isPending ? "Saving…" : "Set pledge amount"}
      </Button>
    </form>
  );
}
