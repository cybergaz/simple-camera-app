import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, Text, Dimensions, Alert, Modal } from 'react-native';
import { Image } from 'expo-image';
import * as FileSystem from 'expo-file-system';
import { Video } from 'expo-av';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../shared/types/navigation';

const MEDIA_FOLDER = `${FileSystem.documentDirectory}media/`;

type MediaItem = {
    uri: string;
    type: 'image' | 'video';
    selected?: boolean;
};

type GalleryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Gallery'>;

export default function GalleryScreen() {
    const navigation = useNavigation<GalleryScreenNavigationProp>();
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [selectedItems, setSelectedItems] = useState<MediaItem[]>([]);
    const [uploading, setUploading] = useState(false);
    const [selectionMode, setSelectionMode] = useState(false);
    const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

    useEffect(() => {
        loadMediaFiles();
    }, []);

    const loadMediaFiles = async () => {
        try {
            const folderInfo = await FileSystem.getInfoAsync(MEDIA_FOLDER);
            if (!folderInfo.exists) {
                await FileSystem.makeDirectoryAsync(MEDIA_FOLDER);
                return;
            }

            const files = await FileSystem.readDirectoryAsync(MEDIA_FOLDER);
            const items: MediaItem[] = files.map(filename => ({
                uri: MEDIA_FOLDER + filename,
                type: filename.endsWith('.mp4') ? 'video' : 'image',
                selected: false,
            }));
            setMediaItems(items);
        } catch (error) {
            console.error('Error loading media files:', error);
            Alert.alert('Error', 'Failed to load media files');
        }
    };

    const handleItemPress = (item: MediaItem) => {
        if (selectionMode) {
            toggleSelection(item);
        } else {
            setPreviewItem(item);
        }
    };

    const handleLongPress = (item: MediaItem) => {
        if (!selectionMode) {
            setSelectionMode(true);
            toggleSelection(item);
        }
    };

    const toggleSelection = (item: MediaItem) => {
        const newMediaItems = mediaItems.map(mediaItem =>
            mediaItem.uri === item.uri
                ? { ...mediaItem, selected: !mediaItem.selected }
                : mediaItem
        );
        setMediaItems(newMediaItems);
        const newSelectedItems = newMediaItems.filter(item => item.selected);
        setSelectedItems(newSelectedItems);

        // Exit selection mode if no items are selected
        if (newSelectedItems.length === 0) {
            setSelectionMode(false);
        }
    };

    const exitSelectionMode = () => {
        setSelectionMode(false);
        setMediaItems(mediaItems.map(item => ({ ...item, selected: false })));
        setSelectedItems([]);
    };


    const uploadToCloud = async () => {
        if (selectedItems.length === 0) {
            Alert.alert('Select Items', 'Please select items to upload');
            return;
        }

        setUploading(true);
        try {
            for (const item of selectedItems) {
                const formData = new FormData();
                formData.append('media', {
                    uri: item.uri,
                    name: `media.${item.type === 'image' ? 'jpg' : 'mp4'}`,
                    type: item.type === 'image' ? 'image/jpeg' : 'video/mp4',
                } as any);

                await axios.post(`http://${process.env.EXPO_PUBLIC_SERVER_HOST}:${process.env.EXPO_PUBLIC_SERVER_PORT}/api/media/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }
            Alert.alert('Success', 'Files uploaded successfully');
            exitSelectionMode();
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', 'Failed to upload files');
        } finally {
            setUploading(false);
        }
    };

    const deleteSelectedItems = async () => {
        if (selectedItems.length === 0) return;

        Alert.alert(
            'Delete Items',
            `Are you sure you want to delete ${selectedItems.length} item${selectedItems.length > 1 ? 's' : ''}?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Delete the files from the file system
                            for (const item of selectedItems) {
                                await FileSystem.deleteAsync(item.uri);
                                console.log('Deleted file:', item.uri);
                            }

                            // Reload media files to ensure UI is in sync
                            await loadMediaFiles();

                            // Exit selection mode
                            exitSelectionMode();

                            Alert.alert('Success', 'Files deleted successfully');
                        } catch (error) {
                            console.error('Delete error:', error);
                            Alert.alert('Error', 'Failed to delete files');

                            // If deletion fails, reload the media files to sync the UI with the file system
                            loadMediaFiles();
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: MediaItem }) => (
        <Pressable
            style={[styles.mediaItem, item.selected && styles.selectedItem]}
            onPress={() => handleItemPress(item)}
            onLongPress={() => handleLongPress(item)}
            delayLongPress={200}
        >
            {item.type === 'image' ? (
                <Image
                    source={{ uri: item.uri }}
                    style={styles.media}
                    contentFit="cover"
                    key={item.uri} // Prevent caching issues
                />
            ) : (
                <View style={styles.media}>
                    <Video
                        source={{ uri: item.uri }}
                        style={styles.media}
                        shouldPlay={false}
                        key={item.uri} // Force re-render
                    />
                    <FontAwesome
                        name="play-circle"
                        size={30}
                        color="white"
                        style={styles.playIcon}
                    />
                </View>
            )}
            {item.selected && (
                <View style={styles.checkmark}>
                    <FontAwesome name="check-circle" size={24} color="#2196F3" />
                </View>
            )}
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={mediaItems}
                renderItem={renderItem}
                keyExtractor={item => item.uri}
                numColumns={3}
                contentContainerStyle={styles.list}
                key={mediaItems.length} // Force re-render when mediaItems changes
            />

            {selectionMode && selectedItems.length > 0 && (
                <View style={styles.footer}>
                    <View style={styles.footerButtons}>
                        <Pressable
                            style={[styles.footerButton, styles.deleteButton]}
                            onPress={deleteSelectedItems}
                        >
                            <FontAwesome name="trash" size={20} color="white" />
                            <Text style={styles.buttonText}>
                                Delete ({selectedItems.length})
                            </Text>
                        </Pressable>
                        <Pressable
                            style={[styles.footerButton, styles.uploadButton]}
                            onPress={uploadToCloud}
                            disabled={uploading}
                        >
                            <FontAwesome name="cloud-upload" size={20} color="white" />
                            <Text style={styles.buttonText}>
                                {uploading ? 'Uploading...' : `Upload (${selectedItems.length})`}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            )}

            <Modal
                visible={previewItem !== null}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setPreviewItem(null)}
            >
                <Pressable
                    style={styles.modalContainer}
                    onPress={() => setPreviewItem(null)}
                >
                    {previewItem && (
                        <View style={styles.previewContainer}>
                            {previewItem.type === 'image' ? (
                                <Image
                                    source={{ uri: previewItem.uri }}
                                    style={styles.previewMedia}
                                    contentFit="contain"
                                    key={previewItem.uri} // Prevent caching issues
                                />
                            ) : (
                                <Video
                                    source={{ uri: previewItem.uri }}
                                    style={styles.previewMedia}
                                    useNativeControls
                                    shouldPlay
                                    isLooping
                                    key={previewItem.uri} // Force re-render
                                />
                            )}
                        </View>
                    )}
                </Pressable>
            </Modal>
        </View>
    );
}

const { width } = Dimensions.get('window');
const itemSize = width / 3 - 4;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    list: {
        padding: 5,
        paddingTop: 50,
        paddingBottom: 50,
    },
    mediaItem: {
        width: itemSize,
        height: itemSize,
        margin: 2,
        borderRadius: 8,
        overflow: 'hidden',
    },
    selectedItem: {
        opacity: 0.7,
    },
    media: {
        width: '100%',
        height: '100%',
    },
    playIcon: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -15,
        marginTop: -15,
    },
    checkmark: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'white',
        borderRadius: 12,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: 'white',
    },
    footerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    footerButton: {
        flex: 1,
        flexDirection: 'row',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    uploadButton: {
        backgroundColor: '#2196F3',
    },
    deleteButton: {
        backgroundColor: '#DC3545',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewMedia: {
        width: '100%',
        height: '100%',
    },
});
