import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Child } from "@/types/child";
import { useSearchParams } from "expo-router/build/hooks";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AntDesign from "@expo/vector-icons/AntDesign";
import AbsenceModal from "@/components/absenceModal";
import { getChild, getAbsence, getGallery, getFood, getSleep } from "@/api/childApi";
import { getUser } from "@/api/userApi";
import { GalleryImage } from "@/types/galleryImage";
import { router } from "expo-router";
import AddFoodModal from "@/components/addFoodModal";
import AddSleepModal from "@/components/addSleepModal";
import AddImageModal from "@/components/addImageModal";
import { useAuth } from "@/providers/authProvider";

export const options = {
    headerShown: false,
};

export default function ChildProfile() {
    const searchParams = useSearchParams();
    const childId = searchParams.get("childId") as string;
    const [child, setChild] = useState<Child | null>(null);
    const [absence, setAbsence] = useState<any[]>([]);
    const [food, setFood] = useState<any[]>([]);
    const [sleep, setSleep] = useState<any[]>([]);
    const [guardians, setGuardians] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [absenceModalVisible, setAbsenceModalVisible] = useState(false);
    const [gallery, setGallery] = useState<GalleryImage[]>([]);

    const [selectedAction, setSelectedAction] = useState<"mat" | "søvn" | "bilde" | null>(null);
    const [menuVisible, setMenuVisible] = useState(false);

    const today = new Date().toISOString().split("T")[0];

    const todaysFood = food.filter(item => item.date === today);
    const todaysSleep = sleep.filter(item => item.date === today);
    const todaysAbsence = absence.filter(item => item.id === today);

    const { appUser } = useAuth();


    const fetchData = async () => {
        if (!childId) return;
        setLoading(true);

        const c = await getChild(childId);
        setChild(c);

        const a = await getAbsence(childId);
        setAbsence(a);

        const f = await getFood(childId);
        setFood(f);

        const s = await getSleep(childId);
        setSleep(s);

        const g = await getGallery(childId);
        setGallery(g);

        if (c?.guardians?.length) {
            const guardianPromises = c.guardians.map((id: string) => getUser(id));
            const users = await Promise.all(guardianPromises);
            setGuardians(users.filter(Boolean));
        } else {
            setGuardians([]);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [childId]);


    if(loading) return <ActivityIndicator style={{ marginTop: 100 }} size={"large"} />

    if (!child) return <Text>Fant ikke barnet</Text>;

    return (
        <ScrollView style={styles.container}>
            {appUser?.role === "ansatt" && (
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.push({ pathname: "/(tabs)"})}>
                        <Text style={styles.backButton}>Tilbake</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{child.name}</Text>
                    <TouchableOpacity onPress={() => setMenuVisible(true)}>
                        <FontAwesome5 name="plus" size={24} color="black" />
                    </TouchableOpacity>
                </View>
            )}
            {appUser?.role === "foresatt" && (
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>{child.name}</Text>
                    {/*<TouchableOpacity onPress={() => setMenuVisible(true)}>
                        <FontAwesome5 name="plus" size={24} color="black" />
                    </TouchableOpacity>*/}
                </View>
            )}
            <Modal
                visible={menuVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setMenuVisible(false)}
            >
                <TouchableOpacity style={styles.menuOverlay} onPress={() => setMenuVisible(true)}>
                    <View style={styles.menu}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                setSelectedAction("mat");
                                setMenuVisible(false);
                            }}
                        >
                            <Text style={styles.menuItemText}>Legg til mat</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                setSelectedAction("søvn");
                                setMenuVisible(false);
                            }}
                        >
                            <Text style={styles.menuItemText}>Legg til søvn</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                setSelectedAction("bilde");
                                setMenuVisible(false);
                            }}
                        >
                            <Text style={styles.menuItemText}>Legg til bilde</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Image
                source={child.imageUrl ? { uri: child.imageUrl } : require("../../assets/images/icon.png")}
                style={styles.image}
            />
            <Text style={styles.name}>{child.name}</Text>
            
            <View style={styles.status}>
                <Text style={styles.sectionTitle}>Status: {child.status}</Text>
                <View>
                    {child.status === "inn" ? (
                        <FontAwesome5 name="check-circle" size={26} color="#3A6F40" />
                    ) : child.status === "ut" ? (
                        <AntDesign name="close-circle" size={24} color="#B82929" />
                    ) : (
                        <FontAwesome5 name="minus-circle" size={26} color="#6B85A5" />
                    )}
                </View>
            </View>

            <TouchableOpacity style={styles.absenceButton} onPress={() => setAbsenceModalVisible(true)}>
                <Text style={styles.sectionTitle}>Registrer fravær</Text>
            </TouchableOpacity>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Registrert fravær</Text>
                {todaysAbsence.length === 0 && <Text>Ingen fravær registrert</Text>}
                {todaysAbsence.map((a) => (
                    <Text style={styles.text} key={a.id}>Grunn: {a.reason}, Notat: {a.note ? `(${a.note})` : ""}</Text>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Viktig info</Text>
                <Text style={styles.text}>{child.importantInfo || "Ingen info."}</Text>
            </View>


            <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between"}}>
                <View style={styles.logSection}>
                    <Text style={styles.sectionTitle}>Matlogg</Text>

                    {food.length === 0 && (
                        <Text style={styles.text}>Ingen mat registrert</Text>
                    )}

                    {todaysFood.map((item) => (
                        <View key={item.id} style={styles.logItem}>
                            <Text style={styles.logTitle}>
                                {item.meal} - {item.time}
                            </Text>
                            {!!item.description && (
                                <Text style={styles.text}>{item.description}</Text>
                            )}
                        </View>
                    ))}
                </View>

                <View style={styles.logSection}>
                    <Text style={styles.sectionTitle}>Søvn</Text>

                    {sleep.length === 0 && (
                        <Text style={styles.text}>Ingen søvn registrert</Text>
                    )}

                    {todaysSleep.map((item) => (
                        <View key={item.id} style={styles.logItem}>
                            <Text style={styles.logTitle}>
                                {item.startTime} - {item.endTime}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Helseinformasjon</Text>
                <Text style={styles.text}>Allergier: {child.health?.allergies?.join(", ") || "Ingen"}</Text>
                <Text style={styles.text}>Medisiner: {child.health?.medicine?.join(", ") || "Ingen"}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Foresatt kontaktinfo</Text>

                {guardians.length === 0 && (
                    <Text style={styles.text}>Ingen foresatte registrert</Text>
                )}

                {guardians.map((g) => (
                    <View key={g.id} style={{ marginBottom: 8 }}>
                        <Text style={styles.text}>{g.name}</Text>
                        <Text style={styles.text}>E-post: {g.email}</Text>
                        <Text style={styles.text}>Tlf: {g.phone}</Text>
                    </View>
                ))}
            </View>

            
            <View style={[styles.section, {marginBottom: 40}]}>
                <Text style={styles.sectionTitle}>Bildegalleri</Text>
                {gallery.length > 0 && (
                <FlatList
                    horizontal
                    data={gallery}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <Image source={{ uri: item.imageUrl }} style={styles.galleryImage} /> }
                />
                )}
            </View>
            

            <AbsenceModal
                childId={childId}
                visible={absenceModalVisible}
                onClose={() => setAbsenceModalVisible(false)}
                onSaved={fetchData}
            />
            <AddFoodModal
                childId={childId}
                visible={selectedAction === "mat"}
                onClose={() => setSelectedAction(null)}
                defaultDate={today}
                onSaved={fetchData}
            />
            <AddSleepModal
                childId={childId}
                visible={selectedAction === "søvn"}
                onClose={() => setSelectedAction(null)}
                defaultDate={today}
                onSaved={fetchData}
            />
            <AddImageModal
                visible={selectedAction === "bilde"}
                onClose={() => setSelectedAction(null)}
                onSaved={fetchData}
            />
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: "#CBDAEB",
        borderRadius: 10,
        marginTop: 48,
        marginBottom: 12,
    },
    backButton: {
        fontSize: 16,
        color: "#546856",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#546856",
    },
    menuOverlay: {
        flex: 1,
        backgroundColor: "#000000aa",
        justifyContent: "center",
    },
    menu: {
        backgroundColor: "#FFFFFF",
        marginHorizontal: 40,
        borderRadius: 10,
        paddingVertical: 10,
    },
    menuItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    menuItemText: {
        fontSize: 16,
        color: "#546856",
    },
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#E2EDFB",
    },
    image: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignSelf: "center",
        marginBottom: 12,
        marginTop: 40,
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
        marginBottom: 100,
        padding: 10,
        backgroundColor: "#CBDAED",
        borderWidth: 1,
        borderColor: "#6B856E",
        borderRadius: 8,
        alignItems: "center",
        alignSelf: "center",
    },
    logSection: {
        marginTop: 16,
        borderColor: "#aaa",
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: "#FFFFFF",
        padding: 8,
        width: "48%",
    },
    logItem: {
        marginTop: 6,
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
    },
    logTitle: {
        fontWeight: "bold",
        color: "#546856",
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