package com.example.backend_instagram.dto.user;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class CallData {
    private String userToCall;
    private JsonNode signalData;  // ✅ Chuyển từ String sang JsonNode
    private String from;
    private String name;
    private String userId; // For call ending
    private String callId; // For call ending
    
    // Default constructor for JSON deserialization
    public CallData() {
    }
    

    public CallData(String userToCall, JsonNode signalData, String from, String name) {
        this.userToCall = userToCall;
        this.signalData = signalData;
        this.from = from;
        this.name = name;
    }
    

    public CallData(String userId, String callId) {
        this.userId = userId;
        this.callId = callId;
    }
    
    
    @Override
    public String toString() {
        return "CallData{" +
                "userToCall='" + userToCall + '\'' +
                ", signalData=" + (signalData != null ? signalData.toString() : "null") +
                ", from='" + from + '\'' +
                ", name='" + name + '\'' +
                ", userId='" + userId + '\'' +
                ", callId='" + callId + '\'' +
                '}';
    }
}
