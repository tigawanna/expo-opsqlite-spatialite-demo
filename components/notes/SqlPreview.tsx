import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { formatSqlMultiline } from "@/lib/data-access-layer/sql-format";
import { useThemeColor } from "@/hooks/use-theme-color";

type SqlPreviewProps = {
  sql: string | undefined;
  label?: string;
  visibleLines?: number;
};

const SQL_FONT_SIZE = 12;
const SQL_LINE_HEIGHT = 18;
const DEFAULT_VISIBLE_LINES = 10;

export function SqlPreview({
  sql,
  label = "Last SQL",
  visibleLines = DEFAULT_VISIBLE_LINES,
}: SqlPreviewProps) {
  const [expanded, setExpanded] = useState(true);
  const panelBg = useThemeColor({ light: "#f4f6f8", dark: "#161b22" }, "background");
  const border = useThemeColor({ light: "#d0d7de", dark: "#30363d" }, "icon");
  const accent = useThemeColor({}, "tint");

  const formattedSql = useMemo(() => (sql ? formatSqlMultiline(sql) : ""), [sql]);
  const maxScrollHeight = SQL_LINE_HEIGHT * visibleLines + 24;

  if (!sql) {
    return null;
  }

  return (
    <View style={[styles.wrapper, { borderColor: border, backgroundColor: panelBg }]}>
      <Pressable
        onPress={() => setExpanded((value) => !value)}
        style={styles.header}
        accessibilityRole="button"
        accessibilityLabel={expanded ? "Collapse SQL preview" : "Expand SQL preview"}>
        <ThemedText type="defaultSemiBold" style={styles.headerLabel}>
          {label}
        </ThemedText>
        <ThemedText style={[styles.chevron, { color: accent }]}>{expanded ? "▾" : "▸"}</ThemedText>
      </Pressable>
      {expanded && (
        <ScrollView
          nestedScrollEnabled
          style={[styles.sqlScroll, { maxHeight: maxScrollHeight }]}
          showsVerticalScrollIndicator>
          <ThemedText style={styles.sqlText} selectable>
            {formattedSql}
          </ThemedText>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerLabel: {
    fontSize: 14,
  },
  chevron: {
    fontSize: 16,
    fontWeight: "600",
  },
  sqlScroll: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(128,128,128,0.35)",
  },
  sqlText: {
    fontFamily: "monospace",
    fontSize: SQL_FONT_SIZE,
    lineHeight: SQL_LINE_HEIGHT,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
