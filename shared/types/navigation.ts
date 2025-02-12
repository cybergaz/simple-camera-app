export type RootStackParamList = {
    Home: undefined; // No parameters for the Home screen
    Media: undefined; // No parameters for the Media screen
    Test: undefined; // No parameters for the Media screen
    Preview: {
        uri: string;
        type: 'image' | 'video';
    };
};
