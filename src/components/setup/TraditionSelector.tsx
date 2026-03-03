import { motion } from "motion/react";
import { BookOpen, MapPin } from "lucide-react";
import { TRADITIONS } from "../../data/traditions";

interface TraditionSelectorProps {
  selectedTraditionId: string;
  onSelect: (traditionId: string) => void;
}

export function TraditionSelector({ selectedTraditionId, onSelect }: TraditionSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {TRADITIONS.map((tradition) => {
        const selected = tradition.id === selectedTraditionId;

        return (
          <motion.button
            key={tradition.id}
            type="button"
            onClick={() => onSelect(tradition.id)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-2xl p-4 text-left transition-all"
            style={{
              background: selected ? "rgba(220,160,72,0.2)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${selected ? "rgba(220,160,72,0.55)" : "rgba(255,255,255,0.08)"}`,
              boxShadow: selected ? "0 8px 30px rgba(220,160,72,0.18)" : "none",
            }}
          >
            <p style={{ color: "white", fontWeight: 700, fontSize: "1rem" }}>{tradition.cardLabel}</p>
            <p style={{ color: "#D7C29F", fontSize: "0.82rem", marginTop: 4 }}>{tradition.description}</p>

            <div className="mt-3 space-y-1.5">
              <div className="flex items-center gap-2" style={{ color: "#DCA048", fontSize: "0.74rem" }}>
                <MapPin size={12} />
                {tradition.region}
              </div>
              <div className="flex items-center gap-2" style={{ color: "#DCA048", fontSize: "0.74rem" }}>
                <BookOpen size={12} />
                {tradition.primarySource}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
