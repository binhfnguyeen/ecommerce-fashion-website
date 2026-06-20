package com.heulwen.accountservice.service;

public interface MailService {
    void sendOtpToMail(String to, String otp);
}
