import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { NoteRow } from "@/types/notes";

type NoteCardProps = {
  note: NoteRow;
  rank: number;
  showDistance: boolean;
  onDelete: () => void;
  deleting?: boolean;
};

function readDistanceMeters(note: NoteRow): unknown {
  if (note.distance !== undefined && note.distance !== null) {
    return note.distance;
  }
  const legacy = note as NoteRow & { distance_m?: unknown };
  return legacy.distance_m;
}

export function formatDistanceKm(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const meters = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(meters)) {
    return null;
  }
  const km = meters / 1000;
  if (km < 1) {
    return `${Math.round(meters)} m`;
  }
  if (km >= 1000) {
    return `${(km / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k km`;
  }
  return `${km.toLocaleString(undefined, { maximumFractionDigits: 0 })} km`;
}

export function NoteCard({ note, rank, showDistance, onDelete, deleting }: NoteCardProps) {
  const cardBg = useThemeColor({}, "card");
  const border = useThemeColor({}, "cardBorder");
  const muted = useThemeColor({ light: "#64748b", dark: "#8b949e" }, "icon");
  const accent = useThemeColor({}, "tint");
  const onAccent = useThemeColor({}, "onPrimary");
  const distanceLabel = showDistance ? formatDistanceKm(readDistanceMeters(note)) : null;

  return (
    <Pressable
      onLongPress={onDelete}
      disabled={deleting}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: cardBg, borderColor: border, opacity: deleting ? 0.6 : pressed ? 0.92 : 1 },
      ]}>
      <View style={styles.row}>
        <View style={[styles.rankBadge, { backgroundColor: accent }]}>
          <ThemedText style={[styles.rankText, { color: onAccent }]}>{rank}</ThemedText>
        </View>
        <View style={styles.body}>
          <ThemedText type="defaultSemiBold" style={styles.title}>
            {note.title}
          </ThemedText>
          <ThemedText style={[styles.coords, { color: muted }]}>
            {note.latitude}, {note.longitude}
          </ThemedText>
        </View>
        {distanceLabel ? (
          <View style={[styles.distanceBadge, { borderColor: border }]}>
            <ThemedText style={[styles.distanceText, { color: accent }]}>{distanceLabel}</ThemedText>
          </View>
        ) : showDistance ? (
          <View style={[styles.distanceBadge, { borderColor: border }]}>
            <ThemedText style={[styles.distanceText, { color: muted }]}>—</ThemedText>
          </View>
        ) : null}
      </View>
      <ThemedText style={[styles.hint, { color: muted }]}>Long press to delete</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontWeight: "700",
    fontSize: 14,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
  },
  coords: {
    fontSize: 13,
    fontFamily: "monospace",
  },
  distanceBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 56,
    alignItems: "center",
  },
  distanceText: {
    fontSize: 12,
    fontWeight: "700",
  },
  hint: {
    fontSize: 11,
  },
});
