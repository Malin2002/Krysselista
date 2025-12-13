import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { Child } from "@/types/child";
import { doc, getDoc } from "firebase/firestore";
import { db, getDownloadUrl } from "@/firebaseConfig";
import { useSearchParams } from "expo-router/build/hooks";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AntDesign from "@expo/vector-icons/AntDesign";
import AbsenceModal from "@/components/absenceModal";
import { getChild, getAbsence } from "@/api/childApi";

export default function ChildProfile() {
    const searchParams = useSearchParams();
    const childId = searchParams.get("childId") as string;
    //const [child, setChild] = useState<Child | null>(null);
    const [child, setChild] = useState<any>(null);
    const [absence, setAbsence] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchData = async () => {
        if (!childId) return;
        const c = await getChild(childId);
        setChild(c);

        const a = await getAbsence(childId);
        setAbsence(a);
        setLoading(false);
    }

    useEffect(() => {
        fetchData();
    }, [childId]);


    if(loading) return <ActivityIndicator style={{ marginTop: 100 }} size={"large"} />

    if (!child) return <Text>Fant ikke barnet</Text>;

    return (
        <ScrollView style={styles.container}>
            <Image
                source={child.imageUrl ? { uri: child.imageUrl } : require("../../assets/images/icon.png")}
                style={styles.avatar}
            />
            <Text style={styles.name}>{child.name}</Text>
            
            <View style={styles.status}>
                <Text style={styles.sectionTitle}>Status: {child.status}</Text>
                <View>
                    {child.status === "inn" ? (
                        <FontAwesome5 name="check-circle" size={26} color="green" />
                    ) : child.status === "ut" ? (
                        <AntDesign name="close-circle" size={24} color="red" />
                    ) : (
                        <FontAwesome5 name="minus-circle" size={26} color="pink" />
                    )}
                </View>
            </View>

            <TouchableOpacity style={styles.absenceButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.sectionTitle}>Registrer fravær</Text>
            </TouchableOpacity>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Registrer fravær</Text>
                {absence.length === 0 && <Text>Ingen fravær registrert</Text>}
                {absence.map((a, index) => (
                    <Text style={styles.text} key={index}>{a.id} Grunn: {a.reason}, Notat: {a.note ? `(${a.note})` : ""}</Text>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Viktig info</Text>
                <Text style={styles.text}>{child.importantInfo || "Ingen info."}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Helseinformasjon</Text>
                <Text style={styles.text}>Allergier: {child.health?.allergies?.join(", ") || "Ingen"}</Text>
                <Text style={styles.text}>Medisiner: {child.health?.medicine?.join(", ") || "Ingen"}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Foresatt kontaktinfo</Text>
                <Text style={styles.text}>{child.guardians?.guardian1 || ""}</Text>
                <Text style={styles.text}>{child.guardians?.guardian2 || ""}</Text>
            </View>

            {child.gallery && child.gallery.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Bildegalleri</Text>
                    <FlatList
                        horizontal
                        data={child.gallery}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => <Image source={{ uri: item }} style={styles.galleryImage} /> }
                    />
                </View>
            )}

            <AbsenceModal
                childId={childId}
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSaved={fetchData}
            />
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#E2EDFB",
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignSelf: "center",
        marginBottom: 12,
    },
    name: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 8,
        color: "#546856",
    },
    status: {
        justifyContent: "center",
        alignItems: "center",
    },
    section: {
        marginTop: 16,
        borderColor: "#aaa",
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: "#FFFFFF",
        padding: 8,
    },
    sectionTitle: {
        fontWeight: "bold",
        marginBottom: 4,
        color: "#546856",
    },
    text: {
        color: "#546856",
    },
    absenceButton: {
        width: "50%",
        marginTop: 12,
        padding: 10,
        backgroundColor: "#CBDAED",
        borderWidth: 1,
        borderColor: "#6B856E",
        borderRadius: 8,
        alignItems: "center",
        alignSelf: "center",
    },
    galleryImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 8,
    },
});



{/*
    useEffect(() => {
        if (!childId) return;
        
        (async () => {
            const docSnap = await getDoc(doc(db, "children", childId));
            if(!docSnap.exists()) return;

            const data = docSnap.data() as Child;

            let imageUrl: string | undefined = undefined;
            if(data.imageUrl) {
                try {
                    imageUrl = await getDownloadUrl(data.imageUrl);
                } catch (e) {
                    console.log("Feil ved henting av bilde:", e);
                }
            }

            let galleryUrls: string[] = [];
            if(data.gallery && data.gallery.length > 0) {
                const urls = await Promise.all(
                    data.gallery.map(async (path) => {
                        try {
                            return await getDownloadUrl(path);
                        } catch {
                            return "";
                        }
                    })
                );
                galleryUrls = urls.filter(Boolean);
            }

            setChild({ ...data, imageUrl, gallery: galleryUrls });
            setLoading(false);
        })();
    }, [childId]);
     */}