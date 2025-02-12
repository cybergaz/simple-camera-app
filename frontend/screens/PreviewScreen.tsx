import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { useRef, useState, useEffect } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../shared/types/navigation';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

type PreviewScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Preview'>;
type PreviewScreenRouteProp = RouteProp<RootStackParamList, 'Preview'>;

type PreviewScreenProps = {
    route: PreviewScreenRouteProp;
};

export default function PreviewScreen({ route }: PreviewScreenProps) {
    const { uri, type } = route.params;
    const navigation = useNavigation<PreviewScreenNavigationProp>();
    const videoRef = useRef<Video>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [fileSize, setFileSize] = useState<string>('');

    useEffect(() => {
        const getFileSize = async () => {
            try {
                const fileInfo = await FileSystem.getInfoAsync(uri);
                if (fileInfo.exists && fileInfo.size) {
                    // Convert to MB with 2 decimal places
                    const sizeInMB = (fileInfo.size / (1024 * 1024)).toFixed(2);
                    setFileSize(`${sizeInMB} MB`);
                }
            } catch (error) {
                console.error('Error getting file size:', error);
            }
        };

        getFileSize();
    }, [uri]);

    const handleSave = async () => {
        try {
            const formData = new FormData();
            formData.append('media', {
                uri: uri,
                name: `media.${type === 'image' ? 'jpg' : 'mp4'}`,
                type: type === 'image' ? 'image/jpeg' : 'video/mp4',
            } as any);

            console.log('Uploading media...');
            const response = await axios.post('http://192.168.1.34:5000/api/media/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log(response.data);
            navigation.goBack();
        } catch (error) {
            console.error('Upload error:', error);
        }
    };

    const handleDiscard = () => {
        navigation.goBack();
    };

    const togglePlayPause = async () => {
        if (!videoRef.current) return;

        if (isPlaying) {
            await videoRef.current.pauseAsync();
        } else {
            await videoRef.current.playAsync();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <View style={styles.container}>
            <View style={styles.mediaContainer}>
                {type === 'image' ? (
                    <Image
                        source={{ uri }}
                        style={styles.media}
                        contentFit="contain"
                    />
                ) : (
                    <View style={styles.videoContainer}>
                        <Video
                            ref={videoRef}
                            source={{ uri }}
                            style={styles.media}
                            useNativeControls={false}
                            resizeMode={ResizeMode.CONTAIN}
                            isLooping
                        />
                        <Pressable
                            style={styles.playButton}
                            onPress={togglePlayPause}
                        >
                            <FontAwesome
                                name={isPlaying ? "pause" : "play"}
                                size={30}
                                color="white"
                            />
                        </Pressable>
                    </View>
                )}
                {fileSize && (
                    <View style={styles.fileSizeContainer}>
                        <Text style={styles.fileSizeText}>Size: {fileSize}</Text>
                    </View>
                )}
            </View>
            <View style={styles.buttonContainer}>
                <Pressable
                    style={[styles.button, styles.discardButton]}
                    onPress={handleDiscard}
                >
                    <FontAwesome name="trash" size={24} color="white" />
                    <Text style={styles.buttonText}>Discard</Text>
                </Pressable>
                <Pressable
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSave}
                >
                    <FontAwesome name="check" size={24} color="white" />
                    <Text style={styles.buttonText}>Save</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    mediaContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    videoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    media: {
        width: '100%',
        height: '100%',
    },
    playButton: {
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
        paddingBottom: 40,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        width: 120,
        justifyContent: 'center',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
    },
    discardButton: {
        backgroundColor: '#f44336',
    },
    buttonText: {
        color: 'white',
        marginLeft: 10,
        fontSize: 16,
        fontWeight: 'bold',
    },
    fileSizeContainer: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 8,
        borderRadius: 8,
    },
    fileSizeText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
});
