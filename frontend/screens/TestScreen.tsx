import {
    CameraType,
    CameraView,
    useCameraPermissions,
    CameraRecordingOptions,
    CameraMode
} from "expo-camera";
import { useRef, useState, useEffect } from "react";
import { Button, Pressable, StyleSheet, Text, View, AppState } from "react-native";
import { Image } from "expo-image";
import { AntDesign } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { FontAwesome6 } from "@expo/vector-icons";
import axios from 'axios';
import { Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../shared/types/navigation';

type TestScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Test'>;

interface RecordingResult {
    uri: string;
}

export default function TextScreen() {
    const navigation = useNavigation<TestScreenNavigationProp>();
    const [permission, requestPermission] = useCameraPermissions();
    const [hasAudioPermission, setHasAudioPermission] = useState<boolean>(false);
    const cameraRef = useRef<CameraView>(null);
    const [uri, setUri] = useState<string | null>(null);
    const [mode, setMode] = useState<CameraMode>("picture");
    const [facing, setFacing] = useState<CameraType>("back");
    const [recording, setRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        (async () => {
            const audioStatus = await Audio.requestPermissionsAsync();
            setHasAudioPermission(audioStatus.granted);
        })();

        // Cleanup timer on unmount
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    const stopRecordingAndCleanup = async () => {
        if (cameraRef.current) {
            try {
                setRecording(false);
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
                setRecordingTime(0);
                cameraRef.current?.stopRecording();
                return
            } catch (error) {
                console.error('Error stopping recording:', error);
                return null;
            }
        }
        return null;
    };

    // Handle app state changes
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState !== 'active' && recording) {
                stopRecordingAndCleanup();
            }
        });

        return () => {
            subscription.remove();
        };
    }, [recording]);

    if (!permission || !hasAudioPermission) {
        return null;
    }

    if (!permission.granted || !hasAudioPermission) {
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: "center" }}>
                    We need your permission to use the camera and microphone
                </Text>
                <Button onPress={async () => {
                    await requestPermission();
                    const audioStatus = await Audio.requestPermissionsAsync();
                    setHasAudioPermission(audioStatus.granted);
                }} title="Grant permissions" />
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current?.takePictureAsync();
                if (photo?.uri) {
                    navigation.navigate('Preview', {
                        uri: photo.uri,
                        type: 'image'
                    });
                }
            } catch (error) {
                console.error('Error taking picture:', error);
            }
        }
    };

    const startRecording = async () => {
        // if (recording) {
        //     setRecording(false);
        //     if (timerRef.current) {
        //         clearInterval(timerRef.current);
        //     }
        //     setRecordingTime(0);
        //     try {
        //         cameraRef.current?.stopRecording()
        //     } catch (error) {
        //         console.error('Error stopping recording:', error);
        //     }
        //     return;
        // }

        if (cameraRef.current) {
            try {
                setRecording(true);
                timerRef.current = setInterval(() => {
                    setRecordingTime((prev) => prev + 1);
                }, 1000);

                // const options: CameraRecordingOptions = {
                //     maxDuration: 60,
                // };

                const recordedVideo = await cameraRef.current?.recordAsync();
                // console.log(recordedVideo);

                if (recordedVideo?.uri) {
                    navigation.navigate('Preview', {
                        uri: recordedVideo.uri,
                        type: 'video'
                    });
                    setRecording(false);
                }
            } catch (error) {
                console.error('Error starting recording:', error);
                setRecording(false);
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
                setRecordingTime(0);
            }
        }
    };

    const stopRecording = async () => {
        if (cameraRef.current) {
            cameraRef.current.stopRecording();
        }
    };

    const toggleMode = () => {
        if (recording) {
            return; // Prevent mode change during recording
        }
        setMode((prev) => (prev === "picture" ? "video" : "picture"));
    };

    const toggleFacing = () => {
        if (recording) {
            return; // Prevent camera flip during recording
        }
        setFacing((prev) => (prev === "back" ? "front" : "back"));
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                ref={cameraRef}
                facing={facing}
            >
                <View style={styles.timerContainer}>
                    {mode === "video" && recording && (
                        <Text style={styles.timerText}>{recordingTime}s</Text>
                    )}
                </View>
                <View style={styles.shutterContainer}>
                    <Pressable
                        onPress={toggleMode}
                        style={[styles.controlButton, recording && styles.disabledButton]}
                        disabled={recording}
                    >
                        {mode === "picture" ? (
                            <AntDesign name="picture" size={32} color={recording ? "gray" : "white"} />
                        ) : (
                            <Feather name="video" size={32} color={recording ? "gray" : "white"} />
                        )}
                    </Pressable>
                    <Pressable onPress={mode === "picture" ? takePicture : recording ? stopRecording : startRecording}>
                        {({ pressed }) => (
                            <View
                                style={[
                                    styles.shutterBtn,
                                    {
                                        opacity: pressed ? 0.5 : 1,
                                    },
                                ]}
                            >
                                <View
                                    style={[
                                        styles.shutterBtnInner,
                                        {
                                            backgroundColor: mode === "picture" ? "white" : recording ? "red" : "white",
                                        },
                                    ]}
                                />
                            </View>
                        )}
                    </Pressable>
                    <Pressable
                        onPress={toggleFacing}
                        style={[styles.controlButton, recording && styles.disabledButton]}
                        disabled={recording}
                    >
                        <FontAwesome6 name="rotate-left" size={32} color={recording ? "gray" : "white"} />
                    </Pressable>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    camera: {
        flex: 1,
        width: "100%",
    },
    timerContainer: {
        position: 'absolute',
        top: '10%',
        width: '100%',
        alignItems: 'center',
    },
    timerText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    shutterContainer: {
        position: "absolute",
        bottom: 44,
        left: 0,
        width: "100%",
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 30,
    },
    shutterBtn: {
        backgroundColor: "transparent",
        borderWidth: 5,
        borderColor: "white",
        width: 85,
        height: 85,
        borderRadius: 45,
        alignItems: "center",
        justifyContent: "center",
    },
    shutterBtnInner: {
        width: 70,
        height: 70,
        borderRadius: 50,
    },
    controlButton: {
        padding: 10,
    },
    disabledButton: {
        opacity: 0.5,
    },
});
