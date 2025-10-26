/**
 * Beta Banner Component
 * Displays beta warning message
 */

export function BetaBanner() {
  return (
    <div className="bg-yellow-100 border-b border-yellow-300 text-yellow-900 text-sm text-center rounded-lg py-2">
      ⚠️ This dashboard is in <span className="font-bold">BETA</span> mode — results may not be final.
    </div>
  );
}
