import { StatusBar } from 'expo-status-bar';
import {Button, Platform, StyleSheet, Text, View, Alert } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import messaging from '@react-native-firebase/messaging';

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: true,
	}),
});

const Progress = () => {
	// const [expoPushToken, setExpoPushToken] = useState<string | undefined>('');
	// const [notification, setNotification] = useState<Notifications.Notification>();
	// const notificationListener = useRef<Subscription>();
	// const responseListener = useRef<Subscription>();

	const requestUserPermission = async () => {
		const authStatus = await messaging().requestPermission();
		const enabled = 
			authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
			authStatus === messaging.AuthorizationStatus.PROVISIONAL;
		if(enabled){
			console.log('Authorization status:', authStatus);
		}
	}	

	useEffect(() => {
		messaging().getToken().then(token => {
			console.log(token);
		});
		// if(requestUserPermission()){
		// 	messaging().getToken().then(token => {
		// 		console.log(token);
		// 	});
		// }
		// else{
		// 	console.log("Faild token status", authStatus)
		// }

		messaging()
			.getInitialNotification()
			.then(remoteMessage => {
				if(remoteMessage){
					console.log(
						'Notification caused app to open from quit state:',
						remoteMessage.notification,
					);
				}
			});
			
		
		// registerForPushNotificationsAsync().then(token => {
		// 	setExpoPushToken(token);
		// });
	
		messaging().onNotificationOpenedApp(async (remoteMessage) => {
			console.log(
				'Notification caused app to open from background state: ',
				remoteMessage.notification,
			);
		});

		messaging().setBackgroundMessageHandler(async remoteMessage => {
			console.log('Message handled in the background!', remoteMessage);
		});

		const unsubscribe = messaging().onMessage(async reomoteMessage => {
			Alert.alert('A new FCM message arrived!', JSON.stringify(reomoteMessage));
		});

		return unsubscribe;
		
		// notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
		// 	setNotification(notification);
		// });
	
		// responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
		// 	console.log(response);
		// });
	
		// return () => {
		// 	if(typeof notificationListener.current !== 'undefined' && typeof responseListener.current !== 'undefined'){
		// 		Notifications.removeNotificationSubscription(notificationListener.current);
		// 		Notifications.removeNotificationSubscription(responseListener.current);
		// 	}
		// };
	}, []);

	
	return (
		<View style={styles.container}>
			<Text>FCM Test</Text>
			<StatusBar style='auto' />
		</View>
	);
};

export default Progress;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
});

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



// async function registerForPushNotificationsAsync() {
// 	let token;
// 	if (Device.isDevice) {
// 		const { status: existingStatus } = await Notifications.getPermissionsAsync();
// 		let finalStatus = existingStatus;
// 		if (existingStatus !== 'granted') {
// 			const { status } = await Notifications.requestPermissionsAsync();
// 			finalStatus = status;
// 		}
// 		if (finalStatus !== 'granted') {
// 			alert('Failed to get push token for push notification!');
// 			return;
// 		}
// 		token = (await Notifications.getExpoPushTokenAsync()).data;
// 		console.log(token);
// 	} else {
// 		alert('Must use physical device for Push Notifications');
// 	}

// 	if (Platform.OS === 'android') {
// 		Notifications.setNotificationChannelAsync('default', {
// 			name: 'default',
// 			importance: Notifications.AndroidImportance.MAX,
// 			vibrationPattern: [0, 250, 250, 250],
// 			lightColor: '#FF231F7C',
// 		});
// 	}

// 	return token;
// }