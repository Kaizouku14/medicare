import { renderNutrients } from "@/types/domain";

export function Nutrients({ nutrients }: { nutrients: string | Record<string, string> }) {
  return <>{renderNutrients(nutrients)}</>;
}
