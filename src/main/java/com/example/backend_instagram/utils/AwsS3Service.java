package com.example.backend_instagram.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;


@Service
public class AwsS3Service {
    private final S3Client s3Client;
    
    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    public AwsS3Service(
        @Value("${aws.access-key}") String accessKey,
        @Value("${aws.secret-key}") String secretKey,
        @Value("${aws.region}") String region
    ) {
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
                .contentType("image/png")  // Giữ nguyên content-type nếu cần
                .build();

        s3Client.putObject(request, RequestBody.fromBytes(fileData));

        return "https://" + bucketName + ".s3.amazonaws.com/" + fileName;
    } catch (Exception e) {
        throw new RuntimeException("Lỗi upload file lên S3: " + e.getMessage());
    }
}

}
