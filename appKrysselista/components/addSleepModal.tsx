import React, { useState } from "react";
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { SleepItem } from "@/types/sleepItem";
import { addSleep } from "@/api/childApi";

type Props = {
    childId: string;
    visible: boolean;
    onClose: () => void;
    onSaved: () => void;
    defaultDate: string;
};

export default function AddSleepModal({ childId, visible, onClose, onSaved, defaultDate }: Props) {
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const handleSave = async () => {
        await addSleep( childId, startTime, endTime, defaultDate);
        setStartTime("");
        setEndTime("");

        onSaved();
        onClose();
    };


    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modal}>
                <View style={styles.inner}>
                    <Text style={styles.title}>Legg til søvn</Text>

                    <TextInput
                        placeholder="Starttid (08:00)"
                        value={startTime}
                        onChangeText={setStartTime}
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Sluttid (09:00)"
                        value={endTime}
                        onChangeText={setEndTime}
                        style={styles.input}
                    />

                    <View style={styles.buttons}>
                        <TouchableOpacity onPress={onClose} style={styles.cancel}>
                            <Text>Avbryt</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleSave} style={styles.save}>
                            <Text>Lagre</Text>
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
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    inner: {
        width: "80%",
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    cancel: {
        backgroundColor: "#B75A5A",
        padding: 10,
        borderRadius: 5,
    },
    save: {
        backgroundColor: "#546856",
        padding: 10,
        borderRadius: 5,
    },
});