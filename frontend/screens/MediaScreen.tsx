import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, Pressable, StyleSheet } from 'react-native';
import { Camera, CameraType, CameraView } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import axios from 'axios';
import { Media } from '../../shared/types/media';

const MediaScreen = () => {
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const cameraRef = useRef<CameraView>(null);
    const [facing, setFacing] = useState<CameraType>("back");

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasCameraPermission(status === 'granted');
        })();
    }, []);

    const captureMedia = async (type: 'photo' | 'video') => {
        if (cameraRef.current) {
            let media;
            if (type === 'photo') {
                media = await cameraRef.current.takePictureAsync(); // Correctly access takePictureAsync
                // console.log(media);
            } else {
                media = await cameraRef.current.recordAsync(); // Correctly access recordAsync
            }

            const formData = new FormData();
            formData.append('media', {
                uri: media?.uri,
                name: 'media.jpg',
                type: type === 'photo' ? 'image/jpeg' : 'video/mp4',
            } as any);

            try {
                console.log('Uploading media...');
                const response = await axios.post('http://192.168.1.34:5000/api/media/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                console.log(response.data);
            } catch (error) {
                console.error(error);
            }
        }
    };

    if (hasCameraPermission === null) {
        return <View />;
    }
    if (hasCameraPermission === false) {
        return <Text>No access to camera</Text>;
    }

    const toggleFacing = () => {
        setFacing((prev) => (prev === "back" ? "front" : "back"));
    };

    return (
        <View style={{ flex: 1 }}>
            <CameraView
                ref={cameraRef}
                style={{ flex: 1 }}
                facing={facing}>
                <View style={{ flex: 1, justifyContent: 'flex-end', gap: 5, paddingBottom: 50, alignItems: 'center' }}>
                    <Button title="Take Photo" onPress={() => captureMedia('photo')} />
                    <Button title="Record Video" onPress={() => captureMedia('video')} />
                    <Button title={facing} onPress={() => toggleFacing()} />
                </View>
            </CameraView>
        </View >
    );
};

export default MediaScreen;
