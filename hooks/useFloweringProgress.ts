import { useEffect, useState } from "react";
import { useBoxStore } from "@/store";
import { calculateFloweringProgress } from "@/utils/floweringProgress";

const UPDATE_INTERVAL = 60_000;

export function useFloweringProgress() {
  const startDate = useBoxStore((state) => state.flowering.startDate);

  const [progress, setProgress] = useState(() =>
    calculateFloweringProgress(startDate),
  );

  useEffect(() => {
    const update = () => {
      setProgress(calculateFloweringProgress(startDate));
    };

    update();

    const interval = setInterval(update, UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [startDate]);

  return progress;
}
