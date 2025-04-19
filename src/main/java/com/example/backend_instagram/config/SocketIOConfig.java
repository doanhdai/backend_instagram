package com.example.backend_instagram.config;

import com.corundumstudio.socketio.Configuration;
import com.corundumstudio.socketio.SocketIOServer;
<<<<<<< HEAD
import com.corundumstudio.socketio.Transport;
=======
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
>>>>>>> 7aaa0d3abf6729f53787353f3bbe488fc11e14aa
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@Component
public class SocketIOConfig {

    @Value("${socketio.host:localhost}")
    private String host;

    @Value("${socketio.port:9092}")
    private Integer port;

    private SocketIOServer server;

    @Bean
    public SocketIOServer socketIOServer() {
        Configuration config = new Configuration();
        config.setHostname(host);
        config.setPort(port);
<<<<<<< HEAD
=======

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

>>>>>>> 7aaa0d3abf6729f53787353f3bbe488fc11e14aa
        server = new SocketIOServer(config);
        server.start();

        System.out.println("✅ Socket.IO Server đang chạy trên cổng " + port);
        return server;
    }

    @PreDestroy
    public void stopServer() {
        if (server != null) {
            server.stop();
            System.out.println("❌ Socket.IO Server đã dừng.");
        }
    }
}