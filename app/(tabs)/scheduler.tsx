import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AppShell from "@/components/AppShell";
import { COLORS } from "@/constants/Colors";
import { useBoxStore } from "@/store";
import { useBoxControllerContext } from "@/context/BoxControllerContext";

export default function SchedulerScreen() {
  const mode = useBoxStore((state) => state.mode);
  const on = useBoxStore((state) => state.scheduler.on);
  const off = useBoxStore((state) => state.scheduler.off);
  const setScheduler = useBoxStore((state) => state.setScheduler);

  const { setLightSchedule } = useBoxControllerContext();

  const [editing, setEditing] = useState<"on" | "off" | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (editing) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [editing]);

  const startEditing = (type: "on" | "off") => {
    const currentTime = type === "on" ? on : off;

    setEditing(type);
    setDraft(currentTime.replace(":", ""));
  };

  const handleInputChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);

    setDraft(digits);
  };

  const saveTime = async () => {
    if (draft.length !== 4 || saving) {
      return;
    }

    const hours = Number(draft.slice(0, 2));
    const minutes = Number(draft.slice(2, 4));

    if (hours > 23 || minutes > 59) {
      return;
    }

    const time = `${draft.slice(0, 2)}:${draft.slice(2, 4)}`;

    const newOn = editing === "on" ? time : on;
    const newOff = editing === "off" ? time : off;

    try {
      setSaving(true);

      await setLightSchedule([
        {
          on: newOn,
          off: newOff,
        },
      ]);

      setScheduler({
        on: newOn,
        off: newOff,
      });

      setEditing(null);
      Keyboard.dismiss();
    } catch {
      // Error is handled by the controller.
    } finally {
      setSaving(false);
    }
  };

  const cancelEditing = () => {
    setEditing(null);
    Keyboard.dismiss();
  };

  return (
    <AppShell title="Scheduler">
      <View style={styles.container}>
        {mode !== "AUTO" ? (
          <View style={styles.infoCard}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>i</Text>
            </View>

            <Text style={styles.infoTitle}>Auto mode required</Text>

            <Text style={styles.infoText}>
              The scheduler is available only when the system is running in Auto
              mode.
            </Text>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>Light schedule</Text>

              <Text style={styles.subtitle}>
                Set when the light turns on and off.
              </Text>
            </View>

            <View style={styles.row}>
              <View>
                <Text style={styles.label}>ON</Text>
                <Text style={styles.time}>{on}</Text>
              </View>

              <Pressable
                style={styles.timeButton}
                onPress={() => startEditing("on")}
              >
                <Text style={styles.buttonText}>Change</Text>
              </Pressable>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View>
                <Text style={styles.label}>OFF</Text>
                <Text style={styles.time}>{off}</Text>
              </View>

              <Pressable
                style={styles.timeButton}
                onPress={() => startEditing("off")}
              >
                <Text style={styles.buttonText}>Change</Text>
              </Pressable>
            </View>

            {editing && (
              <View style={styles.editor}>
                <Text style={styles.editorLabel}>
                  {editing === "on" ? "ON time" : "OFF time"}
                </Text>

                <TextInput
                  ref={inputRef}
                  value={draft}
                  onChangeText={handleInputChange}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="HHMM"
                  placeholderTextColor={COLORS.textMuted}
                  style={styles.input}
                  returnKeyType="done"
                  onSubmitEditing={saveTime}
                />

                <View style={styles.editorButtons}>
                  <Pressable
                    style={styles.cancelButton}
                    onPress={cancelEditing}
                    disabled={saving}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </Pressable>

                  <Pressable
                    style={styles.saveButton}
                    onPress={saveTime}
                    disabled={saving}
                  >
                    <Text style={styles.saveButtonText}>
                      {saving ? "Saving..." : "Save"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  infoCard: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },

  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  icon: {
    color: COLORS.blue,
    fontSize: 22,
    fontWeight: "700",
  },

  infoTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
  },

  infoText: {
    marginTop: 8,
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },

  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  header: {
    marginBottom: 18,
  },

  title: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "600",
  },

  subtitle: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontSize: 13,
  },

  row: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  label: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },

  time: {
    marginTop: 3,
    color: COLORS.green,
    fontSize: 22,
    fontWeight: "700",
  },

  timeButton: {
    minWidth: 76,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 16,
  },

  buttonText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  editor: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  editorLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 8,
  },

  input: {
    height: 52,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 4,
  },

  editorButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },

  cancelButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },

  saveButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "700",
  },
});
