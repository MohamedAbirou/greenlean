import { Droplet, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth";
import { DashboardService } from "../api/dashboardService";

const GLASS_ML = 250;

const WaterIntakeCard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [glasses, setGlasses] = useState(0);
  const [totalML, setTotalML] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const log = await DashboardService.getDailyWaterIntake(user.id);
        if (log) {
          setGlasses(log.glasses || 0);
          setTotalML(log.total_ml || 0);
        } else {
          setGlasses(0);
          setTotalML(0);
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  const handleAddGlass = async () => {
    if (!user?.id) return;
    setSaving(true);
    const newGlasses = glasses + 1;
    const newTotalML = totalML + GLASS_ML;
    await DashboardService.upsertDailyWaterIntake({
      userId: user.id,
      glasses: newGlasses,
      total_ml: newTotalML,
    });
    setGlasses(newGlasses);
    setTotalML(newTotalML);
    setSaving(false);
  };

  return (
    <div className="relative overflow-hidden rounded-md bg-blue-100 p-6 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 flex flex-col items-center shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <Droplet className="h-8 w-8 text-blue-500" />
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200">Water Intake</h3>
      </div>
      {loading ? (
        <div className="text-blue-600 font-medium">Loading...</div>
      ) : (
        <>
          <div className="text-center text-4xl font-bold text-blue-700 dark:text-blue-200">{glasses}</div>
          <div className="text-sm text-blue-700 dark:text-blue-300 mb-2">glasses ({totalML} ml)</div>
          <div className="text-sm text-blue-700 dark:text-blue-300 mb-2">each glass is 250 ml</div>
          <button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-4 rounded-md text-sm mt-1 disabled:opacity-50"
            onClick={handleAddGlass}
            disabled={saving}
            title="Add a glass of water"
          >
            <Plus size={18} /> Add Glass
          </button>
          <div className="text-[0.85em] text-blue-500 dark:text-blue-300 mt-3">
            Great job! Stay hydrated 🌊
          </div>
        </>
      )}
    </div>
  );
};

export default WaterIntakeCard;
