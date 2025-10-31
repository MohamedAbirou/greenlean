import { ML_SERVICE_URL } from "@/features/quiz";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface ServiceStatusItem {
  service: string;
  status: string;
  latency: string;
  details?: string;
}

export default function ServiceStatus() {
  const [services, setServices] = useState<ServiceStatusItem[]>([]);

  useEffect(() => {
    async function checkServices() {
      const results = [];

      // ✅ API & AI health in one call
      const start = performance.now();
      let health = null;
      try {
        const res = await fetch(`${ML_SERVICE_URL}/health`);
        const latency = performance.now() - start;
        health = await res.json();

        results.push({
          service: "API Gateway",
          status: res.ok ? "operational" : "down",
          latency: `${latency.toFixed(0)}ms`,
        });

        // ✅ AI Service (based on ai_providers)
        const activeAIs = Object.entries(health.ai_providers || {})
          .filter(([_, isActive]) => isActive)
          .map(([name]) => name);

        results.push({
          service: "AI Service",
          status: activeAIs.length > 0 ? "operational" : "degraded",
          latency: `${latency.toFixed(0)}ms`,
          details: activeAIs.join(", ") || "None",
        });
      } catch {
        results.push({ service: "API Gateway", status: "down", latency: "—" });
        results.push({ service: "AI Service", status: "down", latency: "—" });
      }

      // ✅ Database (using Supabase or health.database)
      try {
        const dbStart = performance.now();
        const { error } = await supabase.rpc("get_db_size");
        const dbLatency = performance.now() - dbStart;
        results.push({
          service: "Database",
          status: error ? "error" : "operational",
          latency: `${dbLatency.toFixed(0)}ms`,
        });
      } catch {
        results.push({ service: "Database", status: "down", latency: "—" });
      }

      // ✅ Storage
      // ✅ Storage
      const storageStart = performance.now();
      try {
        const { error } = await supabase.storage.from("avatars").list("", { limit: 1 });
        const storageTime = performance.now() - storageStart;
        results.push({
          service: "Storage",
          status: error ? "error" : "operational",
          latency: `${storageTime.toFixed(0)}ms`,
        });
      } catch {
        results.push({ service: "Storage", status: "down", latency: "—" });
      }

      setServices(results as ServiceStatusItem[]);
    }

    checkServices();
    const interval = setInterval(checkServices, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <h3 className="text-lg font-semibold mb-4">Service Status</h3>
      <div className="grid grid-cols-2 gap-4">
        {services.map((item, idx) => (
          <div key={idx} className="p-4 bg-accent rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">{item.service}</span>
              <div
                className={`h-2 w-2 rounded-full ${
                  item.status === "operational"
                    ? "bg-green-500"
                    : item.status === "degraded"
                    ? "bg-orange-500"
                    : "bg-red-500"
                }`}
              />
            </div>
            <p className="text-xs text-muted-foreground">{item.latency}</p>
            {item.details && <p className="text-xs text-muted-foreground italic">{item.details}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
