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
    const disabled = child.hasAbsenceToday;

    const checkedIn = child.status === "inn";
    const checkedOut = child.status === "ut";

    return (
        <View style={styles.card}>
            <TouchableOpacity onPress={() => router.push({ pathname: "/child/[childId]", params: { childId: child.id }})}>
                <View style={styles.imageContainer}>
                    <Image
                        style={styles.image}
                        source={
                            child.imageUrl
                            ? { uri: child.imageUrl }
                            : require("../assets/images/icon.png")
                        }
                    />

                    {child.hasAbsenceToday && (
                        <View style={styles.absenceDot} />
                    )}
                </View>
            </TouchableOpacity>

            <Text style={styles.name}>{child.name}</Text>

            <Text style={styles.status}>
                Status:{" "}
                <Text style={{ fontWeight: "bold" }}>{child.status}</Text>
            </Text>
            <View style={styles.actions}>
                <TouchableOpacity 
                    disabled={disabled || checkedIn} 
                    onPress={() => onStatus("inn")} 
                    style={[
                        styles.actionButton,
                        checkedIn && styles.checkedIn,
                        disabled && styles.disabledButton
                    ]}
                >
                    <FontAwesome5 
                        name="check-circle" 
                        size={26} 
                        color={checkedIn ? "#A0A0A0" : "#546856"}
                    />
                </TouchableOpacity>
                
                <TouchableOpacity 
                    disabled={disabled}
                    onPress={() => onStatus("ut")}
                    style={[
                        styles.actionButton,
                        checkedOut && styles.checkedOut,
                        disabled && styles.disabledButton
                    ]}
                >
                    <AntDesign 
                        name="close-circle" 
                        size={24} 
                        color={checkedOut ? "#A0A0A0" : "#B82929"}
                    />
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
    imageContainer: {
        position: "relative",
    },
    image: {
        width: 90,
        height: 90,
        borderRadius: 45,
        marginBottom: 8,
    },
    absenceDot: {
        position: "absolute",
        top: 4,
        right: 4,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: "#B82929",
        borderWidth: 2,
        borderColor: "#FFFFFF",
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
        alignItems: "center",
        width: "80%",
        marginTop: 10,
    },
    actionButton: {
        padding: 6,
        borderRadius: 20,
    },
    checkedIn: {
        backgroundColor: "#3A6F40",        
    },
    checkedOut: {
        backgroundColor: "#B82929",
    },
    disabledButton: {
        opacity: 0.5,
    },
});