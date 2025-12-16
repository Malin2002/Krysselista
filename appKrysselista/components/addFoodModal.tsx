import React, { useState } from "react";
import { View, Text, Modal, TextInput, Button, StyleSheet, Touchable, TouchableOpacity } from "react-native";
import { addFood } from "@/api/childApi";
import { FoodItem } from "@/types/foodItem";

type Props = {
    childId: string;
    visible: boolean;
    onClose: () => void;
    onSaved: () => void;
    defaultDate: string;
}

export default function AddFoodModal({ childId, visible, onClose, onSaved, defaultDate }: Props) {
    const [meal, setMeal] = useState("");
    const [description, setDescription] = useState("");
    const [time, setTime] = useState("");

    const handleSave = async () => {
        await addFood( childId, meal, description, time, defaultDate);
        setMeal("");
        setDescription("");
        setTime("");

        onSaved();
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modal}>
                <View style={styles.inner}>
                    <Text style={styles.title}>Legg til måltid</Text>
                    <TextInput
                        placeholder="Måltid (frokost/lunsj/middag/mellommåltid)"
                        value={meal}
                        onChangeText={setMeal}
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Beskrivelse"
                        value={description}
                        onChangeText={setDescription}
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Tid (08:00)"
                        value={time}
                        onChangeText={setTime}
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
    )
}


const styles = StyleSheet.create({
    modal: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#000000aa",
        padding: 20,
        margin: 20,
        borderRadius: 10,
    },
    inner: {
        width: "90%",
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        marginBottom: 10,
        padding: 8,
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 12,
    },
    cancel: {
        padding: 14,
    },
    save: {
        backgroundColor: "#546856",
        padding: 14,
        borderRadius: 10,
    },
});