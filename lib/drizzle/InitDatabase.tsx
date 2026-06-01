import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useMigrations } from "drizzle-orm/op-sqlite/migrator";
import migrations from "@/drizzle/migrations";
import { db, ensureSpatialMetadata } from "./client";

interface InitDatabaseProps {
  children?: React.ReactNode;
}

export function InitDatabase({ children }: InitDatabaseProps) {
  const { success, error } = useMigrations(db, migrations);
  const [spatialReady, setSpatialReady] = useState(false);
  const [spatialError, setSpatialError] = useState<Error | null>(null);

  useEffect(() => {
    if (!success) {
      return;
    }
    ensureSpatialMetadata()
      .then(() => setSpatialReady(true))
      .catch((initError) => {
        setSpatialError(initError instanceof Error ? initError : new Error(String(initError)));
      });
  }, [success]);

  if (error) {
    return (
      <View>
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View>
        <Text>Migration is in progress...</Text>
      </View>
    );
  }

  if (spatialError) {
    return (
      <View>
        <Text>SpatiaLite init error: {spatialError.message}</Text>
      </View>
    );
  }

  if (!spatialReady) {
    return (
      <View>
        <Text>Initializing SpatiaLite…</Text>
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({});
