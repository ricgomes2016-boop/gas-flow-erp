import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const stockItems = [
  { name: "Botijão P13 Cheio", current: 45, max: 100, color: "bg-primary" },
  { name: "Botijão P13 Vazio", current: 30, max: 100, color: "bg-muted-foreground" },
  { name: "Botijão P45 Cheio", current: 12, max: 30, color: "bg-success" },
  { name: "Botijão P45 Vazio", current: 8, max: 30, color: "bg-muted-foreground" },
];

export function StockOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visão do Estoque</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {stockItems.map((item) => {
            const percentage = (item.current / item.max) * 100;
            const isLow = percentage < 30;

            return (
              <div key={item.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {item.name}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      isLow ? "text-destructive" : "text-muted-foreground"
                    }`}
                  >
                    {item.current}/{item.max}
                  </span>
                </div>
                <Progress
                  value={percentage}
                  className="h-2"
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
