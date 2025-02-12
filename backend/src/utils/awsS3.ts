import AWS from 'aws-sdk';
import 'dotenv/config';

// Configure AWS SDK
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

export const uploadToS3 = async (file: Express.Multer.File, bucketName: string) => {
    const params = {
        Bucket: bucketName,
        Key: `${Date.now()}-${file.originalname}`, // Unique file name
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // Make the file publicly accessible
    };

    try {
        console.log('Uploading to S3 final call...');
        const data = await s3.upload(params).promise();
        return data.Location; // Return the file URL
    } catch (error) {
        console.error('Error uploading to S3:', error);
        throw error;
    }
};
