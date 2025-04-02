package com.example.backend_instagram.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.github.cdimascio.dotenv.Dotenv;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;




@Service
public class AwsS3Service {
    private final S3Client s3Client;
    private final String bucketName;
    private final String region; 
    
    private static final Dotenv dotenv = Dotenv.load();

    public AwsS3Service() {
        String accessKey = dotenv.get("ACCESS_KEY");
        String secretKey = dotenv.get("SECRET_KEY");
        this.region = dotenv.get("REGION");  
        this.bucketName = dotenv.get("BUCKET_NAME");

        this.s3Client = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)
                ))
                .build();
    }
    public String uploadFile(String fileName, byte[] fileData) {
        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType("image/png")  
                    .build();

            s3Client.putObject(request, RequestBody.fromBytes(fileData));

    
            return "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + fileName;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi upload file lên S3: " + e.getMessage());
        }
    }
}
