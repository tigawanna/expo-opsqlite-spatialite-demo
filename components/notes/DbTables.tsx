import { checkForSpatialitetablesQueryOptions } from "@/lib/data-access-layer/spatialite-query-options";
import { useQueries, useQuery } from "@tanstack/react-query";
import { StyleSheet, View, Text } from "react-native";
import { ThemedText } from "../themed-text";

export function DbTables() {
  const { data, isPending } = useQuery(checkForSpatialitetablesQueryOptions);
  const error = data?.error;
  if (isPending)
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  if (error) {
    return (
      <View>
        <Text>Error: {error}</Text>
      </View>
    );
  }
  const tables = data?.result;
  if (!tables) {
    return (
      <View>
        <Text>No tables found</Text>
      </View>
    );
  }
  return (
    <View style={{ ...styles.container }}>
      <Text>DbTables</Text>
      {tables?.rawRows?.map((row) => {
        const [name] = row;
        return (
          <View key={name as string}>
            <ThemedText>{name as string}</ThemedText>
          </View>
        );
      })}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
