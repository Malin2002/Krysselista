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
                    <FontAwesome5 name="check-circle" size={26} color="#546856" />
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => onStatus("ut")}>
                    <AntDesign name="close-circle" size={24} color="#B82929" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push({ pathname: "/chat"})}>
                    <AntDesign name="comment" size={24} color="#6B85A5" />
                </TouchableOpacity>
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    card: {
        width: "45%",
        backgroundColor: "#CBDAED",
        padding: 12,
        //borderWidth: 1,
        borderColor: "#546856",
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
        color: "#546856",
    },
    statusRow: {
        marginVertical: 5,
    },
    status: {
        color: "#546856",
    },
    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "80%",
        marginTop: 10,
    },
});