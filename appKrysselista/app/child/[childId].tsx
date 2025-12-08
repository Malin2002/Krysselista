import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { Child } from "@/types/child";
import { doc, getDoc } from "firebase/firestore";
import { db, getDownloadUrl } from "@/firebaseConfig";
import { useSearchParams } from "expo-router/build/hooks";

export default function ChildProfile() {
    const searchParams = useSearchParams();
    const childId = searchParams.get("childId") as string;
    const [child, setChild] = useState<Child | null>(null);
    const [loading, setLoading] = useState(true);

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


    if(loading) return <ActivityIndicator style={{ marginTop: 100 }} size={"large"} />

    if (!child) return <Text>Fant ikke barnet</Text>;

    return (
        <ScrollView style={styles.container}>
            <Image
                source={child.imageUrl ? { uri: child.imageUrl } : require("../../assets/images/icon.png")}
                style={styles.avatar}
            />
            <Text style={styles.name}>{child.name}</Text>
            <Text>Status: {child.status}</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Viktig info</Text>
                <Text>{child.importantInfo || "Ingen info."}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Helseinformasjon</Text>
                <Text>Allergier: {child.health?.allergies?.join(", ") || "Ingen"}</Text>
                <Text>Medisiner: {child.health?.medicine?.join(", ") || "Ingen"}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Foresatt kontaktinfo</Text>
                <Text>{child.guardians?.guardian1 || ""}</Text>
                <Text>{child.guardians?.guardian2 || ""}</Text>
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
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#f5f5f5",
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
    },
    section: {
        marginTop: 16,
    },
    sectionTitle: {
        fontWeight: "bold",
        marginBottom: 4,
    },
    galleryImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 8,
    },
});