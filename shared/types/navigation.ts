export type RootStackParamList = {
    Login: undefined;
    Home: undefined; // No parameters for the Home screen
    Media: undefined; // No parameters for the Media screen
    Preview: {
        uri: string;
        type: 'image' | 'video';
    };
    Gallery: undefined;
};
