import React, { useState } from "react";
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { CalendarEvent } from "@/types/calendarEvent";

type AddEventModalProps = {
    visible: boolean,
    onClose: () => void;
    onSave: (event: CalendarEvent) => void;
    defaultDate: string;
};

export default function AddEventModal({ visible, onClose, onSave, defaultDate }: AddEventModalProps) {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");

    const save = () => {
        onSave({
            id: "",
            date: defaultDate,
            title,
            description: desc,
            start,
            end,
        });

        setTitle("");
        setDesc("");
        setStart("");
        setEnd("");
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modal}>
                <View style={styles.inner}>
                    <Text style={styles.title}>Nytt event</Text>

                    <TextInput
                        placeholder="Tittel"
                        value={title}
                        onChangeText={setTitle}
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Beskrivelse"
                        value={desc}
                        onChangeText={setDesc}
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Starttid (08:00)"
                        value={start}
                        onChangeText={setStart}
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Sluttid (16:00)"
                        value={end}
                        onChangeText={setEnd}
                        style={styles.input}
                    />

                    <View style={styles.row}>
                        <TouchableOpacity onPress={onClose} style={styles.cancel}>
                            <Text>Avbryt</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={save} style={styles.save}>
                            <Text style={{ color: "white" }}>Lagre</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}


const styles = StyleSheet.create({
    modal: {
        flex: 1,
        backgroundColor: "#000000aa",
        justifyContent: "center",
      },
      inner: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 20,
      },
      title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#546856",
      },
      input: {
        backgroundColor: "#F2F2F2",
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
      },
      row: {
        flexDirection: "row",
        justifyContent: "space-between",
      },
      cancel: {
        padding: 14,
      },
      save: {
        backgroundColor: "#546856",
        padding: 14,
        borderRadius: 10,
      },
})