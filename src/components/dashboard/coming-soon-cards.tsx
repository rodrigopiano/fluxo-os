import { CalendarClock, TrendingUp, ShieldCheck, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const CARDS = [
  { icon: CalendarClock, label: "Contas que vencem esta semana" },
  { icon: TrendingUp, label: "Evolução do patrimônio" },
  { icon: ShieldCheck, label: "Reserva de emergência" },
  { icon: Target, label: "Objetivos financeiros" },
];

export function ComingSoonCards() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {CARDS.map((card) => (
        <Card key={card.label} className="border-dashed opacity-60">
          <CardContent className="flex flex-col gap-2">
            <card.icon className="size-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <span className="text-xs text-muted-foreground/60">em breve</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
