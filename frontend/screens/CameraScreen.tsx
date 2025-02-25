import { Camera, CameraType, CameraView, useCameraPermissions, CameraRecordingOptions, CameraMode, useMicrophonePermissions } from "expo-camera";
import { useRef, useState, useEffect } from "react";
import { Button, Pressable, StyleSheet, Text, View, AppState } from "react-native";
import { AntDesign, Feather, FontAwesome6 } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../shared/types/navigation';

type TestScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Media'>;

export default function TestScreen() {
    // Navigation
    const navigation = useNavigation<TestScreenNavigationProp>();

    // Permissions
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [microphonePermission, requestMicrophonePermissions] = useMicrophonePermissions();

    // Camera and Recording State
    const cameraRef = useRef<CameraView>(null);
    const [mode, setMode] = useState<CameraMode>("picture");
    const [facing, setFacing] = useState<CameraType>("back");
    const [recording, setRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // App State Handler
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState !== 'active' && recording) {
                stopRecordingAndCleanup();
            }
        });
        return () => subscription.remove();
    }, [recording]);

    // Camera Actions
    const takePicture = async () => {
        if (!cameraRef.current) return;

        try {
            const photo = await cameraRef.current.takePictureAsync();
            if (photo?.uri) {
                navigation.navigate('Preview', {
                    uri: photo.uri,
                    type: 'image'
                });
            }
        } catch (error) {
            console.error('Error taking picture:', error);
        }
    };

    const startRecording = async () => {
        if (!cameraRef.current) return;

        try {
            // Ensure camera is ready
            await new Promise(resolve => setTimeout(resolve, 100));

            const options: CameraRecordingOptions = {
                maxDuration: 60,
            };

            // Set state first to prevent race conditions
            setRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

            // Start recording with proper error handling
            const recordedVideo = await cameraRef.current.recordAsync(options)
                .catch(error => {
                    throw new Error(`Failed to start recording: ${error.message}`);
                });

            if (!recordedVideo?.uri) {
                throw new Error('Recording started but no video URI received');
            }

            // Navigate after successful recording
            navigation.navigate('Preview', {
                uri: recordedVideo.uri,
                type: 'video'
            });
        } catch (error) {
            console.error('Recording failed:', error);
            await stopRecordingAndCleanup();
        } finally {
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const stopRecordingAndCleanup = async () => {
        if (!cameraRef.current) return null;

        try {
            setRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
            setRecordingTime(0);
            return cameraRef.current.stopRecording();
        } catch (error) {
            console.error('Error stopping recording:', error);
            return null;
        }
    };

    // Permission Check
    if (!cameraPermission || !microphonePermission) return null;

    if (!cameraPermission.granted || !microphonePermission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.permissionText}>
                    We need your permission to use the camera and microphone
                </Text>
                <Button
                    onPress={async () => {
                        await requestCameraPermission();
                        await requestMicrophonePermissions();
                    }}
                    title="Grant permissions"
                />
            </View>
        );
    }

    // UI Controls
    const toggleMode = () => {
        if (recording) return;
        setMode(prev => prev === "picture" ? "video" : "picture");
    };

    const toggleFacing = () => {
        if (recording) return;
        setFacing(prev => prev === "back" ? "front" : "back");
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                ref={cameraRef}
                facing={facing}
                mode={mode}
            >
                <View style={styles.topControls}>
                    <Pressable
                        style={styles.controlButton}
                        onPress={() => navigation.navigate('Gallery')}
                    >
                        <FontAwesome6 name="images" size={24} color="white" />
                    </Pressable>
                </View>
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
                            <Feather name="video" size={32} color={recording ? "gray" : "white"} />
                        ) : (
                            <FontAwesome6 name="video" size={32} color={recording ? "gray" : "white"} />
                        )}
                    </Pressable>
                    <Pressable
                        onPress={mode === "picture" ? takePicture : recording ? stopRecordingAndCleanup : startRecording}
                    >
                        {({ pressed }) => (
                            <View style={[
                                styles.shutterButton,
                                pressed && styles.shutterButtonPressed,
                                recording && styles.recordingButton
                            ]} />
                        )}
                    </Pressable>
                    <Pressable
                        onPress={toggleFacing}
                        style={[styles.controlButton, recording && styles.disabledButton]}
                        disabled={recording}
                    >
                        <AntDesign name="sync" size={32} color={recording ? "gray" : "white"} />
                    </Pressable>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    camera: {
        flex: 1,
        justifyContent: "flex-end",
    },
    topControls: {
        position: 'absolute',
        bottom: 150,
        right: 40,
        flexDirection: 'row',
        gap: 20,
    },
    controlButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerContainer: {
        position: "absolute",
        top: 50,
        width: "100%",
        alignItems: "center",
    },
    timerText: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
    },
    shutterContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        marginBottom: 30,
    },
    disabledButton: {
        opacity: 0.5,
    },
    shutterButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "white",
        borderWidth: 4,
        borderColor: "#000",
    },
    shutterButtonPressed: {
        transform: [{ scale: 0.95 }],
    },
    recordingButton: {
        backgroundColor: "red",
    },
    permissionText: {
        textAlign: "center",
        marginBottom: 20,
    },
});
