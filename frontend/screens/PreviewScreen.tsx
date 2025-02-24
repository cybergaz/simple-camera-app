import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { useRef, useState, useEffect } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../shared/types/navigation';
import * as FileSystem from 'expo-file-system';

type PreviewScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Preview'>;
type PreviewScreenRouteProp = RouteProp<RootStackParamList, 'Preview'>;

type PreviewScreenProps = {
    route: PreviewScreenRouteProp;
};

const MEDIA_FOLDER = `${FileSystem.documentDirectory}media/`;

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
            // Create media directory if it doesn't exist
            const folderInfo = await FileSystem.getInfoAsync(MEDIA_FOLDER);
            if (!folderInfo.exists) {
                await FileSystem.makeDirectoryAsync(MEDIA_FOLDER);
            }

            // Generate unique filename
            const timestamp = new Date().getTime();
            const extension = type === 'image' ? 'jpg' : 'mp4';
            const filename = `${timestamp}.${extension}`;
            const destination = MEDIA_FOLDER + filename;

            // Copy file to local storage
            await FileSystem.copyAsync({
                from: uri,
                to: destination
            });

            navigation.navigate('Media');
        } catch (error) {
            console.error('Error saving file:', error);
            alert('Failed to save file');
        }
    };

    const handlePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pauseAsync();
            } else {
                videoRef.current.playAsync();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.mediaContainer}>
                {type === 'image' ? (
                    <Image source={{ uri }} style={styles.media} contentFit="contain" />
                ) : (
                    <Video
                        ref={videoRef}
                        source={{ uri }}
                        style={styles.media}
                        useNativeControls={false}
                        resizeMode={ResizeMode.CONTAIN}
                        isLooping
                    />
                )}
            </View>

            <View style={styles.footer}>
                <View style={styles.infoContainer}>
                    <Text style={styles.fileSize}>{fileSize}</Text>
                </View>

                <View style={styles.buttonContainer}>
                    {type === 'video' && (
                        <Pressable onPress={handlePlayPause} style={styles.button}>
                            <FontAwesome
                                name={isPlaying ? 'pause' : 'play'}
                                size={24}
                                color="white"
                            />
                        </Pressable>
                    )}

                    <Pressable onPress={handleSave} style={styles.button}>
                        <FontAwesome name="save" size={24} color="white" />
                    </Pressable>

                    <Pressable
                        onPress={() => navigation.navigate('Gallery')}
                        style={styles.button}
                    >
                        <FontAwesome name="photo" size={24} color="white" />
                    </Pressable>
                </View>
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
    media: {
        width: '100%',
        height: '100%',
    },
    footer: {
        padding: 20,
        paddingBottom: 40,
    },
    infoContainer: {
        marginBottom: 20,
    },
    fileSize: {
        color: 'white',
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
    button: {
        backgroundColor: '#2196F3',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
