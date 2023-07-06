import { Link, Stack } from "expo-router";
import { Text, View, Pressable, StyleSheet, ScrollView, Platform } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useEffect, useState, useRef } from "react";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Subscription } from "expo-modules-core"
import axios from "axios";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

const Progress = () => {
    
}

export default function Home() {
    const [list, setList] = useState();
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>('');
    const [notification, setNotification] = useState<Notifications.Notification>();
    const notificationListener = useRef<Subscription>();
    const responseListener = useRef<Subscription>();

    useEffect(() => {
        registerForPushNotificationsAsync().then((token: any) => setExpoPushToken(token));
    
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
          setNotification(notification);
        });
    
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
          console.log(response);
        });
        
        let timer = setTimeout(() => { schedulePushNotification() }, 10000);
    
        return () => {
            if(typeof notificationListener.current !== 'undefined' && typeof responseListener.current !== 'undefined'){
                Notifications.removeNotificationSubscription(notificationListener.current);
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
      }, []);
    // useEffect(()=>{
    //     axios.get()
    // },[])
    const medicineList = [
        {
            medicineName: "삼남아세트아미노펜정",
            expiratioDate: "2023.05.12",
            eatTime: "식후 30분",
        },
        {
            medicineName: "프리마란정",
            expiratioDate: "2023.05.12",
            eatTime: "식후 30분",
        },
        {
            medicineName: "슈다페드정",
            expiratioDate: "2023.05.12",
            eatTime: "식후 30분",
        },
    ];
    return (
        <>
            <View style={styles.container}>
                <Stack.Screen
                    options={{
                        title: "복용중인 약",
                        headerRight: () => (
                            <>
                                <Link href="/add" asChild>
                                    <Pressable>
                                        {({ pressed }) => (
                                            <FontAwesome
                                                name="plus"
                                                size={20}
                                                color={"white"}
                                                style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                                            />
                                        )}
                                    </Pressable>
                                </Link>
                            </>
                        ),
                    }}
                />
                <ScrollView style={styles.list}>
                    {medicineList.map((med,index) => (
                        <View style={styles.listItem} key={index}>
                            <View style={styles.listItemLeft}>
                                <Text style={styles.medicineName}>{med.medicineName}</Text>
                            </View>
                            <View style={styles.listItemRight}>
                                <Text style={styles.eatTime}>{med.eatTime}</Text>
                                <Text style={styles.expiratioDate}>~ {med.expiratioDate}</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </>
    );
}

async function schedulePushNotification() {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "약 복용 시간입니다!",
            body: '삼남아세트아미노펜정, 프리마란정, 슈다페드정 약 복용',
            data: { medic_name: 'XXX', time: '12:10' },
        },
        trigger: { seconds: 1 },
    });
}
  
async function registerForPushNotificationsAsync() {
    let token;
  
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }
  
    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }
        token = (await Notifications.getExpoPushTokenAsync({projectId: '88183950-92d6-484f-bf5d-2ed20e6cd2e5'})).data;
        console.log(token);
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    return token;
}  

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    list: {
        flex: 1,
        width: "100%",
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
    },
    link: {
        marginTop: 15,
        paddingVertical: 15,
    },
    linkText: {
        fontSize: 14,
        color: "#2e78b7",
    },
    listItem: {
        borderBottomWidth: 0.2,
        borderBottomColor: "#C6C6C6",
        paddingVertical: 18,
        paddingHorizontal: 25,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    listItemLeft: {
        flex:1,
        justifyContent: "center",
        flexWrap: 'wrap',
        alignItems: 'flex-start'
    },
    listItemRight: {
        alignItems:'flex-end',
    },
    medicineName: {
        color: "white",
        fontSize: 24,
        
    },
    eatTime: {
        color: "#C6C6C6",
        marginBottom:5,
        fontSize: 16
    },
    expiratioDate:{
        color: 'red',
        fontSize: 16,
    }

});