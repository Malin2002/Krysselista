import React, { useState } from "react";
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";

type Props = {
    visible: boolean;
    onClose: () => void;
    onSaved: (imageUri: string) => void;
};

export default function addImageModal({ visible, onClose, onSaved }: Props) {
    const [imageUrl, setImageUrl] = useState("");

    const save = () => {
        onSaved(imageUrl);
        setImageUrl("");
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modal}>
                <View style={styles.inner}>
                    <Text style={styles.title}>Legg til bilde</Text>

                    <TextInput
                        placeholder="Bilde URL"
                        value={imageUrl}
                        onChangeText={setImageUrl}
                        style={styles.input}
                    />

                    {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.imagePreview} /> : null}

                    <View style={styles.buttons}>
                        <TouchableOpacity onPress={onClose} style={styles.cancel}>
                            <Text>Avbryt</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={save} style={styles.save}>
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
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        marginBottom: 20,
    },
    input: {
        width: "100%",
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
    imagePreview: {
        width: 200,
        height: 200,
        marginBottom: 20,
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    cancel: {
        backgroundColor: "#B75A5A",
        padding: 10,
        borderRadius: 5,
        flex: 1,
        alignItems: "center",
        marginRight: 10,
    },
    save: {
        backgroundColor: "#546856",
        padding: 10,
        borderRadius: 5,
        flex: 1,
        alignItems: "center",
        marginLeft: 10,
    },
});