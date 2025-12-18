import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from "react-native";
import { getMonthEvents, addEvent } from "@/api/calendarApi";
import AddEventModal from "@/components/addEventModal";
import { CalendarEvent } from "@/types/calendarEvent";
import { useAuth } from "@/providers/authProvider";

export default function CalendarScreen() {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  );
  const [showAddModal, setShowAddModal] = useState(false);

  const monthId = `${year}-${String(month + 1).padStart(2, "0")}`;

  useEffect(() => {
    loadEvents();
  }, [month, year]);

  const { appUser, kindergardenId } = useAuth();

  const loadEvents = async () => {
    const data = await getMonthEvents(monthId);
    setEvents(data);
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const hasEvent = (day: number) => 
    events.some((e) => e.date === `${monthId}-${String(day).padStart(2, "0")}`);

  const selectedEvents = events.filter((e) => e.date === selectedDate);

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Legg til event</Text>
      </TouchableOpacity>
      <View style={styles.header}>
        <TouchableOpacity onPress={prevMonth}>
          <Text style={styles.navButton}>{"<"}</Text>
        </TouchableOpacity>

        <Text style={styles.headerText}>{monthId}</Text>

        <TouchableOpacity onPress={nextMonth}>
          <Text style={styles.navButton}>{">"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const fullDate = `${monthId}-${String(day).padStart(2, "0")}`;
          const isSelected = selectedDate === fullDate;

          return (
            <TouchableOpacity
              key={day}
              style={[ styles.dayCell, isSelected && styles.selectedDay ]}
              onPress={() => setSelectedDate(fullDate)}
            >
              <Text style={[ styles.dayNumber, isSelected && styles.selectedDayText]}>{day}</Text>
              {hasEvent(day) && <View style={styles.dot} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.infoPanel}>
        <Text style={styles.infoTitle}>
          {selectedDate}
        </Text>

        {selectedEvents.length === 0 ? (
          <Text style={styles.noEventsText}>Ingen hendelser denne dagen</Text>
        ) : (
          <ScrollView style={{ marginTop: 10 }}>
            {selectedEvents.map((e, i) => (
              <View key={i} style={styles.eventBox}>
                <Text style={styles.eventTitle}>{e.title}</Text>

                {(e.start || e.end) && (
                  <Text style={styles.timeText}>
                    {(typeof e.start === "string" && e.start ) ||
                      (e.start?.seconds &&
                        new Date(e.start.seconds * 1000).toLocaleTimeString("no-NO", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }))}{" "}
                    -{" "}
                    {(typeof e.end === "string" && e.end) ||
                      (e.end?.seconds &&
                        new Date(e.end.seconds * 1000).toLocaleTimeString("no-NO", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }))}
                  </Text>
                )}

                {e.description ? <Text>{e.description}</Text> : null}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
      <AddEventModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        defaultDate={selectedDate}
        onSave={async (event: CalendarEvent) => {
          if (!kindergardenId) {
            setShowAddModal(false);
            return;
          }
        
          await addEvent(monthId, event, {
            kindergardenId,
            senderName: appUser?.name,
            senderRole: appUser?.role,
          });
        
          setShowAddModal(false);
          loadEvents();
        }}
    />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 64,
    backgroundColor: "#DDF3DF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  navButton: {
    fontSize: 22,
    padding: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 4,
    flex: 1,
  },
  dayCell: {
    width: "14.28%",
    height: 40,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.4,
    borderColor: "#546856aa",
    position: "relative",
  },
  dayNumber: {
    fontSize: 16,
    color: "#333",
  },
  selectedDay: {
    backgroundColor: "#54685622",
    borderColor: "#546856",
  },
  selectedDayText: {
    color: "#546856",
    fontWeight: "bold",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#546856",
    marginTop: 4,
  },
  infoPanel: {
    height: "40%",
    backgroundColor: "#FAFAFA",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "#546856",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#546856",
  },
  noEventsText: {
    marginTop: 10,
    color: "#546856",
  },
  eventTitle: {
    fontWeight: "bold",
    marginTop: 10,
    fontSize: 16,
  },
  eventBox: {
    marginBottom: 14,
    padding: 10,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
  },
  timeText: {
    marginTop: 4,
    fontSize: 14,
    color: "#666",
  },
  descText: {
    marginTop: 6,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: "#546856",
    padding: 10,
    borderRadius: 10,
    alignSelf: "flex-end",
    marginBottom: 10,
  }
});

// Mørk grønn: #546856
//Mørk blå: #6B85A5
//Lys grønn: #DDF3DF
//Lys blå: #E2EDFB / #CBDAED