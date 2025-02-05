import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import config from "../config/index.js";

const s3 = new S3Client({
  region: config.AWS.Region,
  credentials: {
    accessKeyId: config.AWS.AccessKeyId,
    secretAccessKey: config.AWS.AWSSecretKey,
  }
});


export async function createPresignedPost({ key, contentType }) {
  const command = new PutObjectCommand({
    Bucket: config.AWS.BucketName,
    Key: key,
    ContentType: contentType,
  });
  const fileLink = `https://${config.AWS.BucketName}.s3.${config.AWS.Region}.amazonaws.com/${key}`
  const signedUrl = await getSignedUrl(s3, command, {
    expiresIn: 5 * 60, // 5 minutes - default is 15 mins
  });
  return { fileLink, signedUrl };
}