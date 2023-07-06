// import { Link, Stack } from "expo-router";
// import { useState } from "react";
// import { StyleSheet, Text, View, TextInput, TouchableOpacity,  } from "react-native";
// import { useRouter } from "expo-router";

// export default function Login() {
//     const router = useRouter();
//     const [loginID, setLoginID] = useState("");
//     const [loginPW, setLoginPW] = useState("");

//     return (
//         <>
//             <View style={styles.container}>
//                 <Stack.Screen
//                     options={{
//                         title: "로그인",
//                     }}
//                 />
//                 <Text style={styles.title}>나만의 약사</Text>
//                 <TextInput
//                     onChangeText={(e) => setLoginID(e)}
//                     returnKeyType="done"
//                     value={loginID}
//                     placeholder="아이디"
//                     style={styles.inputText}
//                 ></TextInput>
//                 <TextInput
//                     onChangeText={(e) => setLoginPW(e)}
//                     returnKeyType="done"
//                     value={loginPW}
//                     placeholder="비밀번호"
//                     style={styles.inputText}
//                 ></TextInput>
//                 <TouchableOpacity onPress={() => {router.replace('/home')}}  style={styles.loginButton}>
//                     <Text style={styles.buttonText}>로그인</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity onPress={() => {router.push('/signup')}} style={styles.signupButton}>
//                     <Text style={styles.buttonText}>회원가입</Text>
//                 </TouchableOpacity>
//             </View>
//         </>
//     );
// }

// const GREEN = "#5CBD57";
// const BLUE = "#24B2FF";
// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         alignItems: "center",
//         justifyContent: "center",
//         padding: 20,
//     },
//     title: {
//         fontSize: 30,
//         fontWeight: "bold",
//         color: "white",
//         marginBottom: 30,
//     },
//     inputText: {
//         color: "white",
//         fontSize: 18,
//         borderColor: GREEN,
//         borderRadius: 30,
//         borderWidth: 1.5,
//         paddingVertical: 10,
//         paddingHorizontal: 15,
//         width: "55%",
//         marginBottom: 10,
//     },
//     loginButton: {
//         marginTop: 10,
//         width: "30%",
//         borderRadius: 30,
//         borderWidth: 1.5,
//         borderColor: GREEN,
//         backgroundColor: GREEN,
//     },
//     signupButton: {
//         marginVertical: 20,
//         width: "30%",
//         borderRadius: 30,
//         borderWidth: 1.5,
//         borderColor: BLUE,
//         backgroundColor: BLUE,
//     },
//     buttonText: {
//         paddingVertical: 10,
//         paddingHorizontal: 15,
//         fontSize: 18,
//         textAlign: "center",
//     },
// });

import {Button, Platform, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Subscription } from 'expo-modules-core';

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: true,
	}),
});


const Progress = () => {
	const [expoPushToken, setExpoPushToken] = useState<string | undefined>('');
	const [notification, setNotification] = useState<Notifications.Notification>();
	const notificationListener = useRef<Subscription>();
	const responseListener = useRef<Subscription>();
	
	useEffect(() => {
		registerForPushNotificationsAsync().then(token => {
			// fetch(PUSH_ENDPOINT, {
			// 	method: 'POST',
			// 	headers: {
			// 		Accept: 'application/json',
			// 		'Content-Type': 'application/json',
			// 	},
			// 	body: JSON.stringify({
			// 		token: {
			// 			value: token,
			// 		}
			// 	}),
			// })
			// 	.then(() => console.log('send!'))
			// 	.catch((err) => console.log(err));
			setExpoPushToken(token);
		});
	
		notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
			setNotification(notification);
		});
	
		responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
			console.log(response);
		});
	
		return () => {
			if(typeof notificationListener.current !== 'undefined' && typeof responseListener.current !== 'undefined'){
				Notifications.removeNotificationSubscription(notificationListener.current);
				Notifications.removeNotificationSubscription(responseListener.current);
			}
		};
	}, []);

	
	return (
		<View
			style={{
				flex: 1,
				alignItems: 'center',
				justifyContent: 'space-around',
			}}
		>
			<Text>Your expo push token: {expoPushToken}</Text>
			<View style={{ alignItems: 'center', justifyContent: 'center' }}>
				<Text>Title: {notification && notification.request.content.title} </Text>
				<Text>Body: {notification && notification.request.content.body}</Text>
				<Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
			</View>
			<Button
				title="Press to schedule a notification"
				onPress={async () => {
					await schedulePushNotification();
				}}
			/>
		</View>
	);
};

export default Progress;

const styles = StyleSheet.create({});

async function schedulePushNotification() {
	await Notifications.scheduleNotificationAsync({
		content: {
			sound: 'default',
			title: 'You\'ve got mail! 📬',
			body: 'Here is the notification body',
			data: { data: 'goes here' },
		},
		trigger: { seconds: 2 },
	});
}

async function registerForPushNotificationsAsync() {
	let token;
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
		token = (await Notifications.getExpoPushTokenAsync()).data;
		console.log(token);
	} else {
		alert('Must use physical device for Push Notifications');
	}

	if (Platform.OS === 'android') {
		Notifications.setNotificationChannelAsync('default', {
			name: 'default',
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: '#FF231F7C',
		});
	}

	return token;
}