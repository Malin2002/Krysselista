import React, { useState } from "react";
import { View, Text, Modal, TextInput, Button, StyleSheet } from "react-native";
import { addAbsence } from "@/api/childApi";

interface Props {
    childId: string;
    visible: boolean;
    onClose: () => void;
    onSaved: () => void;
}

export default function AbsenceModal({ childId, visible, onClose, onSaved }: Props) {
    const [date, setDate] = useState("");
    const [reason, setReason] = useState("");
    const [note, setNote] = useState("");

    const handleSave = async () => {
        if(!date || !reason) return;

        await addAbsence(childId, reason as "syk" | "ferie" | "annet", date, note);
        setDate("");
        setReason("");
        setNote("");
        onSaved();
        onClose();
    }

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>Registrer fravær</Text>

                    <TextInput
                        placeholder="Dato (YYYY-MM-DD)"
                        style={styles.input}
                        value={date}
                        onChangeText={setDate}
                    />
                    <TextInput
                        placeholder="Årsak (syk/ferie/annet)"
                        style={styles.input}
                        value={reason}
                        onChangeText={setReason}
                    />
                    <TextInput
                        placeholder="Notat (valgfritt)"
                        style={styles.input}
                        value={note}
                        onChangeText={setNote}
                    />

                    <View style={styles.buttons}>
                        <Button title="Avbryt" color="#B75A5A" onPress={onClose} />
                        <Button title="Lagre" color="#546856" onPress={handleSave} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}


const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "#000000aa",
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        width: "85%",
        backgroundColor: "#DDF3DF",
        padding: 16,
        borderRadius: 12,
    },
    title: {
        fontWeight: "bold",
        marginBottom: 12,
        fontSize: 16,
        color: "#546856"
    },
    input: {
        borderWidth: 1.5,
        borderColor: "#546856",
        borderRadius: 8,
        padding: 8,
        marginBottom: 8,
        color: "#546856"
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 12,
    },
});
