import React from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { Child } from "@/types/child";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5.js";
import AntDesign from "@expo/vector-icons/AntDesign.js";
import { router } from "expo-router";

interface Props {
    child: Child;
    onStatus: (status: "inn" | "ut" | "fravaer") => void;
}


export default function ChildCard({ child, onStatus }: Props) {
    return (
        <View style={styles.card}>
            <TouchableOpacity onPress={() => router.push({ pathname: "/child/[childId]", params: { childId: child.id }})}>
                <Image
                    style={styles.avatar}
                    source={
                        child.imageUrl
                        ? { uri: child.imageUrl }
                        : require("../assets/images/icon.png")
                    }
                />
            </TouchableOpacity>

            <Text style={styles.name}>{child.name}</Text>

            <Text style={styles.status}>
                Status:{" "}
                <Text style={{ fontWeight: "bold" }}>{child.status}</Text>
            </Text>
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => onStatus("inn")}>
                    <FontAwesome5 name="check-circle" size={26} color="green" />
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => onStatus("ut")}>
                    <AntDesign name="close-circle" size={24} color="red" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => onStatus("fravaer")}>
                    <FontAwesome5 name="minus-circle" size={26} color="pink" />
                </TouchableOpacity>
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    card: {
        width: "45%",
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 10,
        margin: "2.5%",
        alignItems: "center",
        elevation: 2,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        marginBottom: 8,

    },
    name: {
        fontWeight: "bold",
    },
    statusRow: {
        marginVertical: 5,
    },
    status: {
        color: "#666",
    },
    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "80%",
        marginTop: 10,
    },
});